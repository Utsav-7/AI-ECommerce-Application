using ECommerce.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.Value)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.MinPurchaseAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.MaxDiscountAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.UsageLimit)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(c => c.UsedCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Relationships
        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Coupon)
            .HasForeignKey(o => o.CouponId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

