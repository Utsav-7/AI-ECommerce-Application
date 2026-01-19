using System;
using System.Threading.Tasks;
using BCrypt.Net;
using ECommerce.Application.Helpers;
using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Auth;
using ECommerce.Core.DTOs.Response.Auth;
using ECommerce.Core.Enums;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly JwtTokenHelper _jwtTokenHelper;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUnitOfWork unitOfWork, JwtTokenHelper jwtTokenHelper, IEmailService emailService, ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenHelper = jwtTokenHelper;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);

        if (user == null)
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Check if user is a seller pending approval
        if (user.Role == UserRole.Seller && !user.IsApproved)
        {
            throw new UnauthorizedException("Your seller account is pending admin approval. Please wait for approval to login.");
        }

        // Check if account is active
        if (!user.IsActive)
        {
            throw new UnauthorizedException("Your account has been deactivated. Please contact support.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        var token = _jwtTokenHelper.GenerateToken(user);
        var refreshToken = _jwtTokenHelper.GenerateRefreshToken();

        return new LoginResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            UserInfo = new UserInfo
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive
            }
        };
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        if (await _unitOfWork.Users.EmailExistsAsync(request.Email))
        {
            throw new BadRequestException("Email already exists");
        }

        // Determine the role (only User or Seller allowed, default to User)
        var role = UserRole.User;
        var isSeller = !string.IsNullOrWhiteSpace(request.Role) && 
                       request.Role.Equals("Seller", StringComparison.OrdinalIgnoreCase);
        
        if (isSeller)
        {
            role = UserRole.Seller;
            
            // Validate GST number for sellers
            if (string.IsNullOrWhiteSpace(request.GstNumber))
            {
                throw new BadRequestException("GST number is required for seller registration");
            }
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Create user
        var user = new Core.Entities.User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.ToLower(),
            PasswordHash = passwordHash,
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = role,
            GstNumber = isSeller ? request.GstNumber?.Trim().ToUpper() : null,
            IsActive = isSeller ? false : true, // Sellers need admin approval
            IsApproved = isSeller ? false : true, // Sellers need admin approval
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Send welcome email
        try
        {
            var userName = $"{user.FirstName} {user.LastName}";
            var roleText = isSeller ? "Seller" : "User";
            await _emailService.SendWelcomeEmailAsync(user.Email, userName, roleText);
            _logger.LogInformation("Welcome email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send welcome email to {Email}", user.Email);
            // Don't fail registration if email fails
        }

        // Different message for sellers
        var message = isSeller 
            ? "Registration successful. Your account is pending admin approval." 
            : "Registration successful";

        return new RegisterResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Message = message
        };
    }

    /// <summary>
    /// Reset Password Flow - Step 1: Send OTP to Email
    /// No authentication required. Checks if email exists, generates 6-digit OTP, stores it with 10-minute expiry, and sends via email.
    /// </summary>
    public async Task<bool> SendPasswordResetOtpAsync(ResetPasswordRequest request)
    {
        // Check if email exists in the system
        var emailExists = await _unitOfWork.Users.EmailExistsAsync(request.Email);
        if (!emailExists)
        {
            throw new NotFoundException("Email not found in the system");
        }

        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        // Generate 6-digit OTP
        var random = new Random();
        var otp = random.Next(100000, 999999).ToString();

        // Store OTP and expiry (10 minutes)
        user.ResetPasswordOtp = otp;
        user.ResetPasswordOtpExpiry = DateTime.UtcNow.AddMinutes(10);

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        //// Print OTP to console
        //Console.WriteLine("=========================================");
        //Console.WriteLine($"Password Reset OTP for {user.Email}");
        //Console.WriteLine($"OTP: {otp}");
        //Console.WriteLine($"Expires at: {user.ResetPasswordOtpExpiry:yyyy-MM-dd HH:mm:ss} UTC");
        //Console.WriteLine("=========================================");
        _logger.LogInformation("Password reset OTP generated for {Email}: {OTP}", user.Email, otp);

        // Send OTP via email
        try
        {
            await _emailService.SendPasswordResetOtpAsync(user.Email, otp);
            _logger.LogInformation("Password reset OTP email sent successfully to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP email to {Email}. OTP is still valid: {OTP}", user.Email, otp);
            // Don't clear OTP if email fails - OTP is already printed to console
            // User can still use the OTP from console for testing
            // In production, you might want to handle this differently
        }

        return true;
    }

    /// <summary>
    /// Reset Password Flow - Step 2: Verify OTP and Reset Password
    /// No authentication required. Verifies OTP matches and hasn't expired, then updates password.
    /// Uses: email, OTP, new password
    /// </summary>
    public async Task<bool> VerifyOtpAndResetPasswordAsync(VerifyOtpRequest request)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);

        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        // Verify OTP
        if (string.IsNullOrEmpty(user.ResetPasswordOtp) || user.ResetPasswordOtp != request.Otp)
        {
            throw new UnauthorizedException("Invalid OTP");
        }

        // Check if OTP has expired
        if (!user.ResetPasswordOtpExpiry.HasValue || user.ResetPasswordOtpExpiry.Value < DateTime.UtcNow)
        {
            // Clear expired OTP
            user.ResetPasswordOtp = null;
            user.ResetPasswordOtpExpiry = null;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            throw new UnauthorizedException("OTP has expired. Please request a new OTP.");
        }

        // Verify new password and confirm password match
        if (request.NewPassword != request.ConfirmPassword)
        {
            throw new BadRequestException("New password and confirm password do not match");
        }

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        
        // Note: OTP columns are NOT cleared after password reset - they remain for audit/reference

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Password reset successfully for user: {Email}", user.Email);

        return true;
    }

    /// <summary>
    /// Change Password Flow
    /// Verifies old password (CurrentPassword) before updating to new password.
    /// Requires: email, old password (CurrentPassword), new password, confirm password
    /// Sends email notification upon successful password change.
    /// </summary>
    public async Task<bool> ChangePasswordAsync(ChangePasswordRequest request)
    {
        // Find user by email
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);

        if (user == null || !user.IsActive)
        {
            throw new NotFoundException("User not found");
        }

        // Verify old password (CurrentPassword) is correct
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Verify new password and confirm password match (this is also validated by DTO, but double-check for safety)
        if (request.NewPassword != request.ConfirmPassword)
        {
            throw new BadRequestException("New password and confirm password do not match");
        }

        // Verify new password is different from old password
        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
        {
            throw new BadRequestException("New password must be different from the current password");
        }

        // Update to new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Send email notification
        try
        {
            var userName = $"{user.FirstName} {user.LastName}";
            await _emailService.SendPasswordChangeNotificationAsync(user.Email, userName);
            _logger.LogInformation("Password change notification email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            // Log error but don't fail the password change operation
            // Password has already been changed successfully
            // Email notification failure shouldn't prevent password change
            _logger.LogWarning(ex, "Failed to send password change notification email to {Email}", user.Email);
        }

        return true;
    }

    /// <summary>
    /// Get current user details by email
    /// </summary>
    public async Task<UserInfo> GetCurrentUserAsync(string email)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(email);

        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("User account is inactive");
        }

        return new UserInfo
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }
}

