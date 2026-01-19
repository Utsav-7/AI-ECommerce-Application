using System.ComponentModel.DataAnnotations;

namespace ECommerce.Core.DTOs.Request.User;

public class UpdateUserRequest
{
    [Required(ErrorMessage = "First name is required")]
    [StringLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required")]
    [StringLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
    public string LastName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? PhoneNumber { get; set; }

    public bool IsActive { get; set; }
}

public class UpdateUserRoleRequest
{
    [Required(ErrorMessage = "Role is required")]
    public string Role { get; set; } = string.Empty;
}

public class ApproveSellerRequest
{
    public bool IsApproved { get; set; }
}
