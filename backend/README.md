# ECommerce Backend API

A .NET 8.0 ASP.NET Core Web API project built with Clean Architecture principles, featuring JWT authentication, Entity Framework Core, and Swagger documentation.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [AppSettings Configuration](#appsettings-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Architecture](#project-architecture)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **.NET 8.0 SDK** or later - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** (LocalDB, SQL Server Express, or Full SQL Server)
- **Visual Studio 2022** (recommended) or **Visual Studio Code** with C# extension
- **Git** (for version control)

### Verify Installation

```bash
dotnet --version
# Should output: 8.0.x or higher
```

## 📁 Project Structure

The project follows Clean Architecture with the following layers:

```
backend/
├── ECommerce.API/              # API Layer - Controllers, Middleware, Startup
├── ECommerce.Application/      # Application Layer - Business Logic, Services
├── ECommerce.Core/             # Core Layer - Entities, DTOs, Interfaces, Exceptions
├── ECommerce.Infrastructure/   # Infrastructure Layer - Data Access, Repositories, External Services
├── ECommerce.Tests.Unit/       # Unit Tests
├── ECommerce.Tests.Integration/# Integration Tests
└── ECommerce.sln              # Solution file
```

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI_Workshop/backend
```

### 2. Restore NuGet Packages

```bash
dotnet restore
```

Or if you're using Visual Studio, packages will be restored automatically when you open the solution.

### 3. Configure AppSettings

See the [AppSettings Configuration](#appsettings-configuration) section below for detailed configuration instructions.

### 4. Build the Solution

```bash
dotnet build
```

### 5. Run Database Migrations

The application automatically applies migrations on startup. However, you can also run them manually:

```bash
cd ECommerce.API
dotnet ef database update
```

### 6. Run the Application

```bash
cd ECommerce.API
dotnet run
```

The API will be available at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **Swagger UI**: `https://localhost:5001/swagger`

## ⚙️ AppSettings Configuration

The application uses `appsettings.json` for configuration. There are two configuration files:

- `appsettings.json` - Production settings
- `appsettings.Development.json` - Development settings (overrides production settings in Development environment)

### Configuration Structure

#### 1. ConnectionStrings

Configure your database connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ECommerceDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
  }
}
```

**Connection String Options:**

- **LocalDB (Default)**: `Server=(localdb)\\mssqllocaldb;Database=ECommerceDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true`
- **SQL Server Express**: `Server=localhost\\SQLEXPRESS;Database=ECommerceDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true`
- **Full SQL Server**: `Server=YOUR_SERVER_NAME;Database=ECommerceDb;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=true`
- **SQL Server with Port**: `Server=YOUR_SERVER_NAME,1433;Database=ECommerceDb;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=true`

**Important Notes:**
- Replace `YOUR_SERVER_NAME`, `YOUR_USERNAME`, and `YOUR_PASSWORD` with your actual SQL Server credentials
- `TrustServerCertificate=true` is used for local development. Remove it in production or use proper SSL certificates
- `MultipleActiveResultSets=true` allows multiple queries on the same connection

#### 2. JwtSettings

Configure JWT token settings for authentication:

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast32CharactersLong",
    "Issuer": "ECommerce",
    "Audience": "ECommerce",
    "ExpiryMinutes": "60"
  }
}
```

**Configuration Details:**

- **SecretKey**: Must be at least 32 characters long. **IMPORTANT**: Use a strong, random secret key in production. Never commit production secrets to version control.
- **Issuer**: The entity that issues the JWT token
- **Audience**: The intended recipient of the JWT token
- **ExpiryMinutes**: Token expiration time in minutes (default: 60)

**Security Best Practices:**
- Generate a strong secret key using a secure random generator
- Store production secrets in environment variables or Azure Key Vault
- Use different keys for different environments

#### 3. EmailSettings

Configure SMTP settings for email functionality:

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "ECommerce"
  }
}
```

**Configuration Details:**

- **SmtpServer**: SMTP server address (Gmail: `smtp.gmail.com`, Outlook: `smtp-mail.outlook.com`)
- **SmtpPort**: SMTP port (587 for TLS, 465 for SSL)
- **SmtpUsername**: Your email address
- **SmtpPassword**: Your email password or app-specific password
- **FromEmail**: Email address that will appear as sender
- **FromName**: Display name for the sender

**Gmail Setup:**
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the generated app password in `SmtpPassword`

**Other Email Providers:**
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, Port: `587`
- **Yahoo**: `smtp.mail.yahoo.com`, Port: `587`
- **Custom SMTP**: Use your provider's SMTP settings

#### 4. Logging

Configure logging levels:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

**Log Levels:**
- `Trace`: Most detailed
- `Debug`: Debug information
- `Information`: General information (default)
- `Warning`: Warning messages
- `Error`: Error messages
- `Critical`: Critical failures

#### 5. AllowedHosts

Configure allowed hosts for security:

```json
{
  "AllowedHosts": "*"
}
```

- Use `"*"` for development (allows all hosts)
- In production, specify allowed domains: `"example.com;www.example.com"`

### Complete AppSettings Example

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ECommerceDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast32CharactersLong",
    "Issuer": "ECommerce",
    "Audience": "ECommerce",
    "ExpiryMinutes": "60"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "ECommerce"
  }
}
```

### Environment-Specific Configuration

For different environments, you can create additional appsettings files:

- `appsettings.Development.json` - Development environment
- `appsettings.Staging.json` - Staging environment
- `appsettings.Production.json` - Production environment

Set the environment using:
- **Environment Variable**: `ASPNETCORE_ENVIRONMENT=Development`
- **Visual Studio**: Project Properties → Debug → Environment variables
- **Command Line**: `dotnet run --environment Development`

## 🗄️ Database Setup

### Automatic Migration

The application automatically applies migrations and seeds the database on startup. This is configured in `Program.cs`.

### Manual Migration Commands

If you need to manage migrations manually:

```bash
# Navigate to the API project
cd ECommerce.API

# Create a new migration
dotnet ef migrations add MigrationName --project ../ECommerce.Infrastructure

# Update database
dotnet ef database update --project ../ECommerce.Infrastructure

# Remove last migration (if not applied)
dotnet ef migrations remove --project ../ECommerce.Infrastructure
```

### Database Seeding

The database is automatically seeded with initial data on startup. Seed data is configured in `ECommerce.Infrastructure/Data/DbSeeder.cs`.

## 🏃 Running the Application

### Using Visual Studio

1. Open `ECommerce.sln` in Visual Studio 2022
2. Set `ECommerce.API` as the startup project
3. Press `F5` or click "Run"

### Using Command Line

```bash
cd ECommerce.API
dotnet run
```

### Using .NET CLI with Specific Port

```bash
cd ECommerce.API
dotnet run --urls "http://localhost:5000;https://localhost:5001"
```

## 📚 API Documentation

### Swagger UI

Once the application is running, access Swagger UI at:
- **Development**: `https://localhost:5001/swagger`
- **Production**: Configure based on your deployment

### Authentication

The API uses JWT Bearer token authentication. To use protected endpoints:

1. Register/Login to get a JWT token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your-token>
   ```

### Testing with Swagger

1. Open Swagger UI
2. Use the `/api/auth/register` or `/api/auth/login` endpoint to get a token
3. Click the "Authorize" button in Swagger UI
4. Enter: `Bearer <your-token>`
5. Click "Authorize" and "Close"
6. Now you can test protected endpoints

## 🏗️ Project Architecture

### Clean Architecture Layers

1. **ECommerce.Core**
   - Entities (Domain Models)
   - DTOs (Data Transfer Objects)
   - Interfaces
   - Exceptions
   - Enums

2. **ECommerce.Application**
   - Business Logic
   - Service Interfaces and Implementations
   - Application-specific helpers (e.g., JwtTokenHelper)

3. **ECommerce.Infrastructure**
   - Data Access (Entity Framework Core)
   - Repository Implementations
   - External Services (Email Service)
   - Database Migrations
   - Unit of Work Pattern

4. **ECommerce.API**
   - Controllers
   - Middleware (Exception Handling)
   - Program.cs (Startup Configuration)
   - API-specific configurations

### Key Features

- ✅ Clean Architecture
- ✅ JWT Authentication
- ✅ Entity Framework Core with Code First Migrations
- ✅ Repository Pattern with Unit of Work
- ✅ Exception Handling Middleware
- ✅ Swagger/OpenAPI Documentation
- ✅ CORS Configuration
- ✅ Email Service Integration
- ✅ Database Seeding

## 🔒 Security Notes

1. **Never commit sensitive data** (passwords, API keys, connection strings) to version control
2. Use **User Secrets** for local development:
   ```bash
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "your-connection-string"
   ```
3. Use **Azure Key Vault** or **Environment Variables** for production
4. Always use strong JWT secret keys (minimum 32 characters)
5. Enable HTTPS in production
6. Configure proper CORS policies for production

## 🐛 Troubleshooting

### Database Connection Issues

- Verify SQL Server is running
- Check connection string format
- Ensure database server allows connections
- Verify credentials are correct

### Migration Errors

- Ensure database exists or can be created
- Check user permissions
- Verify connection string is correct
- Try deleting migrations and recreating them

### JWT Token Issues

- Verify SecretKey is at least 32 characters
- Check token expiration time
- Ensure Issuer and Audience match configuration

### Email Service Issues

- Verify SMTP credentials
- Check firewall/network settings
- For Gmail, ensure App Password is used (not regular password)
- Verify SMTP port is not blocked

## 📝 Additional Resources

- [.NET 8.0 Documentation](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8)
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
- [JWT Authentication](https://jwt.io/)

## 📧 Support

For issues or questions, please contact the development team or create an issue in the repository.

