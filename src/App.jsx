import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Storefront from './pages/Storefront';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MyOrders from './pages/MyOrders';

function RequireAuth({ children, allowedRoles }) {
  const { isLoggedIn, role, loading } = useAuth();

  if (loading) return null;

  if (!isLoggedIn) {
    // Redirect unauthenticated management access to admin login, otherwise customer login
    const isMgmtTarget = allowedRoles && (allowedRoles.includes('admin') || allowedRoles.includes('manager') || allowedRoles.includes('staff'));
    return <Navigate to={isMgmtTarget ? "/admin/login" : "/login"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role.toLowerCase())) {
    return <Navigate to={role.toLowerCase() === 'customer' ? '/store' : '/dashboard'} replace />;
  }

  return children;
}

function ManagementLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-container ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Topbar />
      <main className="nessa-main">
        {children}
      </main>
    </div>
  );
}

function RootRedirect() {
  const { isLoggedIn, isManagement } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Navigate to={isManagement ? "/dashboard" : "/store"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          
          {/* Dedicated Customer and Admin Login Routes */}
          <Route path="/login" element={<Login portal="customer" />} />
          <Route path="/customer/login" element={<Login portal="customer" />} />
          <Route path="/admin/login" element={<Login portal="admin" />} />
          <Route path="/register" element={<Register />} />

          {/* Storefront Customer Routes */}
          <Route path="/store" element={<Storefront />} />
          <Route path="/my-orders" element={
            <RequireAuth>
              <MyOrders />
            </RequireAuth>
          } />

          {/* Management Dashboard Routes */}
          <Route path="/dashboard" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Dashboard /></ManagementLayout>
            </RequireAuth>
          } />
          <Route path="/products" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Products /></ManagementLayout>
            </RequireAuth>
          } />
          <Route path="/orders" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Orders /></ManagementLayout>
            </RequireAuth>
          } />
          <Route path="/inventory" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Inventory /></ManagementLayout>
            </RequireAuth>
          } />
          <Route path="/customers" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Customers /></ManagementLayout>
            </RequireAuth>
          } />
          <Route path="/analytics" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Analytics /></ManagementLayout>
            </RequireAuth>
          } />
          <Route path="/reports" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Reports /></ManagementLayout>
            </RequireAuth>
          } />
          <Route path="/settings" element={
            <RequireAuth allowedRoles={['admin', 'manager', 'staff']}>
              <ManagementLayout><Settings /></ManagementLayout>
            </RequireAuth>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}
