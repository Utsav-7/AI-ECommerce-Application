namespace ECommerce.Core.DTOs.Response.Cart;

public class CartResponse
{
    public int CartId { get; set; }
    public List<CartItemResponse> Items { get; set; } = new();
    public int TotalItems => Items.Sum(i => i.Quantity);
    public decimal Subtotal => Items.Sum(i => i.Subtotal);
}
