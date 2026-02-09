using System.Security.Claims;
using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Cart;
using ECommerce.Core.DTOs.Response.Cart;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    /// <summary>
    /// Get current customer's cart
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<CartResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<CartResponse>>> GetCart()
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Invalid user context"));

        try
        {
            var cart = await _cartService.GetCartAsync(userId);
            return Ok(ApiResponse<CartResponse>.SuccessResponse(cart, "Cart retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cart for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CartResponse>.ErrorResponse("An error occurred while retrieving the cart"));
        }
    }

    /// <summary>
    /// Add product to cart (validates stock availability)
    /// </summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(ApiResponse<CartResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CartResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<CartResponse>>> AddToCart([FromBody] AddToCartRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Invalid user context"));

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<CartResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var cart = await _cartService.AddToCartAsync(userId, request);
            return Ok(ApiResponse<CartResponse>.SuccessResponse(cart, "Item added to cart"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<CartResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<CartResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to cart for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CartResponse>.ErrorResponse("An error occurred while adding to cart"));
        }
    }

    /// <summary>
    /// Update cart item quantity (validates stock)
    /// </summary>
    [HttpPut("items/{cartItemId:int}")]
    [ProducesResponseType(typeof(ApiResponse<CartResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CartResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CartResponse>>> UpdateItem(int cartItemId, [FromBody] UpdateCartItemRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Invalid user context"));

        try
        {
            var cart = await _cartService.UpdateItemQuantityAsync(userId, cartItemId, request);
            return Ok(ApiResponse<CartResponse>.SuccessResponse(cart, "Cart updated"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<CartResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<CartResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cart item {CartItemId}", cartItemId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CartResponse>.ErrorResponse("An error occurred while updating the cart"));
        }
    }

    /// <summary>
    /// Remove item from cart
    /// </summary>
    [HttpDelete("items/{cartItemId:int}")]
    [ProducesResponseType(typeof(ApiResponse<CartResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CartResponse>>> RemoveItem(int cartItemId)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Invalid user context"));

        try
        {
            var cart = await _cartService.RemoveItemAsync(userId, cartItemId);
            return Ok(ApiResponse<CartResponse>.SuccessResponse(cart, "Item removed from cart"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<CartResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cart item {CartItemId}", cartItemId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CartResponse>.ErrorResponse("An error occurred while removing from cart"));
        }
    }

    /// <summary>
    /// Clear all items from cart
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(typeof(ApiResponse<CartResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<CartResponse>>> ClearCart()
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<CartResponse>.ErrorResponse("Invalid user context"));

        try
        {
            var cart = await _cartService.ClearCartAsync(userId);
            return Ok(ApiResponse<CartResponse>.SuccessResponse(cart, "Cart cleared"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CartResponse>.ErrorResponse("An error occurred while clearing the cart"));
        }
    }
}
