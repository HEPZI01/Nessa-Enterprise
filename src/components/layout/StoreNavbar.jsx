import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StoreNavbar({ cartCount, onOpenCart }) {
  const { user, isLoggedIn, isManagement, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm py-3" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container-fluid px-4">
        {/* Brand */}
        <NavLink to="/store" className="navbar-brand d-flex align-items-center gap-2">
          <div className="brand-icon" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
            N
          </div>
          <div>
            <div className="fw-bold fs-5 text-primary mb-0 leading-tight" style={{ color: 'var(--text-primary)' }}>NESSA</div>
            <div className="text-muted text-uppercase tracking-wider" style={{ fontSize: 10 }}>Pumps & Systems</div>
          </div>
        </NavLink>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-3 ms-auto">
          <NavLink to="/store" className={({ isActive }) => `nav-link fw-medium d-none d-sm-inline-block ${isActive ? 'text-primary' : 'text-secondary'}`}>
            <i className="bi bi-shop me-1"></i> Store
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/my-orders" className={({ isActive }) => `nav-link fw-medium d-none d-sm-inline-block ${isActive ? 'text-primary' : 'text-secondary'}`}>
              <i className="bi bi-bag-check me-1"></i> My Orders
            </NavLink>
          )}

          {isManagement && (
            <NavLink to="/dashboard" className="btn btn-outline-primary btn-sm px-3 rounded-pill">
              <i className="bi bi-speedometer2 me-1"></i> Admin Panel
            </NavLink>
          )}

          {/* Cart Button */}
          <button className="btn btn-primary rounded-pill px-3 d-flex align-items-center gap-2 position-relative" onClick={onOpenCart}>
            <i className="bi bi-cart3 fs-6"></i>
            <span className="d-none d-sm-inline">Cart</span>
            {cartCount > 0 && (
              <span className="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile/Login */}
          {isLoggedIn ? (
            <div className="position-relative">
              <button className="btn btn-light rounded-circle p-0" style={{ width: 38, height: 38 }} onClick={() => setShowProfile(!showProfile)}>
                <div className="w-100 h-100 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              </button>

              {showProfile && (
                <div className="dropdown-menu dropdown-menu-end show p-2 shadow position-absolute end-0 mt-2" style={{ zIndex: 1100 }}>
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-bold">{user?.name}</div>
                    <div className="text-muted fs-8">{user?.email}</div>
                  </div>
                  <button className="dropdown-item py-2" onClick={() => navigate('/my-orders')}>
                    <i className="bi bi-bag me-2"></i> My Orders
                  </button>
                  <button className="dropdown-item py-2 text-danger" onClick={() => { logout(); navigate('/login'); }}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <NavLink to="/login" className="btn btn-outline-primary rounded-pill px-3 fs-7 fw-bold">
                <i className="bi bi-cart3 me-1"></i> Customer Login
              </NavLink>
              <NavLink to="/admin/login" className="btn btn-outline-dark rounded-pill px-3 fs-7 fw-bold">
                <i className="bi bi-shield-lock me-1"></i> Admin Portal
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
