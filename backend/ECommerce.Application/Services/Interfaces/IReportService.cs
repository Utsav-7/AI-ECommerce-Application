using ECommerce.Core.DTOs.Response.Report;

namespace ECommerce.Application.Services.Interfaces;

public interface IReportService
{
    Task<AdminReportResponse> GetAdminReportAsync(DateTime fromUtc, DateTime toUtc);
    Task<SellerReportResponse> GetSellerReportAsync(int sellerId, DateTime fromUtc, DateTime toUtc);
}
