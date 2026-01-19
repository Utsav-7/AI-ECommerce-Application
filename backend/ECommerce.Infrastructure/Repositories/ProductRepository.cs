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
}
