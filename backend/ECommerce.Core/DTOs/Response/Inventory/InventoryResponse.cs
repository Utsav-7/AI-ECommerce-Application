namespace ECommerce.Core.DTOs.Response.Inventory;

public class InventoryResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int AvailableQuantity => StockQuantity - ReservedQuantity;
    public int LowStockThreshold { get; set; }
    public bool IsLowStock => StockQuantity <= LowStockThreshold;
    public DateTime? LastRestockedDate { get; set; }
}
