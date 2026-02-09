namespace ECommerce.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    ICategoryRepository Categories { get; }
    IProductRepository Products { get; }
    IInventoryRepository Inventories { get; }
    ICouponRepository Coupons { get; }
    ICartRepository Carts { get; }
    IAddressRepository Addresses { get; }
    IOrderRepository Orders { get; }
    IPaymentRepository Payments { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}

