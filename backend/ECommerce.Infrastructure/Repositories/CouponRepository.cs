using ECommerce.Core.Entities;
using ECommerce.Core.Enums;
using ECommerce.Core.Interfaces;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CouponRepository : Repository<Coupon>, ICouponRepository
{
    public CouponRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Coupon>> GetAllAsync()
    {
        return await _dbSet
            .Where(c => !c.IsDeleted)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public override async Task<Coupon?> GetByIdAsync(int id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
    }

    public async Task<(List<Coupon> Items, int TotalCount)> GetAllPagedAsync(string? search, bool? isActive, int? type, int page, int pageSize)
    {
        var query = _dbSet.Where(c => !c.IsDeleted);

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        if (type.HasValue && Enum.IsDefined(typeof(CouponType), type.Value))
            query = query.Where(c => (int)c.Type == type.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.Code.ToLower().Contains(term) ||
                (c.Description != null && c.Description.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, totalCount);
    }

    public async Task<bool> CodeExistsAsync(string code, int? excludeId = null)
    {
        var query = _dbSet.Where(c => c.Code.ToLower() == code.Trim().ToLower() && !c.IsDeleted);
        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);
        return await query.AnyAsync();
    }

    public async Task<Coupon?> GetByCodeAsync(string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return null;
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Code.Trim().ToLower() == code.Trim().ToLower() && !c.IsDeleted);
    }
}
