const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const SalesReport = require('./models/SalesReport');

async function migrate() {
  console.log('🚀 Starting Excel to MongoDB Atlas Migration...');

  const excelPath = path.join(__dirname, 'data', 'nessa_database.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Error: ${excelPath} does not exist.`);
    process.exit(1);
  }

  await connectDB();

  console.log(`📖 Reading Excel database file: ${excelPath}`);
  const wb = XLSX.readFile(excelPath);

  const rawUsers = XLSX.utils.sheet_to_json(wb.Sheets['Users'] || wb.Sheets[wb.SheetNames[0]] || []);
  const rawProducts = XLSX.utils.sheet_to_json(wb.Sheets['Products'] || wb.Sheets[wb.SheetNames[1]] || []);
  const rawOrders = XLSX.utils.sheet_to_json(wb.Sheets['Orders'] || wb.Sheets[wb.SheetNames[2]] || []);
  const rawSales = XLSX.utils.sheet_to_json(wb.Sheets['SalesReports'] || wb.Sheets[wb.SheetNames[3]] || []);

  let usersMigrated = 0;
  let productsMigrated = 0;
  let ordersMigrated = 0;
  let salesMigrated = 0;

  // 1. Migrate Users
  for (const u of rawUsers) {
    if (!u.email) continue;
    const userData = {
      id: Number(u.id),
      name: u.name || 'User',
      email: String(u.email).trim().toLowerCase(),
      password: u.password || 'password123',
      role: u.role || 'Customer'
    };
    await User.updateOne({ email: userData.email }, { $set: userData }, { upsert: true });
    usersMigrated++;
  }

  // 2. Migrate Products
  for (const p of rawProducts) {
    if (!p.name) continue;
    const prodData = {
      id: Number(p.id),
      name: String(p.name).trim(),
      category: String(p.category || 'Uncategorized').trim(),
      price: Number(p.price) || 0,
      stock: Math.max(0, Number(p.stock) || 0),
      image: String(p.image || ''),
      description: String(p.description || '')
    };
    await Product.updateOne({ id: prodData.id }, { $set: prodData }, { upsert: true });
    productsMigrated++;
  }

  // Build maps for customer & product details on Orders
  const dbUsers = await User.find();
  const dbProducts = await Product.find();
  const userMap = {};
  dbUsers.forEach(u => { userMap[u.id] = u; });
  const productMap = {};
  dbProducts.forEach(p => { productMap[p.id] = p; });

  // 3. Migrate Orders
  for (const o of rawOrders) {
    const oId = Number(o.id);
    const uId = Number(o.userId || 1);
    const pId = Number(o.productId || 1);
    const matchedUser = userMap[uId];
    const matchedProd = productMap[pId];

    const orderData = {
      id: oId,
      userId: uId,
      customerName: o.customerName || (matchedUser ? matchedUser.name : 'Customer'),
      customerEmail: o.customerEmail || (matchedUser ? matchedUser.email : ''),
      productId: pId,
      productName: o.productName || (matchedProd ? matchedProd.name : `Product #${pId}`),
      quantity: Math.max(1, Number(o.quantity) || 1),
      total: Number(o.total) || 0,
      status: o.status || 'Pending',
      date: o.date || new Date().toISOString().split('T')[0],
      paymentMethod: o.paymentMethod || 'COD'
    };
    await Order.updateOne({ id: oId }, { $set: orderData }, { upsert: true });
    ordersMigrated++;
  }

  // 4. Migrate Sales Reports
  for (const s of rawSales) {
    if (!s.month) continue;
    const salesData = {
      month: String(s.month).trim(),
      revenue: Number(s.revenue) || 0,
      orders: Number(s.orders) || 0
    };
    await SalesReport.updateOne({ month: salesData.month }, { $set: salesData }, { upsert: true });
    salesMigrated++;
  }

  console.log('\n========================================');
  console.log(`Users migrated: ${usersMigrated}`);
  console.log(`Products migrated: ${productsMigrated}`);
  console.log(`Orders migrated: ${ordersMigrated}`);
  console.log(`Sales reports migrated: ${salesMigrated}`);
  console.log('Migration completed successfully.');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration Error:', err);
  process.exit(1);
});
