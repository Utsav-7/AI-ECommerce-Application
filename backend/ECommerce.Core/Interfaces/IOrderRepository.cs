using ECommerce.Core.DTOs.Response.Report;
using ECommerce.Core.Entities;

namespace ECommerce.Core.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetByIdWithDetailsAsync(int orderId);
    Task<IEnumerable<Order>> GetByUserIdAsync(int userId, int? limit = null);
    Task<IEnumerable<Order>> GetOrdersForAdminAsync(int page, int pageSize);
    Task<int> GetOrdersForAdminCountAsync();
    Task<IEnumerable<Order>> GetOrdersForSellerAsync(int sellerId, int page, int pageSize);
    Task<int> GetOrdersForSellerCountAsync(int sellerId);
    Task<bool> ExistsOrderNumberAsync(string orderNumber);
    Task<AdminReportResponse> GetAdminReportAsync(DateTime fromUtc, DateTime toUtc);
    Task<SellerReportResponse> GetSellerReportAsync(int sellerId, DateTime fromUtc, DateTime toUtc);
}
