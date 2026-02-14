# E-Commerce Frontend

React 19 + TypeScript + Vite single-page application for the E-Commerce platform. Role-based dashboards for Customer, Seller, and Admin with responsive UI.

## Tech Stack

- **React 19** – UI library
- **TypeScript** – Type safety
- **Vite** – Build tool and dev server
- **React Router 7** – Client-side routing
- **Axios** – HTTP client for API
- **Recharts** – Charts (reports)
- **jsPDF** – PDF generation (order bill, admin report)
- **CSS Modules** – Scoped styling

## Project Structure

```
frontend/src/
├── assets/           # Images, static assets
├── components/       # Reusable UI
│   ├── common/       # ScrollToTop, ReportSection, OrderDetailModal, etc.
│   ├── layout/       # Navbar, Footer, AdminLayout, SellerLayout
│   └── product/      # ProductCard, ProductQuickViewModal
├── pages/            # Route-level pages
│   ├── Home/
│   ├── user/Dashboard/   # Customer dashboard
│   ├── admin/            # Admin dashboard, Users, Orders, etc.
│   ├── seller/           # Seller dashboard, Inventory, Orders
│   ├── Orders/           # OrderHistory, OrderTracking
│   ├── Account/, Cart, Checkout, Products, etc.
├── routes/           # AppRoutes, route guards (Guest, Customer, Admin, Seller)
├── services/api/     # API clients (auth, cart, order, product, report, etc.)
├── types/            # TypeScript types
├── utils/            # Helpers, orderBillPdf, adminReportPdf
└── App.tsx, main.tsx
```

## Features

### Public / Guest
- **Home** – Hero, categories, featured products, CTA
- **Products** – Browse, search, category filter, product cards
- **About Us** – Company info
- **Contact Us** – Contact form/section
- **Login / Register** – Auth forms
- **Forgot / Reset Password** – OTP flow

### Customer (User)
- **Customer Dashboard** – Categories, products, quick view
- **Cart** – Add/update/remove items, proceed to checkout
- **Checkout** – Address, coupon, place order
- **Orders** – Order history with status filter (All, Pending, Confirmed, Shipped, Delivered, Cancelled), view order, track order
- **Order Tracking** – Timeline, items, address, download bill (PDF)
- **Account** – Profile, security, addresses, link to orders
- **Navbar** – Products, Cart, Orders, Account, Contact, About (no Home/Dashboard for customer)

### Seller
- **Seller Dashboard** – Stats cards (Total Products, Total Orders, Total Revenue, Inventory), report section (Period, Download CSV), Product/Inventory/Order Management cards, Sales Reports card
- **Products** – Manage own products (same as admin product management)
- **Inventory** – Stock levels, update quantities, low-stock alerts
- **Orders** – List orders (items column: one product line + "...." if multiple), View, Update status (with tracking)
- **Account** – Seller profile/settings
- **Reports** – Period: 7d, 30d, 90d, 6 months, 1 year; Download Report (CSV)

### Admin
- **Admin Dashboard** – Stats, reports section
- **Users** – Paged list, search, role filter, Edit (including email), Activate/Deactivate, Delete; Pending Sellers: Approve/Reject
- **Categories** – CRUD, paged list
- **Products** – Full product management, paged list
- **Orders** – Order management, View, Update status; items column: one product line + "...." if multiple
- **Coupons** – CRUD, paged list
- **Account** – Admin profile
- **Reports** – Period 7d/30d/90d/6 months/1 year; **Download PDF**, **Download Excel (CSV)**

### UX
- **Scroll to top** – On every route change (ScrollToTop component)
- **Route guards** – GuestRoute, CustomerRoute, AdminRoute, SellerRoute
- **Toast notifications** – Success/error feedback
- **Responsive layout** – Mobile-friendly nav and pages

## Environment

Create `.env` (or `.env.local`) with:

```env
VITE_API_BASE_URL=http://localhost:5000
```

(Replace port with your backend API port.)

## Scripts

```bash
# Install dependencies
npm install

# Development server (default port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## API Integration

All API calls go through `services/api/apiClient.ts` with base URL from `VITE_API_BASE_URL`. JWT is sent in `Authorization: Bearer <token>` for protected routes. Response shape: `{ success, data, message, errors }`.

## Key Routes

| Path | Role | Description |
|------|------|-------------|
| `/` | Guest | Home |
| `/products` | Public | Product listing |
| `/cart` | Public | Shopping cart |
| `/account` | Customer | Account (profile, addresses, orders link) |
| `/user/dashboard` | Customer | Customer dashboard |
| `/account/orders` | Customer | Order history |
| `/orders/:id` | Customer | Order tracking & bill |
| `/checkout` | Customer | Checkout |
| `/admin/*` | Admin | Admin dashboard, users, categories, products, orders, coupons, account, reports |
| `/seller/*` | Seller | Seller dashboard, products, inventory, orders, account, reports |
