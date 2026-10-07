import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { products, orders, users, salesReports, loading, apiError } = useData();
  const navigate = useNavigate();

  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [fetchingAnalytics, setFetchingAnalytics] = useState(false);

  // Fetch real aggregated monthly revenue analytics from backend if available
  useEffect(() => {
    async function fetchRevenueAnalytics() {
      setFetchingAnalytics(true);
      try {
        const res = await fetch('/api/v1/orders/analytics/revenue');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.monthlyRevenue) {
            setMonthlyRevenueData(json.monthlyRevenue);
          }
        }
      } catch (err) {
        console.warn('Analytics API endpoint fallback to local order calculation.');
      } finally {
        setFetchingAnalytics(false);
      }
    }
    fetchRevenueAnalytics();
  }, [orders]);

  // 1. KPI Calculations (Real DB Values)
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const lowStockProducts = products.filter(p => parseInt(p.stock || 0) < 10);
  const lowStockCount = lowStockProducts.length;

  // Inventory Overview Metrics
  const inStockCount = products.filter(p => parseInt(p.stock || 0) >= 10).length;
  const outOfStockCount = products.filter(p => parseInt(p.stock || 0) === 0).length;

  // 2. Order Status Breakdown
  const statusCounts = {
    Pending: orders.filter(o => (o.status || 'Pending') === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Processing: orders.filter(o => o.status === 'Processing').length,
    'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Shipped').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length
  };

  // 3. Customer Metrics (Strict DB Calculation)
  const customerUsers = users.filter(u => (u.role || '').toLowerCase() === 'customer');
  const uniqueOrderEmails = new Set(orders.map(o => o.customerEmail || o.userId).filter(Boolean));
  const totalCustomersCount = Math.max(customerUsers.length, uniqueOrderEmails.size);
  const activeCustomersCount = uniqueOrderEmails.size;
  const newCustomersCount = customerUsers.slice(-5).length; // Recent additions

  // 4. Revenue Performance Monthly Trend Data
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate aggregated revenue for each month from orders if API data is pending
  const computedMonthlyRevenue = monthLabels.map((month, idx) => {
    if (monthlyRevenueData.length > 0) {
      const match = monthlyRevenueData.find(m => m.month.toLowerCase().startsWith(month.toLowerCase()));
      if (match) return match.revenue;
    }

    // Fallback calculation directly from DB orders dates
    let monthSum = 0;
    orders.forEach(o => {
      if (o.date) {
        const d = new Date(o.date);
        if (!isNaN(d.getTime()) && d.getMonth() === idx) {
          monthSum += parseFloat(o.total || 0);
        }
      }
    });

    // If orders don't have dates matching this year, fallback to salesReports sheet if provided
    if (monthSum === 0 && salesReports && salesReports.length > 0) {
      const rep = salesReports.find(r => r.month.toLowerCase().startsWith(month.toLowerCase()));
      if (rep) return rep.revenue;
    }

    return monthSum;
  });

  const hasSalesData = computedMonthlyRevenue.some(val => val > 0);

  const revenueChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: computedMonthlyRevenue,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#1565d8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  // 5. Category Distribution Chart Data
  const categoriesMap = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + parseInt(p.stock || 0);
  });

  const categoryLabels = Object.keys(categoriesMap);
  const categoryValues = Object.values(categoriesMap);
  const hasCategoryData = categoryLabels.length > 0 && categoryValues.some(v => v > 0);

  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          '#2563eb',
          '#0284c7',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Recent Orders (most recent 5)
  const recentOrders = [...orders].reverse().slice(0, 5);

  const getStatusBadgeClass = (statusStr) => {
    if (!statusStr) return 'pending';
    const lower = statusStr.toLowerCase();
    if (lower.includes('deliver')) return 'delivered';
    if (lower.includes('shipped') || lower.includes('out')) return 'out-for-delivery';
    if (lower.includes('process')) return 'processing';
    if (lower.includes('confirm')) return 'confirmed';
    if (lower.includes('cancel')) return 'cancelled';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
        <p className="mt-3 text-muted fw-medium">Loading real-time enterprise metrics from database...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Backend API Connection Error Alert */}
      {apiError && (
        <div className="alert alert-warning alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>
            <strong>System Notice:</strong> {apiError}
          </div>
        </div>
      )}

      {/* 1. Dashboard Header */}
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
            </ol>
          </nav>
          <h1 className="h3 mb-1 fw-bold text-navy">Executive Dashboard</h1>
          <p className="page-subtitle mb-0 text-secondary">Real-time overview of sales, orders, products, customers and inventory.</p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-semibold shadow-sm" onClick={() => navigate('/reports')}>
            <i className="bi bi-file-earmark-pdf me-1"></i> Export Report
          </button>
          <button className="btn btn-primary btn-sm rounded-pill px-3 py-2 fw-bold shadow-sm" onClick={() => navigate('/products')}>
            <i className="bi bi-plus-lg me-1"></i> Add Product
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Total Revenue */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card h-100">
            <div className="kpi-header">
              <div className="kpi-icon revenue-icon"><i className="bi bi-currency-rupee"></i></div>
              <span className="badge bg-primary-subtle text-primary border rounded-pill px-2 py-1 fs-8 fw-semibold">
                <i className="bi bi-activity me-1"></i>Live Data
              </span>
            </div>
            <div className="kpi-value text-navy">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="kpi-label fw-medium">Total Revenue</div>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card h-100">
            <div className="kpi-header">
              <div className="kpi-icon orders-icon"><i className="bi bi-cart-check-fill"></i></div>
              <span className="badge bg-info-subtle text-info border rounded-pill px-2 py-1 fs-8 fw-semibold">
                <i className="bi bi-bag-check me-1"></i>Orders
              </span>
            </div>
            <div className="kpi-value text-navy">{totalOrdersCount}</div>
            <div className="kpi-label fw-medium">Total Orders</div>
          </div>
        </div>

        {/* KPI 3: Total Products */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card h-100">
            <div className="kpi-header">
              <div className="kpi-icon products-icon"><i className="bi bi-box-seam-fill"></i></div>
              <span className="badge bg-success-subtle text-success border rounded-pill px-2 py-1 fs-8 fw-semibold">
                <i className="bi bi-check-circle me-1"></i>Catalog
              </span>
            </div>
            <div className="kpi-value text-navy">{totalProductsCount}</div>
            <div className="kpi-label fw-medium">Total Products</div>
          </div>
        </div>

        {/* KPI 4: Low Stock Products */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card h-100">
            <div className="kpi-header">
              <div className="kpi-icon alerts-icon"><i className="bi bi-exclamation-triangle-fill"></i></div>
              <span className={`badge ${lowStockCount > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} border rounded-pill px-2 py-1 fs-8 fw-semibold`}>
                {lowStockCount > 0 ? 'Threshold Alert' : 'Stock Optimal'}
              </span>
            </div>
            <div className="kpi-value text-navy">{lowStockCount}</div>
            <div className="kpi-label fw-medium">Low Stock Products</div>
          </div>
        </div>
      </div>

      {/* 3. Order Status Overview Summary Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-surface">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <h6 className="fw-bold mb-0 text-navy d-flex align-items-center gap-2">
            <i className="bi bi-bar-chart-steps text-primary"></i> Order Status Overview
          </h6>
          <span className="fs-8 text-muted fw-medium">Total {totalOrdersCount} Orders Managed</span>
        </div>

        <div className="row g-2 text-center">
          <div className="col-4 col-md-2">
            <div className="p-2 rounded-3 bg-light border">
              <div className="fs-8 text-muted text-uppercase fw-bold">Pending</div>
              <div className="fs-5 fw-extrabold text-warning">{statusCounts.Pending}</div>
            </div>
          </div>
          <div className="col-4 col-md-2">
            <div className="p-2 rounded-3 bg-light border">
              <div className="fs-8 text-muted text-uppercase fw-bold">Confirmed</div>
              <div className="fs-5 fw-extrabold text-primary">{statusCounts.Confirmed}</div>
            </div>
          </div>
          <div className="col-4 col-md-2">
            <div className="p-2 rounded-3 bg-light border">
              <div className="fs-8 text-muted text-uppercase fw-bold">Processing</div>
              <div className="fs-5 fw-extrabold text-info">{statusCounts.Processing}</div>
            </div>
          </div>
          <div className="col-4 col-md-2">
            <div className="p-2 rounded-3 bg-light border">
              <div className="fs-8 text-muted text-uppercase fw-bold">Out For Delivery</div>
              <div className="fs-5 fw-extrabold" style={{ color: '#8b5cf6' }}>{statusCounts['Out for Delivery']}</div>
            </div>
          </div>
          <div className="col-4 col-md-2">
            <div className="p-2 rounded-3 bg-light border">
              <div className="fs-8 text-muted text-uppercase fw-bold">Delivered</div>
              <div className="fs-5 fw-extrabold text-success">{statusCounts.Delivered}</div>
            </div>
          </div>
          <div className="col-4 col-md-2">
            <div className="p-2 rounded-3 bg-light border">
              <div className="fs-8 text-muted text-uppercase fw-bold">Cancelled</div>
              <div className="fs-5 fw-extrabold text-danger">{statusCounts.Cancelled}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Charts Row */}
      <div className="row g-4 mb-4">
        {/* Revenue Performance Trend */}
        <div className="col-12 col-lg-8">
          <div className="nessa-card h-100 p-3">
            <div className="chart-header d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="mb-0 fw-bold text-navy">Revenue Performance Trend</h6>
                <span className="fs-8 text-muted">Monthly sales revenue calculated from orders</span>
              </div>
              <span className="badge bg-primary-subtle text-primary border rounded-pill px-3 py-1 fw-semibold">
                Jan - Dec Analytics
              </span>
            </div>

            <div className="chart-body" style={{ minHeight: '280px', position: 'relative' }}>
              {hasSalesData ? (
                <div style={{ height: '280px' }}>
                  <Line
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => ` Revenue: ₹${context.raw.toLocaleString('en-IN')}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`
                          },
                          grid: { color: '#f1f5f9' }
                        },
                        x: {
                          grid: { display: false }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center py-5 text-muted">
                  <i className="bi bi-graph-up display-5 text-secondary opacity-50 mb-2"></i>
                  <h6 className="fw-semibold mb-1">No sales data available yet.</h6>
                  <p className="fs-7 text-secondary mb-0">Sales trends will automatically display here once customer orders are placed.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Share Analytics */}
        <div className="col-12 col-lg-4">
          <div className="nessa-card h-100 p-3 d-flex flex-column justify-content-between">
            <div className="chart-header d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="mb-0 fw-bold text-navy">Product Category Share</h6>
                <span className="fs-8 text-muted">Inventory distribution by category</span>
              </div>
            </div>

            <div className="chart-body d-flex align-items-center justify-content-center my-auto" style={{ minHeight: '240px' }}>
              {hasCategoryData ? (
                <div style={{ maxWidth: '240px', width: '100%' }}>
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-pie-chart display-5 text-secondary opacity-50 mb-2 d-block"></i>
                  <h6 className="fw-semibold mb-1">No category data available.</h6>
                  <p className="fs-7 text-secondary mb-0">Add products to populate category distribution.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Inventory Overview & Low Stock Alerts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="nessa-table-card h-100">
            <div className="table-toolbar p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0 fw-bold text-navy">Low Stock Inventory Alerts</h6>
                <span className="fs-8 text-muted">Products requiring stock replenishment</span>
              </div>
              <button className="btn btn-sm btn-link text-primary fw-semibold p-0 text-decoration-none" onClick={() => navigate('/inventory')}>
                Manage Inventory →
              </button>
            </div>

            <div className="table-responsive">
              {lowStockProducts.length > 0 ? (
                <table className="table nessa-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="fw-semibold text-navy">{product.name}</div>
                          <div className="text-muted fs-8">ID: #{product.id} • Price: ₹{product.price?.toLocaleString('en-IN')}</div>
                        </td>
                        <td><span className="badge bg-light text-dark border">{product.category}</span></td>
                        <td>
                          <span className={`fw-bold ${product.stock === 0 ? 'text-danger' : 'text-warning'}`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${product.stock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                            <span className="status-dot"></span>
                            {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-check-circle-fill text-success display-6 mb-2 d-block opacity-75"></i>
                  <h6 className="fw-semibold mb-1 text-dark">No low-stock products.</h6>
                  <p className="fs-7 text-muted mb-0">All catalog inventory levels are currently optimal!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Overview Section */}
        <div className="col-12 col-lg-5">
          <div className="nessa-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                  <h6 className="mb-0 fw-bold text-navy">Customer Overview</h6>
                  <span className="fs-8 text-muted">Customer base activity & metrics</span>
                </div>
                <button className="btn btn-sm btn-link text-primary fw-semibold p-0 text-decoration-none" onClick={() => navigate('/customers')}>
                  View Customers →
                </button>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-4">
                  <div className="p-3 rounded-3 bg-light text-center border">
                    <div className="fs-8 text-muted text-uppercase fw-bold mb-1">Total</div>
                    <div className="fs-4 fw-extrabold text-navy">{totalCustomersCount}</div>
                    <div className="fs-8 text-muted">Registered</div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-3 rounded-3 bg-light text-center border">
                    <div className="fs-8 text-muted text-uppercase fw-bold mb-1">Active</div>
                    <div className="fs-4 fw-extrabold text-primary">{activeCustomersCount}</div>
                    <div className="fs-8 text-muted">With Orders</div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-3 rounded-3 bg-light text-center border">
                    <div className="fs-8 text-muted text-uppercase fw-bold mb-1">New</div>
                    <div className="fs-4 fw-extrabold text-success">{newCustomersCount}</div>
                    <div className="fs-8 text-muted">Recent</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-3 bg-primary-subtle text-primary border border-primary-subtle d-flex align-items-center gap-3">
              <i className="bi bi-people-fill fs-2"></i>
              <div>
                <h6 className="fw-bold mb-0">Customer Engagement</h6>
                <p className="fs-8 mb-0">
                  {totalCustomersCount > 0
                    ? `${Math.round((activeCustomersCount / totalCustomersCount) * 100)}% of customers have active order activity in the system.`
                    : 'No customer registration data available yet.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Customer Orders Section */}
      <div className="nessa-table-card mb-4">
        <div className="table-toolbar p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold text-navy">Recent Customer Orders</h6>
            <span className="fs-8 text-muted">Latest sales order transactions</span>
          </div>
          <button className="btn btn-sm btn-link text-primary fw-semibold p-0 text-decoration-none" onClick={() => navigate('/orders')}>
            View All Orders →
          </button>
        </div>

        <div className="table-responsive">
          {recentOrders.length > 0 ? (
            <table className="table nessa-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="fw-bold text-navy">#{order.id}</td>
                    <td>
                      <div className="fw-semibold text-navy">{order.customerName || 'Customer'}</div>
                      <div className="text-muted fs-8">{order.customerEmail || 'No email registered'}</div>
                    </td>
                    <td className="text-muted fs-7">{order.date ? order.date.split('T')[0] : 'Recent'}</td>
                    <td className="fw-bold text-primary">₹{(order.total || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border fs-8">
                        {order.paymentMethod || 'COD'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        <span className="status-dot"></span>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fs-8"
                        onClick={() => navigate('/orders')}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-cart-x display-6 text-secondary opacity-50 mb-2 d-block"></i>
              <h6 className="fw-semibold mb-1 text-dark">No orders placed yet.</h6>
              <p className="fs-7 text-muted mb-0">Customer sales transactions will appear here as soon as orders are created.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
