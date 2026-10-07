import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`nessa-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">N</div>
        <div className="brand-text">
          <span className="brand-name">Nessa Enterprise</span>
          <span className="brand-subtitle">Industrial Systems</span>
        </div>
      </div>

      <button
        className="sidebar-toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        title="Toggle Sidebar"
      >
        <i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`}></i>
      </button>

      <div className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main Navigation</div>

          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-grid-1x2-fill"></i>
            <span className="nav-link-text">Dashboard</span>
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-box-seam-fill"></i>
            <span className="nav-link-text">Products</span>
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-cart-check-fill"></i>
            <span className="nav-link-text">Orders</span>
          </NavLink>

          <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-stack"></i>
            <span className="nav-link-text">Inventory</span>
          </NavLink>

          <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-people-fill"></i>
            <span className="nav-link-text">Customers</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Analytics & Tools</div>

          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-graph-up-arrow"></i>
            <span className="nav-link-text">Analytics</span>
          </NavLink>

          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-file-earmark-bar-graph-fill"></i>
            <span className="nav-link-text">Reports</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-gear-fill"></i>
            <span className="nav-link-text">Settings</span>
          </NavLink>

          <NavLink to="/store" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-shop"></i>
            <span className="nav-link-text">View Store</span>
          </NavLink>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="nav-link text-danger" style={{ cursor: 'pointer' }} onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span className="nav-link-text">Logout ({user?.name ? user.name.split(' ')[0] : 'User'})</span>
        </div>
      </div>
    </nav>
  );
}
