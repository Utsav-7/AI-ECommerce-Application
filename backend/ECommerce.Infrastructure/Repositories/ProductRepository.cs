using ECommerce.Core.Entities;
using ECommerce.Core.Interfaces;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Product?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => !p.IsDeleted)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Product>> GetAllWithDetailsAsync()
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetBySellerIdAsync(int sellerId)
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => p.SellerId == sellerId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId)
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => p.CategoryId == categoryId && !p.IsDeleted && p.IsVisible && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetActiveProductsAsync()
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => p.IsActive && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetVisibleProductsAsync()
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => p.IsActive && p.IsVisible && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => !p.IsDeleted && p.IsActive && p.IsVisible &&
                (p.Name.ToLower().Contains(lowerSearchTerm) ||
                 p.Description.ToLower().Contains(lowerSearchTerm) ||
                 p.Category.Name.ToLower().Contains(lowerSearchTerm)))
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetProductCountBySellerAsync(int sellerId)
    {
        return await _dbSet
            .Where(p => p.SellerId == sellerId && !p.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetProductCountByCategoryAsync(int categoryId)
    {
        return await _dbSet
            .Where(p => p.CategoryId == categoryId && !p.IsDeleted)
            .CountAsync();
    }

    public async Task<bool> ProductExistsAsync(int id)
    {
        return await _dbSet
            .AnyAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<(List<Product> Items, int TotalCount)> GetAllWithDetailsPagedAsync(string? search, int? categoryId, bool? isActive, bool? isVisible, int page, int pageSize)
    {
        var query = _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => !p.IsDeleted);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);
        if (isVisible.HasValue)
            query = query.Where(p => p.IsVisible == isVisible.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                (p.Description != null && p.Description.ToLower().Contains(term)) ||
                (p.Category != null && p.Category.Name.ToLower().Contains(term)) ||
                (p.Seller != null && (p.Seller.FirstName + " " + p.Seller.LastName).ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();
        var skip = (page - 1) * pageSize;
        var take = pageSize;
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        return (items, totalCount);
    }

    public async Task<(List<Product> Items, int TotalCount)> GetBySellerIdPagedAsync(int sellerId, string? search, int? categoryId, bool? isActive, int page, int pageSize)
    {
        var query = _dbSet
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Where(p => p.SellerId == sellerId && !p.IsDeleted);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                (p.Description != null && p.Description.ToLower().Contains(term)) ||
                (p.Category != null && p.Category.Name.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();
        var skip = (page - 1) * pageSize;
        var take = pageSize;
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
        return (items, totalCount);
    }
}
