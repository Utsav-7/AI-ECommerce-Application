using ECommerce.Core.Entities.Base;

namespace ECommerce.Core.Entities;

public class Inventory : BaseEntity
{
    public int ProductId { get; set; }
    public int StockQuantity { get; set; }
    public int ReservedQuantity { get; set; } = 0; // Items in carts/orders
    public int AvailableQuantity => StockQuantity - ReservedQuantity;
    public int LowStockThreshold { get; set; } = 10; // Alert when stock is below this
    public DateTime? LastRestockedDate { get; set; }

    // Navigation Properties
    public Product Product { get; set; } = null!;
}

