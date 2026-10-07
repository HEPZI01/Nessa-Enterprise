import React from 'react';
import { useData } from '../context/DataContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const { salesReports, products, orders } = useData();

  const barChartData = {
    labels: salesReports.map(r => r.month),
    datasets: [
      {
        label: 'Gross Sales Revenue (₹)',
        data: salesReports.map(r => r.revenue),
        backgroundColor: '#6366f1',
        borderRadius: 8
      }
    ]
  };

  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + (p.price * p.stock);
  });

  const doughnutData = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
      }
    ]
  };

  // Top 5 products by order volume
  const prodSales = {};
  orders.forEach(o => {
    const name = o.productName || `Product #${o.productId}`;
    prodSales[name] = (prodSales[name] || 0) + (o.quantity || 1);
  });

  const topProducts = Object.entries(prodSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Analytics</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0">Business Intelligence & Analytics</h1>
          <p className="page-subtitle mb-0">Analyze product sales demand, revenue growth, and category valuation.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="chart-card p-3">
            <h6 className="fw-bold mb-3">Monthly Gross Sales (₹)</h6>
            <div style={{ height: 300 }}>
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="chart-card p-3">
            <h6 className="fw-bold mb-3">Inventory Valuation by Category</h6>
            <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
              <div style={{ maxWidth: 240 }}>
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="nessa-card p-4">
        <h5 className="fw-bold mb-3"><i className="bi bi-trophy text-warning me-2"></i>Top Selling Pump Products</h5>
        <div className="table-responsive">
          <table className="table ness-table align-middle">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product Name</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(([name, qty], index) => (
                <tr key={name}>
                  <td className="fw-bold">#{index + 1}</td>
                  <td className="fw-semibold">{name}</td>
                  <td><span className="badge bg-primary rounded-pill px-3">{qty} units</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
