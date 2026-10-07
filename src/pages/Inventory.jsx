import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Inventory() {
  const { products, updateProduct } = useData();
  const [search, setSearch] = useState('');

  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStockItems = products.filter(p => p.stock === 0);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const handleStockChange = (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    updateProduct(product.id, { stock: newStock });
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Inventory</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0">Inventory & Stock Tracking</h1>
          <p className="page-subtitle mb-0">Monitor warehouse availability, restock triggers, and item balances.</p>
        </div>
      </div>

      {/* Stock Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="p-3 border rounded-3 bg-surface shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted fs-8 text-uppercase fw-bold">Low Stock Warning</div>
              <h3 className="fw-bold mb-0 text-warning">{lowStockItems.length} Products</h3>
            </div>
            <i className="bi bi-exclamation-triangle display-6 text-warning opacity-50"></i>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="p-3 border rounded-3 bg-surface shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted fs-8 text-uppercase fw-bold">Out of Stock</div>
              <h3 className="fw-bold mb-0 text-danger">{outOfStockItems.length} Products</h3>
            </div>
            <i className="bi bi-x-circle display-6 text-danger opacity-50"></i>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="p-3 border rounded-3 bg-surface shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted fs-8 text-uppercase fw-bold">Total Managed Items</div>
              <h3 className="fw-bold mb-0 text-primary">{products.length} Products</h3>
            </div>
            <i className="bi bi-box-seam display-6 text-primary opacity-50"></i>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="nessa-table-card">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <div className="table-search">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search inventory items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table nessa-table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock Units</th>
                <th>Stock Level</th>
                <th className="text-end">Quick Restock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const stockPercent = Math.min(100, Math.round((p.stock / 100) * 100));
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-bold">{p.name}</div>
                      <div className="text-muted fs-8">Price: ₹{p.price.toLocaleString('en-IN')}</div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{p.category}</span></td>
                    <td className="fw-extrabold">{p.stock} units</td>
                    <td style={{ minWidth: 160 }}>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className={`progress-bar ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${stockPercent}%` }}
                        ></div>
                      </div>
                      <div className="fs-8 text-muted mt-1">{p.stock > 10 ? 'Optimal' : p.stock > 0 ? 'Reorder Soon' : 'Depleted'}</div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleStockChange(p, -5)}>-5</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => handleStockChange(p, -1)}>-1</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => handleStockChange(p, 1)}>+1</button>
                        <button className="btn btn-sm btn-outline-success py-0 px-2" onClick={() => handleStockChange(p, 5)}>+5</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
