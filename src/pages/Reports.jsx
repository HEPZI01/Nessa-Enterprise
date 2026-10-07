import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { orders, products, salesReports } = useData();
  const [reportType, setReportType] = useState('sales');

  const exportToExcel = () => {
    let exportData = [];
    let filename = 'nessa_report.xlsx';

    if (reportType === 'sales') {
      exportData = orders.map(o => ({
        'Order ID': o.id,
        'Customer': o.customerName,
        'Email': o.customerEmail,
        'Product': o.productName,
        'Quantity': o.quantity,
        'Total (INR)': o.total,
        'Status': o.status,
        'Date': o.date
      }));
      filename = 'nessa_sales_report.xlsx';
    } else if (reportType === 'inventory') {
      exportData = products.map(p => ({
        'Product ID': p.id,
        'Name': p.name,
        'Category': p.category,
        'Price (INR)': p.price,
        'Stock Units': p.stock
      }));
      filename = 'nessa_inventory_report.xlsx';
    } else {
      exportData = salesReports;
      filename = 'nessa_monthly_summary.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Reports</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0">Business Reports</h1>
          <p className="page-subtitle mb-0">Generate, view, and export sales & inventory data sheets.</p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary rounded-pill px-3" onClick={() => window.print()}>
            <i className="bi bi-printer me-1"></i> Print
          </button>
          <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={exportToExcel}>
            <i className="bi bi-download me-1"></i> Export Excel
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-surface">
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${reportType === 'sales' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setReportType('sales')}
          >
            <i className="bi bi-cart-check me-1"></i> Sales & Orders Report
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${reportType === 'inventory' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setReportType('inventory')}
          >
            <i className="bi bi-box-seam me-1"></i> Inventory Stock Audit
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${reportType === 'monthly' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setReportType('monthly')}
          >
            <i className="bi bi-calendar-range me-1"></i> Monthly Summary
          </button>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="nessa-table-card">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-capitalize">{reportType} Preview Sheet</h6>
          <span className="badge bg-success-subtle text-success border">Ready to Export</span>
        </div>

        <div className="table-responsive">
          {reportType === 'sales' && (
            <table className="table nessa-table align-middle">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="fw-bold">#{o.id}</td>
                    <td>{o.customerName}</td>
                    <td>{o.productName}</td>
                    <td>{o.quantity}</td>
                    <td className="fw-bold text-primary">₹{(o.total || 0).toLocaleString('en-IN')}</td>
                    <td><span className="badge bg-light text-dark border">{o.status}</span></td>
                    <td className="text-muted fs-7">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'inventory' && (
            <table className="table nessa-table align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Balance</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="fw-bold">#{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td className="fw-bold">₹{p.price.toLocaleString('en-IN')}</td>
                    <td>{p.stock} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'monthly' && (
            <table className="table nessa-table align-middle">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue (INR)</th>
                  <th>Orders Count</th>
                </tr>
              </thead>
              <tbody>
                {salesReports.map(r => (
                  <tr key={r.month}>
                    <td className="fw-bold">{r.month}</td>
                    <td className="fw-bold text-primary">₹{r.revenue.toLocaleString('en-IN')}</td>
                    <td>{r.orders} orders</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
