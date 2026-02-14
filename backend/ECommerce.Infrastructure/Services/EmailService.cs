using System.Net;
using System.Net.Mail;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECommerce.Infrastructure.Services;

public static class TimeZoneHelper
{
    /// <summary>
    /// Converts UTC time to Indian Standard Time (IST)
    /// IST is UTC+5:30
    /// </summary>
    public static DateTime ConvertUtcToIst(DateTime utcTime)
    {
        try
        {
            // Try Windows time zone ID first
            TimeZoneInfo istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(utcTime, istTimeZone);
        }
        catch (TimeZoneNotFoundException)
        {
            try
            {
                // Try Linux time zone ID
                TimeZoneInfo istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
                return TimeZoneInfo.ConvertTimeFromUtc(utcTime, istTimeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                // Fallback: Manually add 5 hours 30 minutes (IST offset)
                return utcTime.AddHours(5).AddMinutes(30);
            }
        }
    }

    /// <summary>
    /// Gets current IST time
    /// </summary>  image.png
    public static DateTime GetCurrentIstTime()
    {
        return ConvertUtcToIst(DateTime.UtcNow);
    }

    /// <summary>
    /// Formats DateTime to IST string
    /// </summary>
    public static string FormatIstDateTime(DateTime utcTime)
    {
        var istTime = ConvertUtcToIst(utcTime);
        return istTime.ToString("yyyy-MM-dd HH:mm:ss IST");
    }
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
        var emailSettings = configuration.GetSection("EmailSettings");
        _smtpServer = emailSettings["SmtpServer"] ?? "smtp.gmail.com";
        _smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
        _smtpUsername = emailSettings["SmtpUsername"] ?? string.Empty;
        _smtpPassword = emailSettings["SmtpPassword"] ?? string.Empty;
        _fromEmail = emailSettings["FromEmail"] ?? string.Empty;
        _fromName = emailSettings["FromName"] ?? "ECommerce";
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            using var client = new SmtpClient(_smtpServer, _smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_smtpUsername, _smtpPassword)
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(to);

            await client.SendMailAsync(message);
        }
        catch (Exception)
        {
            // Log error in production
            // For now, we'll throw to let caller handle it
            throw;
        }
    }

    public async Task SendPasswordResetOtpAsync(string to, string otp)
    {
        var subject = "Password Reset OTP - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Password Reset Request</h2>
                <p>Dear User,</p>
                <p>You have requested to reset your password. Please use the following OTP to reset your password:</p>
                <div style='background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>
                    {otp}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you did not request this password reset, please ignore this email.</p>
                <p>Best regards,<br>ECommerce Team</p>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendPasswordChangeNotificationAsync(string to, string userName)
    {
        var formattedTime = TimeZoneHelper.FormatIstDateTime(DateTime.UtcNow);
        
        var subject = "Password Changed Successfully - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Password Changed Successfully</h2>
                <p>Dear {userName},</p>
                <p>This email is to confirm that your password has been successfully changed.</p>
                <p><strong>Date and Time:</strong> {formattedTime}</p>
                <p>If you did not make this change, please contact our support team immediately and secure your account.</p>
                <p>For your security, we recommend:</p>
                <ul>
                    <li>Using a strong, unique password</li>
                    <li>Not sharing your password with anyone</li>
                    <li>Changing your password regularly</li>
                </ul>
                <p>Stay secure,<br>ECommerce Team</p>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string to, string userName, string role)
    {
        var subject = "Welcome to ECommerce - Registration Successful";
        
        var roleSpecificMessage = role.Equals("Seller", StringComparison.OrdinalIgnoreCase)
            ? "<p><strong>Important:</strong> Your seller account is pending approval from our admin team. You will receive another email once your account has been approved and activated.</p>"
            : "<p>You can now start shopping and exploring our wide range of products.</p>";

        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #667eea;'>Welcome to ECommerce!</h2>
                    <p>Dear {userName},</p>
                    <p>Thank you for registering with ECommerce. Your account has been successfully created.</p>
                    <div style='background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <p><strong>Account Type:</strong> {role}</p>
                        <p><strong>Email:</strong> {to}</p>
                        <p><strong>Registration Date:</strong> {TimeZoneHelper.FormatIstDateTime(DateTime.UtcNow)}</p>
                    </div>
                    {roleSpecificMessage}
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendSellerApprovalEmailAsync(string to, string userName)
    {
        var subject = "Congratulations! Your Seller Account Has Been Approved - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #28a745;'>🎉 Your Seller Account Has Been Approved!</h2>
                    <p>Dear {userName},</p>
                    <p>Great news! Your seller account on ECommerce has been reviewed and approved by our admin team.</p>
                    <div style='background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;'>
                        <p style='margin: 0; color: #155724;'><strong>✓ Account Status:</strong> Active</p>
                        <p style='margin: 10px 0 0 0; color: #155724;'><strong>✓ Approval Date:</strong> {TimeZoneHelper.FormatIstDateTime(DateTime.UtcNow)}</p>
                    </div>
                    <p>You can now:</p>
                    <ul>
                        <li>Log in to your seller dashboard</li>
                        <li>Add products to your store</li>
                        <li>Manage your inventory</li>
                        <li>Start receiving orders</li>
                    </ul>
                    <p>We're excited to have you as a seller on our platform!</p>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendSellerRejectionEmailAsync(string to, string userName, string? reason)
    {
        var reasonText = string.IsNullOrWhiteSpace(reason) 
            ? "Your application did not meet our seller requirements at this time."
            : reason;

        var subject = "Seller Account Application Update - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #dc3545;'>Seller Account Application Update</h2>
                    <p>Dear {userName},</p>
                    <p>Thank you for your interest in becoming a seller on ECommerce.</p>
                    <p>After reviewing your application, we regret to inform you that your seller account request has not been approved at this time.</p>
                    <div style='background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;'>
                        <p style='margin: 0; color: #721c24;'><strong>Reason:</strong> {reasonText}</p>
                    </div>
                    <p>If you believe this decision was made in error or if you have additional documentation to support your application, please contact our support team.</p>
                    <p>You may also reapply after addressing the concerns mentioned above.</p>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendAccountStatusChangeEmailAsync(string to, string userName, bool isActive)
    {
        var statusText = isActive ? "Activated" : "Deactivated";
        var statusColor = isActive ? "#28a745" : "#dc3545";
        var subject = $"Account {statusText} - ECommerce";

        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: {statusColor};'>Account {statusText}</h2>
                    <p>Dear {userName},</p>
                    <p>This email is to inform you that your ECommerce account has been <strong>{statusText.ToLower()}</strong>.</p>
                    <div style='background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <p><strong>Account Status:</strong> {statusText}</p>
                        <p><strong>Date:</strong> {TimeZoneHelper.FormatIstDateTime(DateTime.UtcNow)}</p>
                    </div>
                    {(isActive 
                        ? "<p>You can now log in and access all features of your account.</p>" 
                        : "<p>If you believe this was done in error, please contact our support team immediately.</p>")}
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendOrderPlacedEmailAsync(string to, string customerName, string orderNumber, decimal totalAmount, DateTime createdAt)
    {
        var formattedDate = TimeZoneHelper.FormatIstDateTime(createdAt);
        var subject = $"Order Confirmation - {orderNumber} - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #f59e0b;'>Order Placed Successfully</h2>
                    <p>Dear {customerName},</p>
                    <p>Thank you for your order. We have received your order and will process it shortly.</p>
                    <div style='background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;'>
                        <p style='margin: 0;'><strong>Order Number:</strong> {orderNumber}</p>
                        <p style='margin: 10px 0 0 0;'><strong>Order Date:</strong> {formattedDate}</p>
                        <p style='margin: 10px 0 0 0;'><strong>Total Amount:</strong> ₹{totalAmount:N2}</p>
                    </div>
                    <p>You can track your order status from your account dashboard.</p>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendOrderConfirmedEmailAsync(string to, string customerName, string orderNumber)
    {
        var subject = $"Order Confirmed - {orderNumber} - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #3b82f6;'>Order Confirmed</h2>
                    <p>Dear {customerName},</p>
                    <p>Your order <strong>{orderNumber}</strong> has been confirmed and is being prepared for shipment.</p>
                    <div style='background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;'>
                        <p style='margin: 0; color: #1e40af;'><strong>Order Number:</strong> {orderNumber}</p>
                        <p style='margin: 10px 0 0 0; color: #1e40af;'><strong>Status:</strong> Confirmed</p>
                    </div>
                    <p>We will notify you when your order is shipped.</p>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendOrderCancelledEmailAsync(string to, string customerName, string orderNumber)
    {
        var subject = $"Order Cancelled - {orderNumber} - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #dc3545;'>Order Cancelled</h2>
                    <p>Dear {customerName},</p>
                    <p>Your order <strong>{orderNumber}</strong> has been cancelled.</p>
                    <div style='background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;'>
                        <p style='margin: 0; color: #721c24;'><strong>Order Number:</strong> {orderNumber}</p>
                        <p style='margin: 10px 0 0 0; color: #721c24;'><strong>Status:</strong> Cancelled</p>
                    </div>
                    <p>If you did not request this cancellation or have any questions, please contact our support team.</p>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendOrderDeliveredEmailAsync(string to, string customerName, string orderNumber, DateTime? deliveredDate = null)
    {
        var formattedDate = deliveredDate.HasValue
            ? TimeZoneHelper.FormatIstDateTime(deliveredDate.Value)
            : TimeZoneHelper.FormatIstDateTime(DateTime.UtcNow);
        var subject = $"Order Delivered - {orderNumber} - ECommerce";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #10b981;'>Order Delivered</h2>
                    <p>Dear {customerName},</p>
                    <p>Your order <strong>{orderNumber}</strong> has been delivered. We hope you enjoy your purchase!</p>
                    <div style='background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #a7f3d0;'>
                        <p style='margin: 0; color: #065f46;'><strong>Order Number:</strong> {orderNumber}</p>
                        <p style='margin: 10px 0 0 0; color: #065f46;'><strong>Delivered On:</strong> {formattedDate}</p>
                    </div>
                    <p>Thank you for shopping with us. We look forward to serving you again.</p>
                    <p>Best regards,<br>ECommerce Team</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }
}

