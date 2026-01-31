using ECommerce.Core.Entities;
using ECommerce.Core.Interfaces;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<bool> HasProductsAsync(int categoryId)
    {
        return await _dbSet
            .Where(c => c.Id == categoryId)
            .SelectMany(c => c.Products)
            .AnyAsync(p => !p.IsDeleted);
    }

    public async Task<bool> CategoryNameExistsAsync(string name, int? excludeId = null)
    {
        var query = _dbSet.Where(c => c.Name.ToLower() == name.ToLower() && !c.IsDeleted);
        
        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }
        
        return await query.AnyAsync();
    }

    public override async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _dbSet
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public override async Task<Category?> GetByIdAsync(int id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
    }

    public async Task<(List<Category> Items, int TotalCount)> GetAllPagedAsync(string? search, bool? isActive, int page, int pageSize)
    {
        var query = _dbSet.Where(c => !c.IsDeleted);

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                (c.Description != null && c.Description.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, totalCount);
    }
}
