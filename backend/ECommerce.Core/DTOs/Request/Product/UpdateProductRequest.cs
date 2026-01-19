using System.ComponentModel.DataAnnotations;

namespace ECommerce.Core.DTOs.Request.Product;

public class UpdateProductRequest
{
    [Required(ErrorMessage = "Product name is required")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Product name must be between 2 and 200 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [StringLength(2000, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 2000 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Price is required")]
    [Range(0.01, 10000000, ErrorMessage = "Price must be between 0.01 and 10,000,000")]
    public decimal Price { get; set; }

    [Range(0, 10000000, ErrorMessage = "Discount price must be between 0 and 10,000,000")]
    public decimal? DiscountPrice { get; set; }

    /// <summary>
    /// Primary product image (Base64 encoded string)
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// Additional product images (JSON array of Base64 encoded strings)
    /// </summary>
    public List<string>? AdditionalImages { get; set; }

    [Required(ErrorMessage = "Stock quantity is required")]
    [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
    public int StockQuantity { get; set; }

    [Required(ErrorMessage = "Category is required")]
    public int CategoryId { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsVisible { get; set; } = true;
}
