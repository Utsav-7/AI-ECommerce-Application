namespace ECommerce.Core.DTOs.Response.Coupon;

public class ValidateCouponResponse
{
    public bool Valid { get; set; }
    public decimal DiscountAmount { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Code { get; set; }
}
