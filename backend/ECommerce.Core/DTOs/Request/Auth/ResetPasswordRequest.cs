using System.ComponentModel.DataAnnotations;

namespace ECommerce.Core.DTOs.Request.Auth;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}

