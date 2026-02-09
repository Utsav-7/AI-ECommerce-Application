using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Response.Report;
using ECommerce.Core.Interfaces;

namespace ECommerce.Application.Services.Implementations;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReportService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminReportResponse> GetAdminReportAsync(DateTime fromUtc, DateTime toUtc)
    {
        return await _unitOfWork.Orders.GetAdminReportAsync(fromUtc, toUtc);
    }

    public async Task<SellerReportResponse> GetSellerReportAsync(int sellerId, DateTime fromUtc, DateTime toUtc)
    {
        return await _unitOfWork.Orders.GetSellerReportAsync(sellerId, fromUtc, toUtc);
    }
}
