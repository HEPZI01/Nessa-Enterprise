import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const SESSION_KEY = 'nessa_jwt_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to generate session JSON
  function generateSession(payload) {
    return JSON.stringify({
      ...payload,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
  }

  // Helper to validate stored session
  function validateSession(raw) {
    if (!raw) return null;
    try {
      const decoded = JSON.parse(raw);
      if (decoded.exp < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return decoded;
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    const valid = validateSession(raw);
    if (valid) {
      setUser(valid);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    let matchedUser = null;
    let token = null;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const json = await res.json();
        matchedUser = json.user;
        token = json.token;
      } else {
        const json = await res.json();
        throw new Error(json.message || 'Invalid email or password');
      }
    } catch (err) {
      if (err.message) throw err;
    }

    if (!matchedUser) {
      throw new Error('Invalid email or password');
    }

    const sessionData = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: String(matchedUser.role || 'Customer').trim(),
      token: token || null
    };

    const session = generateSession(sessionData);
    localStorage.setItem(SESSION_KEY, session);
    setUser(sessionData);
    return sessionData;
  };

  const register = async (newUser) => {
    const sessionData = {
      id: newUser.id || Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: String(newUser.role || 'Customer').trim(),
      token: newUser.token || null
    };
    const session = generateSession(sessionData);
    localStorage.setItem(SESSION_KEY, session);
    setUser(sessionData);
    return sessionData;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const role = (user?.role || '').toLowerCase();
  const isManagement = role === 'admin' || role === 'manager' || role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isLoggedIn: !!user,
        isManagement,
        role: user?.role || 'Customer',
        token: user?.token || null,
        getRedirectPath: () => (isManagement ? '/dashboard' : '/store')
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
