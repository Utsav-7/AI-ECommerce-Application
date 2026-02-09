using ECommerce.Core.DTOs.Request.Coupon;
using ECommerce.Core.DTOs.Response.Coupon;
using ECommerce.Core.DTOs.Response.Common;

namespace ECommerce.Application.Services.Interfaces;

public interface ICouponService
{
    Task<int> GetTotalCountAsync();
    Task<CouponResponse> GetByIdAsync(int id);
    Task<IEnumerable<CouponResponse>> GetAllAsync();
    Task<PagedResponse<CouponResponse>> GetAllPagedAsync(string? search, bool? isActive, int? type, int page, int pageSize);
    Task<CouponResponse> CreateAsync(CreateCouponRequest request);
    Task<CouponResponse> UpdateAsync(int id, UpdateCouponRequest request);
    Task DeleteAsync(int id);
    Task<ValidateCouponResponse> ValidateCouponAsync(string code, decimal orderAmount);
}
