using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.User;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.User;
using ECommerce.Core.Enums;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly ILogger<UserService> _logger;

    public UserService(IUnitOfWork unitOfWork, IEmailService emailService, ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<UserResponse> GetByIdAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        
        if (user == null || user.IsDeleted)
        {
            throw new NotFoundException("User", id);
        }

        return MapToUserResponse(user);
    }

    public async Task<IEnumerable<UserListResponse>> GetAllUsersAsync()
    {
        var users = await _unitOfWork.Users.GetAllUsersAsync();
        return users.Select(MapToUserListResponse);
    }

    public async Task<IEnumerable<UserListResponse>> GetUsersByRoleAsync(string role)
    {
        if (!Enum.TryParse<UserRole>(role, true, out var userRole))
        {
            throw new BadRequestException($"Invalid role: {role}");
        }

        var users = await _unitOfWork.Users.GetUsersByRoleAsync(userRole);
        return users.Select(MapToUserListResponse);
    }

    public async Task<IEnumerable<PendingSellerResponse>> GetPendingSellersAsync()
    {
        var sellers = await _unitOfWork.Users.GetPendingSellersAsync();
        return sellers.Select(s => new PendingSellerResponse
        {
            Id = s.Id,
            FirstName = s.FirstName,
            LastName = s.LastName,
            Email = s.Email,
            PhoneNumber = s.PhoneNumber,
            GstNumber = s.GstNumber,
            CreatedAt = s.CreatedAt
        });
    }

    public async Task<PagedResponse<UserListResponse>> GetAllUsersPagedAsync(string? search, string? role, bool? isActive, int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Users.GetAllUsersPagedAsync(search, role, isActive, page, pageSize);
        var data = items.Select(MapToUserListResponse).ToList();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResponse<UserListResponse>
        {
            Data = data,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            TotalRecords = totalCount
        };
    }

    public async Task<PagedResponse<PendingSellerResponse>> GetPendingSellersPagedAsync(string? search, int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Users.GetPendingSellersPagedAsync(search, page, pageSize);
        var data = items.Select(s => new PendingSellerResponse
        {
            Id = s.Id,
            FirstName = s.FirstName,
            LastName = s.LastName,
            Email = s.Email,
            PhoneNumber = s.PhoneNumber,
            GstNumber = s.GstNumber,
            CreatedAt = s.CreatedAt
        }).ToList();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResponse<PendingSellerResponse>
        {
            Data = data,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            TotalRecords = totalCount
        };
    }

    public async Task<int> GetTotalUsersCountAsync()
    {
        return await _unitOfWork.Users.GetUserCountByRoleAsync(UserRole.User);
    }

    public async Task<int> GetTotalSellersCountAsync()
    {
        return await _unitOfWork.Users.GetUserCountByRoleAsync(UserRole.Seller);
    }

    public async Task<int> GetPendingSellersCountAsync()
    {
        return await _unitOfWork.Users.GetPendingSellersCountAsync();
    }

    public async Task<UserResponse> UpdateUserAsync(int id, UpdateUserRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        
        if (user == null || user.IsDeleted)
        {
            throw new NotFoundException("User", id);
        }

        // Prevent modifying admin users
        if (user.Role == UserRole.Admin)
        {
            throw new BadRequestException("Cannot modify admin users");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated successfully", id);

        return MapToUserResponse(user);
    }

    public async Task<UserResponse> UpdateUserStatusAsync(int id, bool isActive)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        
        if (user == null || user.IsDeleted)
        {
            throw new NotFoundException("User", id);
        }

        // Prevent modifying admin users
        if (user.Role == UserRole.Admin)
        {
            throw new BadRequestException("Cannot modify admin users");
        }

        var previousStatus = user.IsActive;
        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} status changed from {PreviousStatus} to {NewStatus}", 
            id, previousStatus, isActive);

        // Send email notification about status change
        try
        {
            var userName = $"{user.FirstName} {user.LastName}";
            await _emailService.SendAccountStatusChangeEmailAsync(user.Email, userName, isActive);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send account status change email to {Email}", user.Email);
        }

        return MapToUserResponse(user);
    }

    public async Task<UserResponse> ApproveSellerAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        
        if (user == null || user.IsDeleted)
        {
            throw new NotFoundException("User", id);
        }

        if (user.Role != UserRole.Seller)
        {
            throw new BadRequestException("User is not a seller");
        }

        if (user.IsApproved)
        {
            throw new BadRequestException("Seller is already approved");
        }

        user.IsApproved = true;
        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Seller {UserId} approved successfully", id);

        // Send approval email
        try
        {
            var userName = $"{user.FirstName} {user.LastName}";
            await _emailService.SendSellerApprovalEmailAsync(user.Email, userName);
            _logger.LogInformation("Seller approval email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send seller approval email to {Email}", user.Email);
        }

        return MapToUserResponse(user);
    }

    public async Task RejectSellerAsync(int id, string? reason)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        
        if (user == null || user.IsDeleted)
        {
            throw new NotFoundException("User", id);
        }

        if (user.Role != UserRole.Seller)
        {
            throw new BadRequestException("User is not a seller");
        }

        if (user.IsApproved)
        {
            throw new BadRequestException("Cannot reject an already approved seller");
        }

        // Soft delete the rejected seller
        user.IsDeleted = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Seller {UserId} rejected and removed", id);

        // Send rejection email
        try
        {
            var userName = $"{user.FirstName} {user.LastName}";
            await _emailService.SendSellerRejectionEmailAsync(user.Email, userName, reason);
            _logger.LogInformation("Seller rejection email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send seller rejection email to {Email}", user.Email);
        }
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        
        if (user == null || user.IsDeleted)
        {
            throw new NotFoundException("User", id);
        }

        // Prevent deleting admin users
        if (user.Role == UserRole.Admin)
        {
            throw new BadRequestException("Cannot delete admin users");
        }

        await _unitOfWork.Users.DeleteAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deleted successfully", id);
    }

    private static UserResponse MapToUserResponse(Core.Entities.User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            IsApproved = user.IsApproved,
            GstNumber = user.GstNumber,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private static UserListResponse MapToUserListResponse(Core.Entities.User user)
    {
        return new UserListResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            IsApproved = user.IsApproved,
            GstNumber = user.GstNumber,
            CreatedAt = user.CreatedAt
        };
    }
}
