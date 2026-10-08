/**
 * Excel Service Module - Nessa Enterprise Dashboard
 * Handles reading and parsing Excel data using SheetJS
 */

const ExcelService = (() => {
  const DATA_PATH = 'data/nessa_database.xlsx';
  let cachedData = null;

  // Generate sample data in-memory (fallback when .xlsx file is not available)
  function generateSampleData() {
    const users = [
      { id: 1, name: 'Admin User', email: 'admin@nessa.com', password: 'admin123', role: 'Admin' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@nessa.com', password: 'sarah123', role: 'Manager' },
      { id: 3, name: 'James Wilson', email: 'james@nessa.com', password: 'james123', role: 'Staff' },
      { id: 4, name: 'Emily Davis', email: 'emily@nessa.com', password: 'emily123', role: 'Staff' },
      { id: 5, name: 'Michael Brown', email: 'michael@nessa.com', password: 'michael123', role: 'Manager' },
      { id: 6, name: 'Test Customer', email: 'customer@nessa.com', password: 'customer123', role: 'Customer' }
    ];

    const categories = ['Submersible Pump', 'Openwell Pump', 'Monoblock Pump', 'Domestic Pump', 'Self Priming Pump', 'Jet Pump', 'Smart IoT Pump', 'Booster System', 'Pool Pump', 'Solar System'];
    const productNames = [
      ['Lena Series Borewell Submersible Pump', 'Submersible Pump', 18000, 45, 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'],
      ['Zuno Lite Series Borewell Submersible Pump', 'Submersible Pump', 16500, 52, 'https://cdn.moglix.com/p/DyIVu3VaZbRyZ-large.jpg'],
      ['Lena+ Series Borewell Submersible Pump', 'Submersible Pump', 20000, 38, 'https://cdn.moglix.com/p/psvq6DLOzqttv-large.jpg'],
      ['Genie Series Borewell Submersible Pump', 'Submersible Pump', 22000, 24, 'https://cdn.moglix.com/p/znMu7c7wuIjVC-large.jpg'],
      ['Zuno Series Borewell Submersible Pump', 'Submersible Pump', 21000, 29, 'https://cdn.moglix.com/p/7WiKsPkpDiVTI-large.jpg'],
      ['Steelix Series Borewell Submersible Pump', 'Submersible Pump', 35000, 15, 'https://cdn.moglix.com/p/vOBjufdKe3f99-large.png'],
      ['Nile Series Borewell Submersible Pump', 'Submersible Pump', 45000, 10, 'https://cdn.moglix.com/p/HvotdQutwswmH-large.png'],
      ['Nile+ Series Borewell Submersible Pump', 'Submersible Pump', 48000, 12, 'https://cdn.moglix.com/p/b5t0gJ8GEnbKj-large.jpg'],
      ['Ryker Series Vertical Openwell Submersible Pump', 'Openwell Pump', 18500, 33, 'https://cdn.moglix.com/p/t17jVkK36RU9T-large.png'],
      ['LTK Series Vertical Openwell Submersible Pump', 'Openwell Pump', 17000, 27, 'https://cdn.moglix.com/p/PXZfo5UfRnAi1-large.png'],
      ['CV Series Openwell Submersible Pump', 'Openwell Pump', 16500, 40, 'https://cdn.moglix.com/p/DyIVu3VaZbRyZ-large.jpg'],
      ['CSM Series Horizontal Openwell Pump', 'Openwell Pump', 19000, 41, 'https://cdn.moglix.com/p/7WiKsPkpDiVTI-large.jpg'],
      ['CSM-J Series Openwell Pump', 'Openwell Pump', 20500, 18, 'https://cdn.moglix.com/p/vOBjufdKe3f99-large.png'],
      ['CSS Series Openwell Pump', 'Openwell Pump', 21000, 22, 'https://cdn.moglix.com/p/HvotdQutwswmH-large.png'],
      ['Plano Series Openwell Pump', 'Openwell Pump', 18500, 35, 'https://cdn.moglix.com/p/b5t0gJ8GEnbKj-large.jpg'],
      ['Dino Series Openwell Pump', 'Openwell Pump', 17800, 65, 'https://cdn.moglix.com/p/t17jVkK36RU9T-large.png'],
      ['ACM Series Centrifugal Monoblock Pump', 'Monoblock Pump', 9500, 50, 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'],
      ['Mini Monoblock Pump', 'Domestic Pump', 6000, 90, 'https://cdn.moglix.com/p/DyIVu3VaZbRyZ-large.jpg'],
      ['Regenerative Self Priming Monoset Pump', 'Self Priming Pump', 8200, 72, 'https://cdn.moglix.com/p/psvq6DLOzqttv-large.jpg'],
      ['Centrifugal Jet Self Priming Pump', 'Jet Pump', 9800, 48, 'https://cdn.moglix.com/p/znMu7c7wuIjVC-large.jpg'],
      ['Deepwell Centrifugal Jet Pump', 'Jet Pump', 12000, 55, 'https://cdn.moglix.com/p/7WiKsPkpDiVTI-large.jpg'],
      ['I-Smart Pump', 'Smart IoT Pump', 15500, 22, 'https://cdn.moglix.com/p/HvotdQutwswmH-large.png'],
      ['Pressure Booster System', 'Booster System', 35000, 18, 'https://cdn.moglix.com/p/b5t0gJ8GEnbKj-large.jpg'],
      ['Swimming Pool Pump', 'Pool Pump', 28000, 14, 'https://cdn.moglix.com/p/t17jVkK36RU9T-large.png'],
      ['Solar Pumping System', 'Solar System', 75000, 8, 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg']
    ];

    const products = productNames.map((p, i) => {
      const name = p[0];
      const basename = name.toLowerCase().split(' ')[0].replace('+', '-plus');
      return {
        id: i + 1,
        name: name,
        description: `High performance ${name.toLowerCase()} for industrial and domestic use.`,
        price: p[2],
        category: p[1],
        stock: p[3],
        image: `images/products/${basename}.png`, // Local-first
        fallback: p[4] // Verified CDN fallback
      };
    });

    const customerNames = [
      'Alice Cooper', 'Bob Martinez', 'Catherine Lee', 'David Kim', 'Eva Green',
      'Frank Wright', 'Grace Hall', 'Henry Adams', 'Ivy Nelson', 'Jack Turner',
      'Karen White', 'Leo Garcia', 'Mia Robinson', 'Nathan Scott', 'Olivia Perez',
      'Patrick Hill', 'Quinn Foster', 'Rachel King', 'Sam Morgan', 'Tina Brooks'
    ];

    const statuses = ['Pending', 'Shipped', 'Delivered'];

    const orders = [];
    let orderId = 1;
    for (let month = 0; month < 12; month++) {
      const ordersInMonth = Math.floor(Math.random() * 20) + 15;
      for (let j = 0; j < ordersInMonth; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 5) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const custIdx = Math.floor(Math.random() * customerNames.length);
        orders.push({
          id: orderId++,
          userId: custIdx + 1,
          customerName: customerNames[custIdx],
          customerEmail: customerNames[custIdx].toLowerCase().replace(' ', '.') + '@email.com',
          productId: product.id,
          productName: product.name,
          quantity: qty,
          total: parseFloat((product.price * qty).toFixed(2)),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          date: `2025-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        });
      }
    }

    // Sales Reports
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesReports = monthNames.map((month, i) => {
      const monthOrders = orders.filter(o => parseInt(o.date.split('-')[1]) === i + 1);
      return {
        month: month,
        revenue: parseFloat(monthOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)),
        orders: monthOrders.length
      };
    });

    return { users, products, orders, salesReports };
  }

  // Load from REST API
  async function loadFromExcel() {
    // Add timeout to prevent long hangs if backend is unreachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch('/api/data', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Backend not available.');

      const data = await response.json();
      
      const users = data.users || [];
      const products = data.products || [];
      const ordersRaw = data.orders || [];
      const salesReports = data.salesReports || [];

      // Enrich orders with product/customer names
      const orders = ordersRaw.map(order => {
        const product = products.find(p => p.id === order.productId);
        const user = users.find(u => u.id === order.userId);
        return {
          ...order,
          productName: product ? product.name : (order.productName || 'Unknown'),
          customerName: user ? user.name : (order.customerName || 'Unknown'),
          customerEmail: user ? user.email : (order.customerEmail || '')
        };
      });

      return { users, products, orders, salesReports };
    } catch (err) {
      console.warn('Backend API not available, falling back to local fallback data:', err.message);
      return null;
    }
  }

  function saveOfflineDB() {
    localStorage.setItem('nessa_offline_db', JSON.stringify(cachedData));
  }

  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    try {
      const raw = localStorage.getItem('nessa_jwt_token');
      if (raw) {
        const decoded = JSON.parse(raw);
        if (decoded && decoded.token) {
          headers['Authorization'] = `Bearer ${decoded.token}`;
        }
      }
    } catch(e) {}
    return headers;
  }

  // API Methods
  async function addProduct(product) {
    if (!cachedData) await loadData();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to add product');
      await loadData(true); // reload memory
      return await response.json();
    } catch(err) {
      console.warn("Backend unavailable. Simulating addProduct locally.");
      const maxId = cachedData.products.reduce((max, p) => p.id > max ? p.id : max, 0);
      product.id = maxId + 1;
      cachedData.products.push(product);
      saveOfflineDB();
      return { success: true, product, simulated: true };
    }
  }

  async function updateProduct(id, updates) {
    if (!cachedData) await loadData();
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update product');
      await loadData(true); // reload memory
      return await response.json();
    } catch(err) {
      console.warn("Backend unavailable. Simulating updateProduct locally.");
      const index = cachedData.products.findIndex(p => p.id === id);
      if (index !== -1) {
        cachedData.products[index] = { ...cachedData.products[index], ...updates };
      }
      saveOfflineDB();
      return { success: true, simulated: true };
    }
  }

  async function deleteProduct(id) {
    if (!cachedData) await loadData();
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await loadData(true); // reload memory
      return await response.json();
    } catch(err) {
      console.warn("Backend unavailable. Simulating deleteProduct locally.");
      cachedData.products = cachedData.products.filter(p => p.id !== id);
      saveOfflineDB();
      return { success: true, simulated: true };
    }
  }

  async function placeOrder(orderData) {
    if (!cachedData) await loadData();
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to place order');
      }
      await loadData(true); // reload memory
      return await response.json();
    } catch(err) {
      console.warn("Backend unavailable. Simulating placeOrder locally.", err.message);
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('Backend unavailable')) {
        throw err;
      }
      const { userId, items, paymentMethod, customerName, customerEmail, deliveryPhone, deliveryAddress } = orderData;
      let maxOrderId = cachedData.orders.reduce((max, o) => o.id > max ? o.id : max, 0);
      const nowIso = new Date().toISOString().split('T')[0];
      for (let item of items) {
        maxOrderId++;
        cachedData.orders.push({
          id: maxOrderId,
          userId: userId || 999,
          customerName: customerName || 'Customer',
          customerEmail: customerEmail || '',
          deliveryPhone: deliveryPhone || '',
          deliveryAddress: deliveryAddress || '',
          productId: item.productId,
          quantity: item.quantity,
          total: item.total,
          status: 'Pending',
          date: nowIso,
          paymentMethod: paymentMethod || 'COD'
        });
        const prod = cachedData.products.find(p => p.id === item.productId);
        if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
      }
      saveOfflineDB();
      return { success: true, simulated: true };
    }
  }

  async function registerUser(userData) {
    if (!cachedData) await loadData();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      let result;
      try { result = await response.json(); } catch(e) { throw new Error('Failed to reach the server properly.'); }
      if (!response.ok) throw new Error(result.error || 'Failed to register');
      await loadData(true); // reload memory
      return result;
    } catch(err) {
      console.warn("Backend unavailable. Simulating registration locally.");
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('server properly')) {
        throw err; // Real error from backend
      }
      const maxId = cachedData.users.reduce((max, u) => u.id > max ? u.id : max, 0);
      const newUser = { id: maxId + 1, name: userData.name, email: userData.email, password: userData.password, role: 'Customer' };
      cachedData.users.push(newUser);
      saveOfflineDB();
      return { success: true, user: newUser, simulated: true };
    }
  }

  // Main load function
  async function loadData(forceReload = false) {
    if (cachedData && !forceReload) return cachedData;

    // Try to load from backend API first
    let data = await loadFromExcel();

    // Always check for offline-registered data
    const offlineDB = localStorage.getItem('nessa_offline_db');
    let offlineData = null;
    if (offlineDB) {
      try { offlineData = JSON.parse(offlineDB); } catch(e) { offlineData = null; }
    }

    // Validation: If data is null or has no products/orders, it's not useful
    const isDataValid = data && (data.products && data.products.length > 0);

    if (data && isDataValid) {
      // Server data loaded successfully — merge any offline-registered users
      if (offlineData && offlineData.users) {
        offlineData.users.forEach(offlineUser => {
          const exists = data.users.find(u => u.email === offlineUser.email);
          if (!exists) {
            data.users.push(offlineUser);
          }
        });
      }
    } else if (offlineData && offlineData.products && offlineData.products.length > 0) {
      // No server — use offline data if it has products
      data = offlineData;
    } else {
      // Fallback: Generate real-looking sample data so the dashboard isn't empty
      console.log("Loading sample data fallback...");
      data = generateSampleData();
    }

    cachedData = data;
    
    // --- MANDATORY SYNC: Prioritize Local-First with Verified Fallbacks ---
    if (cachedData && cachedData.products) {
      const sample = generateSampleData();
      cachedData.products.forEach(p => {
        const matchingSample = sample.products.find(sp => sp.name.trim().toLowerCase() === p.name.trim().toLowerCase());
        if (matchingSample) {
          // 1. Ensure fallback is always present
          p.fallback = matchingSample.fallback;
          
          // 2. Set default local path if not already set or if it was a broken URL
          const basename = p.name.toLowerCase().split(' ')[0].replace('+', '-plus');
          const localPath = `images/products/${basename}.png`;
          
          if (!p.image || p.image.startsWith('http') || p.image.includes('placeholder')) {
             p.image = localPath;
          }
        }
      });
      saveOfflineDB();
    }
    
    return data;
  }

  // Getters
  function getUsers() { return cachedData ? cachedData.users : []; }
  function getProducts() { return cachedData ? cachedData.products : []; }
  function getOrders() { return cachedData ? cachedData.orders : []; }
  function getSalesReports() { return cachedData ? cachedData.salesReports : []; }

  // Computed analytics
  function getTotalRevenue() {
    return getOrders().reduce((sum, o) => sum + (o.total || 0), 0);
  }

  function getTotalOrders() {
    return getOrders().length;
  }

  function getTotalProducts() {
    return getProducts().length;
  }

  function getLowStockItems() {
    return getProducts().filter(p => p.stock < 10);
  }

  function getOutOfStockItems() {
    return getProducts().filter(p => p.stock === 0);
  }

  function getTopSellingProducts(limit = 5) {
    const productSales = {};
    getOrders().forEach(order => {
      if (!productSales[order.productName]) {
        productSales[order.productName] = 0;
      }
      productSales[order.productName] += order.quantity;
    });
    return Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, qty]) => ({ name, quantity: qty }));
  }

  function getCategoryStockDistribution() {
    const dist = {};
    getProducts().forEach(p => {
      if (!dist[p.category]) dist[p.category] = 0;
      dist[p.category] += p.stock;
    });
    return dist;
  }

  function getCustomerAnalytics() {
    const customers = {};
    getOrders().forEach(order => {
      const key = order.customerName;
      if (!customers[key]) {
        customers[key] = {
          name: order.customerName,
          email: order.customerEmail,
          totalOrders: 0,
          totalSpending: 0,
          lastOrderDate: order.date
        };
      }
      customers[key].totalOrders++;
      customers[key].totalSpending += order.total;
      if (order.date > customers[key].lastOrderDate) {
        customers[key].lastOrderDate = order.date;
      }
    });
    return Object.values(customers).sort((a, b) => b.totalSpending - a.totalSpending);
  }

  function getMonthlyGrowth() {
    const reports = getSalesReports();
    if (reports.length < 2) return 0;
    const current = reports[reports.length - 1].revenue;
    const previous = reports[reports.length - 2].revenue;
    if (previous === 0) return 100;
    return parseFloat(((current - previous) / previous * 100).toFixed(1));
  }

  function getAverageOrderValue() {
    const orders = getOrders();
    if (orders.length === 0) return 0;
    return (orders.reduce((sum, o) => sum + o.total, 0) / orders.length);
  }

  return {
    loadData,
    getUsers,
    getProducts,
    getOrders,
    getSalesReports,
    getTotalRevenue,
    getTotalOrders,
    getTotalProducts,
    getLowStockItems,
    getOutOfStockItems,
    getTopSellingProducts,
    getCategoryStockDistribution,
    getCustomerAnalytics,
    getMonthlyGrowth,
    getAverageOrderValue,
    generateSampleData,
    addProduct,
    updateProduct,
    deleteProduct,
    placeOrder,
    registerUser,
    async bulkImport(data) {
      try {
        const response = await fetch('http://localhost:3000/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to import data');
        await loadData(true); // reload memory
        return await response.json();
      } catch(err) {
        console.warn("Backend unavailable. Updating local storage for import.");
        cachedData = { ...cachedData, ...data };
        saveOfflineDB();
        return { success: true, simulated: true };
      }
    }
  };
})();
