const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'index.html');
const scriptFile = path.join(__dirname, '..', 'script.js');

let htmlContent = fs.readFileSync(indexFile, 'utf8');
let jsContent = fs.readFileSync(scriptFile, 'utf8');

const specificReplacements = {
    'luxury-destination-vacation-1.png': {
        title: 'Kyoto Zen Temple',
        country: 'Japan',
        desc: 'Experience the serene beauty of traditional Japanese pagodas surrounded by vibrant spring cherry blossoms.'
    },
    'luxury-destination-vacation-2.png': {
        title: "St. Stephen's Cathedral",
        country: 'Austria',
        desc: 'Discover the stunning Gothic architecture and colorful tiled roofs in the heart of historic Vienna.'
    },
    'luxury-destination-vacation-3.png': {
        title: 'Sydney Harbour',
        country: 'Australia',
        desc: 'Take in the breathtaking sunset views of the iconic Opera House and Sydney Harbour Bridge.'
    },
    'luxury-destination-vacation-4.png': {
        title: 'The Colosseum',
        country: 'Italy',
        desc: 'Step back in time at this ancient Roman amphitheater glowing beautifully in the sunset light.'
    },
    'luxury-destination-vacation-5.png': {
        title: 'Hyangwonjeong Pavilion',
        country: 'South Korea',
        desc: 'Relax by the tranquil lake reflecting traditional architecture with the N Seoul Tower in the distance.'
    },
    'luxury-destination-vacation-6.png': {
        title: 'Dubai Skyline',
        country: 'UAE',
        desc: 'Marvel at the futuristic cityscape and the towering Burj Khalifa rising above the sparkling marina.'
    }
};

const genericLuxuryLocations = [
    { title: 'Maldives Overwater Bungalow', country: 'Maldives', desc: 'Relax in an exclusive overwater villa surrounded by crystal clear turquoise waters.' },
    { title: 'Swiss Alps Ski Lodge', country: 'Switzerland', desc: 'Enjoy premium alpine luxury and breathtaking snowy peaks from a cozy modern lodge.' },
    { title: 'Santorini Sunset Villa', country: 'Greece', desc: 'Soak in the iconic white and blue architecture against the brilliant Mediterranean sunset.' },
    { title: 'Bali Jungle Resort', country: 'Indonesia', desc: 'Find inner peace in a secluded jungle sanctuary surrounded by lush tropical greenery.' },
    { title: 'Parisian Boutique Hotel', country: 'France', desc: 'Experience the romance of the city with elegant suites and classic French dining.' },
    { title: 'Tulum Beach Retreat', country: 'Mexico', desc: 'Unwind at an eco-chic beachfront sanctuary blending bohemian design and natural beauty.' },
    { title: 'Amalfi Coast Getaway', country: 'Italy', desc: 'Drive along dramatic coastal cliffs and stay in vibrant seaside pastel villages.' },
    { title: 'Bora Bora Lagoon', country: 'French Polynesia', desc: 'Dive into pristine coral reefs right from your private luxury island deck.' },
    { title: 'Banff Mountain Retreat', country: 'Canada', desc: 'Immerse yourself in spectacular glacial lakes and towering Rocky Mountain peaks.' },
    { title: 'Fiji Private Island', country: 'Fiji', desc: 'Escape to a completely secluded tropical paradise with world-class personalized service.' },
    { title: 'Marrakech Luxury Riad', country: 'Morocco', desc: 'Discover vibrant culture, hidden courtyards, and exquisite traditional architecture.' },
    { title: 'Seychelles Seaside Estate', country: 'Seychelles', desc: 'Walk along untouched white-sand beaches with giant granite boulders.' },
    { title: 'Kyoto Ryokan Getaway', country: 'Japan', desc: 'Enjoy traditional hospitality, hot springs, and perfectly manicured Zen gardens.' },
    { title: 'New York Penthouse', country: 'USA', desc: 'Take in unmatched panoramic views of the city skyline from unparalleled heights.' }
];

let genericIndex = 0;

const regex = /<div class="destination-card"[\s\S]*?<img[\s\S]*?src="([^"]+)"[\s\S]*?<span class="category"[^>]*>([^<]+)<\/span>\s*<h3>([^<]+)<\/h3>\s*<p[^>]*>([^<]+)<\/p>/g;

let updatedHtml = htmlContent.replace(regex, (match, src, oldCategory, oldTitle, oldDesc) => {
    // Only replace if it looks like the placeholder
    if (!oldTitle.toLowerCase().includes('mahagama') && !oldTitle.toLowerCase().includes('urjanagar')) {
        return match; // keep original if it doesn't have the dummy text
    }

    let data;
    const basename = src.split('/').pop();
    
    if (specificReplacements[basename]) {
        data = specificReplacements[basename];
    } else {
        data = genericLuxuryLocations[genericIndex % genericLuxuryLocations.length];
        genericIndex++;
    }

    let newMatch = match.replace(oldCategory, data.country);
    newMatch = newMatch.replace(oldTitle, data.title);
    newMatch = newMatch.replace(oldDesc, data.desc);
    return newMatch;
});

// Also replace simple JS occurrences
jsContent = jsContent.replace(/"name":\s*"Ganga Sagar mahagama"/g, '"name": "Tropical Beach Getaway"');
jsContent = jsContent.replace(/"name":\s*"shimda pahad mahagama"/g, '"name": "Mountain Peak Retreat"');
jsContent = jsContent.replace(/"name":\s*"ECO park urjanagar"/g, '"name": "Eco Nature Park"');
jsContent = jsContent.replace(/"name":\s*"mela maidan urjanagar"/g, '"name": "Cultural Plaza Festival"');
jsContent = jsContent.replace(/'ganga sagar':\s*'mahagama'/g, "'tropical beach': 'getaway'");

fs.writeFileSync(indexFile, updatedHtml);
fs.writeFileSync(scriptFile, jsContent);

console.log('Fixed dummy text in index.html and script.js!');
