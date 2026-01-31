using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Product;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.Product;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }

    private bool IsAdmin()
    {
        return GetCurrentUserRole().Equals("Admin", StringComparison.OrdinalIgnoreCase);
    }

    private bool IsSeller()
    {
        return GetCurrentUserRole().Equals("Seller", StringComparison.OrdinalIgnoreCase);
    }

    private bool IsAdminOrSeller()
    {
        var role = GetCurrentUserRole();
        return role.Equals("Admin", StringComparison.OrdinalIgnoreCase) || 
               role.Equals("Seller", StringComparison.OrdinalIgnoreCase);
    }

    #region Public Endpoints (No Auth Required)

    /// <summary>
    /// Get all visible products (Public - for customers)
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductPublicResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductPublicResponse>>>> GetPublicProducts()
    {
        try
        {
            var products = await _productService.GetAllPublicProductsAsync();
            return Ok(ApiResponse<IEnumerable<ProductPublicResponse>>.SuccessResponse(products, "Products retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public products");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<ProductPublicResponse>>.ErrorResponse("An error occurred while retrieving products"));
        }
    }

    /// <summary>
    /// Get product by ID (Public - for customers)
    /// </summary>
    [HttpGet("public/{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<ProductPublicResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductPublicResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductPublicResponse>>> GetPublicProductById(int id)
    {
        try
        {
            var product = await _productService.GetPublicProductByIdAsync(id);
            return Ok(ApiResponse<ProductPublicResponse>.SuccessResponse(product, "Product retrieved successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<ProductPublicResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving product {ProductId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<ProductPublicResponse>.ErrorResponse("An error occurred while retrieving the product"));
        }
    }

    /// <summary>
    /// Get products by category (Public)
    /// </summary>
    [HttpGet("public/category/{categoryId:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductPublicResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductPublicResponse>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductPublicResponse>>>> GetProductsByCategory(int categoryId)
    {
        try
        {
            var products = await _productService.GetProductsByCategoryAsync(categoryId);
            return Ok(ApiResponse<IEnumerable<ProductPublicResponse>>.SuccessResponse(products, "Products retrieved successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<IEnumerable<ProductPublicResponse>>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products for category {CategoryId}", categoryId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<ProductPublicResponse>>.ErrorResponse("An error occurred while retrieving products"));
        }
    }

    /// <summary>
    /// Search products (Public)
    /// </summary>
    [HttpGet("public/search")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductPublicResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductPublicResponse>>>> SearchProducts([FromQuery] string? q)
    {
        try
        {
            var products = await _productService.SearchProductsAsync(q ?? string.Empty);
            return Ok(ApiResponse<IEnumerable<ProductPublicResponse>>.SuccessResponse(products, "Search completed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products with term: {SearchTerm}", q);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<ProductPublicResponse>>.ErrorResponse("An error occurred while searching products"));
        }
    }

    #endregion

    #region Admin/Seller Endpoints

    /// <summary>
    /// Get all products (Admin only - includes all statuses)
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductListResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductListResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductListResponse>>>> GetAllProducts()
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<IEnumerable<ProductListResponse>>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(ApiResponse<IEnumerable<ProductListResponse>>.SuccessResponse(products, "Products retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all products");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<ProductListResponse>>.ErrorResponse("An error occurred while retrieving products"));
        }
    }

    /// <summary>
    /// Get all products with server-side pagination and search (Admin only)
    /// </summary>
    [HttpGet("paged")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<ProductListResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<ProductListResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<PagedResponse<ProductListResponse>>>> GetAllProductsPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isVisible = null)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<PagedResponse<ProductListResponse>>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var result = await _productService.GetAllProductsPagedAsync(search, categoryId, isActive, isVisible, page, pageSize);
            return Ok(ApiResponse<PagedResponse<ProductListResponse>>.SuccessResponse(result, "Products retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all products");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<PagedResponse<ProductListResponse>>.ErrorResponse("An error occurred while retrieving products"));
        }
    }

    /// <summary>
    /// Get product by ID (Admin/Seller)
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> GetProductById(int id)
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse("Access denied."));
        }

        try
        {
            var product = await _productService.GetByIdAsync(id);

            // Sellers can only view their own products
            if (IsSeller() && product.SellerId != GetCurrentUserId())
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    ApiResponse<ProductResponse>.ErrorResponse("You can only view your own products."));
            }

            return Ok(ApiResponse<ProductResponse>.SuccessResponse(product, "Product retrieved successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving product {ProductId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<ProductResponse>.ErrorResponse("An error occurred while retrieving the product"));
        }
    }

    /// <summary>
    /// Get products by current seller (Seller) or specific seller (Admin)
    /// </summary>
    [HttpGet("my-products")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductListResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductListResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductListResponse>>>> GetMyProducts()
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<IEnumerable<ProductListResponse>>.ErrorResponse("Access denied."));
        }

        try
        {
            var sellerId = GetCurrentUserId();
            var products = await _productService.GetProductsBySellerAsync(sellerId);
            return Ok(ApiResponse<IEnumerable<ProductListResponse>>.SuccessResponse(products, "Products retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products for seller");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<ProductListResponse>>.ErrorResponse("An error occurred while retrieving products"));
        }
    }

    /// <summary>
    /// Get current seller's products with server-side pagination and search
    /// </summary>
    [HttpGet("my-products/paged")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<ProductListResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<ProductListResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<PagedResponse<ProductListResponse>>>> GetMyProductsPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] bool? isActive = null)
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<PagedResponse<ProductListResponse>>.ErrorResponse("Access denied."));
        }

        try
        {
            var sellerId = GetCurrentUserId();
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var result = await _productService.GetProductsBySellerPagedAsync(sellerId, search, categoryId, isActive, page, pageSize);
            return Ok(ApiResponse<PagedResponse<ProductListResponse>>.SuccessResponse(result, "Products retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products for seller");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<PagedResponse<ProductListResponse>>.ErrorResponse("An error occurred while retrieving products"));
        }
    }

    /// <summary>
    /// Get products by seller ID (Admin only)
    /// </summary>
    [HttpGet("seller/{sellerId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductListResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductListResponse>>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductListResponse>>>> GetProductsBySeller(int sellerId)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<IEnumerable<ProductListResponse>>.ErrorResponse("Access denied. Admin privileges required."));
        }

        try
        {
            var products = await _productService.GetProductsBySellerAsync(sellerId);
            return Ok(ApiResponse<IEnumerable<ProductListResponse>>.SuccessResponse(products, "Products retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products for seller {SellerId}", sellerId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<ProductListResponse>>.ErrorResponse("An error occurred while retrieving products"));
        }
    }

    /// <summary>
    /// Create a new product (Admin/Seller)
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> CreateProduct([FromBody] CreateProductRequest request)
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse("Access denied. Only Admin or Seller can create products."));
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<ProductResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var sellerId = GetCurrentUserId();
            var product = await _productService.CreateProductAsync(request, sellerId);
            
            _logger.LogInformation("Product {ProductId} created by user {UserId}", product.Id, sellerId);
            
            return CreatedAtAction(
                nameof(GetProductById), 
                new { id = product.Id },
                ApiResponse<ProductResponse>.SuccessResponse(product, "Product created successfully"));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<ProductResponse>.ErrorResponse("An error occurred while creating the product"));
        }
    }

    /// <summary>
    /// Update a product (Admin can update any, Seller can update own)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse("Access denied."));
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<ProductResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var userId = GetCurrentUserId();
            var product = await _productService.UpdateProductAsync(id, request, userId, IsAdmin());
            
            _logger.LogInformation("Product {ProductId} updated by user {UserId}", id, userId);
            
            return Ok(ApiResponse<ProductResponse>.SuccessResponse(product, "Product updated successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product {ProductId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<ProductResponse>.ErrorResponse("An error occurred while updating the product"));
        }
    }

    /// <summary>
    /// Delete a product (Admin can delete any, Seller can delete own)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteProduct(int id)
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<object>.ErrorResponse("Access denied."));
        }

        try
        {
            var userId = GetCurrentUserId();
            await _productService.DeleteProductAsync(id, userId, IsAdmin());
            
            _logger.LogInformation("Product {ProductId} deleted by user {UserId}", id, userId);
            
            return Ok(ApiResponse<object>.SuccessResponse(null, "Product deleted successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product {ProductId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResponse("An error occurred while deleting the product"));
        }
    }

    /// <summary>
    /// Toggle product active status (Admin can toggle any, Seller can toggle own)
    /// </summary>
    [HttpPatch("{id:int}/toggle-status")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> ToggleProductStatus(int id)
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse("Access denied."));
        }

        try
        {
            var userId = GetCurrentUserId();
            var product = await _productService.ToggleProductStatusAsync(id, userId, IsAdmin());
            
            var statusText = product.IsActive ? "activated" : "deactivated";
            return Ok(ApiResponse<ProductResponse>.SuccessResponse(product, $"Product {statusText} successfully"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling status for product {ProductId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<ProductResponse>.ErrorResponse("An error occurred while updating the product"));
        }
    }

    /// <summary>
    /// Toggle product visibility (Admin can toggle any, Seller can toggle own)
    /// </summary>
    [HttpPatch("{id:int}/toggle-visibility")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<ProductResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductResponse>>> ToggleProductVisibility(int id)
    {
        if (!IsAdminOrSeller())
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse("Access denied."));
        }

        try
        {
            var userId = GetCurrentUserId();
            var product = await _productService.ToggleProductVisibilityAsync(id, userId, IsAdmin());
            
            var visibilityText = product.IsVisible ? "visible" : "hidden";
            return Ok(ApiResponse<ProductResponse>.SuccessResponse(product, $"Product is now {visibilityText}"));
        }
        catch (NotFoundException ex)
        {
            return NotFound(ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse<ProductResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling visibility for product {ProductId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<ProductResponse>.ErrorResponse("An error occurred while updating the product"));
        }
    }

    #endregion
}
