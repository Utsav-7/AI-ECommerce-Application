using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Coupon;
using ECommerce.Core.DTOs.Response.Coupon;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.Entities;
using ECommerce.Core.Enums;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Services.Implementations;

public class CouponService : ICouponService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CouponService> _logger;

    public CouponService(IUnitOfWork unitOfWork, ILogger<CouponService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _unitOfWork.Coupons.CountAsync(c => !c.IsDeleted);
    }

    public async Task<CouponResponse> GetByIdAsync(int id)
    {
        var coupon = await _unitOfWork.Coupons.GetByIdAsync(id);
        if (coupon == null)
            throw new NotFoundException("Coupon", id);
        return MapToResponse(coupon);
    }

    public async Task<IEnumerable<CouponResponse>> GetAllAsync()
    {
        var coupons = await _unitOfWork.Coupons.GetAllAsync();
        return coupons.Select(MapToResponse);
    }

    public async Task<PagedResponse<CouponResponse>> GetAllPagedAsync(string? search, bool? isActive, int? type, int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Coupons.GetAllPagedAsync(search, isActive, type, page, pageSize);
        var data = items.Select(MapToResponse).ToList();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResponse<CouponResponse>
        {
            Data = data,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            TotalRecords = totalCount
        };
    }

    public async Task<CouponResponse> CreateAsync(CreateCouponRequest request)
    {
        if (await _unitOfWork.Coupons.CodeExistsAsync(request.Code))
            throw new BadRequestException($"Coupon with code '{request.Code}' already exists");

        if (request.ValidTo < request.ValidFrom)
            throw new BadRequestException("ValidTo must be after ValidFrom");

        var coupon = new Coupon
        {
            Code = request.Code.Trim(),
            Description = request.Description.Trim(),
            Type = request.Type,
            Value = request.Value,
            MinPurchaseAmount = request.MinPurchaseAmount,
            MaxDiscountAmount = request.MaxDiscountAmount,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
            UsageLimit = request.UsageLimit,
            UsedCount = 0,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Coupons.AddAsync(coupon);
        await _unitOfWork.SaveChangesAsync();
        return MapToResponse(coupon);
    }

    public async Task<CouponResponse> UpdateAsync(int id, UpdateCouponRequest request)
    {
        var coupon = await _unitOfWork.Coupons.GetByIdAsync(id);
        if (coupon == null)
            throw new NotFoundException("Coupon", id);

        if (await _unitOfWork.Coupons.CodeExistsAsync(request.Code, id))
            throw new BadRequestException($"Coupon with code '{request.Code}' already exists");

        if (request.ValidTo < request.ValidFrom)
            throw new BadRequestException("ValidTo must be after ValidFrom");

        if (request.UsageLimit > 0 && coupon.UsedCount > request.UsageLimit)
            throw new BadRequestException($"Usage limit cannot be less than current used count ({coupon.UsedCount})");

        coupon.Code = request.Code.Trim();
        coupon.Description = request.Description.Trim();
        coupon.Type = request.Type;
        coupon.Value = request.Value;
        coupon.MinPurchaseAmount = request.MinPurchaseAmount;
        coupon.MaxDiscountAmount = request.MaxDiscountAmount;
        coupon.ValidFrom = request.ValidFrom;
        coupon.ValidTo = request.ValidTo;
        coupon.UsageLimit = request.UsageLimit;
        coupon.IsActive = request.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Coupons.UpdateAsync(coupon);
        await _unitOfWork.SaveChangesAsync();
        return MapToResponse(coupon);
    }

    public async Task DeleteAsync(int id)
    {
        var coupon = await _unitOfWork.Coupons.GetByIdAsync(id);
        if (coupon == null)
            throw new NotFoundException("Coupon", id);
        await _unitOfWork.Coupons.DeleteAsync(coupon);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<ValidateCouponResponse> ValidateCouponAsync(string code, decimal orderAmount)
    {
        if (string.IsNullOrWhiteSpace(code))
            return new ValidateCouponResponse { Valid = false, Message = "Coupon code is required." };

        var coupon = await _unitOfWork.Coupons.GetByCodeAsync(code.Trim());
        if (coupon == null)
            return new ValidateCouponResponse { Valid = false, Message = "Invalid coupon code." };

        if (!coupon.IsActive)
            return new ValidateCouponResponse { Valid = false, Message = "This coupon is no longer active." };

        var now = DateTime.UtcNow;
        if (now < coupon.ValidFrom)
            return new ValidateCouponResponse { Valid = false, Message = "This coupon is not yet valid." };
        if (now > coupon.ValidTo)
            return new ValidateCouponResponse { Valid = false, Message = "This coupon has expired." };

        if (coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit)
            return new ValidateCouponResponse { Valid = false, Message = "This coupon has reached its usage limit." };

        if (coupon.MinPurchaseAmount.HasValue && orderAmount < coupon.MinPurchaseAmount.Value)
            return new ValidateCouponResponse
            {
                Valid = false,
                Message = $"Minimum order amount of ₹{coupon.MinPurchaseAmount.Value:N0} required for this coupon."
            };

        decimal discountAmount;
        if (coupon.Type == CouponType.Percentage)
        {
            discountAmount = Math.Round(orderAmount * (coupon.Value / 100m), 2);
            if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                discountAmount = coupon.MaxDiscountAmount.Value;
        }
        else
        {
            discountAmount = coupon.Value;
            if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                discountAmount = coupon.MaxDiscountAmount.Value;
        }

        if (discountAmount > orderAmount)
            discountAmount = orderAmount;

        return new ValidateCouponResponse
        {
            Valid = true,
            DiscountAmount = discountAmount,
            Message = $"You save ₹{discountAmount:N0}",
            Code = coupon.Code
        };
    }

    private static CouponResponse MapToResponse(Coupon coupon)
    {
        return new CouponResponse
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Description = coupon.Description,
            Type = coupon.Type,
            TypeName = coupon.Type == CouponType.Percentage ? "Percentage" : "Flat",
            Value = coupon.Value,
            MinPurchaseAmount = coupon.MinPurchaseAmount,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            ValidFrom = coupon.ValidFrom,
            ValidTo = coupon.ValidTo,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            IsActive = coupon.IsActive,
            CreatedAt = coupon.CreatedAt,
            UpdatedAt = coupon.UpdatedAt
        };
    }
}
