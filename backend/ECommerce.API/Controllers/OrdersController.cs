using System.Security.Claims;
using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Order;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.Order;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    private static int? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>
    /// Place order from cart (Customer only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "User")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<OrderResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> PlaceOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserId(User);
        if (!userId.HasValue)
            return Unauthorized(ApiResponse<OrderResponse>.ErrorResponse("Invalid user context"));

        try
        {
            var order = await _orderService.PlaceOrderAsync(userId.Value, request);
            return Ok(ApiResponse<OrderResponse>.SuccessResponse(order, "Order placed successfully"));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<OrderResponse>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            return Unauthorized(ApiResponse<OrderResponse>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Get order by ID (Customer: own orders, Seller: orders with seller's products, Admin: any)
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "User,Admin,Seller")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> GetOrder(int id)
    {
        var userId = GetUserId(User);
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var isAdmin = role == "Admin";
        var isSeller = role == "Seller";
        var sellerId = isSeller && userId.HasValue ? userId : null;

        var order = await _orderService.GetByIdAsync(id, userId, sellerId, isAdmin);
        if (order == null)
            return NotFound(ApiResponse<OrderResponse>.ErrorResponse("Order not found"));

        return Ok(ApiResponse<OrderResponse>.SuccessResponse(order));
    }

    /// <summary>
    /// Get current customer's orders
    /// </summary>
    [HttpGet("my-orders")]
    [Authorize(Roles = "User")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<OrderResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<OrderResponse>>>> GetMyOrders([FromQuery] int? limit = null)
    {
        var userId = GetUserId(User);
        if (!userId.HasValue)
            return Unauthorized(ApiResponse<IEnumerable<OrderResponse>>.ErrorResponse("Invalid user context"));

        var orders = await _orderService.GetMyOrdersAsync(userId.Value, limit);
        return Ok(ApiResponse<IEnumerable<OrderResponse>>.SuccessResponse(orders));
    }

    /// <summary>
    /// Get all orders (Admin only)
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<OrderResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResponse<OrderResponse>>>> GetOrdersForAdmin(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _orderService.GetOrdersForAdminAsync(page, pageSize);
        return Ok(ApiResponse<PagedResponse<OrderResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Get orders for current seller
    /// </summary>
    [HttpGet("seller")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<OrderResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResponse<OrderResponse>>>> GetOrdersForSeller(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var sellerId = GetUserId(User);
        if (!sellerId.HasValue)
            return Unauthorized(ApiResponse<PagedResponse<OrderResponse>>.ErrorResponse("Invalid user context"));

        var result = await _orderService.GetOrdersForSellerAsync(sellerId.Value, page, pageSize);
        return Ok(ApiResponse<PagedResponse<OrderResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Update order status (Admin or Seller)
    /// </summary>
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin,Seller")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> UpdateOrderStatus(
        int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var userId = GetUserId(User);
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var isAdmin = role == "Admin";
        var sellerId = role == "Seller" && userId.HasValue ? userId : null;

        try
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, request, sellerId, isAdmin);
            return Ok(ApiResponse<OrderResponse>.SuccessResponse(order, "Order status updated"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<OrderResponse>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            return Forbid();
        }
    }
}
