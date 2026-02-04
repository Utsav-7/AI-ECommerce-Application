using ECommerce.Core.Entities;

namespace ECommerce.Core.Interfaces;

public interface ICouponRepository : IRepository<Coupon>
{
    Task<(List<Coupon> Items, int TotalCount)> GetAllPagedAsync(string? search, bool? isActive, int? type, int page, int pageSize);
    Task<bool> CodeExistsAsync(string code, int? excludeId = null);
}
