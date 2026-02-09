using ECommerce.Core.DTOs.Request.Cart;
using ECommerce.Core.DTOs.Response.Cart;

namespace ECommerce.Application.Services.Interfaces;

public interface ICartService
{
    Task<CartResponse> GetCartAsync(int userId);
    Task<CartResponse> AddToCartAsync(int userId, AddToCartRequest request);
    Task<CartResponse> UpdateItemQuantityAsync(int userId, int cartItemId, UpdateCartItemRequest request);
    Task<CartResponse> RemoveItemAsync(int userId, int cartItemId);
    Task<CartResponse> ClearCartAsync(int userId);
}
