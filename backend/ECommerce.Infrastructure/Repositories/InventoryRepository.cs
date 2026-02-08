using ECommerce.Core.Entities;
using ECommerce.Core.Interfaces;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class InventoryRepository : Repository<Inventory>, IInventoryRepository
{
    public InventoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Inventory>> GetBySellerIdAsync(int sellerId)
    {
        return await _dbSet
            .Include(i => i.Product)
            .Where(i => i.Product.SellerId == sellerId && !i.IsDeleted)
            .OrderBy(i => i.Product.Name)
            .ToListAsync();
    }

    public async Task<int> GetLowStockCountBySellerAsync(int sellerId)
    {
        return await _dbSet
            .Where(i => i.Product.SellerId == sellerId && !i.IsDeleted && i.StockQuantity <= i.LowStockThreshold)
            .CountAsync();
    }
}
