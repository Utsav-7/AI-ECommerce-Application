using System.Text.Json.Serialization;
using ECommerce.Core.Enums;

namespace ECommerce.Core.DTOs.Request.Order;

public class UpdateOrderStatusRequest
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public OrderStatus Status { get; set; }
    public string? TrackingNumber { get; set; }
}
