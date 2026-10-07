import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function Login({ portal = 'customer' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isLoggedIn, isManagement } = useAuth();
  const { users } = useData();

  // Determine portal mode from prop or pathname
  const initialMode = portal === 'admin' || location.pathname.includes('/admin') ? 'admin' : 'customer';
  const [portalMode, setPortalMode] = useState(initialMode);

  const [email, setEmail] = useState(initialMode === 'admin' ? 'admin@nessa.com' : 'customer@nessa.com');
  const [password, setPassword] = useState(initialMode === 'admin' ? 'admin123' : 'customer123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync mode if props/URL change
  useEffect(() => {
    const isAdminUrl = location.pathname.includes('/admin') || portal === 'admin';
    const newMode = isAdminUrl ? 'admin' : 'customer';
    setPortalMode(newMode);
    if (newMode === 'admin') {
      setEmail('admin@nessa.com');
      setPassword('admin123');
    } else {
      setEmail('customer@nessa.com');
      setPassword('customer123');
    }
    setError('');
  }, [location.pathname, portal]);

  // If already logged in, redirect straight away
  useEffect(() => {
    if (isLoggedIn) {
      navigate(isManagement ? '/dashboard' : '/store', { replace: true });
    }
  }, [isLoggedIn, isManagement, navigate]);

  const handlePortalSwitch = (mode) => {
    setPortalMode(mode);
    setError('');
    if (mode === 'admin') {
      navigate('/admin/login', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password, users);
      const userRole = (loggedUser.role || '').toLowerCase();
      const isUserMgmt = userRole === 'admin' || userRole === 'manager' || userRole === 'staff' || loggedUser.email === 'admin@nessa.com';

      if (portalMode === 'admin' && !isUserMgmt) {
        setError('Access Denied: Customer accounts cannot log in to the Admin & Staff Portal. Please switch to Customer Sign In.');
        setLoading(false);
        return;
      }

      const redirectPath = isUserMgmt ? '/dashboard' : '/store';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setQuickUser = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  const isDarkAdmin = portalMode === 'admin';

  return (
    <div
      className="login-page d-flex align-items-center justify-content-center py-5"
      style={{
        minHeight: '100vh',
        background: isDarkAdmin
          ? 'linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #3a506b 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
        transition: 'background 0.4s ease'
      }}
    >
      <div className="container" style={{ maxWidth: '460px' }}>
        {/* Portal Switcher Header */}
        <div className="bg-dark-subtle p-1 rounded-pill d-flex mb-4 shadow-sm border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            type="button"
            className={`btn flex-fill rounded-pill py-2 fw-bold fs-7 transition-all ${portalMode === 'customer' ? 'btn-primary shadow' : 'text-white border-0 opacity-75'}`}
            onClick={() => handlePortalSwitch('customer')}
          >
            <i className="bi bi-cart3 me-2"></i> Customer Login
          </button>
          <button
            type="button"
            className={`btn flex-fill rounded-pill py-2 fw-bold fs-7 transition-all ${portalMode === 'admin' ? 'btn-warning text-dark shadow' : 'text-white border-0 opacity-75'}`}
            onClick={() => handlePortalSwitch('admin')}
          >
            <i className="bi bi-shield-lock me-2"></i> Admin & Staff
          </button>
        </div>

        <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5" style={{ background: 'var(--bg-surface)' }}>
          {/* Logo & Header */}
          <div className="text-center mb-4">
            <div
              className="brand-icon mx-auto mb-3 shadow"
              style={{
                width: 52,
                height: 52,
                background: isDarkAdmin
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 26,
                fontWeight: 800
              }}
            >
              <i className={`bi bi-${isDarkAdmin ? 'shield-check' : 'bag-check-fill'}`}></i>
            </div>
            
            <span className={`badge mb-2 px-3 py-1 rounded-pill fw-bold text-uppercase ${isDarkAdmin ? 'bg-warning-subtle text-warning border border-warning' : 'bg-primary-subtle text-primary'}`}>
              {isDarkAdmin ? 'Enterprise Staff Portal' : 'Customer Storefront'}
            </span>

            <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {isDarkAdmin ? 'Admin & Management Sign In' : 'Customer Sign In'}
            </h4>
            <p className="text-muted fs-7 mb-0">
              {isDarkAdmin
                ? 'Authorized access for sales, inventory & management'
                : 'Sign in to place orders and manage your account'}
            </p>
          </div>

          {/* Quick Pre-fill Badges */}
          <div className="mb-4 text-center p-2.5 rounded-3 bg-light border">
            <span className="text-muted fs-8 fw-semibold d-block mb-1 text-uppercase tracking-wider">
              Quick Login Demo:
            </span>
            {isDarkAdmin ? (
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-sm btn-dark rounded-pill px-3 py-1 fs-8 fw-bold"
                  onClick={() => setQuickUser('admin@nessa.com', 'admin123')}
                >
                  <i className="bi bi-shield-fill me-1 text-warning"></i> Admin
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fs-8 fw-bold"
                  onClick={() => setQuickUser('sarah@nessa.com', 'sarah123')}
                >
                  <i className="bi bi-person-badge me-1"></i> Manager
                </button>
              </div>
            ) : (
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-pill px-3 py-1 fs-8 fw-bold"
                  onClick={() => setQuickUser('customer@nessa.com', 'customer123')}
                >
                  <i className="bi bi-cart me-1"></i> Customer Account
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger py-2.5 px-3 fs-7 mb-3 rounded-3 d-flex align-items-center gap-2 shadow-sm">
              <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-7" style={{ color: 'var(--text-primary)' }}>
                {isDarkAdmin ? 'Work / Staff Email' : 'Customer Email Address'}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder={isDarkAdmin ? 'admin@nessa.com' : 'customer@nessa.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold fs-7" style={{ color: 'var(--text-primary)' }}>Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn w-100 py-2.5 rounded-3 fw-bold shadow-sm ${isDarkAdmin ? 'btn-warning text-dark' : 'btn-primary'}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Authenticating...
                </>
              ) : (
                isDarkAdmin ? 'Sign In to Admin Panel' : 'Sign In as Customer'
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="text-center mt-4 pt-2 border-top">
            {!isDarkAdmin ? (
              <>
                <span className="text-muted fs-7">Don't have a customer account? </span>
                <Link to="/register" className="fw-semibold text-primary fs-7 text-decoration-none">
                  Register here
                </Link>
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-secondary fs-8 text-decoration-none"
                    onClick={() => handlePortalSwitch('admin')}
                  >
                    Admin / Staff Portal Sign In <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </>
            ) : (
              <div>
                <span className="text-muted fs-7">Are you a customer? </span>
                <button
                  type="button"
                  className="btn btn-link btn-sm text-primary fw-semibold fs-7 p-0 text-decoration-none"
                  onClick={() => handlePortalSwitch('customer')}
                >
                  Switch to Customer Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
