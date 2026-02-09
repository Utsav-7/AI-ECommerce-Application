using System.Security.Claims;
using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Address;
using ECommerce.Core.DTOs.Response.Address;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User")]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addressService;
    private readonly ILogger<AddressesController> _logger;

    public AddressesController(IAddressService addressService, ILogger<AddressesController> logger)
    {
        _addressService = addressService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    /// <summary>
    /// Get all addresses for the current customer
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AddressResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<AddressResponse>>>> GetMyAddresses()
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<IEnumerable<AddressResponse>>.ErrorResponse("Invalid user context"));

        try
        {
            var addresses = await _addressService.GetByUserIdAsync(userId);
            return Ok(ApiResponse<IEnumerable<AddressResponse>>.SuccessResponse(addresses, "Addresses retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving addresses for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<AddressResponse>>.ErrorResponse("An error occurred while retrieving addresses"));
        }
    }

    /// <summary>
    /// Get address by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<AddressResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AddressResponse>>> GetById(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<AddressResponse>.ErrorResponse("Invalid user context"));

        try
        {
            var address = await _addressService.GetByIdAsync(id, userId);
            return Ok(ApiResponse<AddressResponse>.SuccessResponse(address, "Address retrieved successfully"));
        }
        catch (NotFoundException)
        {
            return NotFound(ApiResponse<AddressResponse>.ErrorResponse("Address not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving address {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<AddressResponse>.ErrorResponse("An error occurred while retrieving the address"));
        }
    }

    /// <summary>
    /// Create a new address
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<AddressResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<AddressResponse>>> Create([FromBody] CreateAddressRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<AddressResponse>.ErrorResponse("Invalid user context"));

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<AddressResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var address = await _addressService.CreateAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = address.Id },
                ApiResponse<AddressResponse>.SuccessResponse(address, "Address created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating address for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<AddressResponse>.ErrorResponse("An error occurred while creating the address"));
        }
    }

    /// <summary>
    /// Update an address
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<AddressResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AddressResponse>>> Update(int id, [FromBody] UpdateAddressRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<AddressResponse>.ErrorResponse("Invalid user context"));

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<AddressResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var address = await _addressService.UpdateAsync(id, userId, request);
            return Ok(ApiResponse<AddressResponse>.SuccessResponse(address, "Address updated successfully"));
        }
        catch (NotFoundException)
        {
            return NotFound(ApiResponse<AddressResponse>.ErrorResponse("Address not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating address {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<AddressResponse>.ErrorResponse("An error occurred while updating the address"));
        }
    }

    /// <summary>
    /// Delete an address
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user context"));

        try
        {
            await _addressService.DeleteAsync(id, userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Address deleted successfully"));
        }
        catch (NotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Address not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting address {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResponse("An error occurred while deleting the address"));
        }
    }

    /// <summary>
    /// Set an address as default
    /// </summary>
    [HttpPatch("{id:int}/set-default")]
    [ProducesResponseType(typeof(ApiResponse<AddressResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AddressResponse>>> SetDefault(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<AddressResponse>.ErrorResponse("Invalid user context"));

        try
        {
            var address = await _addressService.SetDefaultAsync(id, userId);
            return Ok(ApiResponse<AddressResponse>.SuccessResponse(address, "Default address updated successfully"));
        }
        catch (NotFoundException)
        {
            return NotFound(ApiResponse<AddressResponse>.ErrorResponse("Address not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting default address {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<AddressResponse>.ErrorResponse("An error occurred while updating the default address"));
        }
    }
}
