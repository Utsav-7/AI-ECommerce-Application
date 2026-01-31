using ECommerce.Core.Entities;
using ECommerce.Core.Enums;
using ECommerce.Core.Interfaces;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        // Check email uniqueness including soft-deleted users
        // to prevent re-registration with same email
        return await _dbSet
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role)
    {
        return await _dbSet
            .Where(u => u.Role == role && !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _dbSet
            .Where(u => !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetPendingSellersAsync()
    {
        return await _dbSet
            .Where(u => u.Role == UserRole.Seller && !u.IsApproved && !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUserCountByRoleAsync(UserRole role)
    {
        return await _dbSet
            .Where(u => u.Role == role && !u.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetPendingSellersCountAsync()
    {
        return await _dbSet
            .Where(u => u.Role == UserRole.Seller && !u.IsApproved && !u.IsDeleted)
            .CountAsync();
    }

    public async Task<(List<User> Items, int TotalCount)> GetAllUsersPagedAsync(string? search, string? role, bool? isActive, int page, int pageSize)
    {
        var query = _dbSet.Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var userRole))
            query = query.Where(u => u.Role == userRole);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                (u.FirstName + " " + u.LastName).ToLower().Contains(term) ||
                (u.Email != null && u.Email.ToLower().Contains(term)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(search.Trim())));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, totalCount);
    }

    public async Task<(List<User> Items, int TotalCount)> GetPendingSellersPagedAsync(string? search, int page, int pageSize)
    {
        var query = _dbSet
            .Where(u => u.Role == UserRole.Seller && !u.IsApproved && !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                (u.FirstName + " " + u.LastName).ToLower().Contains(term) ||
                (u.Email != null && u.Email.ToLower().Contains(term)) ||
                (u.GstNumber != null && u.GstNumber.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, totalCount);
    }
}

