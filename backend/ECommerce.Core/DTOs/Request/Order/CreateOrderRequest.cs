using System.ComponentModel.DataAnnotations;

namespace ECommerce.Core.DTOs.Request.Order;

public class CreateOrderRequest
{
    [Required]
    public int AddressId { get; set; }

    public string? CouponCode { get; set; }
}
