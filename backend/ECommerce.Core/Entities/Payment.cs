using ECommerce.Core.Entities.Base;
using ECommerce.Core.Enums;

namespace ECommerce.Core.Entities;

public class Payment : BaseEntity
{
    public int OrderId { get; set; }
    public string TransactionId { get; set; } = string.Empty; // Payment gateway transaction ID
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public string? PaymentGatewayResponse { get; set; } // JSON response from gateway
    public DateTime? PaidAt { get; set; }

    // Navigation Properties
    public Order Order { get; set; } = null!;
}

