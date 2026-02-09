using ECommerce.Core.DTOs.Request.Order;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.Order;

namespace ECommerce.Application.Services.Interfaces;

public interface IOrderService
{
    Task<int> GetTotalOrdersCountAsync();
    Task<OrderResponse> PlaceOrderAsync(int userId, CreateOrderRequest request);
    Task<OrderResponse?> GetByIdAsync(int orderId, int? userId = null, int? sellerId = null, bool isAdmin = false);
    Task<IEnumerable<OrderResponse>> GetMyOrdersAsync(int userId, int? limit = null);
    Task<PagedResponse<OrderResponse>> GetOrdersForAdminAsync(int page, int pageSize);
    Task<PagedResponse<OrderResponse>> GetOrdersForSellerAsync(int sellerId, int page, int pageSize);
    Task<OrderResponse> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request, int? sellerId = null, bool isAdmin = false);
}
