using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Category;
using ECommerce.Core.DTOs.Response.Category;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    /// <summary>
    /// Get all categories
    /// </summary>
    /// <returns>List of all categories</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryResponse>>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryResponse>>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryResponse>>>> GetAll()
    {
        try
        {
            var categories = await _categoryService.GetAllAsync();
            _logger.LogInformation("Retrieved {Count} categories", categories.Count());
            
            return Ok(ApiResponse<IEnumerable<CategoryResponse>>.SuccessResponse(categories, "Categories retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving categories");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                ApiResponse<IEnumerable<CategoryResponse>>.ErrorResponse("An error occurred while retrieving categories"));
        }
    }

    /// <summary>
    /// Get categories with server-side pagination and search
    /// </summary>
    [HttpGet("paged")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<CategoryResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<CategoryResponse>>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<CategoryResponse>>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PagedResponse<CategoryResponse>>>> GetAllPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var result = await _categoryService.GetAllPagedAsync(search, isActive, page, pageSize);
            return Ok(ApiResponse<PagedResponse<CategoryResponse>>.SuccessResponse(result, "Categories retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving categories");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<PagedResponse<CategoryResponse>>.ErrorResponse("An error occurred while retrieving categories"));
        }
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    /// <param name="id">Category ID</param>
    /// <returns>Category details</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> GetById(int id)
    {
        try
        {
            var category = await _categoryService.GetByIdAsync(id);
            _logger.LogInformation("Retrieved category with ID: {CategoryId}", id);
            
            return Ok(ApiResponse<CategoryResponse>.SuccessResponse(category, "Category retrieved successfully"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Category not found: {CategoryId}", id);
            return NotFound(ApiResponse<CategoryResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving category with ID: {CategoryId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                ApiResponse<CategoryResponse>.ErrorResponse("An error occurred while retrieving the category"));
        }
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    /// <param name="request">Category creation details</param>
    /// <returns>Created category</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> Create([FromBody] CreateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<CategoryResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var category = await _categoryService.CreateAsync(request);
            _logger.LogInformation("Created category with ID: {CategoryId}, Name: {CategoryName}", category.Id, category.Name);
            
            return CreatedAtAction(
                nameof(GetById), 
                new { id = category.Id }, 
                ApiResponse<CategoryResponse>.SuccessResponse(category, "Category created successfully"));
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("Category creation failed: {Message}", ex.Message);
            return BadRequest(ApiResponse<CategoryResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating category");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                ApiResponse<CategoryResponse>.ErrorResponse("An error occurred while creating the category"));
        }
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    /// <param name="id">Category ID</param>
    /// <param name="request">Category update details</param>
    /// <returns>Updated category</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> Update(int id, [FromBody] UpdateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<CategoryResponse>.ErrorResponse("Validation failed", errors));
        }

        try
        {
            var category = await _categoryService.UpdateAsync(id, request);
            _logger.LogInformation("Updated category with ID: {CategoryId}", id);
            
            return Ok(ApiResponse<CategoryResponse>.SuccessResponse(category, "Category updated successfully"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Category update failed - not found: {CategoryId}", id);
            return NotFound(ApiResponse<CategoryResponse>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("Category update failed: {Message}", ex.Message);
            return BadRequest(ApiResponse<CategoryResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating category with ID: {CategoryId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                ApiResponse<CategoryResponse>.ErrorResponse("An error occurred while updating the category"));
        }
    }

    /// <summary>
    /// Delete a category (soft delete)
    /// </summary>
    /// <param name="id">Category ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        try
        {
            await _categoryService.DeleteAsync(id);
            _logger.LogInformation("Deleted category with ID: {CategoryId}", id);
            
            return Ok(ApiResponse<object>.SuccessResponse(null, "Category deleted successfully"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Category deletion failed - not found: {CategoryId}", id);
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("Category deletion failed: {Message}", ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting category with ID: {CategoryId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, 
                ApiResponse<object>.ErrorResponse("An error occurred while deleting the category"));
        }
    }
}
