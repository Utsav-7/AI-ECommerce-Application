using System.ComponentModel.DataAnnotations;
using ECommerce.Core.Enums;

namespace ECommerce.Core.DTOs.Request.Coupon;

public class CreateCouponRequest
{
    [Required(ErrorMessage = "Coupon code is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Code must be between 1 and 100 characters")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string Description { get; set; } = string.Empty;

    [Required]
    public CouponType Type { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Value must be greater than 0")]
    public decimal Value { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Min purchase amount cannot be negative")]
    public decimal? MinPurchaseAmount { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Max discount amount cannot be negative")]
    public decimal? MaxDiscountAmount { get; set; }

    [Required]
    public DateTime ValidFrom { get; set; }

    [Required]
    public DateTime ValidTo { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Usage limit cannot be negative")]
    public int UsageLimit { get; set; } = 0; // 0 = unlimited

    public bool IsActive { get; set; } = true;
}
