# 🏭 Nessa Enterprise — Product Sales & Inventory Management System

A full-stack enterprise dashboard and e-commerce platform for **Nessa Enterprise** (pumping solutions for agriculture & industry). Built with a modern, responsive UI featuring real-time updates, role-based access control, and an Excel-powered database.

---

## ✨ Features

### 🔐 Authentication & Roles
- **Login / Registration** with session-based auth (localStorage JWT-style tokens with 24h expiry)
- **Role-based access control** — Admin, Manager, Staff → Admin Dashboard; Customer → Store
- Password visibility toggle, demo credentials pre-filled for quick access

### 📊 Admin Dashboard
- **KPI Cards** — Total Revenue, Orders, Products, Low Stock Alerts, Monthly Growth
- **Interactive Charts** (Chart.js) — Sales Revenue Trend, Stock Distribution, Orders Per Month, Top Selling Products
- **Recent Orders Table** with status badges
- **Low Stock Alerts** panel

### 📦 Product Management
- Add, edit, and delete products with full CRUD operations
- Product catalog with categories, pricing, stock levels, images, and descriptions
- 25 pre-seeded CRI Pump products across multiple categories

### 📋 Inventory Management
- Track stock levels across all products
- Low stock alerts and monitoring
- Bulk import/update via Excel

### 🛒 Orders Management
- View and manage all customer orders
- Update order status (Pending → Shipped → Delivered)
- Real-time order notifications via Socket.IO

### 👥 Customer Management
- View registered customers
- Customer order history and tracking

### 📈 Sales Analytics & Reports
- Detailed sales analytics with visual charts
- Monthly sales reports with revenue and order breakdowns
- Exportable data and insights

### 🛍️ Customer Store (E-Commerce)
- Beautiful product catalog with category filtering and search
- Product detail modals with stock status
- Shopping cart with quantity controls (offcanvas sidebar)
- **Buy Now** quick checkout flow
- Multiple payment methods — COD, UPI, Debit/Credit Card
- Order success overlay with confetti animation and delivery tracking
- **My Orders** page for customers to track their orders

### ⚙️ Settings
- System configuration and preferences

### 🎨 UI/UX
- **Dark / Light theme** toggle with persistence
- Fully responsive design (mobile-friendly sidebar, topbar)
- Modern glassmorphism-inspired design with smooth animations
- Bootstrap 5 + Bootstrap Icons
- Real-time toast notifications for new orders

---

## 🛠️ Tech Stack

| Layer       | Technology                                                                 |
|-------------|---------------------------------------------------------------------------|
| **Backend** | [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)      |
| **Frontend**| HTML5, CSS3, Vanilla JavaScript                                           |
| **UI Framework** | [Bootstrap 5.3](https://getbootstrap.com/)                           |
| **Charts**  | [Chart.js](https://www.chartjs.org/)                                      |
| **Database**| Excel (`.xlsx`) via [SheetJS](https://sheetjs.com/)                       |
| **Real-time**| [Socket.IO](https://socket.io/)                                          |
| **File Upload** | [Multer](https://github.com/expressjs/multer)                        |
| **Icons**   | [Bootstrap Icons](https://icons.getbootstrap.com/)                        |
| **Confetti**| [canvas-confetti](https://github.com/catdad/canvas-confetti)              |

---

## 📁 Project Structure

```
Nessa-Enterprise-main/
├── css/
│   └── style.css              # Global styles, themes, components
├── js/
│   ├── auth.js                # Authentication & session management
│   ├── dashboard.js           # Dashboard KPIs, charts, and data rendering
│   ├── analytics.js           # Sales analytics logic
│   ├── orders.js              # Orders management logic
│   ├── products.js            # Products CRUD logic
│   └── excelService.js        # Excel database service (read/write via API)
├── data/
│   └── nessa_database.xlsx    # Excel-based database (Users, Products, Orders, SalesReports)
├── images/
│   └── products/              # Product images directory
├── server.js                  # Express backend with REST API + Socket.IO
├── generate_excel.js          # Script to seed the database with sample data
├── index.html                 # Entry point (redirects by role)
├── login.html                 # Login page
├── register.html              # Registration page
├── dashboard.html             # Admin dashboard
├── products.html              # Product management (Admin)
├── inventory.html             # Inventory management (Admin)
├── orders.html                # Orders management (Admin)
├── customers.html             # Customer management (Admin)
├── analytics.html             # Sales analytics (Admin)
├── reports.html               # Reports (Admin)
├── settings.html              # System settings (Admin)
├── store.html                 # Customer-facing e-commerce store
├── my-orders.html             # Customer order tracking
├── package.json               # Node.js dependencies
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Nessa-Enterprise.git
   cd Nessa-Enterprise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate the sample database**
   ```bash
   node generate_excel.js
   ```
   This creates `data/nessa_database.xlsx` with pre-seeded users, products, orders, and sales reports.

4. **Start the server**
   ```bash
   node server.js
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔑 Demo Credentials

| Role       | Email                 | Password       |
|------------|-----------------------|----------------|
| **Admin**  | admin@nessa.com       | admin123        |
| **Manager**| sarah@nessa.com       | sarah123        |
| **Staff**  | james@nessa.com       | james123        |
| **Customer** | customer@nessa.com  | customer123     |

> **Admin / Manager / Staff** → Redirected to the **Admin Dashboard**  
> **Customer** → Redirected to the **Store**

---

## 📡 API Endpoints

| Method   | Endpoint                    | Description                    |
|----------|-----------------------------|--------------------------------|
| `GET`    | `/api/data`                 | Get all data (users, products, orders, reports) |
| `POST`   | `/api/register`             | Register a new user            |
| `POST`   | `/api/products`             | Add a new product              |
| `PUT`    | `/api/products/:id`         | Update a product               |
| `DELETE` | `/api/products/:id`         | Delete a product               |
| `POST`   | `/api/orders`               | Place a new order              |
| `PUT`    | `/api/orders/:id/status`    | Update order status            |
| `POST`   | `/api/import`               | Bulk import/update database    |

### Real-time Events (Socket.IO)

| Event                  | Description                                  |
|------------------------|----------------------------------------------|
| `new_order`            | Broadcast when a customer places an order     |
| `order_status_updated` | Broadcast when admin updates an order status  |
| `data_synced`          | Broadcast when database is updated via import |

---

## 📸 Pages Overview

| Page               | Description                                                    |
|--------------------|----------------------------------------------------------------|
| **Login**          | Sleek sign-in page with demo credentials                       |
| **Register**       | New user registration form                                     |
| **Dashboard**      | KPI cards, revenue/order/stock charts, recent orders, alerts   |
| **Products**       | Full CRUD for product catalog                                  |
| **Inventory**      | Stock monitoring and management                                |
| **Orders**         | Order list with status management                              |
| **Customers**      | Registered users overview                                      |
| **Analytics**      | Sales analytics with visual breakdowns                         |
| **Reports**        | Detailed business reports                                      |
| **Settings**       | System configuration                                           |
| **Store**          | Customer e-commerce with cart, search, categories, checkout     |
| **My Orders**      | Customer order tracking with status updates                    |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ by <strong>Nessa Enterprise</strong>
</p>
