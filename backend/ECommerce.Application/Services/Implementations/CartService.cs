using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Cart;
using ECommerce.Core.DTOs.Response.Cart;
using ECommerce.Core.Entities;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Services.Implementations;

public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CartService> _logger;

    public CartService(IUnitOfWork unitOfWork, ILogger<CartService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<CartResponse> GetCartAsync(int userId)
    {
        var cart = await _unitOfWork.Carts.GetByUserIdAsync(userId);
        if (cart == null || !cart.CartItems.Any())
            return new CartResponse { CartId = 0, Items = new List<CartItemResponse>() };

        var items = new List<CartItemResponse>();
        foreach (var item in cart.CartItems.Where(ci => !ci.IsDeleted))
        {
            var availableStock = await GetAvailableStockAsync(item.ProductId);
            items.Add(MapToCartItemResponse(item, availableStock));
        }

        return new CartResponse
        {
            CartId = cart.Id,
            Items = items
        };
    }

    public async Task<CartResponse> AddToCartAsync(int userId, AddToCartRequest request)
    {
        var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(request.ProductId);
        if (product == null || !product.IsActive || !product.IsVisible)
            throw new NotFoundException("Product", request.ProductId);

        var availableStock = await GetAvailableStockAsync(request.ProductId);
        if (availableStock < 1)
            throw new BadRequestException("Product is out of stock.");

        if (request.Quantity > availableStock)
            throw new BadRequestException($"Only {availableStock} item(s) available in stock.");

        var cart = await _unitOfWork.Carts.GetOrCreateCartForUserAsync(userId);
        var unitPrice = product.DiscountPrice ?? product.Price;

        var existingItem = await _unitOfWork.Carts.GetCartItemByCartAndProductAsync(cart.Id, request.ProductId);
        if (existingItem != null)
        {
            var newQty = existingItem.Quantity + request.Quantity;
            if (newQty > availableStock)
                throw new BadRequestException($"Only {availableStock} item(s) available. You already have {existingItem.Quantity} in cart.");
            existingItem.Quantity = newQty;
            existingItem.Price = unitPrice;
            await _unitOfWork.Carts.UpdateCartItemAsync(existingItem);
        }
        else
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                Price = unitPrice
            };
            await _unitOfWork.Carts.AddCartItemAsync(newItem);
        }

        await _unitOfWork.SaveChangesAsync();
        return await GetCartAsync(userId);
    }

    public async Task<CartResponse> UpdateItemQuantityAsync(int userId, int cartItemId, UpdateCartItemRequest request)
    {
        var cart = await _unitOfWork.Carts.GetByUserIdAsync(userId);
        if (cart == null)
            return await GetCartAsync(userId);

        var item = await _unitOfWork.Carts.GetCartItemByIdAsync(cartItemId);
        if (item == null || item.CartId != cart.Id)
            throw new NotFoundException("Cart item", cartItemId);

        var availableStock = await GetAvailableStockAsync(item.ProductId);
        if (request.Quantity > availableStock)
            throw new BadRequestException($"Only {availableStock} item(s) available in stock.");

        item.Quantity = request.Quantity;
        await _unitOfWork.Carts.UpdateCartItemAsync(item);
        await _unitOfWork.SaveChangesAsync();

        return await GetCartAsync(userId);
    }

    public async Task<CartResponse> RemoveItemAsync(int userId, int cartItemId)
    {
        var cart = await _unitOfWork.Carts.GetByUserIdAsync(userId);
        if (cart == null)
            return await GetCartAsync(userId);

        var item = await _unitOfWork.Carts.GetCartItemByIdAsync(cartItemId);
        if (item == null || item.CartId != cart.Id)
            throw new NotFoundException("Cart item", cartItemId);

        item.IsDeleted = true;
        await _unitOfWork.Carts.UpdateCartItemAsync(item);
        await _unitOfWork.SaveChangesAsync();

        return await GetCartAsync(userId);
    }

    public async Task<CartResponse> ClearCartAsync(int userId)
    {
        var cart = await _unitOfWork.Carts.GetByUserIdAsync(userId);
        if (cart == null)
            return await GetCartAsync(userId);

        foreach (var item in cart.CartItems.Where(ci => !ci.IsDeleted))
        {
            item.IsDeleted = true;
            await _unitOfWork.Carts.UpdateCartItemAsync(item);
        }
        await _unitOfWork.SaveChangesAsync();

        return new CartResponse { CartId = cart.Id, Items = new List<CartItemResponse>() };
    }

    private async Task<int> GetAvailableStockAsync(int productId)
    {
        var inventory = await _unitOfWork.Inventories.GetByProductIdAsync(productId);
        if (inventory != null)
            return inventory.StockQuantity - inventory.ReservedQuantity;

        var product = await _unitOfWork.Products.GetByIdAsync(productId);
        return product?.StockQuantity ?? 0;
    }

    private static CartItemResponse MapToCartItemResponse(CartItem item, int availableStock)
    {
        var product = item.Product;
        return new CartItemResponse
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = product?.Name ?? string.Empty,
            ImageUrl = product?.ImageUrl,
            UnitPrice = item.Price,
            Quantity = item.Quantity,
            AvailableStock = availableStock
        };
    }
}
