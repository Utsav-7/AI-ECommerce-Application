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
}

