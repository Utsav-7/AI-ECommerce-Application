using ECommerce.Core.Entities;
using ECommerce.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Check if database exists first
        bool databaseExists = false;
        try
        {
            databaseExists = await context.Database.CanConnectAsync();
        }
        catch
        {
            // Database doesn't exist or can't connect
            databaseExists = false;
        }

        if (!databaseExists)
        {
            // Database doesn't exist - create it with schema
            // EnsureCreatedAsync will create the database if it doesn't exist
            await context.Database.EnsureCreatedAsync();
        }
        else
        {
            // Database exists - try to apply migrations if any
            try
            {
                var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
                if (pendingMigrations.Any())
                {
                    // Apply pending migrations
                    await context.Database.MigrateAsync();
                }
            }
            catch
            {
                // If migrations fail, ensure schema is up to date
                await context.Database.EnsureCreatedAsync();
            }
        }

        // Check if data already exists (ignore query filters to check all users)
        var hasUsers = false;
        try
        {
            hasUsers = await context.Users
                .IgnoreQueryFilters()
                .AnyAsync();
        }
        catch
        {
            // If table doesn't exist or query fails, proceed with seeding
            hasUsers = false;
        }

        if (hasUsers)
        {
            return; // Data already seeded
        }

        // Seed Roles/Users
        var admin = new User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@ecommerce.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var seller = new User
        {
            FirstName = "Seller",
            LastName = "User",
            Email = "seller@ecommerce.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Seller@123"),
            Role = UserRole.Seller,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var customer = new User
        {
            FirstName = "Customer",
            LastName = "User",
            Email = "customer@ecommerce.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(admin, seller, customer);
        await context.SaveChangesAsync();
    }
}

