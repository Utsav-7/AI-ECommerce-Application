namespace ECommerce.Core.DTOs.Response.Product;

/// <summary>
/// Full product details response
/// </summary>
public class ProductResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? ImageUrl { get; set; }
    public List<string>? AdditionalImages { get; set; }
    public bool IsActive { get; set; }
    public bool IsVisible { get; set; }
    public int StockQuantity { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Product list item for displaying in lists/grids
/// </summary>
public class ProductListResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsVisible { get; set; }
    public int StockQuantity { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public int SellerId { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Public product display for customers
/// </summary>
public class ProductPublicResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? ImageUrl { get; set; }
    public List<string>? AdditionalImages { get; set; }
    public int StockQuantity { get; set; }
    public bool InStock => StockQuantity > 0;
    public string CategoryName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public int SellerId { get; set; }
    public decimal? DiscountPercentage => DiscountPrice.HasValue && Price > 0 
        ? Math.Round((Price - DiscountPrice.Value) / Price * 100, 0) 
        : null;
}
