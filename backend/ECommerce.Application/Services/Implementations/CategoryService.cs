using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Category;
using ECommerce.Core.DTOs.Response.Category;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.Entities;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;

namespace ECommerce.Application.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _unitOfWork.Categories.CountAsync(c => !c.IsDeleted);
    }

    public async Task<CategoryResponse> GetByIdAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        
        if (category == null)
        {
            throw new NotFoundException("Category", id);
        }

        return MapToResponse(category);
    }

    public async Task<IEnumerable<CategoryResponse>> GetAllAsync()
    {
        var categories = await _unitOfWork.Categories.GetAllAsync();
        return categories.Select(MapToResponse);
    }

    public async Task<PagedResponse<CategoryResponse>> GetAllPagedAsync(string? search, bool? isActive, int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Categories.GetAllPagedAsync(search, isActive, page, pageSize);
        var data = items.Select(MapToResponse).ToList();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResponse<CategoryResponse>
        {
            Data = data,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            TotalRecords = totalCount
        };
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
    {
        // Check if category name already exists
        if (await _unitOfWork.Categories.CategoryNameExistsAsync(request.Name))
        {
            throw new BadRequestException($"Category with name '{request.Name}' already exists");
        }

        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task<CategoryResponse> UpdateAsync(int id, UpdateCategoryRequest request)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        
        if (category == null)
        {
            throw new NotFoundException("Category", id);
        }

        // Check if category name already exists (excluding current category)
        if (await _unitOfWork.Categories.CategoryNameExistsAsync(request.Name, id))
        {
            throw new BadRequestException($"Category with name '{request.Name}' already exists");
        }

        category.Name = request.Name;
        category.Description = request.Description;
        category.ImageUrl = request.ImageUrl;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        
        if (category == null)
        {
            throw new NotFoundException("Category", id);
        }

        // Check if category has products
        if (await _unitOfWork.Categories.HasProductsAsync(id))
        {
            throw new BadRequestException("Cannot delete category that has associated products. Please remove or reassign the products first.");
        }

        await _unitOfWork.Categories.DeleteAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    private static CategoryResponse MapToResponse(Category category)
    {
        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}
