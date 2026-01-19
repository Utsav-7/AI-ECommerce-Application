using System.Text.Json;
using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Product;
using ECommerce.Core.DTOs.Response.Product;
using ECommerce.Core.Entities;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Services.Implementations;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IUnitOfWork unitOfWork, ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    #region Public Endpoints

    public async Task<IEnumerable<ProductPublicResponse>> GetAllPublicProductsAsync()
    {
        var products = await _unitOfWork.Products.GetVisibleProductsAsync();
        return products.Select(MapToPublicResponse);
    }

    public async Task<ProductPublicResponse> GetPublicProductByIdAsync(int id)
    {
        var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(id);

        if (product == null || !product.IsActive || !product.IsVisible)
        {
            throw new NotFoundException("Product", id);
        }

        return MapToPublicResponse(product);
    }

    public async Task<IEnumerable<ProductPublicResponse>> GetProductsByCategoryAsync(int categoryId)
    {
        // Verify category exists
        var category = await _unitOfWork.Categories.GetByIdAsync(categoryId);
        if (category == null)
        {
            throw new NotFoundException("Category", categoryId);
        }

        var products = await _unitOfWork.Products.GetByCategoryIdAsync(categoryId);
        return products.Select(MapToPublicResponse);
    }

    public async Task<IEnumerable<ProductPublicResponse>> SearchProductsAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return await GetAllPublicProductsAsync();
        }

        var products = await _unitOfWork.Products.SearchProductsAsync(searchTerm);
        return products.Select(MapToPublicResponse);
    }

    #endregion

    #region Admin/Seller Endpoints

    public async Task<IEnumerable<ProductListResponse>> GetAllProductsAsync()
    {
        var products = await _unitOfWork.Products.GetAllWithDetailsAsync();
        return products.Select(MapToListResponse);
    }

    public async Task<ProductResponse> GetByIdAsync(int id)
    {
        var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(id);

        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        return MapToResponse(product);
    }

    public async Task<IEnumerable<ProductListResponse>> GetProductsBySellerAsync(int sellerId)
    {
        var products = await _unitOfWork.Products.GetBySellerIdAsync(sellerId);
        return products.Select(MapToListResponse);
    }

    public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request, int sellerId)
    {
        // Validate category exists
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            throw new BadRequestException($"Category with ID {request.CategoryId} not found");
        }

        // Validate discount price
        if (request.DiscountPrice.HasValue && request.DiscountPrice >= request.Price)
        {
            throw new BadRequestException("Discount price must be less than the original price");
        }

        var product = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Price = request.Price,
            DiscountPrice = request.DiscountPrice,
            ImageUrl = request.ImageUrl,
            ImageUrls = request.AdditionalImages != null && request.AdditionalImages.Any()
                ? JsonSerializer.Serialize(request.AdditionalImages)
                : null,
            StockQuantity = request.StockQuantity,
            CategoryId = request.CategoryId,
            SellerId = sellerId,
            IsActive = request.IsActive,
            IsVisible = request.IsVisible,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Product {ProductId} created by seller {SellerId}", product.Id, sellerId);

        // Reload with details
        var createdProduct = await _unitOfWork.Products.GetByIdWithDetailsAsync(product.Id);
        return MapToResponse(createdProduct!);
    }

    public async Task<ProductResponse> UpdateProductAsync(int id, UpdateProductRequest request, int userId, bool isAdmin)
    {
        var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(id);

        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        // Check permission: Admin can update any, Seller can only update own products
        if (!isAdmin && product.SellerId != userId)
        {
            throw new UnauthorizedException("You don't have permission to update this product");
        }

        // Validate category exists
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            throw new BadRequestException($"Category with ID {request.CategoryId} not found");
        }

        // Validate discount price
        if (request.DiscountPrice.HasValue && request.DiscountPrice >= request.Price)
        {
            throw new BadRequestException("Discount price must be less than the original price");
        }

        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.Price = request.Price;
        product.DiscountPrice = request.DiscountPrice;
        product.StockQuantity = request.StockQuantity;
        product.CategoryId = request.CategoryId;
        product.IsActive = request.IsActive;
        product.IsVisible = request.IsVisible;
        product.UpdatedAt = DateTime.UtcNow;

        // Update image only if provided
        if (!string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            product.ImageUrl = request.ImageUrl;
        }

        if (request.AdditionalImages != null)
        {
            product.ImageUrls = request.AdditionalImages.Any()
                ? JsonSerializer.Serialize(request.AdditionalImages)
                : null;
        }

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Product {ProductId} updated by user {UserId}", id, userId);

        // Reload with details
        var updatedProduct = await _unitOfWork.Products.GetByIdWithDetailsAsync(id);
        return MapToResponse(updatedProduct!);
    }

    public async Task DeleteProductAsync(int id, int userId, bool isAdmin)
    {
        var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(id);

        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        // Check permission: Admin can delete any, Seller can only delete own products
        if (!isAdmin && product.SellerId != userId)
        {
            throw new UnauthorizedException("You don't have permission to delete this product");
        }

        await _unitOfWork.Products.DeleteAsync(product);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Product {ProductId} deleted by user {UserId}", id, userId);
    }

    public async Task<ProductResponse> ToggleProductStatusAsync(int id, int userId, bool isAdmin)
    {
        var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(id);

        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        // Check permission
        if (!isAdmin && product.SellerId != userId)
        {
            throw new UnauthorizedException("You don't have permission to modify this product");
        }

        product.IsActive = !product.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Product {ProductId} status toggled to {Status} by user {UserId}", 
            id, product.IsActive, userId);

        return MapToResponse(product);
    }

    public async Task<ProductResponse> ToggleProductVisibilityAsync(int id, int userId, bool isAdmin)
    {
        var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(id);

        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        // Check permission
        if (!isAdmin && product.SellerId != userId)
        {
            throw new UnauthorizedException("You don't have permission to modify this product");
        }

        product.IsVisible = !product.IsVisible;
        product.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Product {ProductId} visibility toggled to {Visible} by user {UserId}", 
            id, product.IsVisible, userId);

        return MapToResponse(product);
    }

    #endregion

    #region Stats

    public async Task<int> GetTotalProductCountAsync()
    {
        return await _unitOfWork.Products.CountAsync(p => !p.IsDeleted);
    }

    public async Task<int> GetProductCountBySellerAsync(int sellerId)
    {
        return await _unitOfWork.Products.GetProductCountBySellerAsync(sellerId);
    }

    #endregion

    #region Private Mapping Methods

    private static ProductResponse MapToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            ImageUrl = product.ImageUrl,
            AdditionalImages = !string.IsNullOrEmpty(product.ImageUrls)
                ? JsonSerializer.Deserialize<List<string>>(product.ImageUrls)
                : null,
            IsActive = product.IsActive,
            IsVisible = product.IsVisible,
            StockQuantity = product.StockQuantity,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            SellerId = product.SellerId,
            SellerName = product.Seller != null 
                ? $"{product.Seller.FirstName} {product.Seller.LastName}" 
                : string.Empty,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }

    private static ProductListResponse MapToListResponse(Product product)
    {
        return new ProductListResponse
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            IsVisible = product.IsVisible,
            StockQuantity = product.StockQuantity,
            CategoryName = product.Category?.Name ?? string.Empty,
            SellerName = product.Seller != null 
                ? $"{product.Seller.FirstName} {product.Seller.LastName}" 
                : string.Empty,
            SellerId = product.SellerId,
            CreatedAt = product.CreatedAt
        };
    }

    private static ProductPublicResponse MapToPublicResponse(Product product)
    {
        return new ProductPublicResponse
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            ImageUrl = product.ImageUrl,
            AdditionalImages = !string.IsNullOrEmpty(product.ImageUrls)
                ? JsonSerializer.Deserialize<List<string>>(product.ImageUrls)
                : null,
            StockQuantity = product.StockQuantity,
            CategoryName = product.Category?.Name ?? string.Empty,
            CategoryId = product.CategoryId,
            SellerName = product.Seller != null 
                ? $"{product.Seller.FirstName} {product.Seller.LastName}" 
                : string.Empty,
            SellerId = product.SellerId
        };
    }

    #endregion
}
