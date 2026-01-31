using ECommerce.Core.Entities;

namespace ECommerce.Core.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<Product?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Product>> GetAllWithDetailsAsync();
    Task<IEnumerable<Product>> GetBySellerIdAsync(int sellerId);
    Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId);
    Task<IEnumerable<Product>> GetActiveProductsAsync();
    Task<IEnumerable<Product>> GetVisibleProductsAsync();
    Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm);
    Task<int> GetProductCountBySellerAsync(int sellerId);
    Task<int> GetProductCountByCategoryAsync(int categoryId);
    Task<bool> ProductExistsAsync(int id);
    Task<(List<Product> Items, int TotalCount)> GetAllWithDetailsPagedAsync(string? search, int? categoryId, bool? isActive, bool? isVisible, int page, int pageSize);
    Task<(List<Product> Items, int TotalCount)> GetBySellerIdPagedAsync(int sellerId, string? search, int? categoryId, bool? isActive, int page, int pageSize);
}
