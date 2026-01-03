using ECommerce.Core.DTOs.Request.Auth;
using ECommerce.Core.DTOs.Response.Auth;

namespace ECommerce.Application.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    Task<bool> SendPasswordResetOtpAsync(ResetPasswordRequest request);
    Task<bool> VerifyOtpAndResetPasswordAsync(VerifyOtpRequest request);
    Task<bool> ChangePasswordAsync(ChangePasswordRequest request);
    Task<UserInfo> GetCurrentUserAsync(string email);
}

