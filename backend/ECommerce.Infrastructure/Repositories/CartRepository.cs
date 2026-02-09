using ECommerce.Core.Entities;
using ECommerce.Core.Interfaces;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly ApplicationDbContext _context;

    public CartRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByUserIdAsync(int userId)
    {
        return await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .ThenInclude(p => p.Category)
            .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);
    }

    public async Task<Cart> GetOrCreateCartForUserAsync(int userId)
    {
        var cart = await GetByUserIdAsync(userId);
        if (cart != null)
            return cart;

        var newCart = new Cart { UserId = userId };
        await _context.Carts.AddAsync(newCart);
        await _context.SaveChangesAsync();

        return await GetByUserIdAsync(userId) ?? newCart;
    }

    public async Task<CartItem?> GetCartItemByIdAsync(int cartItemId)
    {
        return await _context.CartItems
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId && !ci.IsDeleted);
    }

    public async Task<CartItem?> GetCartItemByCartAndProductAsync(int cartId, int productId)
    {
        return await _context.CartItems
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.ProductId == productId && !ci.IsDeleted);
    }

    public async Task<CartItem> AddCartItemAsync(CartItem item)
    {
        await _context.CartItems.AddAsync(item);
        return item;
    }

    public Task UpdateCartItemAsync(CartItem item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        _context.CartItems.Update(item);
        return Task.CompletedTask;
    }
}
