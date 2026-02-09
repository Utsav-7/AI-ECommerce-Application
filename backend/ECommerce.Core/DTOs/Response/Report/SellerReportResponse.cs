namespace ECommerce.Core.DTOs.Response.Report;

public class SellerReportResponse
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public List<DailyStatsDto> DailyStats { get; set; } = new();
    public List<ProductSalesDto> TopProducts { get; set; } = new();
}

public class ProductSalesDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}
