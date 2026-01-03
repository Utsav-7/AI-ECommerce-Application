using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Auth;
using ECommerce.Core.DTOs.Response.Auth;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="request">Registration details</param>
    /// <returns>Registration response with user information</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<RegisterResponse>>> Register([FromBody] RegisterRequest request)
    {
        // Model validation is automatically handled by ASP.NET Core
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<RegisterResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var result = await _authService.RegisterAsync(request);
            _logger.LogInformation("User registered successfully: {Email}", request.Email);
            
            return Ok(ApiResponse<RegisterResponse>.SuccessResponse(result, "Registration successful"));
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("Registration failed for {Email}: {Message}", request.Email, ex.Message);
            return BadRequest(ApiResponse<RegisterResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during registration for {Email}", request.Email);
            return StatusCode(500, ApiResponse<RegisterResponse>.ErrorResponse("An error occurred during registration"));
        }
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Login response with JWT token and user information</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        // Model validation is automatically handled by ASP.NET Core
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<LoginResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var result = await _authService.LoginAsync(request);
            _logger.LogInformation("User logged in successfully: {Email}", request.Email);
            
            return Ok(ApiResponse<LoginResponse>.SuccessResponse(result, "Login successful"));
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Login failed for {Email}: {Message}", request.Email, ex.Message);
            return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during login for {Email}", request.Email);
            return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse("An error occurred during login"));
        }
    }

    /// <summary>
    /// Change password with old password verification (Requires JWT Authentication)
    /// </summary>
    /// <param name="request">Change password request with old password, new password, and confirm password</param>
    /// <returns>Success response</returns>
    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        // Check if user is authenticated
        if (User?.Identity == null || !User.Identity.IsAuthenticated)
        {
            _logger.LogWarning("Unauthenticated request to change password");
            return Unauthorized(ApiResponse<object>.ErrorResponse("Authentication required. Please provide a valid JWT token."));
        }

        // Extract email from JWT token claims
        var emailFromToken = User.FindFirst(ClaimTypes.Email)?.Value;
        
        if (string.IsNullOrEmpty(emailFromToken))
        {
            var claims = User.Claims.Select(c => $"{c.Type}={c.Value}").ToList();
            _logger.LogWarning("Token does not contain email claim. Available claims: {Claims}", 
                string.Join(", ", claims));
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token. Token does not contain email claim. Please login again."));
        }
        
        _logger.LogInformation("Change password request for authenticated user: {Email}", emailFromToken);

        // Verify email from token matches email in request (for additional security)
        if (!string.Equals(emailFromToken, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Email does not match the authenticated user"));
        }

        // Model validation is automatically handled by ASP.NET Core
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            await _authService.ChangePasswordAsync(request);
            _logger.LogInformation("Password changed successfully for user: {Email}", emailFromToken);
            
            return Ok(ApiResponse<object>.SuccessResponse(null, "Password changed successfully. A confirmation email has been sent."));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Password change failed for {Email}: {Message}", emailFromToken, ex.Message);
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Password change failed for {Email}: {Message}", emailFromToken, ex.Message);
            return Unauthorized(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("Password change failed for {Email}: {Message}", emailFromToken, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during password change for {Email}", emailFromToken);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred during password change"));
        }
    }

    /// <summary>
    /// Get current logged-in user details (Requires JWT Authentication)
    /// </summary>
    /// <returns>Current user information</returns>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserInfo>>> GetCurrentUser()
    {
        // Check if user is authenticated
        if (User?.Identity == null || !User.Identity.IsAuthenticated)
        {
            _logger.LogWarning("Unauthenticated request to get current user");
            return Unauthorized(ApiResponse<UserInfo>.ErrorResponse("Authentication required. Please provide a valid JWT token."));
        }

        // Extract email from JWT token claims
        var emailFromToken = User.FindFirst(ClaimTypes.Email)?.Value;
        
        if (string.IsNullOrEmpty(emailFromToken))
        {
            var claims = User.Claims.Select(c => $"{c.Type}={c.Value}").ToList();
            _logger.LogWarning("Token does not contain email claim. Available claims: {Claims}", 
                string.Join(", ", claims));
            return Unauthorized(ApiResponse<UserInfo>.ErrorResponse("Invalid token. Token does not contain email claim. Please login again."));
        }

        try
        {
            var userInfo = await _authService.GetCurrentUserAsync(emailFromToken);
            _logger.LogInformation("Retrieved user details for: {Email}", emailFromToken);
            
            return Ok(ApiResponse<UserInfo>.SuccessResponse(userInfo, "User details retrieved successfully"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {Email}", emailFromToken);
            return NotFound(ApiResponse<UserInfo>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
            return Unauthorized(ApiResponse<UserInfo>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving user details for {Email}", emailFromToken);
            return StatusCode(500, ApiResponse<UserInfo>.ErrorResponse("An error occurred while retrieving user details"));
        }
    }

    /// <summary>
    /// Send password reset OTP to email (No authentication required)
    /// </summary>
    /// <param name="request">Email address</param>
    /// <returns>Success response</returns>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> SendPasswordResetOtp([FromBody] ResetPasswordRequest request)
    {
        // Model validation is automatically handled by ASP.NET Core
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            await _authService.SendPasswordResetOtpAsync(request);
            _logger.LogInformation("Password reset OTP sent successfully to {Email}", request.Email);
            
            return Ok(ApiResponse<object>.SuccessResponse(null, "OTP has been sent to your email address. Please check your email."));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Password reset OTP request failed for {Email}: {Message}", request.Email, ex.Message);
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("Password reset OTP request failed for {Email}: {Message}", request.Email, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while sending password reset OTP to {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while sending OTP. Please try again later."));
        }
    }

    /// <summary>
    /// Verify OTP and reset password (No authentication required)
    /// </summary>
    /// <param name="request">Email, OTP, new password, and confirm password</param>
    /// <returns>Success response</returns>
    [HttpPost("verify-otp-reset-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> VerifyOtpAndResetPassword([FromBody] VerifyOtpRequest request)
    {
        // Model validation is automatically handled by ASP.NET Core
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            await _authService.VerifyOtpAndResetPasswordAsync(request);
            _logger.LogInformation("Password reset successfully for {Email}", request.Email);
            
            return Ok(ApiResponse<object>.SuccessResponse(null, "Password has been reset successfully. Please login with your new password."));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Password reset verification failed for {Email}: {Message}", request.Email, ex.Message);
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Password reset verification failed for {Email}: {Message}", request.Email, ex.Message);
            return Unauthorized(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("Password reset verification failed for {Email}: {Message}", request.Email, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while resetting password for {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while resetting password. Please try again."));
        }
    }
}

