
const http = require('http');
const products = [
  {
    id: 1,
    name: 'CRI PCJS-8 Booster Pump with Pressure Tank',
    category: 'Booster Pump',
    price: 21242,
    stock: 18,
    power: '1 HP',
    description: 'Automatic pressure boosting for buildings, thermal overload protection.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
  },
  {
    id: 2,
    name: 'CRI VIRAT1532(AF)',
    category: 'Centrifugal Monoblock Pump',
    price: 13683,
    stock: 44,
    power: '1.5 HP',
    description: 'Used for water supply, irrigation and domestic pumping.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500'
  },
  {
    id: 3,
    name: 'CRI SELFY 50 Plus',
    category: 'Openwell Submersible Pump',
    price: 19864,
    stock: 35,
    power: '0.5 HP',
    description: 'Compact pump for wells and water tanks.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500'
  },
  {
    id: 4,
    name: 'CRI CRI4P-20-5 Submersible Pump',
    category: 'Borewell Submersible',
    price: 43652,
    stock: 10,
    power: '5 HP',
    description: 'High-efficiency multistage pump for deep borewells.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500'
  },
  {
    id: 5,
    name: 'CRI VIRAT525M(AF)',
    category: 'Centrifugal Monoblock Pump',
    price: 6069,
    stock: 60,
    power: '0.5 HP',
    description: 'Used for garden irrigation and domestic supply.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500'
  },
  {
    id: 6,
    name: 'CRI CSS-36J Pump',
    category: 'Openwell Submersible',
    price: 35520,
    stock: 20,
    power: '2 HP',
    description: 'Designed for open wells with fluctuating water level.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500'
  },
  {
    id: 7,
    name: 'CRI SLC-2D-18FT',
    category: 'Sewage Cutter Pump',
    price: 62392,
    stock: 8,
    power: '1.8 kW',
    description: 'Handles wastewater and sewage applications.',
    image: 'https://images.unsplash.com/photo-1603201667141-5a2d4c673b28?w=500'
  },
  {
    id: 8,
    name: 'CRI Genie CRI4R-3E',
    category: 'Borewell Submersible Pump',
    price: 23047,
    stock: 25,
    power: '2 HP',
    description: '14-stage water-filled pump for agriculture.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500'
  },
  {
    id: 9,
    name: 'CRI T/ACM-2',
    category: 'Centrifugal Monoblock Pump',
    price: 15389,
    stock: 50,
    power: '1 HP',
    description: 'Compact design suitable for continuous operation.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
  },
  {
    id: 10,
    name: 'CRI SL-2M-11DT',
    category: 'Large Sewage Pump',
    price: 20328,
    stock: 15,
    power: '1.1 kW',
    description: 'Used in sewage treatment plants.',
    image: 'https://images.unsplash.com/photo-1603201667141-5a2d4c673b28?w=500'
  },
  {
    id: 11,
    name: 'CRI Lena Series',
    category: 'Borewell Submersible Pump',
    price: 20000,
    stock: 45,
    power: '1–3 HP',
    description: 'Multistage centrifugal pump for groundwater extraction.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500'
  },
  {
    id: 12,
    name: 'CRI Zuno Lite Series',
    category: 'Borewell Submersible Pump',
    price: 17500,
    stock: 52,
    power: '1–2 HP',
    description: 'Energy-efficient agricultural pump.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500'
  },
  {
    id: 13,
    name: 'CRI Genie Series',
    category: 'Submersible Borewell Pump',
    price: 32500,
    stock: 24,
    power: '1–5 HP',
    description: 'Used for irrigation and farm water supply.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500'
  },
  {
    id: 14,
    name: 'CRI Steelix Series',
    category: 'Stainless Steel Submersible Pump',
    price: 57500,
    stock: 12,
    power: '2–7.5 HP',
    description: 'Corrosion-resistant stainless steel design.',
    image: 'https://images.unsplash.com/photo-1536939459926-301728717817?w=500'
  },
  {
    id: 15,
    name: 'CRI Nile Series',
    category: 'Submersible Pump',
    price: 80000,
    stock: 10,
    power: '3–10 HP',
    description: 'Used for large irrigation systems.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500'
  },
  {
    id: 16,
    name: 'CRI Ryker Series',
    category: 'Openwell Submersible Pump',
    price: 27500,
    stock: 33,
    power: '1–5 HP',
    description: 'High discharge pumps for agriculture.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500'
  },
  {
    id: 17,
    name: 'CRI Plano Series',
    category: 'Horizontal Openwell Pump',
    price: 21000,
    stock: 35,
    power: '1–3 HP',
    description: 'Works submerged inside tanks or wells.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
  },
  {
    id: 18,
    name: 'CRI Dino Series (SP)',
    category: 'Self-Priming Pump',
    price: 14000,
    stock: 65,
    power: '0.5–2 HP',
    description: 'Used for domestic water transfer.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500'
  },
  {
    id: 19,
    name: 'CRI Shalo Series',
    category: 'Centrifugal Pump',
    price: 17500,
    stock: 48,
    power: '1–3 HP',
    description: 'Domestic and small irrigation applications.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
  },
  {
    id: 20,
    name: 'CRI Jumbo Series',
    category: 'High Capacity Centrifugal Pump',
    price: 39000,
    stock: 20,
    power: '2–10 HP',
    description: 'Used in commercial and industrial pumping.',
    image: 'https://images.unsplash.com/photo-1536939459926-301728717817?w=500'
  },
  {
    id: 21,
    name: 'CRI Mini Pump',
    category: 'Compact Domestic Pump',
    price: 5500,
    stock: 90,
    power: '0.25–0.5 HP',
    description: 'Small water circulation and household use.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500'
  },
  {
    id: 22,
    name: 'CRI I-Smart Pump',
    category: 'Smart Pressure Pump',
    price: 26500,
    stock: 22,
    power: '0.5–1 HP',
    description: 'Includes smart controller with automation.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'
  },
  {
    id: 23,
    name: 'CRI Swimming Pool Pump (Vista Series)',
    category: 'Pool Circulation Pump',
    price: 35000,
    stock: 14,
    power: '0.5–2 HP',
    description: 'Used for filtration and recirculation.',
    image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=500'
  },
  {
    id: 24,
    name: 'CRI Wastewater Pump (MS/MP Series)',
    category: 'Wastewater Pump',
    price: 40000,
    stock: 25,
    power: '1–5 HP',
    description: 'For drainage and wastewater handling.',
    image: 'https://images.unsplash.com/photo-1603201667141-5a2d4c673b28?w=500'
  },
  {
    id: 25,
    name: 'CRI Solar Pumping System',
    category: 'Solar Water Pump',
    price: 180000,
    stock: 8,
    power: '1–20 HP',
    description: 'Solar powered pumping for farms and remote areas.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500'
  }
];

const users = [
  { id: 1, name: 'Admin User', email: 'admin@nessa.com', password: 'admin123', role: 'Admin' },
  { id: 6, name: 'Test Customer', email: 'customer@nessa.com', password: 'customer123', role: 'Customer' }
];

const data = JSON.stringify({
  users: users,
  products: CRI_PRODUCTS,
  orders: [],
  salesReports: []
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/import',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('API Response:', body);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Error connecting to server API:', e.message);
  process.exit(1);
});

console.log('Sending bulk import request to server...');
req.write(data);
req.end();
