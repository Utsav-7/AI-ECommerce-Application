using ECommerce.Core.Entities.Base;

namespace ECommerce.Core.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation Properties
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
