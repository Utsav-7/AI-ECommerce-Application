using ECommerce.Core.Entities;
using ECommerce.Core.Enums;

namespace ECommerce.Core.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role);
}

