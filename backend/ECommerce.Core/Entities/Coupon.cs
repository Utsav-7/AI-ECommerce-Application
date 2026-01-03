using ECommerce.Core.Entities.Base;
using ECommerce.Core.Enums;

namespace ECommerce.Core.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty; // Unique coupon code
    public string Description { get; set; } = string.Empty;
    public CouponType Type { get; set; }
    public decimal Value { get; set; } // Percentage or flat amount
    public decimal? MinPurchaseAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; } // For percentage coupons
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public int UsageLimit { get; set; } = 0; // 0 means unlimited
    public int UsedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

