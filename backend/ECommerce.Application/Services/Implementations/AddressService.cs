using ECommerce.Application.Services.Interfaces;
using ECommerce.Core.DTOs.Request.Address;
using ECommerce.Core.DTOs.Response.Address;
using ECommerce.Core.Entities;
using ECommerce.Core.Exceptions;
using ECommerce.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Services.Implementations;

public class AddressService : IAddressService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AddressService> _logger;

    public AddressService(IUnitOfWork unitOfWork, ILogger<AddressService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<AddressResponse>> GetByUserIdAsync(int userId)
    {
        var addresses = await _unitOfWork.Addresses.GetByUserIdAsync(userId);
        return addresses.Select(MapToResponse);
    }

    public async Task<AddressResponse> GetByIdAsync(int id, int userId)
    {
        var address = await _unitOfWork.Addresses.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            throw new NotFoundException("Address", id);
        return MapToResponse(address);
    }

    public async Task<AddressResponse> CreateAsync(int userId, CreateAddressRequest request)
    {
        var address = new Address
        {
            UserId = userId,
            Street = request.Street.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            Country = request.Country.Trim(),
            ZipCode = request.ZipCode.Trim(),
            IsDefault = request.IsDefault
        };

        if (request.IsDefault)
            await UnsetOtherDefaultsAsync(userId);

        await _unitOfWork.Addresses.AddAsync(address);
        await _unitOfWork.SaveChangesAsync();
        return MapToResponse(address);
    }

    public async Task<AddressResponse> UpdateAsync(int id, int userId, UpdateAddressRequest request)
    {
        var address = await _unitOfWork.Addresses.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            throw new NotFoundException("Address", id);

        address.Street = request.Street.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.Country = request.Country.Trim();
        address.ZipCode = request.ZipCode.Trim();
        address.IsDefault = request.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        if (request.IsDefault)
            await UnsetOtherDefaultsAsync(userId, id);

        await _unitOfWork.Addresses.UpdateAsync(address);
        await _unitOfWork.SaveChangesAsync();
        return MapToResponse(address);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var address = await _unitOfWork.Addresses.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            throw new NotFoundException("Address", id);
        await _unitOfWork.Addresses.DeleteAsync(address);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<AddressResponse> SetDefaultAsync(int id, int userId)
    {
        var address = await _unitOfWork.Addresses.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            throw new NotFoundException("Address", id);

        await UnsetOtherDefaultsAsync(userId, id);
        address.IsDefault = true;
        address.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Addresses.UpdateAsync(address);
        await _unitOfWork.SaveChangesAsync();
        return MapToResponse(address);
    }

    private async Task UnsetOtherDefaultsAsync(int userId, int? excludeId = null)
    {
        var addresses = await _unitOfWork.Addresses.GetByUserIdAsync(userId);
        foreach (var a in addresses.Where(a => a.IsDefault && a.Id != excludeId))
        {
            a.IsDefault = false;
            a.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Addresses.UpdateAsync(a);
        }
    }

    private static AddressResponse MapToResponse(Address a)
    {
        return new AddressResponse
        {
            Id = a.Id,
            UserId = a.UserId,
            Street = a.Street,
            City = a.City,
            State = a.State,
            Country = a.Country,
            ZipCode = a.ZipCode,
            IsDefault = a.IsDefault,
            CreatedAt = a.CreatedAt
        };
    }
}
