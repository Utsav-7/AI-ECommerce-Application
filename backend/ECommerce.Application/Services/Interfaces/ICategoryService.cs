using ECommerce.Core.DTOs.Request.Category;
using ECommerce.Core.DTOs.Response.Category;

namespace ECommerce.Application.Services.Interfaces;

public interface ICategoryService
{
    Task<CategoryResponse> GetByIdAsync(int id);
    Task<IEnumerable<CategoryResponse>> GetAllAsync();
    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request);
    Task<CategoryResponse> UpdateAsync(int id, UpdateCategoryRequest request);
    Task DeleteAsync(int id);
}
