using ECommerce.Core.Entities.Base;

namespace ECommerce.Core.Entities;

public class CartItem : BaseEntity
{
    public int CartId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Price at the time of adding to cart

    // Navigation Properties
    public Cart Cart { get; set; } = null!;
    public Product Product { get; set; } = null!;
}

