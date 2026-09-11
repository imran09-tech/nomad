const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const imagesDir = path.join(rootDir, 'images');

// Folders to create
const dirs = ['travel', 'hotels', 'food', 'restaurants', 'users', 'icons', 'banners'];
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}
dirs.forEach(d => {
    const target = path.join(imagesDir, d);
    if (!fs.existsSync(target)) fs.mkdirSync(target);
});

// Heuristics map
// Maps current folder or name substring to target folder and SEO prefix
const rules = [
    { source: 'destination', target: 'travel', prefix: 'luxury-destination-vacation-' },
    { source: 'nature', target: 'travel', prefix: 'beautiful-nature-landscape-' },
    { source: 'mountain', target: 'travel', prefix: 'scenic-mountain-view-' },
    { source: 'sea', target: 'travel', prefix: 'ocean-beach-resort-' },
    { source: 'planets', target: 'travel', prefix: 'stargazing-experience-' },
    { source: 'hotel', target: 'hotels', prefix: 'premium-hotel-suite-' },
    { source: 'food', target: 'food', prefix: 'gourmet-restaurant-meal-' },
    { source: 'pic', target: 'users', prefix: 'verified-traveler-review-' },
];

let mapping = {};
let imageCount = 0;

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!['images', 'node_modules', '.git', '.dist', 'dist', 'scripts'].includes(file)) {
                walkDir(fullPath);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
                processImage(fullPath, dir, file, ext);
            }
        }
    }
}

function processImage(fullPath, dir, file, ext) {
    // Determine relative path from root
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
    if (relPath.startsWith('images/')) return; // Already processed
    
    let targetFolder = 'banners';
    let prefix = 'nomad-travel-';
    
    // Check rules
    for (const rule of rules) {
        if (relPath.startsWith(rule.source + '/')) {
            targetFolder = rule.target;
            prefix = rule.prefix;
            break;
        }
    }

    // Special root files
    if (file.includes('bg') || file.includes('banner')) targetFolder = 'banners';
    if (file.includes('burger')) { targetFolder = 'food'; prefix = 'premium-burger-delivery-'; }
    if (file.includes('pizza')) { targetFolder = 'food'; prefix = 'authentic-italian-pizza-'; }
    if (file.includes('biryani')) { targetFolder = 'food'; prefix = 'spicy-chicken-biryani-'; }

    // Generate new name
    const idMatch = file.match(/\d+/);
    const id = idMatch ? idMatch[0] : Math.floor(Math.random() * 1000).toString(); // extract number if exists
    let newFilename = `${prefix}${id}${ext}`;
    
    // If it's a specific named root image
    if (!relPath.includes('/')) {
        let base = path.basename(file, ext);
        newFilename = base.replace(/_/g, '-') + ext; // luxury_nature_bg.png -> luxury-nature-bg.png
    }

    const newRelPath = `images/${targetFolder}/${newFilename}`;
    const targetPath = path.join(rootDir, newRelPath);

    // Make sure filename is unique
    let finalPath = targetPath;
    let finalRelPath = newRelPath;
    let counter = 1;
    while (fs.existsSync(finalPath) && finalPath !== fullPath) {
        const nameWithoutExt = path.basename(newFilename, ext);
        finalPath = path.join(rootDir, `images/${targetFolder}/${nameWithoutExt}-${counter}${ext}`);
        finalRelPath = `images/${targetFolder}/${nameWithoutExt}-${counter}${ext}`;
        counter++;
    }

    // Move file
    fs.renameSync(fullPath, finalPath);
    
    mapping[relPath] = finalRelPath;
    imageCount++;
    console.log(`Moved: ${relPath} -> ${finalRelPath}`);
}

walkDir(rootDir);

fs.writeFileSync(path.join(rootDir, 'scripts', 'image_mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`\nMigration complete. Processed ${imageCount} images. Mapping saved.`);
