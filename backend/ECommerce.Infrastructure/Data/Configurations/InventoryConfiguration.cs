using ECommerce.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.ToTable("Inventories");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.StockQuantity)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(i => i.ReservedQuantity)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(i => i.LowStockThreshold)
            .IsRequired()
            .HasDefaultValue(10);

        // Relationships
        builder.HasOne(i => i.Product)
            .WithOne(p => p.Inventory)
            .HasForeignKey<Inventory>(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => i.ProductId)
            .IsUnique();
    }
}

