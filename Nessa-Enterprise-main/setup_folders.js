const fs = require('fs');
const path = require('path');

const root = 'd:/Inventory/nessa-enterprise-dashboard';
const imagesDir = path.join(root, 'images');
const productsDir = path.join(imagesDir, 'products');

try {
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
    if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir);
    
    console.log('Successfully created/verified folders.');
    console.log('Contents of root:', fs.readdirSync(root));
} catch (err) {
    console.error('Error:', err.message);
}
