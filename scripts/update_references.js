const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const mappingPath = path.join(rootDir, 'scripts', 'image_mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// High-fidelity manual metadata for top images
const manualSeo = {
    "images/banners/luxury-hero-bg.png": {
        alt: "Luxury modern cliffside villa at night with infinity pool and milky way sky",
        title: "Exclusive Cliffside Infinity Pool Villa"
    },
    "images/food/premium-burger-1781001141274.png": {
        alt: "The Emperor's Wagyu A5 Miyazaki Beef Burger with Truffle Brioche and Gold Leaf",
        title: "Premium A5 Wagyu Gourmet Burger"
    },
    "images/food/premium-pizza-1781001154978.png": {
        alt: "Authentic wood-fired Neapolitan pizza with fresh mozzarella and basil leaves",
        title: "Authentic Neapolitan Wood-Fired Pizza"
    },
    "images/banners/cappadocia-sunset-bg.png": {
        alt: "Hundreds of hot air balloons flying over Cappadocia landscape at sunrise",
        title: "Cappadocia Hot Air Balloon Experience"
    },
    "images/travel/ocean-beach-resort-1.jpg": {
        alt: "Crystal clear turquoise ocean waters at a luxury tropical beach resort",
        title: "Luxury Tropical Beach Resort Getaway"
    }
};

function getAltText(newPath) {
    if (manualSeo[newPath]) return manualSeo[newPath].alt;
    
    // Heuristic generation based on filename
    let base = path.basename(newPath, path.extname(newPath));
    // luxury-destination-vacation-1 -> Luxury Destination Vacation 1
    let alt = base.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return alt;
}

function getTitleText(newPath) {
    if (manualSeo[newPath]) return manualSeo[newPath].title;
    return getAltText(newPath); // Fallback to same as alt
}

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Reverse sort mapping by length to avoid partial replacements (e.g. replacing 'pic/profile.png' inside 'pic/profile.png.old')
    const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);

    for (const oldPath of sortedKeys) {
        const newPath = mapping[oldPath];
        
        // 1. Replace in HTML <img src="...">
        // We need a regex that matches src="oldPath" or src='oldPath' or src=/oldPath
        const htmlRegex = new RegExp(`(<img\\s+[^>]*?src=["'])${oldPath}(["'][^>]*?>)`, 'gi');
        content = content.replace(htmlRegex, (match, p1, p2) => {
            let tag = p1 + newPath + p2;
            
            // Inject or replace alt attribute
            if (!tag.includes('alt=')) {
                tag = tag.replace('<img', `<img alt="${getAltText(newPath)}"`);
            } else {
                tag = tag.replace(/alt=["'][^"']*["']/i, `alt="${getAltText(newPath)}"`);
            }
            
            // Inject or replace title attribute
            if (!tag.includes('title=')) {
                tag = tag.replace('<img', `<img title="${getTitleText(newPath)}"`);
            } else {
                tag = tag.replace(/title=["'][^"']*["']/i, `title="${getTitleText(newPath)}"`);
            }
            
            // Inject loading attribute
            if (!tag.includes('loading=')) {
                tag = tag.replace('<img', `<img loading="lazy"`);
            }
            
            return tag;
        });

        // 2. Replace generic string occurrences (CSS background: url('...'), JS arrays)
        // We match exact strings enclosed in quotes or parentheses to avoid partial replacements
        const genericRegex = new RegExp(`(['"\\(])\\s*${oldPath}\\s*(['"\\)])`, 'g');
        content = content.replace(genericRegex, `$1${newPath}$2`);
        
        // Handle CSS relative paths if necessary (style.css is in root so it's the same path)
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated references in ${filePath}`);
    }
}

// Process files
replaceInFile(path.join(rootDir, 'index.html'));
replaceInFile(path.join(rootDir, 'destination-details.html'));
replaceInFile(path.join(rootDir, 'style.css'));
replaceInFile(path.join(rootDir, 'script.js'));

console.log('Finished updating references and injecting SEO metadata.');
