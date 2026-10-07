import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { registerUserInDB } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const createdUser = await registerUserInDB({ name, email, password });
      await register(createdUser);
      navigate('/store');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5" style={{ background: 'var(--bg-surface)' }}>
          <div className="text-center mb-4">
            <div className="brand-icon mx-auto mb-3" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800 }}>
              N
            </div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create Account</h4>
            <p className="text-muted fs-7">Join Nessa Enterprise Industrial Store</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 fs-7 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-7" style={{ color: 'var(--text-primary)' }}>Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold fs-7" style={{ color: 'var(--text-primary)' }}>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold fs-7" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted fs-7">Already have an account? </span>
            <Link to="/login" className="fw-semibold text-primary fs-7 text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div >
  );
}
