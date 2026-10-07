import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const DataContext = createContext();

const DATA_URL = '/api/data';
const OFFLINE_DB_KEY = 'nessa_offline_db';

function generateSampleData() {
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@nessa.com', password: 'admin123', role: 'Admin' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@nessa.com', password: 'sarah123', role: 'Manager' },
    { id: 3, name: 'James Wilson', email: 'james@nessa.com', password: 'james123', role: 'Staff' },
    { id: 4, name: 'Emily Davis', email: 'emily@nessa.com', password: 'emily123', role: 'Staff' },
    { id: 5, name: 'Michael Brown', email: 'michael@nessa.com', password: 'michael123', role: 'Manager' },
    { id: 6, name: 'Test Customer', email: 'customer@nessa.com', password: 'customer123', role: 'Customer' }
  ];

  const productList = [
    { name: 'Lena Series Borewell Submersible Pump', category: 'Submersible Pump', price: 18000, stock: 45, fallback: 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg' },
    { name: 'Zuno Lite Series Borewell Submersible Pump', category: 'Submersible Pump', price: 16500, stock: 52, fallback: 'https://cdn.moglix.com/p/DyIVu3VaZbRyZ-large.jpg' },
    { name: 'Lena+ Series Borewell Submersible Pump', category: 'Submersible Pump', price: 20000, stock: 38, fallback: 'https://cdn.moglix.com/p/psvq6DLOzqttv-large.jpg' },
    { name: 'Genie Series Borewell Submersible Pump', category: 'Submersible Pump', price: 22000, stock: 24, fallback: 'https://cdn.moglix.com/p/znMu7c7wuIjVC-large.jpg' },
    { name: 'Zuno Series Borewell Submersible Pump', category: 'Submersible Pump', price: 21000, stock: 29, fallback: 'https://cdn.moglix.com/p/7WiKsPkpDiVTI-large.jpg' },
    { name: 'Steelix Series Borewell Submersible Pump', category: 'Submersible Pump', price: 35000, stock: 15, fallback: 'https://cdn.moglix.com/p/vOBjufdKe3f99-large.png' },
    { name: 'Nile Series Borewell Submersible Pump', category: 'Submersible Pump', price: 45000, stock: 10, fallback: 'https://cdn.moglix.com/p/HvotdQutwswmH-large.png' },
    { name: 'Ryker Series Vertical Openwell Submersible Pump', category: 'Openwell Pump', price: 18500, stock: 33, fallback: 'https://cdn.moglix.com/p/t17jVkK36RU9T-large.png' },
    { name: 'ACM Series Centrifugal Monoblock Pump', category: 'Monoblock Pump', price: 9500, stock: 50, fallback: 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg' },
    { name: 'Mini Monoblock Pump', category: 'Domestic Pump', price: 6000, stock: 90, fallback: 'https://cdn.moglix.com/p/DyIVu3VaZbRyZ-large.jpg' },
    { name: 'Regenerative Self Priming Monoset Pump', category: 'Self Priming Pump', price: 8200, stock: 72, fallback: 'https://cdn.moglix.com/p/psvq6DLOzqttv-large.jpg' },
    { name: 'I-Smart Pump', category: 'Smart IoT Pump', price: 15500, stock: 22, fallback: 'https://cdn.moglix.com/p/HvotdQutwswmH-large.png' },
    { name: 'Pressure Booster System', category: 'Booster System', price: 35000, stock: 18, fallback: 'https://cdn.moglix.com/p/b5t0gJ8GEnbKj-large.jpg' },
    { name: 'Solar Pumping System', category: 'Solar System', price: 75000, stock: 8, fallback: 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg' }
  ];

  const products = productList.map((p, i) => ({
    id: i + 1,
    name: p.name,
    description: `High performance ${p.name.toLowerCase()} for industrial and domestic usage.`,
    price: p.price,
    category: p.category,
    stock: p.stock,
    image: p.fallback,
    fallback: p.fallback
  }));

  const customerNames = ['Alice Cooper', 'Bob Martinez', 'Catherine Lee', 'David Kim', 'Eva Green', 'Grace Hall'];
  const statuses = ['Pending', 'Shipped', 'Delivered'];
  const orders = [];
  let orderId = 1;

  for (let month = 1; month <= 6; month++) {
    for (let j = 0; j < 5; j++) {
      const prod = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const custIdx = Math.floor(Math.random() * customerNames.length);
      orders.push({
        id: orderId++,
        userId: custIdx + 1,
        customerName: customerNames[custIdx],
        customerEmail: `${customerNames[custIdx].toLowerCase().replace(' ', '.')}@email.com`,
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        total: parseFloat((prod.price * qty).toFixed(2)),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        date: `2025-0${month}-15`,
        paymentMethod: 'COD'
      });
    }
  }

  const salesReports = [
    { month: 'Jan', revenue: 145000, orders: 12 },
    { month: 'Feb', revenue: 182000, orders: 15 },
    { month: 'Mar', revenue: 210000, orders: 18 },
    { month: 'Apr', revenue: 195000, orders: 16 },
    { month: 'May', revenue: 250000, orders: 22 },
    { month: 'Jun', revenue: 285000, orders: 24 }
  ];

  return { users, products, orders, salesReports };
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const offline = localStorage.getItem(OFFLINE_DB_KEY);
    if (offline) {
      try { return JSON.parse(offline); } catch (e) {}
    }
    return generateSampleData();
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const saveData = useCallback((newData) => {
    setData(newData);
    localStorage.setItem(OFFLINE_DB_KEY, JSON.stringify(newData));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(DATA_URL);
      if (res.ok) {
        const result = await res.json();
        if (result.products && result.products.length > 0) {
          saveData(result);
          setLoading(false);
          return;
        }
      } else {
        setApiError('Unable to connect to the central server. Showing cached offline data.');
      }
    } catch (err) {
      console.warn('Backend unavailable, using local offline data.');
    }
    setLoading(false);
  }, [saveData]);

  useEffect(() => {
    loadData();

    let socket;
    try {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin : 'http://localhost:3000');
      socket = io(socketUrl);
      socket.on('new_order', (msg) => {
        showToast(msg.message || 'New order received!', 'success');
        loadData();
      });
      socket.on('order_status_updated', (msg) => {
        showToast(msg.message || 'Order status updated!', 'info');
        loadData();
      });
    } catch (e) {
      console.log('Socket.io connection disabled or unavailable.');
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [loadData]);

  const getAuthHeaders = () => {
    try {
      const raw = localStorage.getItem('nessa_jwt_token');
      if (raw) {
        const decoded = JSON.parse(raw);
        if (decoded && decoded.token) {
          return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${decoded.token}`
          };
        }
      }
    } catch (e) {}
    return { 'Content-Type': 'application/json' };
  };

  // CRUD Operations
  const addProduct = async (productData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        await loadData();
        showToast('Product added successfully!', 'success');
        return;
      } else {
        const json = await res.json();
        showToast(json.error || json.message || 'Failed to add product', 'error');
        return;
      }
    } catch (e) {}

    // Offline fallback mode
    const newId = (data.products.reduce((max, p) => (p.id || 0) > max ? p.id : max, 0)) + 1;
    const newProduct = { ...productData, id: newId };
    saveData({ ...data, products: [...data.products, newProduct] });
    showToast('Product added (local offline)!', 'success');
  };

  const updateProduct = async (id, updates) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await loadData();
        showToast('Product updated successfully!', 'success');
        return;
      } else {
        const json = await res.json();
        showToast(json.error || json.message || 'Failed to update product', 'error');
        return;
      }
    } catch (e) {}

    const updatedProducts = data.products.map(p => (p.id === id || p._id === id) ? { ...p, ...updates } : p);
    saveData({ ...data, products: updatedProducts });
    showToast('Product updated (local offline)!', 'success');
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await loadData();
        showToast('Product deleted!', 'info');
        return;
      } else {
        const json = await res.json();
        showToast(json.error || json.message || 'Failed to delete product', 'error');
        return;
      }
    } catch (e) {}

    const filtered = data.products.filter(p => p.id !== id && p._id !== id);
    saveData({ ...data, products: filtered });
    showToast('Product deleted (local offline)!', 'info');
  };

  const placeOrder = async (orderPayload) => {
    const { userId, userEmail, userName, items, paymentMethod } = orderPayload;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, items, paymentMethod })
      });
      if (res.ok) {
        await loadData();
        showToast('Order placed successfully!', 'success');
        return;
      } else {
        const json = await res.json();
        showToast(json.error || json.message || 'Failed to place order', 'error');
        return;
      }
    } catch (e) {}

    // Local offline order creation
    let maxId = data.orders.reduce((max, o) => (o.id || 0) > max ? o.id : max, 0);
    const now = new Date().toISOString().split('T')[0];
    const newOrders = [];
    const updatedProducts = [...data.products];

    for (let item of items) {
      maxId++;
      const prod = updatedProducts.find(p => p.id === item.productId || p._id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
      newOrders.push({
        id: maxId,
        userId: userId || 999,
        customerName: userName || 'Customer',
        customerEmail: userEmail || 'customer@nessa.com',
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Product',
        quantity: item.quantity,
        total: item.total,
        status: 'Pending',
        date: now,
        paymentMethod: paymentMethod || 'COD'
      });
    }

    saveData({
      ...data,
      products: updatedProducts,
      orders: [...data.orders, ...newOrders]
    });
    showToast('Order placed successfully (Offline)!', 'success');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await loadData();
        showToast(`Order #${orderId} set to ${newStatus}`, 'info');
        return;
      } else {
        const json = await res.json();
        showToast(json.error || json.message || 'Failed to update order status', 'error');
        return;
      }
    } catch (e) {}

    const updatedOrders = data.orders.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: newStatus } : o);
    saveData({ ...data, orders: updatedOrders });
    showToast(`Order #${orderId} set to ${newStatus} (local)`, 'info');
  };

  const registerUserInDB = async (userData) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const json = await res.json();
        await loadData();
        return json.user;
      } else {
        const json = await res.json();
        throw new Error(json.error || 'Registration failed');
      }
    } catch (e) {
      if (e.message) throw e;
    }

    const maxId = data.users.reduce((max, u) => u.id > max ? u.id : max, 0);
    const newUser = { id: maxId + 1, name: userData.name, email: userData.email, password: userData.password, role: 'Customer' };
    saveData({ ...data, users: [...data.users, newUser] });
    return newUser;
  };

  return (
    <DataContext.Provider
      value={{
        users: data.users || [],
        products: data.products || [],
        orders: data.orders || [],
        salesReports: data.salesReports || [],
        loading,
        apiError,
        toastMessage,
        showToast,
        loadData,
        addProduct,
        updateProduct,
        deleteProduct,
        placeOrder,
        updateOrderStatus,
        registerUserInDB
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
