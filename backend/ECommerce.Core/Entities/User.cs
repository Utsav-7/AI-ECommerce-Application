using ECommerce.Core.Entities.Base;
using ECommerce.Core.Enums;

namespace ECommerce.Core.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;
    public string? ResetPasswordOtp { get; set; }
    public DateTime? ResetPasswordOtpExpiry { get; set; }
    
    // Seller-specific fields
    public string? GstNumber { get; set; }
    public bool IsApproved { get; set; } = true; // For sellers: requires admin approval

    // Navigation Properties
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Product> Products { get; set; } = new List<Product>(); // For Sellers
}

