namespace ECommerce.Core.DTOs.Response.Report;

public class AdminReportResponse
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public List<DailyStatsDto> DailyStats { get; set; } = new();
    public List<StatusCountDto> OrdersByStatus { get; set; } = new();
}

public class DailyStatsDto
{
    public DateTime Date { get; set; }
    public int OrderCount { get; set; }
    public decimal Revenue { get; set; }
}

public class StatusCountDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
