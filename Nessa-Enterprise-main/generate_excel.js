
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// ===== USERS =====
const users = [
  { id: 1, name: 'Admin User', email: 'admin@nessa.com', password: 'admin123', role: 'Admin' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@nessa.com', password: 'sarah123', role: 'Manager' },
  { id: 3, name: 'James Wilson', email: 'james@nessa.com', password: 'james123', role: 'Staff' },
  { id: 4, name: 'Emily Davis', email: 'emily@nessa.com', password: 'emily123', role: 'Staff' },
  { id: 5, name: 'Michael Brown', email: 'michael@nessa.com', password: 'michael123', role: 'Manager' },
  { id: 6, name: 'Test Customer', email: 'customer@nessa.com', password: 'customer123', role: 'Customer' }
];

// ===== NEW PRODUCTS (CRI PUMPS) =====
const productData = [
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

const products = productData.map((item, index) => ({
  id: index + 1,
  name: item[0],
  category: item[1],
  price: item[2],
  stock: item[3],
  description: `${item[0]} is a high-performance pump for various applications.`, // Generic description as it's not provided in the new data
  image: item[4]
}));

// ===== ORDERS =====
const statuses = ['Pending', 'Shipped', 'Delivered'];
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rng = seededRandom(42);

const orders = [];
let orderId = 1;
for (let month = 0; month < 12; month++) {
  const ordersInMonth = Math.floor(rng() * 15) + 10;
  for (let j = 0; j < ordersInMonth; j++) {
    const product = products[Math.floor(rng() * products.length)];
    const qty = Math.floor(rng() * 2) + 1;
    const day = Math.floor(rng() * 28) + 1;
    const custId = Math.floor(rng() * 6) + 1;
    orders.push({
      id: orderId++,
      userId: custId,
      productId: product.id,
      quantity: qty,
      total: parseFloat((product.price * qty).toFixed(2)),
      status: statuses[Math.floor(rng() * statuses.length)],
      paymentMethod: ['UPI', 'COD', 'Card'][Math.floor(rng() * 3)],
      date: `2025-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }
}

// ===== SALES REPORTS =====
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const salesReports = monthNames.map((month, i) => {
  const monthOrders = orders.filter(o => parseInt(o.date.split('-')[1]) === i + 1);
  return {
    month: month,
    revenue: parseFloat(monthOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)),
    orders: monthOrders.length
  };
});

// ===== CREATE WORKBOOK =====
const wb = XLSX.utils.book_new();

const wsUsers = XLSX.utils.json_to_sheet(users);
XLSX.utils.book_append_sheet(wb, wsUsers, 'Users');

const wsProducts = XLSX.utils.json_to_sheet(products);
XLSX.utils.book_append_sheet(wb, wsProducts, 'Products');

const wsOrders = XLSX.utils.json_to_sheet(orders);
XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders');

const wsSales = XLSX.utils.json_to_sheet(salesReports);
XLSX.utils.book_append_sheet(wb, wsSales, 'SalesReports');

// Write file
const outputPath = path.join(__dirname, 'data', 'nessa_database.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Final CRI Pumps Database Generated Successfully!');
console.log(`   - File: ${outputPath}`);
console.log(`   - Products replaced with 25 CRI Pump models.`);