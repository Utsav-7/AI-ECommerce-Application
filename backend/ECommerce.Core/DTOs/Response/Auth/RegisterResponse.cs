namespace ECommerce.Core.DTOs.Response.Auth;

public class RegisterResponse
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = "Registration successful";
}

