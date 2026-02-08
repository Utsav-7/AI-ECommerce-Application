using ECommerce.Core.Entities;

namespace ECommerce.Core.Interfaces;

public interface IInventoryRepository : IRepository<Inventory>
{
    Task<IEnumerable<Inventory>> GetBySellerIdAsync(int sellerId);
    Task<int> GetLowStockCountBySellerAsync(int sellerId);
}
