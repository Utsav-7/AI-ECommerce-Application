using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Response.Inventory;
using ECommerce.Core.Interfaces;

namespace ECommerce.Application.Services.Implementations;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public InventoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<InventoryResponse>> GetBySellerIdAsync(int sellerId)
    {
        var inventories = await _unitOfWork.Inventories.GetBySellerIdAsync(sellerId);
        return inventories.Select(i => new InventoryResponse
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product.Name,
            StockQuantity = i.StockQuantity,
            ReservedQuantity = i.ReservedQuantity,
            LowStockThreshold = i.LowStockThreshold,
            LastRestockedDate = i.LastRestockedDate
        });
    }

    public async Task<object> GetSellerInventoryStatsAsync(int sellerId)
    {
        var inventories = (await _unitOfWork.Inventories.GetBySellerIdAsync(sellerId)).ToList();
        var lowStockCount = await _unitOfWork.Inventories.GetLowStockCountBySellerAsync(sellerId);

        var totalItems = inventories.Sum(i => i.StockQuantity);
        var totalProducts = inventories.Count;

        return new
        {
            TotalItems = totalItems,
            TotalProducts = totalProducts,
            LowStockCount = lowStockCount
        };
    }
}
