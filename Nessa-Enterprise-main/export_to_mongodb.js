const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to Excel database
const excelPath = path.join(__dirname, 'data', 'nessa_database.xlsx');

if (!fs.existsSync(excelPath)) {
  console.error('Error: nessa_database.xlsx not found at', excelPath);
  console.log('Please run "node generate_excel.js" first to create the Excel database.');
  process.exit(1);
}

const exportDir = path.join(__dirname, 'mongodb_export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

console.log('📖 Reading database from Excel:', excelPath);
const workbook = XLSX.readFile(excelPath);

const fullDatabase = {};

workbook.SheetNames.forEach((sheetName) => {
  const collectionName = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Clean data types (numbers, JSON arrays, IDs)
  const cleanedData = rawData.map((row) => {
    const cleanedRow = {};
    for (const key in row) {
      let val = row[key];
      // Convert numeric string to Number if applicable
      if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
        val = Number(val);
      }
      cleanedRow[key] = val;
    }
    return cleanedRow;
  });

  fullDatabase[collectionName] = cleanedData;

  // 1. Export as JSON Array (Standard JSON array, ready for mongoimport --jsonArray)
  const jsonArrayPath = path.join(exportDir, `${collectionName}.json`);
  fs.writeFileSync(jsonArrayPath, JSON.stringify(cleanedData, null, 2), 'utf8');

  // 2. Export as Line-Delimited JSON (NDJSON, standard mongoimport format)
  const ndjsonPath = path.join(exportDir, `${collectionName}.ndjson`);
  const ndjsonContent = cleanedData.map(item => JSON.stringify(item)).join('\n');
  fs.writeFileSync(ndjsonPath, ndjsonContent, 'utf8');

  console.log(`✅ Exported sheet "${sheetName}" -> ${cleanedData.length} documents`);
  console.log(`   └─ JSON Array: ${jsonArrayPath}`);
  console.log(`   └─ NDJSON:     ${ndjsonPath}`);
});

// Export combined database JSON file
const fullDbPath = path.join(exportDir, 'nessa_database_full.json');
fs.writeFileSync(fullDbPath, JSON.stringify(fullDatabase, null, 2), 'utf8');
console.log(`\n🎉 Combined MongoDB Database exported to: ${fullDbPath}`);
console.log(`\n--- Mongoimport Commands ---`);
workbook.SheetNames.forEach((sheetName) => {
  const collectionName = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  console.log(`mongoimport --db nessa_enterprise --collection ${collectionName} --file mongodb_export/${collectionName}.json --jsonArray`);
});
