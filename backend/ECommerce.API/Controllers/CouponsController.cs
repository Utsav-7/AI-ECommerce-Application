using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Coupon;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.Coupon;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;
    private readonly ILogger<CouponsController> _logger;

    public CouponsController(ICouponService couponService, ILogger<CouponsController> logger)
    {
        _couponService = couponService;
        _logger = logger;
    }

    /// <summary>
    /// Validate a coupon code for cart/order amount (public - no auth required).
    /// </summary>
    [HttpGet("validate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<ValidateCouponResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<ValidateCouponResponse>>> ValidateCoupon(
        [FromQuery] string? code,
        [FromQuery] decimal orderAmount = 0)
    {
        try
        {
            var result = await _couponService.ValidateCouponAsync(code ?? string.Empty, orderAmount);
            return Ok(ApiResponse<ValidateCouponResponse>.SuccessResponse(result, result.Valid ? "Coupon applied" : result.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating coupon");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<ValidateCouponResponse>.ErrorResponse("An error occurred while validating the coupon"));
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CouponResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CouponResponse>>>> GetAll()
    {
        try
        {
            var coupons = await _couponService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<CouponResponse>>.SuccessResponse(coupons, "Coupons retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving coupons");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<CouponResponse>>.ErrorResponse("An error occurred while retrieving coupons"));
        }
    }

    [HttpGet("paged")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<CouponResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<PagedResponse<CouponResponse>>>> GetAllPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int? type = null)
    {
        try
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var result = await _couponService.GetAllPagedAsync(search, isActive, type, page, pageSize);
            return Ok(ApiResponse<PagedResponse<CouponResponse>>.SuccessResponse(result, "Coupons retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving coupons");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<PagedResponse<CouponResponse>>.ErrorResponse("An error occurred while retrieving coupons"));
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<CouponResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CouponResponse>>> GetById(int id)
    {
        try
        {
            var coupon = await _couponService.GetByIdAsync(id);
            return Ok(ApiResponse<CouponResponse>.SuccessResponse(coupon, "Coupon retrieved successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<CouponResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving coupon {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CouponResponse>.ErrorResponse("An error occurred while retrieving the coupon"));
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CouponResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<CouponResponse>>> Create([FromBody] CreateCouponRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<CouponResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var coupon = await _couponService.CreateAsync(request);
            _logger.LogInformation("Created coupon with ID: {Id}, Code: {Code}", coupon.Id, coupon.Code);
            return CreatedAtAction(nameof(GetById), new { id = coupon.Id },
                ApiResponse<CouponResponse>.SuccessResponse(coupon, "Coupon created successfully"));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<CouponResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating coupon");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CouponResponse>.ErrorResponse("An error occurred while creating the coupon"));
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<CouponResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CouponResponse>>> Update(int id, [FromBody] UpdateCouponRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<CouponResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var coupon = await _couponService.UpdateAsync(id, request);
            _logger.LogInformation("Updated coupon with ID: {Id}", id);
            return Ok(ApiResponse<CouponResponse>.SuccessResponse(coupon, "Coupon updated successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<CouponResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<CouponResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating coupon {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<CouponResponse>.ErrorResponse("An error occurred while updating the coupon"));
        }
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        try
        {
            await _couponService.DeleteAsync(id);
            _logger.LogInformation("Deleted coupon with ID: {Id}", id);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Coupon deleted successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting coupon {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResponse("An error occurred while deleting the coupon"));
        }
    }
}
