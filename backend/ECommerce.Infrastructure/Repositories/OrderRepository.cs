using ECommerce.Core.DTOs.Response.Report;
using ECommerce.Core.Entities;
using ECommerce.Core.Interfaces;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class OrderRepository : Repository<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Order?> GetByIdWithDetailsAsync(int orderId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Address)
            .Include(o => o.Coupon)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                    .ThenInclude(p => p.Seller)
            .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);
    }

    public async Task<IEnumerable<Order>> GetByUserIdAsync(int userId, int? limit = null)
    {
        var query = _dbSet
            .Include(o => o.User)
            .Include(o => o.Address)
            .Include(o => o.Coupon)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(o => o.UserId == userId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt);

        var finalQuery = limit.HasValue ? query.Take(limit.Value) : query;
        return await finalQuery.ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetOrdersForAdminAsync(int page, int pageSize)
    {
        return await _dbSet
            .Include(o => o.User)
            .Include(o => o.Address)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(o => !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetOrdersForAdminCountAsync()
    {
        return await _dbSet.CountAsync(o => !o.IsDeleted);
    }

    public async Task<IEnumerable<Order>> GetOrdersForSellerAsync(int sellerId, int page, int pageSize)
    {
        var orderIds = await _context.OrderItems
            .Include(oi => oi.Product)
            .Where(oi => !oi.IsDeleted && oi.Product.SellerId == sellerId)
            .Select(oi => oi.OrderId)
            .Distinct()
            .ToListAsync();

        return await _dbSet
            .Include(o => o.User)
            .Include(o => o.Address)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Where(o => !o.IsDeleted && orderIds.Contains(o.Id))
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetOrdersForSellerCountAsync(int sellerId)
    {
        var orderIds = await _context.OrderItems
            .Include(oi => oi.Product)
            .Where(oi => !oi.IsDeleted && oi.Product.SellerId == sellerId)
            .Select(oi => oi.OrderId)
            .Distinct()
            .ToListAsync();

        return await _dbSet.CountAsync(o => !o.IsDeleted && orderIds.Contains(o.Id));
    }

    public async Task<bool> ExistsOrderNumberAsync(string orderNumber)
    {
        return await _dbSet.AnyAsync(o => o.OrderNumber == orderNumber);
    }

    public async Task<AdminReportResponse> GetAdminReportAsync(DateTime fromUtc, DateTime toUtc)
    {
        var ordersQuery = _dbSet
            .AsNoTracking()
            .Where(o => !o.IsDeleted && o.CreatedAt >= fromUtc && o.CreatedAt < toUtc);

        var orders = await ordersQuery.ToListAsync();

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;

        var dailyStats = orders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new DailyStatsDto
            {
                Date = g.Key,
                OrderCount = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(x => x.Date)
            .ToList();

        var ordersByStatus = orders
            .GroupBy(o => o.Status)
            .Select(g => new StatusCountDto
            {
                Status = g.Key.ToString(),
                Count = g.Count()
            })
            .ToList();

        return new AdminReportResponse
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            DailyStats = dailyStats,
            OrdersByStatus = ordersByStatus
        };
    }

    public async Task<SellerReportResponse> GetSellerReportAsync(int sellerId, DateTime fromUtc, DateTime toUtc)
    {
        var orderIdsWithSellerItems = await _context.OrderItems
            .AsNoTracking()
            .Include(oi => oi.Product)
            .Where(oi => !oi.IsDeleted && oi.Product != null && oi.Product.SellerId == sellerId)
            .Select(oi => oi.OrderId)
            .Distinct()
            .ToListAsync();

        var orders = await _dbSet
            .AsNoTracking()
            .Include(o => o.OrderItems!)
                .ThenInclude(oi => oi.Product)
            .Where(o => !o.IsDeleted && o.CreatedAt >= fromUtc && o.CreatedAt < toUtc && orderIdsWithSellerItems.Contains(o.Id))
            .ToListAsync();

        var sellerOrderItems = orders
            .SelectMany(o => o.OrderItems ?? new List<OrderItem>())
            .Where(oi => !oi.IsDeleted && oi.Product?.SellerId == sellerId)
            .ToList();

        var totalRevenue = sellerOrderItems.Sum(oi => oi.TotalAmount);
        var totalOrders = orders.Count;

        var orderDates = orders.Select(o => o.CreatedAt.Date).Distinct().ToList();
        var dailyStats = orderDates
            .Select(date =>
            {
                var dayOrders = orders.Where(o => o.CreatedAt.Date == date).ToList();
                var dayRevenue = dayOrders
                    .SelectMany(o => o.OrderItems ?? new List<OrderItem>())
                    .Where(oi => !oi.IsDeleted && oi.Product?.SellerId == sellerId)
                    .Sum(oi => oi.TotalAmount);
                return new DailyStatsDto
                {
                    Date = date,
                    OrderCount = dayOrders.Count,
                    Revenue = dayRevenue
                };
            })
            .OrderBy(x => x.Date)
            .ToList();

        var topProducts = sellerOrderItems
            .GroupBy(oi => new { oi.ProductId, oi.Product!.Name })
            .Select(g => new ProductSalesDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name ?? "Unknown",
                UnitsSold = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.TotalAmount)
            })
            .OrderByDescending(x => x.UnitsSold)
            .Take(10)
            .ToList();

        return new SellerReportResponse
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            DailyStats = dailyStats,
            TopProducts = topProducts
        };
    }
}
