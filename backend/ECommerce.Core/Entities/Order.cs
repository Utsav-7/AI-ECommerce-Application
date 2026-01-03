using ECommerce.Core.Entities.Base;
using ECommerce.Core.Enums;

namespace ECommerce.Core.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty; // Unique order number
    public int UserId { get; set; }
    public int AddressId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public int? CouponId { get; set; }

    // Navigation Properties
    public User User { get; set; } = null!;
    public Address Address { get; set; } = null!;
    public Coupon? Coupon { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
}

