using ECommerce.Core.Entities;

namespace ECommerce.Core.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<bool> HasProductsAsync(int categoryId);
    Task<bool> CategoryNameExistsAsync(string name, int? excludeId = null);
    Task<(List<Category> Items, int TotalCount)> GetAllPagedAsync(string? search, bool? isActive, int page, int pageSize);
}
