import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toastMessage } = useData();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('nessa_theme') || 'light');
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nessa_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="nessa-topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search products, orders, customers..."
          />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Toast alert banner if active */}
        {toastMessage && (
          <div className={`alert alert-${toastMessage.type === 'error' ? 'danger' : toastMessage.type} py-1 px-3 mb-0 me-2 d-none d-md-flex align-items-center gap-2 style-sm`}>
            <i className="bi bi-info-circle-fill"></i>
            <span>{toastMessage.message}</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          className="topbar-action-btn theme-toggle"
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
        >
          <i className={`bi bi-${theme === 'dark' ? 'sun-fill text-warning' : 'moon-fill'}`}></i>
        </button>

        {/* Notification Bell */}
        <div className="position-relative">
          <button
            className="topbar-action-btn"
            onClick={() => setShowNotif(!showNotif)}
            title="Notifications"
          >
            <i className="bi bi-bell-fill"></i>
            <span className="notification-badge"></span>
          </button>

          {showNotif && (
            <div className="dropdown-menu dropdown-menu-end show p-3 shadow-lg position-absolute end-0 mt-2" style={{ width: '300px', zIndex: 1100 }}>
              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <h6 className="mb-0 font-weight-bold">Notifications</h6>
                <span className="badge bg-primary rounded-pill">New</span>
              </div>
              <div className="py-2 border-bottom fs-7">
                <i className="bi bi-cart-check text-success me-2"></i> System database active and synced.
              </div>
              <div className="py-2 fs-7">
                <i className="bi bi-lightning text-warning me-2"></i> Socket.IO live notifications enabled.
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="position-relative">
          <button
            className="profile-dropdown"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
            </div>
            <div className="profile-info d-none d-sm-block">
              <div className="profile-name">{user?.name || 'Admin User'}</div>
              <div className="profile-role">{user?.role || 'Admin'}</div>
            </div>
            <i className="bi bi-chevron-down ms-1 fs-8 text-muted"></i>
          </button>

          {showProfile && (
            <div className="dropdown-menu dropdown-menu-end show p-2 shadow position-absolute end-0 mt-2" style={{ zIndex: 1100 }}>
              <button className="dropdown-item py-2" onClick={() => navigate('/settings')}>
                <i className="bi bi-gear me-2"></i> Settings
              </button>
              <button className="dropdown-item py-2" onClick={() => navigate('/store')}>
                <i className="bi bi-shop me-2"></i> Storefront
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
