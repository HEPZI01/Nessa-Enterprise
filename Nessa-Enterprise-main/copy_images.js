const fs = require('fs');
const path = require('path');

const srcFiles = [
    { src: 'C:/Users/LENOVO/.gemini/antigravity/brain/e9f70010-ff52-4d43-8232-379ce08f1df0/borewell_submersible_pump_1773759555325.png', dest: 'images/products/borewell.png' },
    { src: 'C:/Users/LENOVO/.gemini/antigravity/brain/e9f70010-ff52-4d43-8232-379ce08f1df0/openwell_submersible_pump_1773759587454.png', dest: 'images/products/openwell.png' },
    { src: 'C:/Users/LENOVO/.gemini/antigravity/brain/e9f70010-ff52-4d43-8232-379ce08f1df0/monoblock_pump_1773759608341.png', dest: 'images/products/monoblock.png' },
    { src: 'C:/Users/LENOVO/.gemini/antigravity/brain/e9f70010-ff52-4d43-8232-379ce08f1df0/domestic_pump_1773759629964.png', dest: 'images/products/domestic.png' },
    { src: 'C:/Users/LENOVO/.gemini/antigravity/brain/e9f70010-ff52-4d43-8232-379ce08f1df0/solar_pump_system_1773759650361.png', dest: 'images/products/solar.png' }
];

srcFiles.forEach(file => {
    try {
        if (fs.existsSync(file.src)) {
            fs.copyFileSync(file.src, path.join(__dirname, file.dest));
            console.log(`Copied ${file.src} to ${file.dest}`);
        } else {
            console.error(`Source not found: ${file.src}`);
        }
    } catch (err) {
        console.error(`Failed to copy ${file.src}: ${err.message}`);
    }
});
