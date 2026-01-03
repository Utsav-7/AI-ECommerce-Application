# Software Requirements Specification (SRS)
## E-Commerce Platform

**Version:** 1.0  
**Date:** December 2024  
**Prepared By:** Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [System Architecture](#5-system-architecture)
6. [User Interface Requirements](#6-user-interface-requirements)
7. [Data Models](#7-data-models)
8. [Security Requirements](#8-security-requirements)
9. [Appendices](#9-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the E-Commerce Platform. It describes the functional and non-functional requirements, system architecture, user roles, and technical specifications. This document is intended for developers, project managers, stakeholders, and quality assurance teams.

### 1.2 Scope

The E-Commerce Platform is a web-based application that enables:
- Multiple user types (Admin, Vendor, User) to interact with the system
- Vendors to manage their products, inventory, and sales
- Users to browse, purchase products, and manage orders
- Administrators to oversee the entire platform, manage users, categories, and view reports
- Integration with a test payment gateway for transaction processing

**Out of Scope:**
- Chat functionality between users and vendors
- Mobile native applications (web-responsive only)
- Real-time inventory synchronization across multiple warehouses
- Multi-currency support
- International shipping calculations

### 1.3 Definitions, Acronyms, and Abbreviations

- **SRS**: Software Requirements Specification
- **API**: Application Programming Interface
- **EF Core**: Entity Framework Core
- **JWT**: JSON Web Token
- **REST**: Representational State Transfer
- **UI**: User Interface
- **UX**: User Experience
- **CRUD**: Create, Read, Update, Delete
- **SKU**: Stock Keeping Unit
- **GDPR**: General Data Protection Regulation

### 1.4 References

- .NET 8 Documentation: https://learn.microsoft.com/en-us/dotnet/
- Entity Framework Core Documentation: https://learn.microsoft.com/en-us/ef/core/
- SQL Server Documentation: https://learn.microsoft.com/en-us/sql/
- Tailwind CSS Documentation: https://tailwindcss.com/docs

### 1.5 Overview

This document is organized into sections covering system overview, functional requirements, non-functional requirements, system architecture, user interface requirements, data models, security requirements, and appendices.

---

## 2. System Overview

### 2.1 Product Perspective

The E-Commerce Platform is a standalone web application that operates as a multi-vendor marketplace. The system allows vendors to register, list products, manage inventory, and receive orders. Users can browse products, add items to cart, make purchases, and track orders. Administrators have full control over the platform, including user management, category management, and comprehensive reporting.

### 2.2 Product Functions

The system provides the following major functions:

1. **User Authentication & Authorization**
   - User and Vendor registration
   - Secure login for all user types
   - Role-based access control

2. **Product Catalog Management**
   - Category creation and management
   - Product listing and management by vendors
   - Product search and filtering

3. **Shopping Experience**
   - Shopping cart functionality
   - Wishlist management
   - Product reviews and ratings
   - Checkout process

4. **Order Management**
   - Order placement and processing
   - Order tracking
   - Order history

5. **Payment Processing**
   - Integration with test payment gateway
   - Transaction handling

6. **Inventory Management**
   - Stock tracking
   - Low stock alerts to vendors

7. **Address Management**
   - Multiple shipping addresses per user
   - Address validation

8. **Discount Management**
   - Coupon creation and application
   - Discount code management

9. **Reporting**
   - Vendor sales reports
   - Administrative reports

10. **User Management**
    - Super Admin user management capabilities

### 2.3 User Classes and Characteristics

#### 2.3.1 Super Admin
- **Characteristics**: Full system access, manages all users, categories, and platform settings
- **Technical Expertise**: High
- **Frequency of Use**: Daily
- **Primary Responsibilities**:
  - Manage all user accounts (approve/reject vendors, suspend users)
  - Manage product categories
  - View system-wide reports
  - Monitor platform health

#### 2.3.2 Vendor
- **Characteristics**: Business owners selling products on the platform
- **Technical Expertise**: Medium
- **Frequency of Use**: Daily
- **Primary Responsibilities**:
  - Manage product listings
  - Manage inventory and stock levels
  - Process orders
  - View sales reports
  - Manage discounts/coupons for their products

#### 2.3.3 User (Customer)
- **Characteristics**: End consumers purchasing products
- **Technical Expertise**: Low to Medium
- **Frequency of Use**: Occasional to Regular
- **Primary Responsibilities**:
  - Browse and search products
  - Add items to cart and wishlist
  - Place orders
  - Manage addresses
  - Write reviews and ratings
  - Track orders

### 2.4 Operating Environment

#### 2.4.1 Server Environment
- **Operating System**: Windows Server 2019/2022 or Linux (Ubuntu 20.04+)
- **Web Server**: IIS (Windows) or Nginx/Kestrel (Linux)
- **Runtime**: .NET 8 Runtime
- **Database Server**: SQL Server 2019 or later

#### 2.4.2 Client Environment
- **Browsers**: Chrome (latest 2 versions), Firefox (latest 2 versions), Edge (latest 2 versions), Safari (latest 2 versions)
- **Screen Resolutions**: Responsive design supporting 320px to 4K displays
- **Network**: Broadband internet connection recommended

### 2.5 Design and Implementation Constraints

1. **Technology Constraints**:
   - Backend must use .NET 8
   - Database must use SQL Server
   - ORM must use Entity Framework Core
   - Frontend styling must use Tailwind CSS

2. **Regulatory Constraints**:
   - Must comply with data protection regulations
   - Payment processing must follow PCI DSS guidelines (for future production)

3. **Platform Constraints**:
   - Web-based application only (no native mobile apps)
   - Must be responsive and mobile-friendly

4. **Integration Constraints**:
   - Payment gateway integration must support test mode
   - API must follow RESTful principles

---

## 3. Functional Requirements

### 3.1 User Registration

#### 3.1.1 User Registration
**FR-1.1**: The system shall allow new users to register by providing:
- Full Name (required)
- Email Address (required, must be unique)
- Password (required, minimum 8 characters, must contain uppercase, lowercase, number, and special character)
- Phone Number (optional)
- Terms and Conditions acceptance (required)

**FR-1.2**: The system shall validate email format and uniqueness before registration.

**FR-1.3**: The system shall send a verification email to the registered email address.

**FR-1.4**: The system shall require email verification before allowing login.

**FR-1.5**: Upon successful registration, the system shall assign the "User" role automatically.

#### 3.1.2 Vendor Registration
**FR-1.6**: The system shall allow vendors to register by providing:
- Business Name (required)
- Contact Person Name (required)
- Email Address (required, must be unique)
- Password (required, minimum 8 characters)
- Phone Number (required)
- Business Address (required)
- Tax ID / Business Registration Number (optional)
- Business Description (optional)

**FR-1.7**: The system shall require vendor approval by Super Admin before vendor can access the system.

**FR-1.8**: The system shall send notification to Super Admin when a new vendor registers.

**FR-1.9**: Upon Super Admin approval, the system shall assign the "Vendor" role and send approval email to vendor.

**FR-1.10**: The system shall allow vendors to upload business documents (optional) during registration.

### 3.2 User Login

#### 3.2.1 Login Functionality
**FR-2.1**: The system shall provide a login page accessible to all user types (Admin, Vendor, User).

**FR-2.2**: The system shall authenticate users using email and password.

**FR-2.3**: The system shall support "Remember Me" functionality with secure token storage.

**FR-2.4**: The system shall implement account lockout after 5 failed login attempts (lockout duration: 15 minutes).

**FR-2.5**: The system shall redirect users to their respective dashboards based on role:
- Super Admin → Admin Dashboard
- Vendor → Vendor Dashboard
- User → User Dashboard/Home Page

**FR-2.6**: The system shall provide "Forgot Password" functionality:
- User enters email
- System sends password reset link
- Link expires after 24 hours
- User can set new password

**FR-2.7**: The system shall use JWT (JSON Web Token) for session management.

**FR-2.8**: The system shall log all login attempts (successful and failed) for security auditing.

### 3.3 User Management (Super Admin)

#### 3.3.1 User Listing
**FR-3.1**: The system shall provide Super Admin with a list of all registered users (Users and Vendors).

**FR-3.2**: The system shall allow Super Admin to filter users by:
- Role (User, Vendor, Admin)
- Status (Active, Inactive, Pending Approval)
- Registration Date Range
- Email/Name search

**FR-3.3**: The system shall display user information:
- Name/Business Name
- Email
- Role
- Registration Date
- Status
- Last Login Date

#### 3.3.2 User Actions
**FR-3.4**: The system shall allow Super Admin to:
- View user details
- Activate/Deactivate user accounts
- Approve/Reject vendor registrations
- Reset user passwords
- Delete user accounts (with confirmation)
- Change user roles (with restrictions)

**FR-3.5**: The system shall prevent Super Admin from deleting their own account.

**FR-3.6**: The system shall send email notifications to users when their account status changes.

**FR-3.7**: The system shall maintain an audit log of all user management actions performed by Super Admin.

### 3.4 Category Management

#### 3.4.1 Category Creation
**FR-4.1**: The system shall allow Super Admin to create product categories.

**FR-4.2**: Each category shall have:
- Category Name (required, unique)
- Description (optional)
- Category Image (optional)
- Parent Category (optional, for subcategories)
- Display Order (optional, for sorting)
- Is Active flag

**FR-4.3**: The system shall support hierarchical category structure (parent-child relationships).

**FR-4.4**: The system shall validate that category names are unique within the same parent level.

#### 3.4.2 Category Management
**FR-4.5**: The system shall allow Super Admin to:
- View all categories in a tree/hierarchical view
- Edit category details
- Delete categories (only if no products are associated)
- Activate/Deactivate categories
- Reorder categories

**FR-4.6**: The system shall display category usage count (number of products in category).

**FR-4.7**: The system shall prevent deletion of categories that have associated products.

**FR-4.8**: The system shall allow bulk operations on categories (bulk activate/deactivate).

### 3.5 Product Management

#### 3.5.1 Product Creation (Vendor)
**FR-5.1**: The system shall allow vendors to create product listings.

**FR-5.2**: Each product shall have:
- Product Name (required)
- Description (required)
- SKU (required, unique per vendor)
- Price (required, must be greater than 0)
- Stock Quantity (required, must be >= 0)
- Category (required, must select from existing categories)
- Product Images (required, minimum 1, maximum 10)
- Weight (optional)
- Dimensions (optional)
- Is Active flag

**FR-5.3**: The system shall allow vendors to set:
- Discount Price (optional, must be less than regular price)
- Discount Start Date and End Date (if discount price is set)

**FR-5.4**: The system shall validate that SKU is unique within the vendor's product list.

**FR-5.5**: The system shall allow vendors to upload multiple product images.

**FR-5.6**: The system shall support product variants (Size, Color, etc.) if needed in future (noted for extensibility).

#### 3.5.2 Product Listing (Vendor)
**FR-5.7**: The system shall provide vendors with a list of all their products.

**FR-5.8**: The system shall allow vendors to filter products by:
- Category
- Status (Active, Inactive, Out of Stock)
- Stock Level (In Stock, Low Stock, Out of Stock)
- Search by name/SKU

**FR-5.9**: The system shall display product information:
- Product Name
- SKU
- Price
- Stock Quantity
- Category
- Status
- Created Date
- Last Modified Date

#### 3.5.3 Product Management (Vendor)
**FR-5.10**: The system shall allow vendors to:
- Edit product details
- Update stock quantity
- Activate/Deactivate products
- Delete products (only if no orders exist)
- Duplicate products
- Bulk update (price, stock, status)

**FR-5.11**: The system shall prevent deletion of products that have existing orders.

**FR-5.12**: The system shall allow vendors to view product performance metrics (views, orders, revenue).

#### 3.5.4 Product Display (User)
**FR-5.13**: The system shall display products to users on the frontend:
- Product listing page with filters (Category, Price Range, Sort options)
- Product detail page with full information
- Related products suggestions
- Product reviews and ratings display

**FR-5.14**: The system shall only display active products that are in stock (or allow out-of-stock display with "Notify Me" option).

**FR-5.15**: The system shall support product search functionality:
- Search by product name
- Search by category
- Advanced filters (Price, Rating, Availability)

### 3.6 Coupon & Discount Management

#### 3.6.1 Coupon Creation (Super Admin & Vendor)
**FR-6.1**: The system shall allow Super Admin to create platform-wide coupons.

**FR-6.2**: The system shall allow Vendors to create coupons for their own products.

**FR-6.3**: Each coupon shall have:
- Coupon Code (required, unique, alphanumeric, 6-20 characters)
- Discount Type (Percentage or Fixed Amount)
- Discount Value (required, must be > 0)
- Minimum Purchase Amount (optional)
- Maximum Discount Amount (optional, for percentage coupons)
- Start Date (required)
- End Date (required, must be after start date)
- Usage Limit (optional, total number of times coupon can be used)
- Usage Limit Per User (optional, number of times a single user can use)
- Applicable Categories (optional, can be all or specific categories)
- Applicable Products (optional, for vendor coupons)

**FR-6.4**: The system shall validate coupon code uniqueness.

**FR-6.5**: The system shall allow activation/deactivation of coupons.

#### 3.6.2 Coupon Application
**FR-6.6**: The system shall allow users to apply coupon codes during checkout.

**FR-6.7**: The system shall validate coupon:
- Is active
- Is within valid date range
- Meets minimum purchase amount requirement
- Has not exceeded usage limits
- Is applicable to cart items
- User has not exceeded per-user usage limit

**FR-6.8**: The system shall display discount amount in cart summary.

**FR-6.9**: The system shall allow users to remove applied coupon.

**FR-6.10**: The system shall track coupon usage statistics.

#### 3.6.3 Coupon Management
**FR-6.11**: The system shall provide coupon listing with:
- Coupon Code
- Discount Details
- Validity Period
- Usage Statistics
- Status

**FR-6.12**: The system shall allow editing of active coupons (with restrictions to prevent abuse).

**FR-6.13**: The system shall send notifications when coupons are about to expire (optional feature).

### 3.7 Simple Test Payment Gateway

#### 3.7.1 Payment Integration
**FR-7.1**: The system shall integrate with a test payment gateway (e.g., Stripe Test Mode, PayPal Sandbox, or custom test gateway).

**FR-7.2**: The system shall support test mode only (no real transactions).

**FR-7.3**: The system shall handle payment processing during checkout:
- Collect payment method information
- Process payment through gateway
- Handle payment success response
- Handle payment failure response

**FR-7.4**: The system shall support multiple test payment methods:
- Credit/Debit Card (test cards)
- Digital Wallet (if supported by gateway)

**FR-7.5**: The system shall store payment transaction details:
- Transaction ID
- Payment Method
- Amount
- Status (Success, Failed, Pending)
- Gateway Response
- Transaction Date

**FR-7.6**: The system shall not store sensitive payment information (card numbers, CVV) - only transaction references.

**FR-7.7**: The system shall provide payment status updates to users.

**FR-7.8**: The system shall handle payment gateway errors gracefully and display user-friendly error messages.

**FR-7.9**: The system shall allow Super Admin to view all payment transactions.

**FR-7.10**: The system shall support payment refunds (test mode) initiated by Super Admin or Vendor.

### 3.8 Cart Management & Checkout

#### 3.8.1 Shopping Cart
**FR-8.1**: The system shall allow users to add products to shopping cart.

**FR-8.2**: The system shall maintain cart items for:
- Logged-in users (persisted in database)
- Guest users (stored in session/cookies)

**FR-8.3**: The system shall display cart contents:
- Product Name and Image
- Quantity
- Unit Price
- Subtotal
- Total Amount

**FR-8.4**: The system shall allow users to:
- Update product quantity (with stock validation)
- Remove items from cart
- Clear entire cart
- Apply coupon code

**FR-8.5**: The system shall validate stock availability when adding/updating cart items.

**FR-8.6**: The system shall prevent adding out-of-stock products to cart.

**FR-8.7**: The system shall calculate and display:
- Subtotal
- Discount (if coupon applied)
- Shipping Charges (if applicable)
- Tax (if applicable)
- Grand Total

**FR-8.8**: The system shall persist cart for logged-in users across sessions.

**FR-8.9**: The system shall merge guest cart with user cart upon login.

#### 3.8.2 Checkout Process
**FR-8.10**: The system shall provide a checkout page accessible from cart.

**FR-8.11**: The checkout process shall include:
- Step 1: Shipping Address Selection/Entry
- Step 2: Payment Method Selection
- Step 3: Order Review
- Step 4: Payment Processing
- Step 5: Order Confirmation

**FR-8.12**: The system shall require users to be logged in to complete checkout.

**FR-8.13**: The system shall validate:
- Shipping address is complete
- Payment method is selected
- Cart is not empty
- All items are in stock
- Coupon is still valid (if applied)

**FR-8.14**: The system shall create order after successful payment.

**FR-8.15**: The system shall send order confirmation email to user.

**FR-8.16**: The system shall update inventory after order creation.

**FR-8.17**: The system shall handle checkout abandonment (save progress for logged-in users).

### 3.9 Address Management

#### 3.9.1 Address Storage
**FR-9.1**: The system shall allow users to save multiple shipping addresses.

**FR-9.2**: Each address shall include:
- Full Name (required)
- Phone Number (required)
- Address Line 1 (required)
- Address Line 2 (optional)
- City (required)
- State/Province (required)
- Postal/ZIP Code (required)
- Country (required)
- Address Type (Home, Work, Other) (optional)
- Is Default flag

**FR-9.3**: The system shall allow users to set one default shipping address.

**FR-9.4**: The system shall validate address format based on country (basic validation).

#### 3.9.2 Address Management
**FR-9.5**: The system shall provide users with address management page:
- List all saved addresses
- Add new address
- Edit existing address
- Delete address
- Set default address

**FR-9.6**: The system shall prevent deletion of default address if it's the only address.

**FR-9.7**: The system shall allow users to select address during checkout from saved addresses or enter new address.

**FR-9.8**: The system shall auto-fill checkout form with default address.

**FR-9.9**: The system shall allow users to save address entered during checkout for future use.

### 3.10 Review & Feedback

#### 3.10.1 Product Reviews
**FR-10.1**: The system shall allow users to write reviews for products they have purchased.

**FR-10.2**: Each review shall include:
- Rating (1-5 stars, required)
- Review Title (optional)
- Review Text (required, minimum 10 characters)
- Product Images (optional, user-uploaded)
- Review Date

**FR-10.3**: The system shall allow users to edit their own reviews.

**FR-10.4**: The system shall allow users to delete their own reviews.

**FR-10.5**: The system shall display reviews on product detail page:
- Sorted by most recent or most helpful
- Average rating display
- Rating distribution (5 stars, 4 stars, etc.)
- Pagination for large number of reviews

**FR-10.6**: The system shall allow other users to mark reviews as "Helpful" or "Not Helpful".

**FR-10.7**: The system shall prevent users from reviewing the same product multiple times (one review per purchase).

**FR-10.8**: The system shall allow vendors to respond to reviews.

**FR-10.9**: The system shall allow Super Admin to moderate reviews (approve/reject/delete).

**FR-10.10**: The system shall calculate and display average product rating.

**FR-10.11**: The system shall filter out inappropriate content (basic profanity filter).

### 3.11 Vendor Reports

#### 3.11.1 Vendor Report (Vendor View)
**FR-11.1**: The system shall provide vendors with sales reports dashboard.

**FR-11.2**: Reports shall include:
- Total Sales (Revenue)
- Number of Orders
- Number of Products Sold
- Top Selling Products
- Sales by Date Range (Daily, Weekly, Monthly, Custom)
- Sales by Category
- Order Status Distribution

**FR-11.3**: The system shall allow vendors to:
- Filter reports by date range
- Export reports to CSV/PDF
- View detailed order list
- View product performance metrics

**FR-11.4**: The system shall display charts/graphs for visual representation:
- Sales trend chart
- Category-wise sales pie chart
- Top products bar chart

**FR-11.5**: The system shall show comparison metrics (e.g., this month vs last month).

#### 3.11.2 Vendor Report (Super Admin View)
**FR-11.6**: The system shall provide Super Admin with vendor performance reports.

**FR-11.7**: Super Admin reports shall include:
- All vendor sales data
- Vendor comparison metrics
- Platform-wide sales statistics
- Top performing vendors
- Vendor activity metrics
- Commission/Earnings (if applicable)

**FR-11.8**: The system shall allow Super Admin to:
- Filter by vendor
- Filter by date range
- Export reports
- View individual vendor details

**FR-11.9**: The system shall provide system health metrics:
- Total users
- Total vendors
- Total products
- Total orders
- Revenue trends

### 3.12 Wishlist Management

#### 3.12.1 Wishlist Functionality
**FR-12.1**: The system shall allow users to add products to wishlist.

**FR-12.2**: The system shall require user login to use wishlist feature.

**FR-12.3**: The system shall display wishlist page showing:
- Product Name and Image
- Price
- Stock Status
- Add to Cart button
- Remove from Wishlist option

**FR-12.4**: The system shall allow users to:
- Add product to wishlist from product listing or detail page
- Remove product from wishlist
- Move wishlist item to cart
- Clear entire wishlist

**FR-12.5**: The system shall display wishlist count indicator in navigation.

**FR-12.6**: The system shall notify users when wishlist items go on sale or come back in stock (optional feature).

**FR-12.7**: The system shall allow users to create multiple wishlists with custom names (optional feature for future).

### 3.13 Order Management

#### 3.13.1 Order Creation
**FR-13.1**: The system shall create order after successful payment during checkout.

**FR-13.2**: Each order shall contain:
- Order Number (unique, auto-generated)
- User Information
- Shipping Address
- Order Items (Product, Quantity, Price)
- Subtotal
- Discount Amount
- Shipping Charges
- Tax
- Total Amount
- Payment Information
- Order Status
- Order Date
- Estimated Delivery Date

**FR-13.3**: The system shall assign unique order number (format: ORD-YYYYMMDD-XXXXX).

**FR-13.4**: The system shall send order confirmation email to user.

**FR-13.5**: The system shall notify vendor(s) when order is placed.

#### 3.13.2 Order Status Management
**FR-13.6**: Order statuses shall include:
- Pending (initial status)
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled
- Refunded

**FR-13.7**: The system shall allow vendors to update order status (with restrictions):
- Can update: Confirmed, Processing, Shipped
- Cannot update: Delivered, Cancelled, Refunded (requires admin approval)

**FR-13.8**: The system shall allow users to cancel orders (within 24 hours of placement, before shipping).

**FR-13.9**: The system shall allow Super Admin to update any order status.

**FR-13.10**: The system shall send status update notifications to users.

#### 3.13.3 Order Viewing
**FR-13.11**: The system shall provide users with order history page:
- List all orders
- Filter by status
- Filter by date range
- View order details
- Track order status
- Download invoice (PDF)

**FR-13.12**: The system shall provide vendors with order management page:
- List all orders for their products
- Filter by status, date
- View order details
- Update order status
- Print shipping label (if applicable)

**FR-13.13**: The system shall provide Super Admin with all orders view:
- List all platform orders
- Filter by vendor, user, status, date
- View order details
- Manage order status
- Process refunds

**FR-13.14**: The system shall generate order invoice (PDF) with:
- Order details
- Product list
- Pricing breakdown
- Shipping address
- Payment information

### 3.14 Inventory Management (Low Stock Alerts)

#### 3.14.1 Stock Tracking
**FR-14.1**: The system shall track stock quantity for each product.

**FR-14.2**: The system shall automatically decrement stock when order is placed.

**FR-14.3**: The system shall automatically increment stock when order is cancelled/refunded.

**FR-14.4**: The system shall allow vendors to manually update stock quantities.

**FR-14.5**: The system shall prevent ordering when stock is 0.

#### 3.14.2 Low Stock Alerts
**FR-14.6**: The system shall allow vendors to set low stock threshold for each product (default: 10 units).

**FR-14.7**: The system shall send alert to vendor when product stock falls below threshold:
- Email notification
- In-app notification
- Dashboard alert indicator

**FR-14.8**: The system shall display low stock products list on vendor dashboard.

**FR-14.9**: The system shall allow vendors to:
- View all low stock products
- Bulk update stock quantities
- Set custom threshold per product
- Disable alerts for specific products

**FR-14.10**: The system shall provide low stock report:
- List of products below threshold
- Current stock level
- Days since last restock (if tracked)
- Suggested reorder quantity (optional)

**FR-14.11**: The system shall prevent out-of-stock products from being displayed as available (or show "Out of Stock" badge).

**FR-14.12**: The system shall allow vendors to set products as "Backorder" (allow orders even when out of stock).

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

**NFR-1.1**: The system shall support at least 100 concurrent users.

**NFR-1.2**: Page load time shall not exceed 3 seconds under normal load conditions.

**NFR-1.3**: API response time shall be less than 500ms for 95% of requests.

**NFR-1.4**: Database queries shall be optimized with proper indexing.

**NFR-1.5**: The system shall support pagination for large data sets (products, orders, users).

**NFR-1.6**: Image uploads shall be optimized and compressed.

**NFR-1.7**: The system shall implement caching for frequently accessed data (categories, product listings).

### 4.2 Security Requirements

**NFR-2.1**: The system shall use HTTPS for all communications.

**NFR-2.2**: Passwords shall be hashed using industry-standard algorithms (bcrypt, Argon2).

**NFR-2.3**: The system shall implement JWT tokens with expiration (access token: 1 hour, refresh token: 7 days).

**NFR-2.4**: The system shall implement CSRF protection.

**NFR-2.5**: The system shall implement SQL injection prevention through parameterized queries (EF Core).

**NFR-2.6**: The system shall implement XSS protection.

**NFR-2.7**: The system shall implement rate limiting for API endpoints.

**NFR-2.8**: Sensitive data (passwords, payment info) shall never be logged.

**NFR-2.9**: The system shall implement role-based access control (RBAC).

**NFR-2.10**: The system shall maintain audit logs for sensitive operations.

### 4.3 Usability Requirements

**NFR-3.1**: The system shall be intuitive and require minimal training for end users.

**NFR-3.2**: The system shall provide clear error messages and validation feedback.

**NFR-3.3**: The system shall be responsive and work on mobile, tablet, and desktop devices.

**NFR-3.4**: The system shall follow WCAG 2.1 Level AA accessibility guidelines.

**NFR-3.5**: The system shall provide help tooltips and documentation where needed.

**NFR-3.6**: Navigation shall be consistent across all pages.

**NFR-3.7**: Forms shall have clear labels and validation messages.

### 4.4 Reliability Requirements

**NFR-4.1**: The system shall have 99.5% uptime availability.

**NFR-4.2**: The system shall handle errors gracefully without crashing.

**NFR-4.3**: The system shall implement transaction rollback for failed operations.

**NFR-4.4**: The system shall have automated backup procedures for database.

**NFR-4.5**: The system shall implement retry mechanisms for external service calls (payment gateway).

**NFR-4.6**: The system shall log all errors for debugging and monitoring.

### 4.5 Scalability Requirements

**NFR-5.1**: The system architecture shall support horizontal scaling.

**NFR-5.2**: Database design shall support future growth (millions of products, users, orders).

**NFR-5.3**: The system shall use asynchronous processing for heavy operations (email sending, report generation).

**NFR-5.4**: File storage shall be scalable (consider cloud storage for product images).

**NFR-5.5**: The system shall support load balancing.

### 4.6 Compatibility Requirements

**NFR-6.1**: The system shall be compatible with .NET 8 runtime.

**NFR-6.2**: The system shall support SQL Server 2019 and later versions.

**NFR-6.3**: The system shall work with modern browsers (Chrome, Firefox, Edge, Safari - latest 2 versions).

**NFR-6.4**: The system shall be responsive and work on devices with screen sizes from 320px to 4K.

### 4.7 Maintainability Requirements

**NFR-7.1**: Code shall follow .NET coding standards and best practices.

**NFR-7.2**: The system shall have comprehensive code documentation.

**NFR-7.3**: The system shall use dependency injection for loose coupling.

**NFR-7.4**: The system shall implement separation of concerns (Repository pattern, Service layer).

**NFR-7.5**: Database migrations shall be version controlled.

---

## 5. System Architecture

### 5.1 Technology Stack

#### 5.1.1 Backend
- **Framework**: .NET 8
- **ORM**: Entity Framework Core 8.0
- **Database**: SQL Server 2019 or later
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful Web API
- **Logging**: Serilog or NLog
- **Validation**: FluentValidation or Data Annotations

#### 5.1.2 Frontend
- **Styling Framework**: Tailwind CSS
- **JavaScript Framework**: (To be determined - could be React, Vue, Angular, or vanilla JS)
- **Build Tool**: (Based on frontend framework choice)

#### 5.1.3 Infrastructure
- **Web Server**: IIS (Windows) or Nginx/Kestrel (Linux)
- **Version Control**: Git
- **CI/CD**: (To be determined)

### 5.2 Database Design Overview

#### 5.2.1 Core Entities
- **Users**: User accounts (Admin, Vendor, Customer)
- **Categories**: Product categories (hierarchical)
- **Products**: Product information
- **Orders**: Order headers
- **OrderItems**: Order line items
- **CartItems**: Shopping cart items
- **Addresses**: User shipping addresses
- **Reviews**: Product reviews and ratings
- **Coupons**: Discount coupons
- **WishlistItems**: User wishlist
- **Payments**: Payment transactions
- **Inventory**: Stock tracking (can be part of Products table)

#### 5.2.2 Key Relationships
- User (1) → (Many) Orders
- User (1) → (Many) Addresses
- User (1) → (Many) Reviews
- User (1) → (Many) CartItems
- User (1) → (Many) WishlistItems
- Vendor (1) → (Many) Products
- Category (1) → (Many) Products
- Product (1) → (Many) OrderItems
- Product (1) → (Many) Reviews
- Order (1) → (Many) OrderItems
- Order (1) → (1) Payment
- Coupon (1) → (Many) Orders

### 5.3 API Structure

#### 5.3.1 API Design Principles
- RESTful architecture
- Resource-based URLs
- HTTP methods: GET, POST, PUT, DELETE, PATCH
- JSON request/response format
- Standard HTTP status codes
- API versioning (e.g., /api/v1/)

#### 5.3.2 API Endpoint Categories
- **Authentication**: /api/auth/register, /api/auth/login, /api/auth/refresh
- **Users**: /api/users, /api/users/{id}
- **Categories**: /api/categories, /api/categories/{id}
- **Products**: /api/products, /api/products/{id}
- **Cart**: /api/cart, /api/cart/items/{id}
- **Orders**: /api/orders, /api/orders/{id}
- **Addresses**: /api/addresses, /api/addresses/{id}
- **Reviews**: /api/reviews, /api/reviews/{id}
- **Coupons**: /api/coupons, /api/coupons/apply
- **Wishlist**: /api/wishlist, /api/wishlist/{id}
- **Payments**: /api/payments, /api/payments/{id}
- **Reports**: /api/reports/sales, /api/reports/inventory

### 5.4 Frontend Architecture

#### 5.4.1 Component Structure
- **Layout Components**: Header, Footer, Sidebar, Navigation
- **Page Components**: Home, Product Listing, Product Detail, Cart, Checkout, Dashboard
- **Shared Components**: Button, Input, Modal, Card, Alert
- **Feature Components**: ProductCard, OrderCard, ReviewCard

#### 5.4.2 State Management
- Global state management (if using framework like React/Vue)
- API state management
- Form state management
- Cart state (persisted)

#### 5.4.3 Routing
- Client-side routing
- Protected routes (require authentication)
- Role-based route access

### 5.5 System Layers

```
┌─────────────────────────────────────┐
│      Presentation Layer            │
│    (Frontend - Tailwind CSS)       │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         API Layer                   │
│    (RESTful Web API - .NET 8)      │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      Business Logic Layer           │
│         (Services)                  │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      Data Access Layer              │
│    (Repository - EF Core)           │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Database Layer              │
│        (SQL Server)                 │
└─────────────────────────────────────┘
```

---

## 6. User Interface Requirements

### 6.1 Design Guidelines

#### 6.1.1 Tailwind CSS Usage
- Use Tailwind CSS utility classes for all styling
- Follow Tailwind's design system and spacing scale
- Use Tailwind's color palette or custom theme
- Implement responsive design using Tailwind breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

#### 6.1.2 Design Principles
- **Consistency**: Use consistent spacing, typography, and color scheme
- **Clarity**: Clear visual hierarchy and readable typography
- **Accessibility**: Sufficient color contrast, keyboard navigation support
- **Responsiveness**: Mobile-first approach
- **Performance**: Optimize images and minimize CSS/JS bundle size

### 6.2 Responsive Design Requirements

**UI-1**: The system shall be fully responsive and work on:
- Mobile devices (320px - 767px)
- Tablets (768px - 1023px)
- Desktops (1024px and above)
- Large screens (1920px and above)

**UI-2**: Navigation shall adapt to screen size:
- Desktop: Horizontal navigation bar
- Mobile: Hamburger menu with slide-out drawer

**UI-3**: Product listings shall use responsive grid:
- Desktop: 4-5 columns
- Tablet: 2-3 columns
- Mobile: 1-2 columns

**UI-4**: Forms shall stack vertically on mobile devices.

**UI-5**: Tables shall be scrollable horizontally on mobile or converted to card layout.

### 6.3 Key UI Components

#### 6.3.1 Common Components
- **Header**: Logo, Navigation, Search, Cart Icon, User Menu
- **Footer**: Links, Contact Info, Social Media
- **Buttons**: Primary, Secondary, Danger, Disabled states
- **Forms**: Input fields, Select dropdowns, Checkboxes, Radio buttons
- **Cards**: Product cards, Order cards, Dashboard cards
- **Modals**: Confirmation dialogs, Product quick view
- **Alerts**: Success, Error, Warning, Info messages
- **Loading States**: Spinners, Skeleton loaders

#### 6.3.2 Page-Specific Requirements

**Home Page**:
- Hero section
- Featured categories
- Featured products
- Promotional banners

**Product Listing Page**:
- Filters sidebar (desktop) / Drawer (mobile)
- Sort options
- Product grid
- Pagination

**Product Detail Page**:
- Product image gallery
- Product information
- Add to cart button
- Reviews section
- Related products

**Cart Page**:
- Cart items list
- Quantity controls
- Coupon code input
- Price summary
- Checkout button

**Checkout Page**:
- Multi-step form
- Progress indicator
- Address selection
- Payment method selection
- Order summary

**Dashboard Pages** (Admin/Vendor/User):
- Statistics cards
- Charts/graphs
- Data tables
- Action buttons

### 6.4 Accessibility Requirements

**UI-6**: All images shall have alt text.

**UI-7**: Forms shall have proper labels and ARIA attributes.

**UI-8**: Color contrast shall meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**UI-9**: The system shall be keyboard navigable.

**UI-10**: Focus indicators shall be visible.

**UI-11**: Error messages shall be associated with form fields.

---

## 7. Data Models

### 7.1 Entity Relationship Overview

```
Users
  ├── Roles (Admin, Vendor, User)
  ├── One-to-Many: Orders
  ├── One-to-Many: Addresses
  ├── One-to-Many: Reviews
  ├── One-to-Many: CartItems
  └── One-to-Many: WishlistItems

Categories
  ├── Self-referencing (Parent-Child)
  └── One-to-Many: Products

Products
  ├── Many-to-One: Vendor (User)
  ├── Many-to-One: Category
  ├── One-to-Many: OrderItems
  ├── One-to-Many: Reviews
  ├── One-to-Many: CartItems
  └── One-to-Many: WishlistItems

Orders
  ├── Many-to-One: User
  ├── Many-to-One: Address
  ├── Many-to-One: Coupon (optional)
  ├── One-to-Many: OrderItems
  └── One-to-One: Payment

Coupons
  ├── Many-to-One: Vendor (optional, for vendor-specific)
  └── One-to-Many: Orders

Payments
  └── One-to-One: Order
```

### 7.2 Key Entities and Relationships

#### 7.2.1 User Entity
- **Primary Key**: UserId (int, Identity)
- **Fields**: 
  - Email (string, unique, required)
  - PasswordHash (string, required)
  - FirstName (string, required)
  - LastName (string, required)
  - PhoneNumber (string, optional)
  - Role (enum: Admin, Vendor, User)
  - IsActive (bool)
  - EmailVerified (bool)
  - CreatedDate (datetime)
  - LastLoginDate (datetime, nullable)
- **Vendor-Specific Fields** (if Role = Vendor):
  - BusinessName (string)
  - BusinessAddress (string)
  - TaxId (string, nullable)
  - IsApproved (bool)
  - ApprovedDate (datetime, nullable)

#### 7.2.2 Category Entity
- **Primary Key**: CategoryId (int, Identity)
- **Fields**:
  - Name (string, required, unique)
  - Description (string, nullable)
  - ImageUrl (string, nullable)
  - ParentCategoryId (int, nullable, FK to Category)
  - DisplayOrder (int)
  - IsActive (bool)
  - CreatedDate (datetime)

#### 7.2.3 Product Entity
- **Primary Key**: ProductId (int, Identity)
- **Fields**:
  - Name (string, required)
  - Description (string, required)
  - SKU (string, required, unique per vendor)
  - Price (decimal, required)
  - DiscountPrice (decimal, nullable)
  - DiscountStartDate (datetime, nullable)
  - DiscountEndDate (datetime, nullable)
  - StockQuantity (int, required)
  - LowStockThreshold (int, default: 10)
  - CategoryId (int, FK to Category)
  - VendorId (int, FK to User)
  - Weight (decimal, nullable)
  - Dimensions (string, nullable)
  - IsActive (bool)
  - CreatedDate (datetime)
  - ModifiedDate (datetime)

#### 7.2.4 Order Entity
- **Primary Key**: OrderId (int, Identity)
- **Fields**:
  - OrderNumber (string, unique, required)
  - UserId (int, FK to User)
  - ShippingAddressId (int, FK to Address)
  - CouponId (int, nullable, FK to Coupon)
  - Subtotal (decimal, required)
  - DiscountAmount (decimal, default: 0)
  - ShippingCharges (decimal, default: 0)
  - Tax (decimal, default: 0)
  - TotalAmount (decimal, required)
  - OrderStatus (enum: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded)
  - OrderDate (datetime, required)
  - EstimatedDeliveryDate (datetime, nullable)
  - DeliveredDate (datetime, nullable)

#### 7.2.5 OrderItem Entity
- **Primary Key**: OrderItemId (int, Identity)
- **Fields**:
  - OrderId (int, FK to Order)
  - ProductId (int, FK to Product)
  - Quantity (int, required)
  - UnitPrice (decimal, required)
  - TotalPrice (decimal, required)

#### 7.2.6 Address Entity
- **Primary Key**: AddressId (int, Identity)
- **Fields**:
  - UserId (int, FK to User)
  - FullName (string, required)
  - PhoneNumber (string, required)
  - AddressLine1 (string, required)
  - AddressLine2 (string, nullable)
  - City (string, required)
  - State (string, required)
  - PostalCode (string, required)
  - Country (string, required)
  - AddressType (string, nullable)
  - IsDefault (bool, default: false)

#### 7.2.7 Review Entity
- **Primary Key**: ReviewId (int, Identity)
- **Fields**:
  - ProductId (int, FK to Product)
  - UserId (int, FK to User)
  - OrderId (int, FK to Order, nullable, for verification)
  - Rating (int, required, 1-5)
  - Title (string, nullable)
  - ReviewText (string, required)
  - IsApproved (bool, default: true)
  - HelpfulCount (int, default: 0)
  - CreatedDate (datetime)
  - ModifiedDate (datetime, nullable)

#### 