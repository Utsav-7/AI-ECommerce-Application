# E-Commerce Backend API

ASP.NET Core 8 Web API for the E-Commerce platform. Provides REST APIs with JWT authentication, role-based access (Admin, Seller, Customer), and full e-commerce workflows.

## Tech Stack

- **.NET 8** – Web API
- **Entity Framework Core 8** – ORM with SQL Server
- **JWT Bearer** – Authentication
- **Swagger/OpenAPI** – API documentation
- **N-tier** – Core, Application, Infrastructure, API

## Project Structure

```
backend/
├── ECommerce.API/           # Web API, controllers, middleware
├── ECommerce.Application/   # Services, DTOs, interfaces
├── ECommerce.Core/           # Entities, enums, exceptions, interfaces
├── ECommerce.Infrastructure/ # DbContext, repositories, migrations, email
└── ECommerce.Tests.Unit/     # Unit tests
```

## Features

### Authentication & Users
- **Register** – Customer/Seller registration with welcome email
- **Login** – JWT token with role (Admin, Seller, User)
- **Change Password** – Authenticated user with email notification
- **Reset Password** – OTP via email, verify OTP and set new password
- **Get Current User** – Profile from JWT
- **User Management (Admin)** – List users, paged search, filter by role/status, get by ID
- **Update User (Admin)** – Edit customer/seller (name, email, phone, active)
- **Update User Status** – Activate/deactivate (with email notification)
- **Approve/Reject Seller** – With email notifications
- **Delete User** – Soft delete

### Categories
- **Public** – Get all active categories
- **Admin** – CRUD, paged list, toggle active

### Products
- **Public** – List, get by ID, by category, search
- **Seller** – CRUD own products, my-products (paged), toggle status/visibility
- **Admin** – Full CRUD, paged list, get by seller

### Cart
- **Get Cart** – Current user cart with items
- **Add Item** – Add/update product in cart
- **Update Item** – Change quantity
- **Remove Item** – Remove line item
- **Clear Cart** – Remove all items

### Addresses
- **CRUD** – List, get, create, update, delete addresses
- **Set Default** – Mark one address as default for checkout

### Coupons
- **Validate** – Check coupon code and get discount (for checkout)
- **Admin** – CRUD, paged list, get by ID

### Orders
- **Place Order** – Create order from cart (with coupon), payment record, stock deduction, order-placed email
- **Get My Orders** – Customer order history
- **Get Order by ID** – Customer/Seller/Admin with authorization
- **Admin/Seller** – Paged orders list
- **Update Status** – Admin/Seller: set status (Pending, Confirmed, Shipped, Delivered, Cancelled), tracking number; emails sent for Confirmed, Cancelled, Delivered

### Inventory (Seller)
- **Get Seller Inventory** – Products with stock
- **Get Seller Stats** – Total items, low-stock count

### Reports
- **Admin Report** – Total revenue/orders, daily stats, orders by status (with date range)
- **Seller Report** – Total revenue/orders, daily stats, top products (with date range)

### Email Notifications
- Welcome (registration)
- Password reset OTP, password change confirmation
- Seller approval/rejection, account status change
- **Order emails** – Placed, Confirmed, Cancelled, Delivered

## Configuration

### appsettings.json

- **ConnectionStrings:DefaultConnection** – SQL Server connection string
- **JwtSettings:SecretKey** – JWT signing key
- **JwtSettings:Issuer / Audience** – Token issuer/audience
- **EmailSettings** – SmtpServer, SmtpPort, SmtpUsername, SmtpPassword, FromEmail, FromName

### Run

```bash
cd backend
dotnet restore
dotnet run --project ECommerce.API
```

API: `https://localhost:7xxx` (or port in launchSettings). Swagger: `https://localhost:7xxx/swagger`.

### Migrations

```bash
cd backend
dotnet ef migrations add <MigrationName> --project ECommerce.Infrastructure --startup-project ECommerce.API
dotnet ef database update --project ECommerce.Infrastructure --startup-project ECommerce.API
```

## API Overview

| Area        | Base Route        | Auth / Role      |
|------------|-------------------|-------------------|
| Auth       | `/api/auth`       | Public / User     |
| Users      | `/api/users`      | Admin             |
| Categories | `/api/categories` | Public / Admin    |
| Products   | `/api/products`   | Public / Seller / Admin |
| Cart       | `/api/cart`       | Customer          |
| Addresses  | `/api/addresses`  | Customer          |
| Coupons    | `/api/coupons`    | Public / Admin    |
| Orders     | `/api/orders`     | Customer / Seller / Admin |
| Inventories| `/api/inventories`| Seller            |
| Reports    | `/api/reports`    | Admin / Seller    |

Responses use a common envelope: `{ success, data, message, errors }`.
