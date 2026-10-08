import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Orders() {
  const { orders, updateOrderStatus } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = [...orders].reverse().filter(o => {
    const matchesSearch = (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (o.productName || '').toLowerCase().includes(search.toLowerCase()) ||
                          String(o.id).includes(search);
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Orders</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0">Order Management</h1>
          <p className="page-subtitle mb-0">Monitor customer purchases, manage fulfillment statuses, and track live updates.</p>
        </div>
      </div>

      <div className="nessa-table-card">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <div className="table-search">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search orders by ID, customer, product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-dropdown ms-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
          <div className="toolbar-right text-muted fs-7">
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
          </div>
        </div>

        <div className="table-responsive">
          <table className="table nessa-table align-middle">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Fulfillment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td className="fw-bold">#{o.id}</td>
                  <td>
                    <div className="fw-semibold">{o.customerName || 'Customer'}</div>
                    <div className="text-muted fs-8">{o.customerEmail || ''}</div>
                    {o.deliveryPhone && (
                      <div className="text-muted fs-8">
                        <i className="bi bi-telephone me-1 text-primary"></i>{o.deliveryPhone}
                      </div>
                    )}
                    {o.deliveryAddress && (
                      <div className="text-muted fs-8 text-truncate" style={{ maxWidth: '180px' }} title={o.deliveryAddress}>
                        <i className="bi bi-geo-alt me-1 text-danger"></i>{o.deliveryAddress}
                      </div>
                    )}
                  </td>
                  <td className="fw-medium">{o.productName || `Product #${o.productId}`}</td>
                  <td><span className="badge bg-light text-dark border">{o.quantity}</span></td>
                  <td className="fw-bold text-primary">₹{(o.total || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className="badge bg-secondary-subtle text-secondary border fs-8">
                      {o.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td className="text-muted fs-7">{o.date || 'Recent'}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm fw-bold rounded-pill border-0 shadow-sm ${
                        o.status === 'Delivered' ? 'bg-success-subtle text-success' :
                        o.status === 'Shipped' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'
                      }`}
                      style={{ width: '130px' }}
                      value={o.status || 'Pending'}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
