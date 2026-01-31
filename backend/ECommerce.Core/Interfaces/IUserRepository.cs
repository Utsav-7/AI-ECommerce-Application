using ECommerce.Core.Entities;
using ECommerce.Core.Enums;

namespace ECommerce.Core.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role);
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<IEnumerable<User>> GetPendingSellersAsync();
    Task<int> GetUserCountByRoleAsync(UserRole role);
    Task<int> GetPendingSellersCountAsync();
    Task<(List<User> Items, int TotalCount)> GetAllUsersPagedAsync(string? search, string? role, bool? isActive, int page, int pageSize);
    Task<(List<User> Items, int TotalCount)> GetPendingSellersPagedAsync(string? search, int page, int pageSize);
}

