using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoriesController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<InventoriesController> _logger;

    public InventoriesController(IInventoryService inventoryService, ILogger<InventoriesController> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    private bool IsSeller()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value?.Equals("Seller", StringComparison.OrdinalIgnoreCase) ?? false;
    }

    /// <summary>
    /// Get inventory for the current seller (Seller only)
    /// </summary>
    [HttpGet("seller")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<InventoryResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryResponse>>>> GetSellerInventory()
    {
        if (!IsSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<IEnumerable<InventoryResponse>>.ErrorResponse("Access denied. Seller privileges required."));
        }

        var sellerId = GetCurrentUserId();
        if (sellerId <= 0)
        {
            return Unauthorized(ApiResponse<IEnumerable<InventoryResponse>>.ErrorResponse("Invalid user context"));
        }

        try
        {
            var inventory = await _inventoryService.GetBySellerIdAsync(sellerId);
            return Ok(ApiResponse<IEnumerable<InventoryResponse>>.SuccessResponse(inventory, "Inventory retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving inventory for seller {SellerId}", sellerId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<InventoryResponse>>.ErrorResponse("An error occurred while retrieving inventory"));
        }
    }

    /// <summary>
    /// Get inventory stats for the current seller (Seller only)
    /// </summary>
    [HttpGet("seller/stats")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<object>>> GetSellerInventoryStats()
    {
        if (!IsSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<object>.ErrorResponse("Access denied. Seller privileges required."));
        }

        var sellerId = GetCurrentUserId();
        if (sellerId <= 0)
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user context"));
        }

        try
        {
            var stats = await _inventoryService.GetSellerInventoryStatsAsync(sellerId);
            return Ok(ApiResponse<object>.SuccessResponse(stats, "Inventory stats retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving inventory stats for seller {SellerId}", sellerId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResponse("An error occurred while retrieving inventory stats"));
        }
    }
}
