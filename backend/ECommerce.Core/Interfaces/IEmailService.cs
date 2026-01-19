namespace ECommerce.Core.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendPasswordResetOtpAsync(string to, string otp);
    Task SendPasswordChangeNotificationAsync(string to, string userName);
    Task SendWelcomeEmailAsync(string to, string userName, string role);
    Task SendSellerApprovalEmailAsync(string to, string userName);
    Task SendSellerRejectionEmailAsync(string to, string userName, string? reason);
    Task SendAccountStatusChangeEmailAsync(string to, string userName, bool isActive);
}

