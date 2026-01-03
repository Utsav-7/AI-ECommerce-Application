namespace ECommerce.Core.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendPasswordResetOtpAsync(string to, string otp);
    Task SendPasswordChangeNotificationAsync(string to, string userName);
}

