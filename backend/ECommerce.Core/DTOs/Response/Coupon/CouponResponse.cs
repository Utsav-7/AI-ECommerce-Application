using ECommerce.Core.Enums;

namespace ECommerce.Core.DTOs.Response.Coupon;

public class CouponResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CouponType Type { get; set; }
    public string TypeName { get; set; } = string.Empty; // "Percentage" or "Flat"
    public decimal Value { get; set; }
    public decimal? MinPurchaseAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
