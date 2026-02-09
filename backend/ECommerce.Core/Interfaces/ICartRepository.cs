using ECommerce.Core.Entities;

namespace ECommerce.Core.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByUserIdAsync(int userId);
    Task<Cart> GetOrCreateCartForUserAsync(int userId);
    Task<CartItem?> GetCartItemByIdAsync(int cartItemId);
    Task<CartItem?> GetCartItemByCartAndProductAsync(int cartId, int productId);
    Task<CartItem> AddCartItemAsync(CartItem item);
    Task UpdateCartItemAsync(CartItem item);
}
