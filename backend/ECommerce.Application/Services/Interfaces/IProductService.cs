using ECommerce.Core.DTOs.Request.Product;
using ECommerce.Core.DTOs.Response.Product;

namespace ECommerce.Application.Services.Interfaces;

public interface IProductService
{
    // Public endpoints (for all users including guests)
    Task<IEnumerable<ProductPublicResponse>> GetAllPublicProductsAsync();
    Task<ProductPublicResponse> GetPublicProductByIdAsync(int id);
    Task<IEnumerable<ProductPublicResponse>> GetProductsByCategoryAsync(int categoryId);
    Task<IEnumerable<ProductPublicResponse>> SearchProductsAsync(string searchTerm);

    // Admin/Seller endpoints
    Task<IEnumerable<ProductListResponse>> GetAllProductsAsync();
    Task<ProductResponse> GetByIdAsync(int id);
    Task<IEnumerable<ProductListResponse>> GetProductsBySellerAsync(int sellerId);
    
    // Create (Admin or Seller)
    Task<ProductResponse> CreateProductAsync(CreateProductRequest request, int sellerId);
    
    // Update (Admin can update any, Seller can update own)
    Task<ProductResponse> UpdateProductAsync(int id, UpdateProductRequest request, int userId, bool isAdmin);
    
    // Delete (Admin can delete any, Seller can delete own)
    Task DeleteProductAsync(int id, int userId, bool isAdmin);
    
    // Toggle status
    Task<ProductResponse> ToggleProductStatusAsync(int id, int userId, bool isAdmin);
    Task<ProductResponse> ToggleProductVisibilityAsync(int id, int userId, bool isAdmin);
    
    // Stats
    Task<int> GetTotalProductCountAsync();
    Task<int> GetProductCountBySellerAsync(int sellerId);
}
