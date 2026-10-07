import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Submersible Pump',
    price: '',
    stock: '',
    image: '',
    description: ''
  });

  const categories = [
    'Submersible Pump',
    'Openwell Pump',
    'Monoblock Pump',
    'Domestic Pump',
    'Self Priming Pump',
    'Smart IoT Pump',
    'Booster System',
    'Solar System'
  ];

  // Calculated Metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 15).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const activeCategories = new Set(products.map(p => p.category)).size;

    return { totalProducts, totalValue, lowStockCount, outOfStockCount, activeCategories };
  }, [products]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()) ||
          (p.id && p.id.toString().includes(search));
        
        const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;

        let matchesStock = true;
        if (stockFilter === 'in-stock') matchesStock = p.stock > 15;
        else if (stockFilter === 'low-stock') matchesStock = p.stock > 0 && p.stock <= 15;
        else if (stockFilter === 'out-stock') matchesStock = p.stock === 0;

        return matchesSearch && matchesCat && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        return 0;
      });
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      name: '',
      category: 'Submersible Pump',
      price: '',
      stock: '',
      image: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditItem(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      image: prod.image || '',
      description: prod.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0
    };

    if (editItem) {
      await updateProduct(editItem.id, payload);
    } else {
      await addProduct(payload);
    }
    setShowModal(false);
  };

  return (
    <div className="pb-5">
      {/* Page Header */}
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Products</li>
            </ol>
          </nav>
          <h1 className="h3 mb-1 font-weight-bold">Product Catalog</h1>
          <p className="page-subtitle mb-0">Manage pump inventory, pricing, descriptions, and category distribution.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={handleOpenAdd}>
            <i className="bi bi-plus-circle-fill fs-6"></i> Add New Product
          </button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label font-weight-semibold">Total Catalog Items</span>
              <div className="kpi-icon products-icon">
                <i className="bi bi-box-seam"></i>
              </div>
            </div>
            <div className="kpi-value text-primary">{metrics.totalProducts}</div>
            <div className="fs-7 text-muted mt-1">Across {metrics.activeCategories} product categories</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label font-weight-semibold">Total Stock Value</span>
              <div className="kpi-icon revenue-icon">
                <i className="bi bi-currency-rupee"></i>
              </div>
            </div>
            <div className="kpi-value">₹{metrics.totalValue.toLocaleString('en-IN')}</div>
            <div className="fs-7 text-muted mt-1">Cumulative inventory asset value</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label font-weight-semibold">Low Stock Alerts</span>
              <div className="kpi-icon alerts-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
            </div>
            <div className="kpi-value text-warning">{metrics.lowStockCount}</div>
            <div className="fs-7 text-muted mt-1">Products requiring restock (&le;15 units)</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label font-weight-semibold">Active Categories</span>
              <div className="kpi-icon growth-icon">
                <i className="bi bi-grid-3x3-gap"></i>
              </div>
            </div>
            <div className="kpi-value text-success">{metrics.activeCategories}</div>
            <div className="fs-7 text-muted mt-1">Product spectrum categories</div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="filter-chips-wrapper mb-3">
        <button
          className={`filter-chip ${categoryFilter === 'All' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('All')}
        >
          All Categories ({products.length})
        </button>
        {categories.map(cat => {
          const count = products.filter(p => p.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Container Card */}
      <div className="nessa-table-card">
        {/* Toolbar Controls */}
        <div className="table-toolbar">
          <div className="toolbar-left">
            <div className="table-search">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search products by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear-btn" onClick={() => setSearch('')}>
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            {/* Stock Level Selector */}
            <div className="ms-md-1">
              <select
                className="form-select form-select-sm rounded-pill px-3"
                style={{ height: '40px', fontSize: '13px' }}
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="All">All Stock Levels</option>
                <option value="in-stock">In Stock (&gt;15)</option>
                <option value="low-stock">Low Stock (1-15)</option>
                <option value="out-stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div>
              <select
                className="form-select form-select-sm rounded-pill px-3"
                style={{ height: '40px', fontSize: '13px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
                <option value="stock-asc">Sort: Stock (Low to High)</option>
                <option value="stock-desc">Sort: Stock (High to Low)</option>
              </select>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="text-muted fs-7">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> items
            </span>

            {/* View Mode Toggle Buttons */}
            <div className="view-toggle-group">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <i className="bi bi-grid-fill"></i> Grid
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <i className="bi bi-list-ul"></i> Table
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3 text-muted display-4">
              <i className="bi bi-box"></i>
            </div>
            <h5 className="fw-bold">No Products Found</h5>
            <p className="text-muted fs-7">No items match your search term or category filters.</p>
            <button
              className="btn btn-outline-primary btn-sm rounded-pill px-4"
              onClick={() => { setSearch(''); setCategoryFilter('All'); setStockFilter('All'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ================= GRID VIEW ================= */
          <div className="p-3">
            <div className="catalog-grid">
              {filteredProducts.map(p => {
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock > 0 && p.stock <= 15;
                const stockPct = Math.min(100, (p.stock / 100) * 100);

                return (
                  <div key={p.id} className="catalog-card">
                    <div className="catalog-card-image-wrap">
                      <span className={`status-badge catalog-card-badge ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
                        <span className="status-dot"></span>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>

                      <div className="catalog-card-quick-actions">
                        <button className="action-btn view" onClick={() => setPreviewItem(p)} title="Quick Preview">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="action-btn" onClick={() => handleOpenEdit(p)} title="Edit Product">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="action-btn delete" onClick={() => deleteProduct(p.id)} title="Delete Product">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>

                      <img
                        src={p.image}
                        alt={p.name}
                        className="catalog-card-img"
                        onError={(e) => { e.target.src = p.fallback || 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'; }}
                      />
                    </div>

                    <div className="catalog-card-body">
                      <div className="catalog-card-category">{p.category}</div>
                      <h3 className="catalog-card-title" onClick={() => setPreviewItem(p)} style={{ cursor: 'pointer' }}>
                        {p.name}
                      </h3>
                      <p className="catalog-card-desc">{p.description || 'High performance industrial pump equipment.'}</p>

                      <div className="mb-2">
                        <div className="d-flex justify-content-between fs-7 text-muted mb-1">
                          <span>Available Stock</span>
                          <span className="fw-bold">{p.stock} units</span>
                        </div>
                        <div className="stock-meter">
                          <div
                            className={`stock-meter-fill ${isOutOfStock ? 'bg-danger' : isLowStock ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: `${isOutOfStock ? 5 : stockPct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="catalog-card-footer">
                        <div>
                          <span className="fs-7 text-muted d-block line-height-1">Price</span>
                          <span className="catalog-card-price">₹{p.price.toLocaleString('en-IN')}</span>
                        </div>
                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => setPreviewItem(p)}>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= TABLE VIEW ================= */
          <div className="table-responsive">
            <table className="table nessa-table align-middle">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumb">
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={(e) => { e.target.src = p.fallback || 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'; }}
                          />
                        </div>
                        <div className="product-details">
                          <div className="product-name" onClick={() => setPreviewItem(p)} style={{ cursor: 'pointer' }}>
                            {p.name}
                          </div>
                          <div className="product-sku">ID: #{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fs-7">{p.category}</span>
                    </td>
                    <td className="fw-bold fs-6">₹{p.price.toLocaleString('en-IN')}</td>
                    <td>
                      <div className="fw-semibold">{p.stock} units</div>
                      <div className="stock-meter" style={{ width: '80px' }}>
                        <div
                          className={`stock-meter-fill ${p.stock === 0 ? 'bg-danger' : p.stock <= 15 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${p.stock > 15 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                        <span className="status-dot"></span>
                        {p.stock > 15 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="action-btns justify-content-end">
                        <button className="action-btn view" onClick={() => setPreviewItem(p)} title="Preview Details">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="action-btn" onClick={() => handleOpenEdit(p)} title="Edit Product">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="action-btn delete" onClick={() => deleteProduct(p.id)} title="Delete Product">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= QUICK PREVIEW MODAL ================= */}
      {previewItem && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setPreviewItem(null)}></div>
          <div className="modal show d-block" style={{ zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 p-4 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <span className="badge bg-primary-subtle text-primary border px-3 py-2 rounded-pill font-weight-bold">
                    {previewItem.category}
                  </span>
                  <button className="btn-close" onClick={() => setPreviewItem(null)}></button>
                </div>
                <div className="modal-body py-3">
                  <div className="row g-4 align-items-center">
                    <div className="col-12 col-md-5">
                      <div className="product-modal-preview">
                        <img
                          src={previewItem.image}
                          alt={previewItem.name}
                          className="product-modal-img"
                          onError={(e) => { e.target.src = previewItem.fallback || 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'; }}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-7">
                      <h4 className="fw-bold text-primary mb-2">{previewItem.name}</h4>
                      <p className="text-muted fs-7 mb-3">Product ID: #{previewItem.id}</p>
                      
                      <div className="d-flex align-items-baseline gap-2 mb-4">
                        <h2 className="fw-extrabold mb-0 text-dark">₹{previewItem.price.toLocaleString('en-IN')}</h2>
                        <span className="text-muted fs-7">Inclusive of all taxes</span>
                      </div>

                      <p className="text-secondary fs-6 mb-4">
                        {previewItem.description || 'High performance pump engineered for efficiency and high durability.'}
                      </p>

                      <div className="row g-2 mb-4">
                        <div className="col-6">
                          <div className="spec-pill">
                            <div className="spec-icon">
                              <i className="bi bi-box"></i>
                            </div>
                            <div>
                              <div className="fs-7 text-muted">Current Stock</div>
                              <div className="fw-bold">{previewItem.stock} units</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="spec-pill">
                            <div className="spec-icon">
                              <i className="bi bi-shield-check"></i>
                            </div>
                            <div>
                              <div className="fs-7 text-muted">Availability</div>
                              <div className="fw-bold">{previewItem.stock > 0 ? 'Available' : 'Out of Stock'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-primary rounded-pill px-4 fw-bold"
                          onClick={() => {
                            const prodToEdit = previewItem;
                            setPreviewItem(null);
                            handleOpenEdit(prodToEdit);
                          }}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit Product
                        </button>
                        <button className="btn btn-light rounded-pill px-4" onClick={() => setPreviewItem(null)}>
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}
      {showModal && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}></div>
          <div className="modal show d-block" style={{ zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 p-4 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold fs-5">{editItem ? 'Edit Product' : 'Add New Product'}</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body py-3">
                    <div className="row g-4">
                      {/* Left side: Live image preview */}
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold fs-7 mb-2">Image Preview</label>
                        <div className="product-modal-preview" style={{ height: '220px' }}>
                          <img
                            src={formData.image || 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'}
                            alt="Preview"
                            className="product-modal-img"
                            onError={(e) => { e.target.src = 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'; }}
                          />
                        </div>
                        <small className="text-muted d-block mt-2 text-center fs-7">
                          Enter a direct image URL to view preview
                        </small>
                      </div>

                      {/* Right side: Form controls */}
                      <div className="col-12 col-md-8">
                        <div className="mb-3">
                          <label className="form-label fw-semibold fs-7">Product Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Lena Series Borewell Submersible Pump"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-6">
                            <label className="form-label fw-semibold fs-7">Category *</label>
                            <select
                              className="form-select"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold fs-7">Price (₹) *</label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="18000"
                              required
                              min="0"
                              step="any"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-6">
                            <label className="form-label fw-semibold fs-7">Stock Level *</label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="45"
                              required
                              min="0"
                              value={formData.stock}
                              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold fs-7">Image URL</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="https://..."
                              value={formData.image}
                              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold fs-7">Description</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Describe product specifications, horsepower, materials..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 pt-2">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                      {editItem ? 'Save Changes' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
