using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Order;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.DTOs.Response.Order;
using ECommerce.Core.Entities;
using ECommerce.Core.Enums;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IUnitOfWork unitOfWork, IEmailService emailService, ILogger<OrderService> logger)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<int> GetTotalOrdersCountAsync()
    {
        return await _unitOfWork.Orders.GetOrdersForAdminCountAsync();
    }

    public async Task<OrderResponse> PlaceOrderAsync(int userId, CreateOrderRequest request)
    {
        var cart = await _unitOfWork.Carts.GetByUserIdAsync(userId);
        if (cart == null || !cart.CartItems.Any(ci => !ci.IsDeleted))
            throw new BadRequestException("Your cart is empty. Add items before placing an order.");

        var address = await _unitOfWork.Addresses.GetByIdAsync(request.AddressId);
        if (address == null || address.UserId != userId)
            throw new BadRequestException("Invalid or inaccessible delivery address.");

        decimal discountAmount = 0;
        Coupon? coupon = null;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var validation = await _unitOfWork.Coupons.GetByCodeAsync(request.CouponCode.Trim());
            if (validation == null)
                throw new BadRequestException("Invalid coupon code.");
            var subtotal = cart.CartItems.Where(ci => !ci.IsDeleted).Sum(ci => ci.Price * ci.Quantity);
            var validateResult = await ValidateCouponInternalAsync(validation, subtotal);
            if (!validateResult.Valid)
                throw new BadRequestException(validateResult.Message);
            discountAmount = validateResult.DiscountAmount;
            coupon = validation;
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var orderNumber = await GenerateOrderNumberAsync();
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new UnauthorizedException("User not found.");

            decimal subTotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var cartItem in cart.CartItems.Where(ci => !ci.IsDeleted))
            {
                var product = await _unitOfWork.Products.GetByIdWithDetailsAsync(cartItem.ProductId);
                if (product == null || !product.IsActive)
                    throw new BadRequestException($"Product '{cartItem.Product?.Name ?? "Unknown"}' is no longer available.");

                var availableStock = await GetAvailableStockAsync(cartItem.ProductId);
                if (availableStock < cartItem.Quantity)
                    throw new BadRequestException($"Only {availableStock} unit(s) of '{product.Name}' available.");

                var unitPrice = product.DiscountPrice ?? product.Price;
                var itemTotal = unitPrice * cartItem.Quantity;
                subTotal += itemTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = cartItem.Quantity,
                    Price = unitPrice,
                    TotalAmount = itemTotal,
                    DiscountAmount = null
                });

                await DeductStockAsync(cartItem.ProductId, cartItem.Quantity);
            }

            var taxAmount = 0m;
            var totalAmount = subTotal - discountAmount + taxAmount;
            if (totalAmount < 0) totalAmount = 0;

            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = userId,
                AddressId = address.Id,
                Status = OrderStatus.Pending,
                SubTotal = subTotal,
                DiscountAmount = discountAmount > 0 ? discountAmount : null,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                CouponId = coupon?.Id
            };

            foreach (var item in orderItems)
                order.OrderItems.Add(item);

            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.SaveChangesAsync();

            var transactionId = $"ORD-{order.Id}-{Guid.NewGuid():N}";
            var payment = new Payment
            {
                OrderId = order.Id,
                TransactionId = transactionId,
                Method = PaymentMethod.Other,
                Status = PaymentStatus.Pending,
                Amount = totalAmount
            };
            await _unitOfWork.Payments.AddAsync(payment);

            if (coupon != null)
            {
                coupon.UsedCount++;
                await _unitOfWork.Coupons.UpdateAsync(coupon);
            }

            foreach (var item in cart.CartItems.Where(ci => !ci.IsDeleted))
            {
                item.IsDeleted = true;
                await _unitOfWork.Carts.UpdateCartItemAsync(item);
            }

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            _logger.LogInformation("Order {OrderNumber} placed by user {UserId}", orderNumber, userId);

            var created = await _unitOfWork.Orders.GetByIdWithDetailsAsync(order.Id);
            var response = MapToResponse(created!);

            try
            {
                if (!string.IsNullOrWhiteSpace(response.CustomerEmail))
                    await _emailService.SendOrderPlacedEmailAsync(
                        response.CustomerEmail,
                        response.CustomerName,
                        response.OrderNumber,
                        response.TotalAmount,
                        response.CreatedAt);
                _logger.LogInformation("Order placed email sent to {Email} for order {OrderNumber}", response.CustomerEmail, response.OrderNumber);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send order placed email to {Email} for order {OrderNumber}", response.CustomerEmail, response.OrderNumber);
            }

            return response;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<OrderResponse?> GetByIdAsync(int orderId, int? userId = null, int? sellerId = null, bool isAdmin = false)
    {
        var order = await _unitOfWork.Orders.GetByIdWithDetailsAsync(orderId);
        if (order == null) return null;

        if (!isAdmin)
        {
            if (userId.HasValue && order.UserId != userId.Value)
                return null;
            if (sellerId.HasValue && !order.OrderItems.Any(oi => oi.Product?.SellerId == sellerId.Value))
                return null;
        }

        return isAdmin ? MapToResponse(order) : MapToResponse(order, filterBySellerId: sellerId);
    }

    public async Task<IEnumerable<OrderResponse>> GetMyOrdersAsync(int userId, int? limit = null)
    {
        var orders = await _unitOfWork.Orders.GetByUserIdAsync(userId, limit);
        return orders.Select(o => MapToResponse(o));
    }

    public async Task<PagedResponse<OrderResponse>> GetOrdersForAdminAsync(int page, int pageSize)
    {
        var (items, totalCount) = (
            (await _unitOfWork.Orders.GetOrdersForAdminAsync(page, pageSize)).ToList(),
            await _unitOfWork.Orders.GetOrdersForAdminCountAsync()
        );
        var data = items.ConvertAll(o => MapToResponse(o));
        return new PagedResponse<OrderResponse>
        {
            Data = data,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
            TotalRecords = totalCount
        };
    }

    public async Task<PagedResponse<OrderResponse>> GetOrdersForSellerAsync(int sellerId, int page, int pageSize)
    {
        var items = (await _unitOfWork.Orders.GetOrdersForSellerAsync(sellerId, page, pageSize)).ToList();
        var totalCount = await _unitOfWork.Orders.GetOrdersForSellerCountAsync(sellerId);
        var data = new List<OrderResponse>();
        foreach (var order in items)
            data.Add(MapToResponse(order, filterBySellerId: sellerId));
        return new PagedResponse<OrderResponse>
        {
            Data = data,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
            TotalRecords = totalCount
        };
    }

    public async Task<OrderResponse> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request, int? sellerId = null, bool isAdmin = false)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
        if (order == null)
            throw new NotFoundException("Order", orderId);

        if (!isAdmin && sellerId.HasValue)
        {
            var orderWithItems = await _unitOfWork.Orders.GetByIdWithDetailsAsync(orderId);
            var hasSellerItems = orderWithItems?.OrderItems?
                .Any(oi => !oi.IsDeleted && oi.Product?.SellerId == sellerId.Value) ?? false;
            if (!hasSellerItems)
                throw new UnauthorizedException("You do not have permission to update this order.");
        }
        else if (!isAdmin)
        {
            throw new UnauthorizedException("Only admin or seller can update order status.");
        }

        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request.TrackingNumber))
            order.TrackingNumber = request.TrackingNumber.Trim();
        if (request.Status == OrderStatus.Shipped)
            order.ShippedDate = DateTime.UtcNow;
        if (request.Status == OrderStatus.Delivered)
            order.DeliveredDate = DateTime.UtcNow;

        await _unitOfWork.Orders.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.Orders.GetByIdWithDetailsAsync(orderId);
        var response = MapToResponse(updated!);

        if (!string.IsNullOrWhiteSpace(response.CustomerEmail))
        {
            try
            {
                switch (request.Status)
                {
                    case OrderStatus.Confirmed:
                        await _emailService.SendOrderConfirmedEmailAsync(response.CustomerEmail, response.CustomerName, response.OrderNumber);
                        _logger.LogInformation("Order confirmed email sent to {Email} for order {OrderNumber}", response.CustomerEmail, response.OrderNumber);
                        break;
                    case OrderStatus.Cancelled:
                        await _emailService.SendOrderCancelledEmailAsync(response.CustomerEmail, response.CustomerName, response.OrderNumber);
                        _logger.LogInformation("Order cancelled email sent to {Email} for order {OrderNumber}", response.CustomerEmail, response.OrderNumber);
                        break;
                    case OrderStatus.Delivered:
                        await _emailService.SendOrderDeliveredEmailAsync(response.CustomerEmail, response.CustomerName, response.OrderNumber, order.DeliveredDate);
                        _logger.LogInformation("Order delivered email sent to {Email} for order {OrderNumber}", response.CustomerEmail, response.OrderNumber);
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send order status email to {Email} for order {OrderNumber}", response.CustomerEmail, response.OrderNumber);
            }
        }

        return response;
    }

    private async Task<string> GenerateOrderNumberAsync()
    {
        string orderNumber;
        do
        {
            orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";
        }
        while (await _unitOfWork.Orders.ExistsOrderNumberAsync(orderNumber));
        return orderNumber;
    }

    private async Task<ValidateCouponResult> ValidateCouponInternalAsync(Coupon coupon, decimal orderAmount)
    {
        if (!coupon.IsActive)
            return new ValidateCouponResult { Valid = false, Message = "This coupon is no longer active." };
        var now = DateTime.UtcNow;
        if (now < coupon.ValidFrom)
            return new ValidateCouponResult { Valid = false, Message = "This coupon is not yet valid." };
        if (now > coupon.ValidTo)
            return new ValidateCouponResult { Valid = false, Message = "This coupon has expired." };
        if (coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit)
            return new ValidateCouponResult { Valid = false, Message = "This coupon has reached its usage limit." };
        if (coupon.MinPurchaseAmount.HasValue && orderAmount < coupon.MinPurchaseAmount.Value)
            return new ValidateCouponResult { Valid = false, Message = $"Minimum order amount of ₹{coupon.MinPurchaseAmount.Value:N0} required." };

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
        if (discountAmount > orderAmount) discountAmount = orderAmount;

        return new ValidateCouponResult { Valid = true, DiscountAmount = discountAmount };
    }

    private async Task<int> GetAvailableStockAsync(int productId)
    {
        var inventory = await _unitOfWork.Inventories.GetByProductIdAsync(productId);
        if (inventory != null)
            return inventory.StockQuantity - inventory.ReservedQuantity;
        var product = await _unitOfWork.Products.GetByIdAsync(productId);
        return product?.StockQuantity ?? 0;
    }

    private async Task DeductStockAsync(int productId, int quantity)
    {
        var inventory = await _unitOfWork.Inventories.GetByProductIdAsync(productId);
        var product = await _unitOfWork.Products.GetByIdAsync(productId);
        if (product == null) return;

        if (inventory != null)
        {
            inventory.StockQuantity = Math.Max(0, inventory.StockQuantity - quantity);
            await _unitOfWork.Inventories.UpdateAsync(inventory);
            product.StockQuantity = inventory.StockQuantity;
            await _unitOfWork.Products.UpdateAsync(product);
        }
        else
        {
            product.StockQuantity = Math.Max(0, product.StockQuantity - quantity);
            await _unitOfWork.Products.UpdateAsync(product);
        }
    }

    private static OrderResponse MapToResponse(Order order, int? filterBySellerId = null)
    {
        var address = order.Address;
        var addressLine = address != null
            ? string.Join(", ", new[] { address.Street, address.City, address.State, address.Country, address.ZipCode }.Where(x => !string.IsNullOrEmpty(x)))
            : string.Empty;

        var orderItems = order.OrderItems?.Where(oi => !oi.IsDeleted).ToList() ?? new List<OrderItem>();
        var filteredItems = filterBySellerId.HasValue
            ? orderItems.Where(oi => oi.Product?.SellerId == filterBySellerId.Value).ToList()
            : orderItems;

        var itemResponses = filteredItems
            .Select(oi => new OrderItemResponse
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product?.Name ?? string.Empty,
                ImageUrl = oi.Product?.ImageUrl,
                UnitPrice = oi.Price,
                Quantity = oi.Quantity,
                DiscountAmount = oi.DiscountAmount,
                TotalAmount = oi.TotalAmount,
                SellerId = oi.Product?.SellerId
            })
            .ToList();

        var subTotal = itemResponses.Sum(i => i.TotalAmount);
        var totalAmount = filterBySellerId.HasValue ? subTotal : order.TotalAmount;

        return new OrderResponse
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            CustomerName = order.User != null ? $"{order.User.FirstName} {order.User.LastName}".Trim() : string.Empty,
            CustomerEmail = order.User?.Email ?? string.Empty,
            AddressId = order.AddressId,
            ShippingAddress = addressLine,
            Status = order.Status,
            StatusDisplay = order.Status.ToString(),
            SubTotal = filterBySellerId.HasValue ? subTotal : order.SubTotal,
            DiscountAmount = filterBySellerId.HasValue ? null : order.DiscountAmount,
            TaxAmount = filterBySellerId.HasValue ? 0 : order.TaxAmount,
            TotalAmount = totalAmount,
            TrackingNumber = order.TrackingNumber,
            ShippedDate = order.ShippedDate,
            DeliveredDate = order.DeliveredDate,
            CreatedAt = order.CreatedAt,
            CouponCode = order.Coupon?.Code,
            Items = itemResponses
        };
    }

    private class ValidateCouponResult
    {
        public bool Valid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
    }
}
