using System.Security.Claims;
using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.Report;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    private static int? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>
    /// Get admin report (Admin only)
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AdminReportResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<AdminReportResponse>>> GetAdminReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var (fromUtc, toUtc) = NormalizeDateRange(from, to);
        var result = await _reportService.GetAdminReportAsync(fromUtc, toUtc);
        return Ok(ApiResponse<AdminReportResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get seller report (Seller only)
    /// </summary>
    [HttpGet("seller")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(typeof(ApiResponse<SellerReportResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<SellerReportResponse>>> GetSellerReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var sellerId = GetUserId(User);
        if (!sellerId.HasValue)
            return Unauthorized(ApiResponse<SellerReportResponse>.ErrorResponse("Invalid user context"));

        var (fromUtc, toUtc) = NormalizeDateRange(from, to);
        var result = await _reportService.GetSellerReportAsync(sellerId.Value, fromUtc, toUtc);
        return Ok(ApiResponse<SellerReportResponse>.SuccessResponse(result));
    }

    private static (DateTime FromUtc, DateTime ToUtc) NormalizeDateRange(DateTime? from, DateTime? to)
    {
        var toUtc = to.HasValue ? DateTime.SpecifyKind(to.Value.Date, DateTimeKind.Utc).AddDays(1) : DateTime.UtcNow.Date.AddDays(1);
        var fromUtc = from.HasValue ? DateTime.SpecifyKind(from.Value.Date, DateTimeKind.Utc) : toUtc.AddDays(-30);
        if (fromUtc >= toUtc) fromUtc = toUtc.AddDays(-30);
        return (fromUtc, toUtc);
    }
}
