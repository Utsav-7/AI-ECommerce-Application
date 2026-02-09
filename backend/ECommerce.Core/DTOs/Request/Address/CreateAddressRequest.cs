using System.ComponentModel.DataAnnotations;

namespace ECommerce.Core.DTOs.Request.Address;

public class CreateAddressRequest
{
    [Required(ErrorMessage = "Street / address line is required.")]
    [MinLength(2, ErrorMessage = "Street must be at least 2 characters.")]
    [StringLength(500, ErrorMessage = "Street cannot exceed 500 characters.")]
    public string Street { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required.")]
    [MinLength(2, ErrorMessage = "City must be at least 2 characters.")]
    [StringLength(100, ErrorMessage = "City cannot exceed 100 characters.")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "State is required.")]
    [MinLength(2, ErrorMessage = "State must be at least 2 characters.")]
    [StringLength(100, ErrorMessage = "State cannot exceed 100 characters.")]
    public string State { get; set; } = string.Empty;

    [Required(ErrorMessage = "Country is required.")]
    [MinLength(2, ErrorMessage = "Country must be at least 2 characters.")]
    [StringLength(100, ErrorMessage = "Country cannot exceed 100 characters.")]
    public string Country { get; set; } = string.Empty;

    [Required(ErrorMessage = "Zip / postal code is required.")]
    [MinLength(3, ErrorMessage = "Zip code must be at least 3 characters.")]
    [StringLength(20, ErrorMessage = "Zip code cannot exceed 20 characters.")]
    [RegularExpression(@"^[a-zA-Z0-9\s\-]+$", ErrorMessage = "Zip code can only contain letters, numbers, spaces and hyphens.")]
    public string ZipCode { get; set; } = string.Empty;

    public bool IsDefault { get; set; }
}
