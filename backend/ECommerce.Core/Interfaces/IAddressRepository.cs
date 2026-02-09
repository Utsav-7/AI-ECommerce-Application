using ECommerce.Core.Entities;

namespace ECommerce.Core.Interfaces;

public interface IAddressRepository : IRepository<Address>
{
    Task<IEnumerable<Address>> GetByUserIdAsync(int userId);
}
