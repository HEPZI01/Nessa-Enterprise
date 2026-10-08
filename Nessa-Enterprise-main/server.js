const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const SalesReport = require('./models/SalesReport');
const { authenticateToken, authorizeRoles, JWT_SECRET } = require('./middleware/auth');

const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction && clientUrl
  ? [clientUrl, 'http://localhost:5173']
  : '*';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas / Server
connectDB().catch(err => {
  console.error('❌ Database initialization failed. Exiting process.');
  process.exit(1);
});

// Socket.IO Connection Event
io.on('connection', (socket) => {
  console.log('⚡ A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: isProduction && clientUrl ? [clientUrl, 'http://localhost:5173'] : true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Helper to safely build Mongoose filter for either legacy numeric 'id' or Mongoose '_id'
const buildIdFilter = (param) => {
  if (param === undefined || param === null) return null;
  const num = Number(param);
  if (!isNaN(num) && String(num) === String(param).trim()) {
    return { id: num };
  }
  if (mongoose.Types.ObjectId.isValid(param)) {
    return { _id: param };
  }
  return { id: param };
};

// Helper to sanitize & format database arrays for API consumption
const formatDoc = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  if (!obj.id && obj._id) {
    obj.id = obj._id.toString();
  }
  return obj;
};

// -----------------------------------------------------
// API ENDPOINTS (MongoDB Atlas Source of Truth)
// -----------------------------------------------------

// Get All Data (Sanitizes passwords)
app.get('/api/data', async (req, res) => {
  try {
    const [rawUsers, rawProducts, rawOrders, rawSales] = await Promise.all([
      User.find({}, '-password').sort({ id: 1 }),
      Product.find().sort({ id: 1 }),
      Order.find().sort({ id: 1 }),
      SalesReport.find().sort({ month: 1 })
    ]);

    const users = rawUsers.map(formatDoc);
    const products = rawProducts.map(formatDoc);
    const orders = rawOrders.map(formatDoc);
    const salesReports = rawSales.map(formatDoc);

    res.json({ users, products, orders, salesReports });
  } catch (err) {
    console.error('Error in /api/data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Analytics: Revenue Performance Trend (Monthly)
app.get('/api/v1/orders/analytics/revenue', async (req, res) => {
  try {
    const orders = await Order.find();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const monthlyMap = {};
    monthNames.forEach(m => {
      monthlyMap[m] = { month: m, revenue: 0, orders: 0 };
    });

    if (orders && orders.length > 0) {
      orders.forEach(order => {
        let monthName = null;
        if (order.date) {
          const d = new Date(order.date);
          if (!isNaN(d.getTime())) {
            monthName = monthNames[d.getMonth()];
          }
        }
        if (monthName && monthlyMap[monthName]) {
          monthlyMap[monthName].revenue += parseFloat(order.total || 0);
          monthlyMap[monthName].orders += 1;
        }
      });
    }

    const revenueData = monthNames.map(m => monthlyMap[m]);
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    res.json({
      success: true,
      totalRevenue,
      monthlyRevenue: revenueData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dashboard Consolidated Stats API
app.get('/api/v1/dashboard/stats', async (req, res) => {
  try {
    const [orders, products, users] = await Promise.all([
      Order.find(),
      Product.find(),
      User.find({}, '-password')
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => parseInt(p.stock || 0) < 10).length;

    const orderStatuses = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0
    };

    orders.forEach(o => {
      const status = o.status || 'Pending';
      if (orderStatuses[status] !== undefined) {
        orderStatuses[status]++;
      } else if (status === 'Shipped') {
        orderStatuses['Out for Delivery']++;
      } else {
        orderStatuses['Pending']++;
      }
    });

    const customers = users.filter(u => (u.role || '').toLowerCase() === 'customer');
    const orderUserIds = new Set(orders.map(o => o.userId || o.customerEmail).filter(Boolean));

    const categories = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + parseInt(p.stock || 0);
    });

    res.json({
      success: true,
      kpis: {
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount
      },
      customers: {
        totalCustomers: Math.max(customers.length, orderUserIds.size),
        activeCustomers: orderUserIds.size
      },
      orderStatuses,
      categories
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login User (Server-Side Bcrypt & JWT Authentication against MongoDB)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role || 'Customer' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'Customer'
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Register a User (Bcrypt Password Hashing & JWT)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const maxUser = await User.findOne().sort({ id: -1 });
    const nextId = (maxUser && maxUser.id ? maxUser.id : 0) + 1;

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await User.create({
      id: nextId,
      name: String(name).trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'Customer'
    });

    const token = jwt.sign(
      { id: newUser.id || newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Add a Product (Requires Admin, Manager, or Staff role)
app.post('/api/products', authenticateToken, authorizeRoles('Admin', 'Manager', 'Staff'), async (req, res) => {
  try {
    const newProductData = req.body;
    const maxProd = await Product.findOne().sort({ id: -1 });
    const nextId = (maxProd && maxProd.id ? maxProd.id : 0) + 1;

    newProductData.id = nextId;
    newProductData.stock = Math.max(0, parseInt(newProductData.stock || 0, 10));
    newProductData.price = Math.max(0, parseFloat(newProductData.price || 0));

    const createdProduct = await Product.create(newProductData);
    res.json({ success: true, product: formatDoc(createdProduct) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a Product (Requires Admin, Manager, or Staff role)
app.put('/api/products/:id', authenticateToken, authorizeRoles('Admin', 'Manager', 'Staff'), async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ error: 'Invalid product ID' });

    const updates = { ...req.body };

    if (updates.stock !== undefined) {
      updates.stock = Math.max(0, parseInt(updates.stock, 10) || 0);
    }
    if (updates.price !== undefined) {
      updates.price = Math.max(0, parseFloat(updates.price) || 0);
    }

    const updated = await Product.findOneAndUpdate(filter, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });

    res.json({ success: true, product: formatDoc(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a Product (Requires Admin, Manager, or Staff role)
app.delete('/api/products/:id', authenticateToken, authorizeRoles('Admin', 'Manager', 'Staff'), async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ error: 'Invalid product ID' });

    const deleted = await Product.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place an Order (Requires Authentication - Customer, Staff, Manager, or Admin)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { userId, items, paymentMethod, customerName, customerEmail, deliveryPhone, deliveryAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    if (!deliveryPhone || !String(deliveryPhone).trim()) {
      return res.status(400).json({ error: 'Delivery phone number is required' });
    }

    if (!deliveryAddress || !String(deliveryAddress).trim()) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    // Step 12 Requirement: Validate stock availability FIRST before deducting or creating orders
    const productsToUpdate = [];
    for (let item of items) {
      const filter = buildIdFilter(item.productId);
      const product = filter ? await Product.findOne(filter) : null;

      if (!product) {
        return res.status(400).json({ error: `Product ID #${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }
      productsToUpdate.push({ product, quantity: item.quantity, total: item.total });
    }

    // Get max order ID
    const maxOrder = await Order.findOne().sort({ id: -1 });
    let maxOrderId = (maxOrder && maxOrder.id ? maxOrder.id : 0);

    const userFilter = userId ? buildIdFilter(userId) : null;
    const userDoc = userFilter ? await User.findOne(userFilter) : null;
    const nowIso = new Date().toISOString().split('T')[0];

    // Execute order creation & stock reduction safely
    for (let entry of productsToUpdate) {
      maxOrderId++;
      const { product, quantity, total } = entry;

      // Reduce stock safely
      product.stock = Math.max(0, product.stock - quantity);
      await product.save();

      await Order.create({
        id: maxOrderId,
        userId: userId || (userDoc ? userDoc.id : (req.user?.id || 999)),
        customerName: (customerName && String(customerName).trim()) || (userDoc ? userDoc.name : (req.user?.name || 'Customer')),
        customerEmail: (customerEmail && String(customerEmail).trim()) || (userDoc ? userDoc.email : (req.user?.email || '')),
        deliveryPhone: String(deliveryPhone).trim(),
        deliveryAddress: String(deliveryAddress).trim(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        total: total,
        status: 'Pending',
        date: nowIso,
        paymentMethod: paymentMethod || 'COD'
      });
    }

    // Broadcast new order socket notification
    io.emit('new_order', { message: 'A customer placed a new order!' });

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (err) {
    console.error('Order Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Requires Admin, Manager, or Staff role)
app.put('/api/orders/:id/status', authenticateToken, authorizeRoles('Admin', 'Manager', 'Staff'), async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ error: 'Invalid order ID' });

    const { status } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(filter, { $set: { status } }, { new: true });
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

    // Broadcast status update event to connected clients
    io.emit('order_status_updated', {
      orderId: updatedOrder.id,
      status,
      message: `Order #${updatedOrder.id} updated to ${status}`
    });

    res.json({ success: true, message: `Order #${updatedOrder.id} updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Import to MongoDB Atlas (Requires Admin role)
app.post('/api/import', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { users, products, orders, salesReports } = req.body;

    if (users && Array.isArray(users)) {
      for (let u of users) {
        if (u.email) {
          if (u.password && (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$'))) {
            u.password = await bcrypt.hash(u.password, 10);
          }
          await User.updateOne({ email: u.email.toLowerCase() }, { $set: u }, { upsert: true });
        }
      }
    }

    if (products && Array.isArray(products)) {
      for (let p of products) {
        if (p.name) {
          await Product.updateOne({ id: p.id }, { $set: p }, { upsert: true });
        }
      }
    }

    if (orders && Array.isArray(orders)) {
      for (let o of orders) {
        if (o.id) {
          await Order.updateOne({ id: o.id }, { $set: o }, { upsert: true });
        }
      }
    }

    if (salesReports && Array.isArray(salesReports)) {
      for (let s of salesReports) {
        if (s.month) {
          await SalesReport.updateOne({ month: s.month }, { $set: s }, { upsert: true });
        }
      }
    }

    // Broadcast update notification
    io.emit('data_synced', { message: 'Database was updated via import!' });

    res.json({ success: true, message: 'Database updated successfully in MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`   MongoDB Atlas Primary DB active. Socket.IO & JWT Auth enabled.`);
});
