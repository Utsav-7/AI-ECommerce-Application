using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.User;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.User;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using PagedUserList = ECommerce.Core.DTOs.Response.Common.PagedResponse<ECommerce.Core.DTOs.Response.User.UserListResponse>;
using PagedPendingSeller = ECommerce.Core.DTOs.Response.Common.PagedResponse<ECommerce.Core.DTOs.Response.User.PendingSellerResponse>;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IProductService _productService;
    private readonly ICategoryService _categoryService;
    private readonly ICouponService _couponService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, IProductService productService, ICategoryService categoryService, ICouponService couponService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _productService = productService;
        _categoryService = categoryService;
        _couponService = couponService;
        _logger = logger;
    }

    private bool IsAdmin()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        return roleClaim != null && roleClaim.Equals("Admin", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListResponse>>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserListResponse>>>> GetAllUsers()
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<IEnumerable<UserListResponse>>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var users = await _userService.GetAllUsersAsync();
            _logger.LogInformation("Retrieved {Count} users", users.Count());
            
            return Ok(ApiResponse<IEnumerable<UserListResponse>>.SuccessResponse(users, "Users retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving users");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<UserListResponse>>.ErrorResponse("An error occurred while retrieving users"));
        }
    }

    /// <summary>
    /// Get users with server-side pagination and search (Admin only)
    /// </summary>
    [HttpGet("paged")]
    [ProducesResponseType(typeof(ApiResponse<PagedUserList>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PagedUserList>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<PagedUserList>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<PagedUserList>>> GetUsersPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<PagedUserList>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var result = await _userService.GetAllUsersPagedAsync(search, role, isActive, page, pageSize);
            return Ok(ApiResponse<PagedUserList>.SuccessResponse(result, "Users retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving users");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<PagedUserList>.ErrorResponse("An error occurred while retrieving users"));
        }
    }

    /// <summary>
    /// Get users by role (Admin only)
    /// </summary>
    [HttpGet("role/{role}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListResponse>>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListResponse>>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserListResponse>>>> GetUsersByRole(string role)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<IEnumerable<UserListResponse>>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var users = await _userService.GetUsersByRoleAsync(role);
            _logger.LogInformation("Retrieved {Count} {Role} users", users.Count(), role);
            
            return Ok(ApiResponse<IEnumerable<UserListResponse>>.SuccessResponse(users, $"{role} users retrieved successfully"));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<IEnumerable<UserListResponse>>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving users by role");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<UserListResponse>>.ErrorResponse("An error occurred while retrieving users"));
        }
    }

    /// <summary>
    /// Get pending sellers (Admin only)
    /// </summary>
    [HttpGet("pending-sellers")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PendingSellerResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PendingSellerResponse>>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PendingSellerResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<PendingSellerResponse>>>> GetPendingSellers()
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<IEnumerable<PendingSellerResponse>>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var sellers = await _userService.GetPendingSellersAsync();
            _logger.LogInformation("Retrieved {Count} pending sellers", sellers.Count());
            
            return Ok(ApiResponse<IEnumerable<PendingSellerResponse>>.SuccessResponse(sellers, "Pending sellers retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving pending sellers");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<PendingSellerResponse>>.ErrorResponse("An error occurred while retrieving pending sellers"));
        }
    }

    /// <summary>
    /// Get pending sellers with server-side pagination and search (Admin only)
    /// </summary>
    [HttpGet("pending-sellers/paged")]
    [ProducesResponseType(typeof(ApiResponse<PagedPendingSeller>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PagedPendingSeller>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<PagedPendingSeller>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<PagedPendingSeller>>> GetPendingSellersPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<PagedPendingSeller>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var result = await _userService.GetPendingSellersPagedAsync(search, page, pageSize);
            return Ok(ApiResponse<PagedPendingSeller>.SuccessResponse(result, "Pending sellers retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving pending sellers");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<PagedPendingSeller>.ErrorResponse("An error occurred while retrieving pending sellers"));
        }
    }

    /// <summary>
    /// Get dashboard stats (Admin only)
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<object>>> GetDashboardStats()
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<object>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var totalUsers = await _userService.GetTotalUsersCountAsync();
            var totalSellers = await _userService.GetTotalSellersCountAsync();
            var pendingSellers = await _userService.GetPendingSellersCountAsync();
            var totalProducts = await _productService.GetTotalProductCountAsync();
            var totalCategories = await _categoryService.GetTotalCountAsync();
            var totalCoupons = await _couponService.GetTotalCountAsync();

            var stats = new
            {
                TotalUsers = totalUsers,
                TotalSellers = totalSellers,
                PendingSellers = pendingSellers,
                TotalProducts = totalProducts,
                TotalCategories = totalCategories,
                TotalCoupons = totalCoupons
            };

            return Ok(ApiResponse<object>.SuccessResponse(stats, "Dashboard stats retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving dashboard stats");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResponse("An error occurred while retrieving dashboard stats"));
        }
    }

    /// <summary>
    /// Get user by ID (Admin only)
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> GetUserById(int id)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<UserResponse>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var user = await _userService.GetByIdAsync(id);
            return Ok(ApiResponse<UserResponse>.SuccessResponse(user, "User retrieved successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<UserResponse>.ErrorResponse("An error occurred while retrieving user"));
        }
    }

    /// <summary>
    /// Update user (Admin only)
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<UserResponse>.ErrorResponse("Access denied. Admin privileges required."));
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<UserResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var user = await _userService.UpdateUserAsync(id, request);
            _logger.LogInformation("User {UserId} updated by admin", id);
            
            return Ok(ApiResponse<UserResponse>.SuccessResponse(user, "User updated successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<UserResponse>.ErrorResponse("An error occurred while updating user"));
        }
    }

    /// <summary>
    /// Update user status (activate/deactivate) (Admin only)
    /// </summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> UpdateUserStatus(int id, [FromBody] bool isActive)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<UserResponse>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var user = await _userService.UpdateUserStatusAsync(id, isActive);
            var statusText = isActive ? "activated" : "deactivated";
            _logger.LogInformation("User {UserId} {Status} by admin", id, statusText);
            
            return Ok(ApiResponse<UserResponse>.SuccessResponse(user, $"User {statusText} successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating user status {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<UserResponse>.ErrorResponse("An error occurred while updating user status"));
        }
    }

    /// <summary>
    /// Approve seller (Admin only)
    /// </summary>
    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> ApproveSeller(int id)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<UserResponse>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var user = await _userService.ApproveSellerAsync(id);
            _logger.LogInformation("Seller {UserId} approved by admin", id);
            
            return Ok(ApiResponse<UserResponse>.SuccessResponse(user, "Seller approved successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while approving seller {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<UserResponse>.ErrorResponse("An error occurred while approving seller"));
        }
    }

    /// <summary>
    /// Reject seller (Admin only)
    /// </summary>
    [HttpPost("{id:int}/reject")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> RejectSeller(int id, [FromBody] string? reason)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<object>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            await _userService.RejectSellerAsync(id, reason);
            _logger.LogInformation("Seller {UserId} rejected by admin", id);
            
            return Ok(ApiResponse<object>.SuccessResponse(null, "Seller rejected successfully"));
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
            _logger.LogError(ex, "An error occurred while rejecting seller {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResponse("An error occurred while rejecting seller"));
        }
    }

    /// <summary>
    /// Delete user (Admin only)
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUser(int id)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<object>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            await _userService.DeleteUserAsync(id);
            _logger.LogInformation("User {UserId} deleted by admin", id);
            
            return Ok(ApiResponse<object>.SuccessResponse(null, "User deleted successfully"));
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
            _logger.LogError(ex, "An error occurred while deleting user {UserId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResponse("An error occurred while deleting user"));
        }
    }
}
