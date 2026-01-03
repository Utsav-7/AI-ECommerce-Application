using ECommerce.Core.Entities.Base;

namespace ECommerce.Core.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Price at the time of order
    public decimal? DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    // Navigation Properties
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}

