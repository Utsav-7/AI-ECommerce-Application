using ECommerce.Core.DTOs.Response.Inventory;

namespace ECommerce.Application.Services.Interfaces;

public interface IInventoryService
{
    Task<IEnumerable<InventoryResponse>> GetBySellerIdAsync(int sellerId);
    Task<object> GetSellerInventoryStatsAsync(int sellerId);
}
