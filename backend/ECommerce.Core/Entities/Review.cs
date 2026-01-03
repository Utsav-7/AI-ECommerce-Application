using ECommerce.Core.Entities.Base;

namespace ECommerce.Core.Entities;

public class Review : BaseEntity
{
    public int ProductId { get; set; }
    public int UserId { get; set; }
    public int OrderId { get; set; } // To ensure user has purchased the product
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = false; // Admin approval

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public User User { get; set; } = null!;
    public Order Order { get; set; } = null!;
}

