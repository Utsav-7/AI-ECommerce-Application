using ECommerce.Core.DTOs.Request.User;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.User;

namespace ECommerce.Application.Services.Interfaces;

public interface IUserService
{
    // Get operations
    Task<UserResponse> GetByIdAsync(int id);
    Task<IEnumerable<UserListResponse>> GetAllUsersAsync();
    Task<IEnumerable<UserListResponse>> GetUsersByRoleAsync(string role);
    Task<IEnumerable<PendingSellerResponse>> GetPendingSellersAsync();
    Task<PagedResponse<UserListResponse>> GetAllUsersPagedAsync(string? search, string? role, bool? isActive, int page, int pageSize);
    Task<PagedResponse<PendingSellerResponse>> GetPendingSellersPagedAsync(string? search, int page, int pageSize);
    
    // Dashboard stats
    Task<int> GetTotalUsersCountAsync();
    Task<int> GetTotalSellersCountAsync();
    Task<int> GetPendingSellersCountAsync();
    
    // Update operations
    Task<UserResponse> UpdateUserAsync(int id, UpdateUserRequest request);
    Task<UserResponse> UpdateUserStatusAsync(int id, bool isActive);
    
    // Seller approval
    Task<UserResponse> ApproveSellerAsync(int id);
    Task RejectSellerAsync(int id, string? reason);
    
    // Delete operation
    Task DeleteUserAsync(int id);
}
