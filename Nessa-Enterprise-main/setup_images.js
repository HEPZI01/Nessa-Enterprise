const fs = require('fs');
const path = require('path');

const dir = 'd:/Inventory/nessa-enterprise-dashboard/images/products';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Directory created:', dir);
} else {
    console.log('Directory already exists:', dir);
}
