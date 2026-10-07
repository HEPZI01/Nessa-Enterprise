
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.join(__dirname, 'data', 'nessa_database.xlsx');

if (!fs.existsSync(EXCEL_PATH)) {
  console.log('FILE NOT FOUND');
  process.exit(1);
}

const wb = XLSX.readFile(EXCEL_PATH);
const products = XLSX.utils.sheet_to_json(wb.Sheets['Products']);
console.log('First Product Name in Excel:', products[0] ? products[0].name : 'EMPTY');
console.log('Total Products in Excel:', products.length);
console.log('Timestamp:', fs.statSync(EXCEL_PATH).mtime);
