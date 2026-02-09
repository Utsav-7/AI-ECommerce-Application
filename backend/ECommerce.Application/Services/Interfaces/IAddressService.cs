using ECommerce.Core.DTOs.Request.Address;
using ECommerce.Core.DTOs.Response.Address;

namespace ECommerce.Application.Services.Interfaces;

public interface IAddressService
{
    Task<IEnumerable<AddressResponse>> GetByUserIdAsync(int userId);
    Task<AddressResponse> GetByIdAsync(int id, int userId);
    Task<AddressResponse> CreateAsync(int userId, CreateAddressRequest request);
    Task<AddressResponse> UpdateAsync(int id, int userId, UpdateAddressRequest request);
    Task DeleteAsync(int id, int userId);
    Task<AddressResponse> SetDefaultAsync(int id, int userId);
}
