using ECommerce.Core.Entities.Base;

namespace ECommerce.Core.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImageUrls { get; set; } // JSON array for multiple images
    public bool IsActive { get; set; } = true;
    public bool IsVisible { get; set; } = true;
    public int StockQuantity { get; set; } = 0;
    public int CategoryId { get; set; }
    public int SellerId { get; set; } // User ID who is the seller

    // Navigation Properties
    public Category Category { get; set; } = null!;
    public User Seller { get; set; } = null!;
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public Inventory? Inventory { get; set; }
}

