import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Customers() {
  const { orders, users } = useData();
  const [search, setSearch] = useState('');

  // Calculate customer spending and order counts
  const customerMap = {};

  orders.forEach(o => {
    const key = o.customerEmail || o.customerName || 'Unknown';
    if (!customerMap[key]) {
      customerMap[key] = {
        name: o.customerName || 'Customer',
        email: o.customerEmail || 'N/A',
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: o.date
      };
    }
    customerMap[key].totalOrders += 1;
    customerMap[key].totalSpent += (o.total || 0);
    if (o.date > customerMap[key].lastOrder) {
      customerMap[key].lastOrder = o.date;
    }
  });

  const customerList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

  const filteredCustomers = customerList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Customers</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0">Customer Directory</h1>
          <p className="page-subtitle mb-0">View customer lifetime value, order frequency, and account details.</p>
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
                placeholder="Search customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="toolbar-right text-muted fs-7">
            Total Unique Customers: <strong>{customerList.length}</strong>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table nessa-table align-middle">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Orders Placed</th>
                <th>Total Lifetime Spend</th>
                <th>Last Active</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, i) => (
                <tr key={c.email + i}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold">{c.name}</div>
                        <div className="text-muted fs-8">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge bg-light text-dark border">{c.totalOrders} orders</span></td>
                  <td className="fw-extrabold text-primary">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                  <td className="text-muted fs-7">{c.lastOrder || 'Recent'}</td>
                  <td>
                    <span className="status-badge in-stock">
                      <span className="status-dot"></span> Active
                    </span>
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
