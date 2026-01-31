using ECommerce.Core.DTOs.Request.Category;
using ECommerce.Core.DTOs.Response.Category;
using ECommerce.Core.DTOs.Response.Common;

namespace ECommerce.Application.Services.Interfaces;

public interface ICategoryService
{
    Task<CategoryResponse> GetByIdAsync(int id);
    Task<IEnumerable<CategoryResponse>> GetAllAsync();
    Task<PagedResponse<CategoryResponse>> GetAllPagedAsync(string? search, bool? isActive, int page, int pageSize);
    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request);
    Task<CategoryResponse> UpdateAsync(int id, UpdateCategoryRequest request);
    Task DeleteAsync(int id);
}
