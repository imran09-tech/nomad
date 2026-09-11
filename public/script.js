
function getApiUrl(path) {
    if (window.location.port === '5000') {
        return path;
    }
    const host = window.location.hostname || 'localhost';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${host}:5000${path}`;
}

function dedupeItems(arr) {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    return arr.filter(item => {
        if (!item || !item.img) return false;
        const cleanImg = String(item.img).replace(/^(\.\.\/|\.\/)+/, '').toLowerCase().split('?')[0].trim();
        const cleanName = String(item.name || '').toLowerCase().trim();
        const key = `${cleanName}|${cleanImg}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ==========================================
// STORE & DATA MANAGEMENT
const Store = {
    VERSION: 530,

    init() {
        const ver = parseInt(localStorage.getItem('imxx_version') || '0');
        if (ver < this.VERSION) {
            this.seedData();
            localStorage.setItem('imxx_version', this.VERSION.toString());
        }
        this.loadState();
    },

    state: {
        destinations: [], hotels: [], foodItems: [], flights: [], trains: [], buses: [],
        cart: [], wishlist: [], bookings: [], orders: [],
        currentUser: null,
        settings: { darkMode: true, language: 'en', notifEmail: true, notifSms: false },
        currentView: 'home',
        foodCategory: 'all',
        currentTransportMode: 'flight'
    },

    seedData() {
        const dests = [
            { id: 'd1',  name: "Dolomite Peaks",      location: "Italy",          rating: 5.0, price: 3500, img: "../pic/mountain/m1.jpg",  desc: "Breathtaking alpine valleys with luxury chalets and world-class skiing.",       category: "mountains" },
            { id: 'd2',  name: "Banff Highland",       location: "Canada",         rating: 4.9, price: 15000, img: "../pic/mountain/m2.jpg",  desc: "Crystal-clear turquoise lakes surrounded by snow-capped Rocky peaks.",          category: "mountains" },
            { id: 'd3',  name: "Matterhorn Vista",     location: "Switzerland",    rating: 4.9, price: 12000, img: "../pic/mountain/m3.jpg",  desc: "Iconic alpine scenery with private ski chalets and gourmet fondue.",            category: "mountains" },
            { id: 'd4',  name: "Himalayan Retreat",    location: "Nepal",          rating: 4.8, price: 899, img: "../pic/mountain/m4.jpg",  desc: "Serene mountain sanctuary with panoramic Everest views.",                       category: "mountains" },
            { id: 'd5',  name: "Rockies Escape",       location: "USA",            rating: 4.7, price: 2500, img: "../pic/mountain/m5.jpg",  desc: "Rugged wilderness with private cabins and helicopter tours.",                   category: "mountains" },
            { id: 'dm6',  name: "Snowy Summit",       location: "Alps",           rating: 4.8, price: 2500, img: "../pic/mountain/m6.jpg",  desc: "Experience the pure mountain air at this majestic snowy summit.", category: "mountains" },
            { id: 'dm7',  name: "Glacier Peak",       location: "Andes",          rating: 4.9, price: 5000, img: "../pic/mountain/m7.jpg",  desc: "Breathtaking views of ancient glaciers and rugged terrain.", category: "mountains" },
            { id: 'dm8',  name: "Highland Ridge",     location: "Scotland",       rating: 4.7, price: 1500, img: "../pic/mountain/m8.jpg",  desc: "Rolling misty mountains and deep valleys for the perfect escape.", category: "mountains" },
            { id: 'dm9',  name: "Alpine Valley",      location: "Austria",        rating: 4.8, price: 4500, img: "../pic/mountain/m9.jpg",  desc: "A lush valley surrounded by towering alpine peaks.", category: "mountains" },
            { id: 'dm10', name: "Rocky Ascent",       location: "Colorado, USA",  rating: 4.6, price: 12000, img: "../pic/mountain/m10.jpg", desc: "Challenging trails leading to spectacular mountain lookouts.", category: "mountains" },
            { id: 'dm11', name: "Misty Mountain",     location: "New Zealand",    rating: 4.9, price: 8000, img: "../pic/mountain/m11.jpg", desc: "Mysterious peaks wrapped in clouds, perfect for explorers.", category: "mountains" },
            { id: 'dm12', name: "Eagle's Nest",       location: "Germany",        rating: 4.8, price: 5000, img: "../pic/mountain/m12.jpg", desc: "Perched high above the valley with unmatched panoramic views.", category: "mountains" },
            { id: 'dm13', name: "Sierra Nevada",      location: "Spain",          rating: 4.7, price: 8000, img: "../pic/mountain/m13.jpg", desc: "Sun-drenched mountains offering unique trails and culture.", category: "mountains" },
            { id: 'dm14', name: "Mount Fuji View",    location: "Japan",          rating: 5.0, price: 2500, img: "../pic/mountain/m14.jpg", desc: "Iconic volcanic mountain with serene surrounding lakes.", category: "mountains" },
            { id: 'dm15', name: "Andean Heights",     location: "Peru",           rating: 4.9, price: 4500, img: "../pic/mountain/m15.jpg", desc: "High-altitude adventures among ancient ruins and peaks.", category: "mountains" },
            { id: 'dm16', name: "Carpathian Wild",    location: "Romania",        rating: 4.6, price: 1200,  img: "../pic/mountain/m16.jpg", desc: "Untamed mountain wilderness rich in wildlife and legends.", category: "mountains" },
            { id: 'dm17', name: "Tatra Mountains",    location: "Slovakia",       rating: 4.8, price: 12000, img: "../pic/mountain/m17.jpg", desc: "Dramatic rocky peaks and crystal clear mountain lakes.", category: "mountains" },
            { id: 'dm18', name: "Pyrenees Pass",      location: "France/Spain",   rating: 4.7, price: 2200, img: "../pic/mountain/m18.jpg", desc: "A rugged natural border offering thrilling hikes and views.", category: "mountains" },
            { id: 'dm19', name: "Caucasus Summit",    location: "Georgia",        rating: 4.8, price: 3500, img: "../pic/mountain/m19.jpg", desc: "Discover the hidden gems of these towering, majestic peaks.", category: "mountains" },
            { id: 'dm20', name: "Atlas Mountains",    location: "Morocco",        rating: 4.6, price: 2200,  img: "../pic/mountain/m20.jpg", desc: "Stark and beautiful mountains rising from the desert landscape.", category: "mountains" },
            { id: 'dm21', name: "Southern Alps",      location: "New Zealand",    rating: 4.9, price: 4500, img: "../pic/mountain/m21.jpg", desc: "Spectacular glaciated mountain ranges and deep fjords.", category: "mountains" },
            { id: 'dm22', name: "Drakensberg",        location: "South Africa",   rating: 4.7, price: 3000, img: "../pic/mountain/m22.jpg", desc: "The 'Dragon Mountains' with dramatic basalt cliffs.", category: "mountains" },
            { id: 'dm23', name: "Tien Shan",          location: "Kyrgyzstan",     rating: 4.8, price: 8000, img: "../pic/mountain/m23.jpg", desc: "The 'Celestial Mountains' offering pristine, remote wilderness.", category: "mountains" },
            { id: 'dm24', name: "Pamir Knot",         location: "Tajikistan",     rating: 4.7, price: 3000, img: "../pic/mountain/m24.jpg", desc: "The 'Roof of the World' with towering snow-clad peaks.", category: "mountains" },
            { id: 'dm25', name: "Altai Mountains",    location: "Russia/Mongolia",rating: 4.6, price: 1200, img: "../pic/mountain/m25.jpg", desc: "Golden mountains with a rich nomadic heritage and untouched nature.", category: "mountains" },
            { id: 'dm26', name: "Mount Kilimanjaro",  location: "Tanzania",       rating: 5.0, price: 1500, img: "../pic/mountain/m26.jpg", desc: "The roof of Africa, an iconic solitary volcanic peak.", category: "mountains" },
            { id: 'dm27', name: "Mount Kenya",        location: "Kenya",          rating: 4.8, price: 1500, img: "../pic/mountain/m27.jpg", desc: "Rugged glacier-clad summits right on the equator.", category: "mountains" },
            { id: 'dm28', name: "Rwenzori Mountains", location: "Uganda",         rating: 4.7, price: 1800, img: "../pic/mountain/m28.jpg", desc: "The mystical 'Mountains of the Moon' with unique flora.", category: "mountains" },
            { id: 'dm29', name: "Simien Mountains",   location: "Ethiopia",       rating: 4.8, price: 6500, img: "../pic/mountain/m29.jpg", desc: "Dramatic escarpments and deep valleys with rare wildlife.", category: "mountains" },
            { id: 'dm30', name: "Appalachian Trail",  location: "USA",            rating: 4.6, price: 1500,  img: "../pic/mountain/m30.jpg", desc: "Ancient rolling mountains covered in lush temperate forests.", category: "mountains" },
            { id: 'dm31', name: "White Mountains",    location: "New Hampshire",  rating: 4.7, price: 3500,  img: "../pic/mountain/m31.jpg", desc: "Rugged granite peaks known for challenging weather and hikes.", category: "mountains" },
            { id: 'dm32', name: "Grand Teton",        location: "Wyoming, USA",   rating: 4.9, price: 1200, img: "../pic/mountain/m32.jpg", desc: "Jagged peaks rising abruptly from the valley floor.", category: "mountains" },
            { id: 'dm33', name: "Glacier National",   location: "Montana, USA",   rating: 4.9, price: 2500, img: "../pic/mountain/m33.jpg", desc: "Carved valleys and pristine alpine lakes in the Rockies.", category: "mountains" },
            { id: 'dm34', name: "Mount Rainier",      location: "Washington, USA",rating: 4.8, price: 1200, img: "../pic/mountain/m34.jpg", desc: "An iconic stratovolcano with massive glaciers and wildflower meadows.", category: "mountains" },
            { id: 'dm35', name: "Denali Peak",        location: "Alaska, USA",    rating: 5.0, price: 3000, img: "../pic/mountain/m35.jpg", desc: "The highest peak in North America, a true wilderness challenge.", category: "mountains" },
            { id: 'dm36', name: "Mount Logan",        location: "Yukon, Canada",  rating: 4.8, price: 8000, img: "../pic/mountain/m36.jpg", desc: "Massive glaciated peak in the remote St. Elias Mountains.", category: "mountains" },
            { id: 'dm37', name: "Aconcagua",          location: "Argentina",      rating: 4.9, price: 15000, img: "../pic/mountain/m37.jpg", desc: "The highest mountain outside of Asia, a mountaineer's dream.", category: "mountains" },
            { id: 'dm38', name: "Fitz Roy",           location: "Patagonia",      rating: 4.9, price: 8000, img: "../pic/mountain/m38.jpg", desc: "Iconic granite spires rising above glacial lakes.", category: "mountains" },
            { id: 'dm39', name: "Torres del Paine",   location: "Chile",          rating: 5.0, price: 1500, img: "../pic/mountain/m39.jpg", desc: "Spectacular horn-shaped peaks and vivid blue icebergs.", category: "mountains" },
            { id: 'dm40', name: "Mount Vinson",       location: "Antarctica",     rating: 4.8, price: 8000, img: "../pic/mountain/m40.jpg", desc: "The ultimate remote peak in the frozen continent.", category: "mountains" },
            { id: 'dm41', name: "Mount Cook",         location: "New Zealand",    rating: 4.9, price: 6500, img: "../pic/mountain/m41.jpg", desc: "Aoraki, the highest mountain in New Zealand, surrounded by glaciers.", category: "mountains" },
            { id: 'dm42', name: "Mount Kinabalu",     location: "Malaysia",       rating: 4.7, price: 1500, img: "../pic/mountain/m42.jpg", desc: "A towering granite peak rising above lush tropical rainforest.", category: "mountains" },
            { id: 'dm43', name: "Puncak Jaya",        location: "Indonesia",      rating: 4.8, price: 1200, img: "../pic/mountain/m43.jpg", desc: "The highest island peak in the world, surrounded by jungle.", category: "mountains" },
            { id: 'dm44', name: "Mount Elbrus",       location: "Russia",         rating: 4.8, price: 1500, img: "../pic/mountain/m44.jpg", desc: "The highest peak in Europe, a dormant twin-peaked volcano.", category: "mountains" },
            { id: 'dm45', name: "Mont Blanc",         location: "France/Italy",   rating: 4.9, price: 899, img: "../pic/mountain/m45.jpg", desc: "The majestic white mountain, the highest in the Alps.", category: "mountains" },
            { id: 'dm46', name: "K2 Base Camp",       location: "Pakistan",       rating: 5.0, price: 5000, img: "../pic/mountain/m46.jpg", desc: "Trek to the base of the savage mountain, the second highest on Earth.", category: "mountains" },

            { id: 'd6',  name: "Zakynthos Blue",       location: "Greece",         rating: 5.0, price: 2500, img: "../pic/sea/s1.jpg",       desc: "Iconic blue lagoons and secret sea caves in the Ionian islands.",              category: "beaches" },
            { id: 'ds2',  name: "Coral Cove",          location: "Fiji",           rating: 4.8, price: 12000, img: "../pic/sea/s2.png",       desc: "Spectacular coral reefs accessible right from your beach villa.", category: "beaches" },
            { id: 'd7',  name: "Bora Bora Lagoon",     location: "French Polynesia", rating: 5.0, price: 899, img: "../pic/sea/s3.jpg",     desc: "Overwater bungalows floating above the world's clearest lagoons.",             category: "beaches" },
            { id: 'd8',  name: "Maldive Atoll",        location: "Maldives",       rating: 4.9, price: 15000, img: "../pic/sea/s4.jpg",       desc: "Private atolls with coral reefs, butler service, and sunset cruises.",         category: "beaches" },
            { id: 'd9',  name: "Phuket Sands",         location: "Thailand",       rating: 4.7, price: 15000,  img: "../pic/sea/s5.jpg",       desc: "Pristine white sands with cliffside infinity pools.",                          category: "beaches" },
            { id: 'd10', name: "Amalfi Cliffs",        location: "Italy",          rating: 4.8, price: 2500, img: "../pic/sea/s6.jpg",       desc: "Dramatic coastal cliffs with lemon groves and private villas.",                category: "beaches" },
            { id: 'ds7',  name: "Azure Bay",           location: "Bahamas",        rating: 4.7, price: 12000, img: "../pic/sea/s7.jpg",       desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds8',  name: "Golden Sands",        location: "Seychelles",     rating: 4.9, price: 899, img: "../pic/sea/s8.jpg",       desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds9',  name: "Sunset Haven",        location: "Hawaii",         rating: 4.8, price: 3000, img: "../pic/sea/s9.jpg",       desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds10', name: "Tropical Escape",     location: "Mauritius",      rating: 4.7, price: 5000, img: "../pic/sea/s10.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds11', name: "Island Retreat",      location: "Caribbean",      rating: 4.8, price: 1200, img: "../pic/sea/s11.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds12', name: "Ocean Breeze",        location: "Palau",          rating: 4.9, price: 5000, img: "../pic/sea/s12.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds13', name: "Palm Coast",          location: "Bermuda",        rating: 4.6, price: 899, img: "../pic/sea/s13.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds14', name: "Crystal Waters",      location: "Tahiti",         rating: 4.9, price: 3500, img: "../pic/sea/s14.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds15', name: "Serene Shores",       location: "Barbados",       rating: 4.7, price: 12000, img: "../pic/sea/s15.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds16', name: "Sapphire Sea",        location: "Cook Islands",   rating: 4.8, price: 3500, img: "../pic/sea/s16.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds17', name: "Hidden Cove",         location: "Jamaica",        rating: 4.6, price: 3000, img: "../pic/sea/s17.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds18', name: "Breezy Point",        location: "Aruba",          rating: 4.8, price: 8000, img: "../pic/sea/s18.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds19', name: "White Sands",         location: "Turks and Caicos",rating: 4.9, price: 3000, img: "../pic/sea/s19.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds20', name: "Pearl Beach",         location: "St. Lucia",      rating: 4.7, price: 12000, img: "../pic/sea/s20.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds21', name: "Emerald Isle",        location: "Fiji",           rating: 4.8, price: 6500, img: "../pic/sea/s21.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds22', name: "Paradise Bay",        location: "Antigua",        rating: 4.9, price: 15000, img: "../pic/sea/s22.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds23', name: "Sunny Horizon",       location: "Cayman Islands", rating: 4.7, price: 3500, img: "../pic/sea/s23.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds24', name: "Tropic Haven",        location: "Belize",         rating: 4.8, price: 3000, img: "../pic/sea/s24.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds25', name: "Coastal Charm",       location: "Costa Rica",     rating: 4.6, price: 1200, img: "../pic/sea/s25.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds26', name: "Island Bliss",        location: "Dominican Rep.", rating: 4.7, price: 2500, img: "../pic/sea/s26.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds27', name: "Sandy Solitude",      location: "Grenada",        rating: 4.8, price: 4500, img: "../pic/sea/s27.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds28', name: "Aqua Marine",         location: "Martinique",     rating: 4.9, price: 899, img: "../pic/sea/s28.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds29', name: "Blue Lagoon",         location: "Guadeloupe",     rating: 4.7, price: 2500, img: "../pic/sea/s29.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds30', name: "Seaside Serenity",    location: "St. Vincent",    rating: 4.8, price: 6500, img: "../pic/sea/s30.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds31', name: "Oceanic Splendor",    location: "St. Kitts",      rating: 4.6, price: 8000, img: "../pic/sea/s31.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds32', name: "Reef Rest",           location: "Anguilla",       rating: 4.9, price: 3500, img: "../pic/sea/s32.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds33', name: "Coastal Dream",       location: "St. Barts",      rating: 5.0, price: 5000, img: "../pic/sea/s33.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds34', name: "Waves Edge",          location: "BVI",            rating: 4.8, price: 5000, img: "../pic/sea/s34.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds35', name: "Saltwater Springs",   location: "USVI",           rating: 4.7, price: 2200, img: "../pic/sea/s35.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds36', name: "Tropical Oasis",      location: "Curaçao",        rating: 4.8, price: 2500, img: "../pic/sea/s36.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds37', name: "Island Pearl",        location: "Bonaire",        rating: 4.6, price: 3000, img: "../pic/sea/s37.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds38', name: "Sunset Beach",        location: "Sint Maarten",   rating: 4.7, price: 6500, img: "../pic/sea/s38.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds39', name: "Coral Reef Bay",      location: "San Blas",       rating: 4.9, price: 899, img: "../pic/sea/s39.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds40', name: "Azure Waters",        location: "Roatán",         rating: 4.8, price: 1800, img: "../pic/sea/s40.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds41', name: "Golden Sunrise",      location: "Corn Islands",   rating: 4.7, price: 15000, img: "../pic/sea/s41.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds42', name: "Crystal Cove",        location: "Isla Mujeres",   rating: 4.8, price: 5000, img: "../pic/sea/s42.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds43', name: "Sandy Shores",        location: "Cozumel",        rating: 4.9, price: 5000, img: "../pic/sea/s43.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds45', name: "Palm Tree Hideout",   location: "Tulum",          rating: 4.8, price: 1500, img: "../pic/sea/s45.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds46', name: "Mermaid's Tale",      location: "Los Cabos",      rating: 4.7, price: 2500, img: "../pic/sea/s46.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds47', name: "Ocean Whisper",       location: "Puerto Vallarta",rating: 4.8, price: 8000, img: "../pic/sea/s47.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds48', name: "Tidal Waves",         location: "Sayulita",       rating: 4.6, price: 15000, img: "../pic/sea/s48.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds49', name: "Sea Breeze",          location: "Mazatlán",       rating: 4.7, price: 1800, img: "../pic/sea/s49.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds50', name: "Pristine Sands",      location: "Acapulco",       rating: 4.8, price: 4500, img: "../pic/sea/s50.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds51', name: "Tropical Paradise",   location: "Zihuatanejo",    rating: 4.9, price: 5000, img: "../pic/sea/s51.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds52', name: "Sunny Outlook",       location: "Huatulco",       rating: 4.7, price: 2500, img: "../pic/sea/s52.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds53', name: "Aqua Bay",            location: "Cancún",         rating: 4.8, price: 2500, img: "../pic/sea/s53.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds54', name: "Reef Discovery",      location: "Playa del Carmen",rating: 4.9, price: 12000, img: "../pic/sea/s54.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds55', name: "Island Hop",          location: "Holbox",         rating: 4.8, price: 12000, img: "../pic/sea/s55.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds56', name: "Secluded Shore",      location: "Bacalar",        rating: 4.7, price: 1500, img: "../pic/sea/s56.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds57', name: "Tropic Delight",      location: "Mahahual",       rating: 4.6, price: 6500, img: "../pic/sea/s57.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds58', name: "Breezy Bay",          location: "Punta Cana",     rating: 4.8, price: 2500, img: "../pic/sea/s58.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds59', name: "Sandy Peak",          location: "Bávaro",         rating: 4.9, price: 8000, img: "../pic/sea/s59.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds60', name: "Ocean Frontier",      location: "Cap Cana",       rating: 5.0, price: 12000, img: "../pic/sea/s60.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds61', name: "Coastal Treasure",    location: "Samaná",         rating: 4.8, price: 8000, img: "../pic/sea/s61.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds62', name: "Secret Beach",        location: "Las Terrenas",   rating: 4.7, price: 15000, img: "../pic/sea/s62.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },

            { id: 'd11', name: "Amazon Reserve",       location: "Brazil",         rating: 4.6, price: 6500,  img: "../pic/nature/n1.jpg",    desc: "Deep jungle luxury eco-lodges with private naturalist guides.",                category: "nature" },
            { id: 'd12', name: "Bali Ubud Jungle",     location: "Indonesia",      rating: 4.8, price: 3000, img: "../pic/nature/n2.jpg",    desc: "Lush terraced rice fields, sacred temples, and volcanic hot springs.",         category: "nature" },
            { id: 'd13', name: "Serengeti Safari",     location: "Tanzania",       rating: 4.9, price: 1200, img: "../pic/nature/n3.jpg",    desc: "Witness the Great Migration from your private luxury tented camp.",            category: "nature" },
            { id: 'd14', name: "Patagonia Wild",       location: "Argentina",      rating: 4.7, price: 8000, img: "../pic/nature/n4.jpg",    desc: "Pristine wilderness at the end of the earth, Torres del Paine peaks.",        category: "nature" },
            { id: 'dn1', name: "Mystic Valley",        location: "New Zealand",     rating: 4.9, price: 12000, img: "../pic/nature/f1.jpg",    desc: "Fog-shrouded valleys with ancient ferns and private eco-lodges.",              category: "nature" },
            { id: 'dn2', name: "Cloud Forest Trails",  location: "Ecuador",         rating: 4.8, price: 3500, img: "../pic/nature/f2.jpg",    desc: "Hike through cloud-draped forest trails with rare orchids and wildlife.",      category: "nature" },
            { id: 'dn3', name: "Misty Highlands",      location: "Scotland",        rating: 4.7, price: 2200, img: "../pic/nature/f4.jpg",    desc: "Rolling heather moorlands, dramatic glens, and ancient castle ruins.",         category: "nature" },
            { id: 'dn4', name: "Canyon Wilderness",    location: "USA",             rating: 4.8, price: 2500, img: "../pic/nature/f5.jpg",    desc: "Vast red rock canyons with luxury glamping under the stars.",                  category: "nature" },
            { id: 'dn5', name: "Emerald Rainforest",   location: "Brazil",          rating: 4.9, price: 1200,  img: "../pic/nature/f6.jpg",    desc: "Immerse in the emerald expanse of the world's greatest tropical rainforest.",  category: "nature" },
            { id: 'dn6', name: "Volcanic Peaks",       location: "Iceland",         rating: 5.0, price: 2500, img: "../pic/nature/f7.jpg",    desc: "Dramatic volcanic landscapes with private hot springs and aurora views.",       category: "nature" },
            { id: 'dn7', name: "Alpine Meadows",       location: "Austria",         rating: 4.7, price: 2200, img: "../pic/nature/f9.jpg",    desc: "Wildflower-filled alpine meadows with panoramic mountain lodge stays.",        category: "nature" },
            { id: 'dn8', name: "Jungle Canopy Lodge",  location: "Costa Rica",      rating: 4.8, price: 1200, img: "../pic/nature/f10.jpg",   desc: "Luxury treehouse lodges above a vibrant tropical jungle canopy.",               category: "nature" },
            { id: 'dn9', name: "Ancient Woodland",     location: "Germany",         rating: 4.6, price: 12000,  img: "../pic/nature/f11.jpg",   desc: "Centuries-old forest with private cabin retreats and deer trails.",             category: "nature" },
            { id: 'dn10',name: "Bamboo Sanctuary",     location: "China",           rating: 4.9, price: 3000, img: "../pic/nature/f12.jpg",   desc: "Tranquil bamboo groves with mindfulness retreats and zen gardens.",             category: "nature" },
            { id: 'dn11',name: "Sacred Forest",        location: "Japan",           rating: 5.0, price: 3500, img: "../pic/nature/f13.jpg",   desc: "Ancient cedar forests shrouding sacred Shinto shrines and meditation trails.", category: "nature" },
            { id: 'dn12',name: "Fjord Wilderness",     location: "Norway",          rating: 4.9, price: 1800, img: "../pic/nature/f14.jpg",   desc: "Dramatic fjord scenery with private kayaking and cliff-edge lodges.",           category: "nature" },
            { id: 'dn13',name: "Desert Oasis",         location: "Namibia",         rating: 4.8, price: 5000, img: "../pic/nature/f16.jpg",   desc: "Private oasis retreat amidst sweeping red sand dunes at sunset.",              category: "nature" },
            { id: 'dn14',name: "Wetland Paradise",     location: "Botswana",        rating: 4.7, price: 15000, img: "../pic/nature/f17.jpg",   desc: "Float through the Okavango Delta in a private mokoro among wild elephants.",   category: "nature" },
            { id: 'dn15',name: "Glacier Retreat",      location: "Alaska, USA",     rating: 4.9, price: 1200, img: "../pic/nature/f18.jpg",   desc: "Watch calving glaciers from your private blue-ice cabin at the edge of the world.", category: "nature" },
            { id: 'dn16',name: "Autumn Forest Lodge",  location: "Canada",          rating: 4.8, price: 1800, img: "../pic/nature/f19.jpg",   desc: "Blaze of golden maple forests surrounding luxury lakeside log cabins.",         category: "nature" },
            { id: 'dn17',name: "Savanna Sunrise",      location: "Kenya",           rating: 5.0, price: 3000, img: "../pic/nature/f20.jpg",   desc: "Wake to golden savanna sunrises in a luxury mobile camp in the Masai Mara.",   category: "nature" },
            { id: 'dn18',name: "Tropical River Lodge", location: "Thailand",        rating: 4.7, price: 2500, img: "../pic/nature/f21.jpg",   desc: "Stilted river lodge immersed in lush jungle with private pool villas.",         category: "nature" },

            { id: 'df1', name: "Redwood Canopy",       location: "California, USA", rating: 4.9, price: 4500, img: "../pic/nature/forest1.png", desc: "Experience luxury treehouse stays nestled among ancient towering redwoods.", category: "nature-forest" },
            { id: 'df2', name: "Kyoto Bamboo Paths",   location: "Japan",           rating: 5.0, price: 4500, img: "../pic/nature/forest2.png", desc: "Wander the mystical pathways of the historic Arashiyama bamboo forest.",   category: "nature-forest" },
            { id: 'df3', name: "Black Forest Hideaway", location: "Germany",         rating: 4.8, price: 1200, img: "../pic/nature/forest3.png", desc: "Cozy chalets hidden deep in the foggy whispering pines of the Black Forest.",category: "nature-forest" },
            { id: 'df4', name: "Costa Rica Rainforest",location: "Costa Rica",      rating: 4.9, price: 6500, img: "../pic/nature/forest4.png", desc: "Luxury eco-resort surrounded by waterfalls, exotic fauna, and thick canopy.",category: "nature-forest" },

            { id: 'd15', name: "Mars Olympus Base",    location: "Mars",           rating: 4.9, price: 12000000, img: "../pic/planets/p1.jpg", desc: "Experience 1/3rd gravity in pressurised luxury domes at Olympus Mons.",       category: "planets" },
            { id: 'd16', name: "Lunar Gateway",        location: "Moon",           rating: 4.7, price: 32000000, img: "../pic/planets/p2.jpg", desc: "Earthrise views from your private lunar suite at Tycho Crater.",              category: "planets" },
            { id: 'd17', name: "ISS Penthouse",        location: "Low Earth Orbit", rating: 5.0, price: 66000000, img: "../pic/planets/p3.png", desc: "16 sunrises per day from the most exclusive address in the universe.",       category: "planets" },
            { id: 'd18', name: "Europa Ocean",         location: "Jupiter Moon",   rating: 4.8, price: 37000000, img: "../pic/planets/p4.jpg", desc: "Submarine luxury exploring potential life beneath the icy surface.",           category: "planets" },

            { id: 'dd1',  name: "Kyoto Zen Temple",        location: "Japan",           rating: 5.0, price: 15000,    img: "../pic/destination/d1.png",  desc: "Experience the serene beauty of traditional Japanese pagodas surrounded by vibrant spring cherry blossoms.", category: "destinations" },
            { id: 'dd2',  name: "St. Stephen's Cathedral", location: "Austria",         rating: 4.9, price: 5000,    img: "../pic/destination/d2.png",  desc: "Discover the stunning Gothic architecture and colorful tiled roofs in the heart of historic Vienna.", category: "destinations" },
            { id: 'dd3',  name: "Sydney Harbour",          location: "Australia",       rating: 4.8, price: 5000,    img: "../pic/destination/d3.png",  desc: "Take in the breathtaking sunset views of the iconic Opera House and Sydney Harbour Bridge.", category: "destinations" },
            { id: 'dd4',  name: "The Colosseum",           location: "Italy",           rating: 4.7, price: 2500,    img: "../pic/destination/d4.png",  desc: "Step back in time at this ancient Roman amphitheater glowing beautifully in the sunset light.", category: "destinations" },
            { id: 'dd5',  name: "Hyangwonjeong Pavilion",  location: "South Korea",     rating: 5.0, price: 3000,    img: "../pic/destination/d5.png",  desc: "Relax by the tranquil lake reflecting traditional architecture with the N Seoul Tower in the distance.", category: "destinations" },
            { id: 'dd6',  name: "Dubai Skyline",           location: "UAE",             rating: 4.8, price: 899,    img: "../pic/destination/d6.png",  desc: "Marvel at the futuristic cityscape and the towering Burj Khalifa rising above the sparkling marina.", category: "destinations" },
            { id: 'dd7',  name: "Amalfi Riviera",          location: "Italy",           rating: 4.9, price: 6500, img: "../pic/destination/d7.png",  desc: "Colourful clifftop villages cascading down to the cobalt Tyrrhenian Sea.",  category: "destinations" },
            { id: 'dd8',  name: "Maldives Pearl",          location: "Maldives",        rating: 5.0, price: 2200, img: "../pic/destination/d8.png",  desc: "Private-island overwater villas on a pristine turquoise lagoon.",            category: "destinations" },
            { id: 'dd9',  name: "Bali Spirit",             location: "Indonesia",       rating: 4.7, price: 2500, img: "../pic/destination/d9.png",  desc: "Sacred temples, terraced rice paddies, and world-class wellness retreats.", category: "destinations" },
            { id: 'dd10', name: "Great Barrier Reef",      location: "Australia",       rating: 4.8, price: 1500, img: "../pic/destination/d10.png", desc: "Explore the world's largest coral reef system, home to diverse marine life and pristine islands.", category: "destinations" },
            { id: 'dd11', name: "Marrakech Medina",    location: "Morocco",         rating: 4.6, price: 12000,  img: "../pic/destination/d11.png", desc: "Labyrinthine souks, rooftop riads, and fragrant spice gardens.",            category: "destinations" },
            { id: 'dd12', name: "Cappadocia Skies",    location: "Turkey",          rating: 4.9, price: 6500, img: "../pic/destination/d12.png", desc: "Hot-air balloon flights over a surreal volcanic landscape at dawn.",         category: "destinations" },
            { id: 'dd13', name: "Prague Castle",       location: "Czech Republic",  rating: 4.7, price: 5000, img: "../pic/destination/d13.png", desc: "Gothic spires, baroque palaces, and cobblestone lanes in bohemian grandeur.", category: "destinations" },
            { id: 'dd14', name: "Rio Carnival",        location: "Brazil",          rating: 4.8, price: 3500, img: "../pic/destination/d14.png", desc: "Samba, Carnival, Christ the Redeemer, and sugar-loaf sunsets.",             category: "destinations" },
            { id: 'dd15', name: "Cape Town Radiance",  location: "South Africa",    rating: 4.9, price: 6500, img: "../pic/destination/d15.png", desc: "Table Mountain, penguin beaches, and world-class winelands.",               category: "destinations" },
            { id: 'dd16', name: "Amsterdam Canals",    location: "Netherlands",     rating: 4.7, price: 3000, img: "../pic/destination/d16.png", desc: "Golden-age architecture reflected in centuries-old canal waterways.",        category: "destinations" },
            { id: 'dd17', name: "Singapore Glow",      location: "Singapore",       rating: 4.9, price: 15000, img: "../pic/destination/d17.png", desc: "Gardens by the Bay, infinity sky pools, and extraordinary street food.",    category: "destinations" },
            { id: 'dd18', name: "Tuscany Vineyards",   location: "Italy",           rating: 5.0, price: 12000, img: "../pic/destination/d18.png", desc: "Rolling cypress hills, private villas, and legendary Brunello wines.",       category: "destinations" },
            { id: 'dd19', name: "Queenstown Peak",     location: "New Zealand",     rating: 4.8, price: 5000, img: "../pic/destination/d19.png", desc: "Adrenaline capital of the world with fjord-side luxury lodges.",             category: "destinations" },
            { id: 'dd20', name: "Havana Rhythm",       location: "Cuba",            rating: 4.6, price: 6500,  img: "../pic/destination/d20.png", desc: "Vintage cars, salsa beats, and colonial architecture by the Caribbean.",     category: "destinations" },
            { id: 'dd21', name: "Petra by Night",      location: "Jordan",          rating: 4.9, price: 899, img: "../pic/destination/d21.png", desc: "Rose-red rock city of the Nabataeans, lit by a thousand candles at dusk.",  category: "destinations" },
            { id: 'dd22', name: "Reykjavik Aurora",    location: "Iceland",         rating: 5.0, price: 8000, img: "../pic/destination/d22.png", desc: "Northern Lights, geothermal spas, and midnight sun adventures.",            category: "destinations" },
            { id: 'dd23', name: "Kyoto Arashiyama",    location: "Japan",           rating: 4.8, price: 2500, img: "../pic/destination/d23.jpg", desc: "Bamboo groves, monkey parks, and peaceful boat rides on the Oi River.",     category: "destinations" },
            { id: 'dd24', name: "Vienna Opera",        location: "Austria",         rating: 4.7, price: 1200, img: "../pic/destination/d24.jpg", desc: "Imperial palaces, Viennese coffee culture, and world-famous opera houses.", category: "destinations" },
            { id: 'dd25', name: "Sahara Starcamp",     location: "Morocco",         rating: 4.9, price: 6500, img: "../pic/destination/d25.jpg", desc: "Luxury desert camps beneath a billion stars in the great Sahara.",          category: "destinations" },
            { id: 'dd26', name: "Galapagos Wild",      location: "Ecuador",         rating: 5.0, price: 1500, img: "../pic/destination/d26.jpg", desc: "Encounter giant tortoises, marine iguanas, and blue-footed boobies.",        category: "destinations" },
            { id: 'dd27', name: "Lisbon Fado",         location: "Portugal",        rating: 4.6, price: 1200,  img: "../pic/destination/d27.jpg", desc: "Tram rides, azulejo tiles, and soulful fado music over Atlantic views.",    category: "destinations" },
            { id: 'dd28', name: "Bangkok Grand",       location: "Thailand",        rating: 4.7, price: 3000, img: "../pic/destination/d28.jpg", desc: "Grand Palace, floating markets, and rooftop bars above the Chao Phraya.",  category: "destinations" },
            { id: 'dd29', name: "Positano Dream",      location: "Italy",           rating: 4.9, price: 899, img: "../pic/destination/d29.jpg", desc: "Pastel-coloured houses draped over cliffs above the Amalfi Coast.",         category: "destinations" },
            { id: 'dd30', name: "Bruges Fairytale",    location: "Belgium",         rating: 4.7, price: 2200, img: "../pic/destination/d30.jpg", desc: "Medieval canals, Belgian chocolate, and horse-drawn carriage rides.",        category: "destinations" },
            { id: 'dd31', name: "Zanzibar Spice",      location: "Tanzania",        rating: 4.8, price: 2200, img: "../pic/destination/d31.jpg", desc: "White-sand beaches, Stone Town spice markets, and turquoise reef dives.",  category: "destinations" },
            { id: 'dd32', name: "Bruges Canal",        location: "Belgium",         rating: 4.6, price: 899, img: "../pic/destination/d32.jpg", desc: "Lace-making heritage, belfry towers, and craft beer in a living museum.",   category: "destinations" },
            { id: 'dd33', name: "Phuket Horizon",      location: "Thailand",        rating: 4.7, price: 6500, img: "../pic/destination/d33.jpg", desc: "Clifftop infinity pools, emerald sea kayaking, and vibrant night bazaars.", category: "destinations" },
            { id: 'dd34', name: "Montreal Winter",     location: "Canada",          rating: 4.6, price: 1800, img: "../pic/destination/d34.jpg", desc: "Underground city, jazz festivals, and world-class French-Canadian cuisine.", category: "destinations" },
            { id: 'dd35', name: "Oman Desert Rose",    location: "Oman",            rating: 4.8, price: 12000, img: "../pic/destination/d35.jpg", desc: "Wadis, forts, and luxury desert resorts beneath the Arabian stars.",         category: "destinations" },
            { id: 'dd36', name: "Cartagena Gold",      location: "Colombia",        rating: 4.7, price: 3000,  img: "../pic/destination/d36.jpg", desc: "Walled old city, Caribbean beaches, and Colombia's best seafood.",          category: "destinations" },
            { id: 'dd37', name: "Maldives Overwater",  location: "Maldives",        rating: 5.0, price: 8000, img: "../pic/destination/d37.jpg", desc: "Ultimate seclusion in glass-floor overwater bungalows above the reef.",     category: "destinations" },
            { id: 'dd38', name: "Lake Como Villa",     location: "Italy",           rating: 4.9, price: 899, img: "../pic/destination/d38.jpg", desc: "Belle époque villas, celebrity retreats, and Alpine lake tranquility.",     category: "destinations" },
            { id: 'dd39', name: "Edinburgh Castle",    location: "Scotland",        rating: 4.7, price: 3500, img: "../pic/destination/d39.jpg", desc: "Volcanic rock fortress, whisky distilleries, and Highland wilderness.",     category: "destinations" },
            { id: 'dd40', name: "Fiji Islands",        location: "Fiji",            rating: 5.0, price: 2200, img: "../pic/destination/d40.jpg", desc: "333 tropical islands with private resorts, reefs, and Fijian hospitality.", category: "destinations" },
            { id: 'dd41', name: "Athens Acropolis",    location: "Greece",          rating: 4.8, price: 1500, img: "../pic/destination/d41.jpg", desc: "Birthplace of democracy, ancient agora walks, and sunset from the Parthenon.", category: "destinations" },
            { id: 'dd42', name: "Alaska Wilderness",   location: "USA",             rating: 4.9, price: 6500, img: "../pic/destination/d42.jpg", desc: "Glaciers, grizzly bears, and the Northern Lights from a private lodge.",    category: "destinations" },
            { id: 'dd43', name: "Bora Bora Escape",    location: "French Polynesia",rating: 5.0, price: 15000, img: "../pic/destination/d43.jpg", desc: "Turquoise lagoon, coral gardens, and the most romantic island on Earth.",   category: "destinations" },
            { id: 'dd44', name: "Nairobi Safari Gate", location: "Kenya",           rating: 4.8, price: 2500, img: "../pic/destination/d44.jpg", desc: "Big Five safari from luxury tented camps in the Masai Mara.",               category: "destinations" },
            { id: 'dd45', name: "Cinque Terre Light",  location: "Italy",           rating: 4.9, price: 1800, img: "../pic/destination/d45.jpg", desc: "Five coastal villages linked by cliff trails and crystal Ligurian waters.", category: "destinations" },
            { id: 'anm1', name: "Anime Art 1", location: "Fantasy", rating: 5.0, price: 39.99, img: "../pic/anime/0397e105-4ee9-4b08-905f-059ee23c483c.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm2', name: "Anime Art 2", location: "Fantasy", rating: 5.0, price: 39.99, img: "../pic/anime/03f72b0c-ec41-4f99-9765-7d9ee7d29f54.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm3', name: "Anime Art 3", location: "Fantasy", rating: 5.0, price: 59.99, img: "../pic/anime/10039001-806b-45c9-8a94-bca3299aa252.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm4', name: "Anime Art 4", location: "Fantasy", rating: 5.0, price: 79.99, img: "../pic/anime/205ecad9-e69d-4cf3-a831-be873c746dc4.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm5', name: "Anime Art 5", location: "Fantasy", rating: 5.0, price: 59.99, img: "../pic/anime/25bcd499-fef5-4da7-b145-a0f28a02bf64.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm6', name: "Cyberpunk Freefall", location: "Fantasy", rating: 5.0, price: 19.99, img: "../pic/anime/0397e105-4ee9-4b08-905f-059ee23c483c.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm7', name: "Itachi Uchiha in Snow", location: "Fantasy", rating: 5.0, price: 24.99, img: "../pic/anime/03f72b0c-ec41-4f99-9765-7d9ee7d29f54.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm8', name: "Tanjiro Kamado", location: "Fantasy", rating: 5.0, price: 19.99, img: "../pic/anime/10039001-806b-45c9-8a94-bca3299aa252.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm9', name: "Eren Yeager Eyes", location: "Fantasy", rating: 5.0, price: 59.99, img: "../pic/anime/205ecad9-e69d-4cf3-a831-be873c746dc4.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm10', name: "Spider-Man & Gwen Stacy Kiss", location: "Fantasy", rating: 5.0, price: 9.99, img: "../pic/anime/25bcd499-fef5-4da7-b145-a0f28a02bf64.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm11', name: "Spider-Man Cyberpunk City", location: "Fantasy", rating: 5.0, price: 49.99, img: "../pic/anime/48ab51bb-07f3-4dd9-8fec-17861ecccfa2.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm12', name: "Spider-Man Swinging", location: "Fantasy", rating: 5.0, price: 24.99, img: "../pic/anime/4d0a485b-b3ca-4613-b64c-69ac6d7ac0c0.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm13', name: "Itachi Uchiha with Crow", location: "Fantasy", rating: 5.0, price: 19.99, img: "../pic/anime/54db51d1-7240-4cb0-af15-df3c437ab5f2.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm14', name: "Monkey D. Luffy Map Art", location: "Fantasy", rating: 5.0, price: 39.99, img: "../pic/anime/5e36af3a-3f96-4415-9520-e7d91a28c66b.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm15', name: "Monkey D. Luffy Blueprint", location: "Fantasy", rating: 5.0, price: 14.99, img: "../pic/anime/60b2c86a-da38-4f7c-9107-b0c121f750b2.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm16', name: "Mikasa Ackerman Poster", location: "Fantasy", rating: 5.0, price: 59.99, img: "../pic/anime/69fbe957-c452-425e-998a-f7df80a81c23.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm17', name: "Monkey D. Luffy Vintage Map", location: "Fantasy", rating: 5.0, price: 29.99, img: "../pic/anime/79774acb-2a5b-4c59-aac6-a8f511483050.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm18', name: "Anime Art 18", location: "Fantasy", rating: 5.0, price: 14.99, img: "../pic/anime/A breathtaking fan art of Spider-Man and Gwen….jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm19', name: "Monkey D. Luffy Red", location: "Fantasy", rating: 5.0, price: 19.99, img: "../pic/anime/a388ed8d-d958-4002-b55c-93785d170cc3.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm20', name: "Spider-Man & Venom Split", location: "Fantasy", rating: 5.0, price: 19.99, img: "../pic/anime/a84e0e14-01d4-4218-8b2d-f6d7c2c584b8.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm21', name: "The Black Pearl Ship", location: "Fantasy", rating: 5.0, price: 59.99, img: "../pic/anime/ab3fed30-3acd-4859-ac97-d3aa898db956.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm22', name: "Alexander Slattery Scenery", location: "Fantasy", rating: 5.0, price: 49.99, img: "../pic/anime/alexander-slattery-LI748t0BK8w-unsplash.jpg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm23', name: "Anime Landscape Traveler", location: "Fantasy", rating: 5.0, price: 14.99, img: "../pic/anime/anime-landscape-person-traveling.jpg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm24', name: "Pirate Ship Blueprint", location: "Fantasy", rating: 5.0, price: 59.99, img: "../pic/anime/b98be76b-0bac-4354-9579-258310c8bdbf.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm25', name: "Monkey D. Luffy Portrait", location: "Fantasy", rating: 5.0, price: 79.99, img: "../pic/anime/c0b2d3e9-d930-4db4-bc9c-c6477f884a3a.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm26', name: "Kung Fu Panda Blueprint", location: "Fantasy", rating: 5.0, price: 9.99, img: "../pic/anime/cb491da8-c557-46e5-b82e-b3810dba5953.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm27', name: "Captain Jack Sparrow Blueprint", location: "Fantasy", rating: 5.0, price: 19.99, img: "../pic/anime/d2e9bdb3-8677-4054-ac9e-8ac010fecb92.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm28', name: "Megumi Fushiguro Smiling", location: "Fantasy", rating: 5.0, price: 9.99, img: "../pic/anime/dc9cdc74-aa1e-42d0-b312-6a840e85b0b3.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm29', name: "Monkey D. Luffy Sky Smile", location: "Fantasy", rating: 5.0, price: 9.99, img: "../pic/anime/e787a65f-cfe3-457a-a69b-9c3f2e4931a2.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm30', name: "Sasuke Uchiha Reaching Out", location: "Fantasy", rating: 5.0, price: 9.99, img: "../pic/anime/f4062259-64eb-4e99-b9c8-e8348fab6d65.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm31', name: "Luffy and Zunesha", location: "Fantasy", rating: 5.0, price: 39.99, img: "../pic/anime/f9779b5b-5716-4ab5-8e28-2f91b19762b9.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm32', name: "Pain (Yahiko) Blueprint", location: "Fantasy", rating: 5.0, price: 29.99, img: "../pic/anime/fdf820a6-86ff-4053-8585-2a3771b721d5.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm33', name: "Giyu Tomioka", location: "Fantasy", rating: 5.0, price: 79.99, img: "../pic/anime/Giyu Tomioka(Demon Slayer).jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm34', name: "Illustration Anime City", location: "Fantasy", rating: 5.0, price: 79.99, img: "../pic/anime/illustration-anime-city.jpg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm35', name: "Anime Style Scenery", location: "Fantasy", rating: 5.0, price: 49.99, img: "../pic/anime/pexels-souvenirpixels-1519088.jpg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm36', name: "Spider-Man Edit", location: "Fantasy", rating: 5.0, price: 39.99, img: "../pic/anime/spiderman edits.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm37', name: "Anime Art 37", location: "Fantasy", rating: 5.0, price: 24.99, img: "../pic/anime/Transform your iPhone into a superhero showcase….jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm38', name: "Asta (Black Clover)", location: "Fantasy", rating: 5.0, price: 19.99, img: "../pic/anime/_My magic is never giving up______Asta _ Black Clover 🖤____Keep swiping to see everything ✨__🎨 Art by _mjyanart____.____.____.____._____blackclover (.jpg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm39', name: "Itachi Uchiha Wallpaper", location: "Fantasy", rating: 5.0, price: 99.99, img: "../pic/anime/【ITACHI 】 ⁀➷ Wallpaper ✪.jpeg", desc: "Experience the anime universe.", category: "anime" },
            { id: 'anm40', name: "Sanemi Shinazugawa Wallpaper", location: "Fantasy", rating: 5.0, price: 49.99, img: "../pic/anime/【SANEMI】 ⁀➷ Wallpaper ✪.jpeg", desc: "Experience the anime universe.", category: "anime" },
        ];

        const hots = [
            { id: 'h1',  name: "Atlantis The Royal",    location: "Dubai, UAE",        rating: 4.9, price: 1800, img: "../pic/hotel/h1.jpg",  amenities: ['fa-spa','fa-martini-glass','fa-water','fa-wifi'],        desc: "The pinnacle of ultra-luxury in Dubai — private pools, exclusive restaurants, and aquaventure access." },
            { id: 'h2',  name: "Four Seasons Maldives", location: "Maldives",          rating: 5.0, price: 4000, img: "../pic/hotel/h2.jpg",  amenities: ['fa-plane','fa-water','fa-wifi','fa-fish'],               desc: "Overwater bungalows with glass floors and private infinity pools above the reef." },
            { id: 'h3',  name: "Aman Tokyo",            location: "Tokyo, Japan",      rating: 4.8, price: 199, img: "../pic/hotel/h3.jpg",  amenities: ['fa-city','fa-spa','fa-dumbbell','fa-wifi'],              desc: "A serene sanctuary on the 33rd floor with panoramic city views and Japanese wellness rituals." },
            { id: 'h4',  name: "The Plaza",             location: "New York, USA",     rating: 4.7, price: 899, img: "../pic/hotel/h4.png",  amenities: ['fa-city','fa-martini-glass','fa-wifi','fa-concierge-bell'], desc: "Iconic luxury at Central Park South — history, elegance, and unrivalled service." },
            { id: 'h5',  name: "Burj Al Arab",          location: "Dubai, UAE",        rating: 5.0, price: 999, img: "../pic/hotel/h5.png",  amenities: ['fa-water','fa-spa','fa-plane','fa-helicopter'],          desc: "The world's most iconic luxury hotel — a sail-shaped icon in the Arabian Gulf." },
            { id: 'h6',  name: "Bvlgari Resort Bali",   location: "Uluwatu, Bali",     rating: 4.9, price: 1800, img: "../pic/hotel/h6.png",  amenities: ['fa-swimming-pool','fa-spa','fa-wine-glass','fa-wifi'],   desc: "Clifftop villas above the Indian Ocean with Italian flair and Balinese spirit." },
            { id: 'h7',  name: "Ritz Paris",            location: "Paris, France",     rating: 5.0, price: 3500, img: "../pic/hotel/h7.jpg",  amenities: ['fa-champagne-glasses','fa-spa','fa-city','fa-wifi'],     desc: "The legendary jewel of Place Vendôme — where history meets haute couture." },
            { id: 'h8',  name: "Mandarin Oriental",     location: "Bangkok, Thailand", rating: 4.8, price: 999, img: "../pic/hotel/h8.png",  amenities: ['fa-spa','fa-water','fa-utensils','fa-wifi'],             desc: "A historic riverside retreat in the heart of Bangkok, reimagined for the modern traveller." },
            { id: 'h9',  name: "One & Only Reethi Rah", location: "North Malé, Maldives", rating: 5.0, price: 5000, img: "../pic/hotel/h9.png", amenities: ['fa-water','fa-fish','fa-plane','fa-spa'],             desc: "The most romantic private island in the Maldives with barefoot luxury." },
            { id: 'h10', name: "Amangiri",              location: "Utah, USA",         rating: 4.9, price: 1200, img: "../pic/hotel/h10.jpg", amenities: ['fa-mountain','fa-spa','fa-horse','fa-wifi'],             desc: "Desert luxury carved into the canyon landscape of southern Utah." },
            { id: 'h11', name: "Singita Grumeti",       location: "Serengeti, Tanzania", rating: 5.0, price: 4000, img: "../pic/hotel/h11.jpg", amenities: ['fa-paw','fa-utensils','fa-spa','fa-wifi'],            desc: "Private game reserve lodge with uninterrupted views of the Serengeti migration." },
            { id: 'h12', name: "Soneva Jani",           location: "Noonu Atoll, Maldives", rating: 4.9, price: 1800, img: "../pic/hotel/h12.jpg", amenities: ['fa-water','fa-film','fa-spa','fa-wifi'],           desc: "Overwater villas with retractable roofs for stargazing from your bed." },
            { id: 'h13', name: "Capella Singapore",     location: "Sentosa, Singapore", rating: 4.7, price: 1200, img: "../pic/hotel/h13.jpg", amenities: ['fa-spa','fa-golf-ball','fa-wifi','fa-pool'],          desc: "Colonial heritage meets modern glamour on Sentosa island." },
            { id: 'h14', name: "Badrutt's Palace",      location: "St. Moritz, Switzerland", rating: 4.8, price: 799, img: "../pic/hotel/h14.jpg", amenities: ['fa-snowflake','fa-spa','fa-champagne-glasses','fa-wifi'], desc: "The grandest winter palace in the Swiss Alps since 1896." },
            { id: 'h15', name: "Amanpuri",              location: "Phuket, Thailand",  rating: 5.0, price: 249, img: "../pic/hotel/h15.jpg", amenities: ['fa-water','fa-spa','fa-utensils','fa-wifi'],             desc: "The original Aman property — a private peninsula of Thai pavilions and pure serenity." },
        ];

        const food = [
            // Pizza
            { id: 'f1',  name: "Truffle Margherita",    desc: "San Marzano tomatoes, fresh buffalo mozzarella, and shaved black truffle.",  price: 346,  img: "../pic/food/f1.jpg",  rest: "La Trattoria",    category: "pizza",    rating: 4.9 },
            { id: 'f2',  name: "Lobster Bianca",         desc: "White sauce, Maine lobster, roasted garlic, burrata, and fresh basil.",      price: 580, img: "../pic/food/f2.jpg",    rest: "La Trattoria",    category: "pizza",    rating: 4.8 },
            { id: 'f3',  name: "Wagyu Pepperoni",        desc: "Hand-stretched dough, wagyu beef pepperoni, grana padano, and honey drizzle.", price: 355, img: "../pic/food/f3.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.7 },

            // Burger
            { id: 'f4',  name: "Wagyu Gold Burger",      desc: "A5 Wagyu patty, foie gras, black truffle, gold leaf on brioche bun.",        price: 325, img: "../pic/food/f4.jpg",  rest: "The Grill Master", category: "burger",   rating: 5.0 },
            { id: 'f5',  name: "Lobster Smash",          desc: "Butter-poached lobster claw, crispy shallots, saffron aioli, and chives.",   price: 205, img: "../pic/food/f5.jpg",    rest: "The Grill Master", category: "burger",   rating: 4.9 },
            { id: 'f6',  name: "Black Truffle Smash",    desc: "Prime smash patty, black truffle mayo, aged cheddar, and caramelised onion.", price: 259, img: "../pic/food/f6.jpg",  rest: "The Grill Master", category: "burger",   rating: 4.7 },

            // Indian
            { id: 'f7',  name: "Dal Makhani Royale",     desc: "Slow-cooked black lentils in Lahori butter sauce with cream and spices.",    price: 257,  img: "../pic/food/f7.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.8 },
            { id: 'f8',  name: "Tandoori Lobster",       desc: "Whole Canadian lobster marinated in saffron-yoghurt and grilled in tandoor.", price: 235, img: "../pic/food/f8.jpg",    rest: "Maharaja Dining", category: "indian",   rating: 4.9 },
            { id: 'f9',  name: "Lamb Rogan Josh",        desc: "Slow-braised Kashmiri lamb in aromatic whole spice masala with naan.",       price: 190,  img: "../pic/food/f9.jpg",  rest: "Maharaja Dining", category: "indian",   rating: 4.7 },

            // Chinese
            { id: 'f10', name: "Peking Duck",            desc: "Imperial-style roasted Peking duck with hoisin, pancakes, and spring onion.", price: 202, img: "../pic/food/f10.jpg",  rest: "Jade Dragon",     category: "chinese",  rating: 4.9 },
            { id: 'f11', name: "Abalone Dim Sum",        desc: "Handcrafted har gow with fresh abalone and golden prawn, steamed to order.", price: 528, img: "../pic/food/f11.jpg",    rest: "Jade Dragon",     category: "chinese",  rating: 5.0 },
            { id: 'f12', name: "Black Cod Miso",         desc: "Nobu-style black cod marinated in miso, sake, and mirin for 72 hours.",      price: 254, img: "../pic/food/f12.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.8 },

            // Desserts
            { id: 'f13', name: "Gold Leaf Soufflé",      desc: "Valrhona dark chocolate soufflé topped with 24k gold leaf and crème fraîche.", price: 227, img: "../pic/food/f13.jpg",  rest: "Patisserie Elite", category: "desserts", rating: 4.9 },
            { id: 'f14', name: "Mango Caviar Parfait",   desc: "Mango spherification caviar with Tahitian vanilla cream and coconut foam.",  price: 530,  img: "../pic/food/f14.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.8 },
            { id: 'f15', name: "Truffle Cheesecake",     desc: "New York cheesecake infused with Italian white truffle and fig compote.",    price: 141,  img: "../pic/food/f15.jpg",    rest: "Patisserie Elite", category: "desserts", rating: 4.7 },

            // Drinks
            { id: 'f16', name: "Dom Pérignon Vintage",   desc: "2012 Dom Pérignon vintage champagne, served in crystal Riedel flutes.",      price: 121, img: "../pic/food/f16.jpg",  rest: "The Bar",         category: "drinks",   rating: 5.0 },
            { id: 'f17', name: "Japanese Whisky Flight",  desc: "Yamazaki 18, Hibiki 21, and Nikka Yoichi tasting set with water stones.",    price: 509, img: "../pic/food/f17.jpg",    rest: "The Bar",         category: "drinks",   rating: 4.9 },
            { id: 'f18', name: "Saffron Martini",        desc: "Persian saffron-infused Grey Goose vodka, elderflower, and citrus zest.",    price: 344,  img: "../pic/food/f18.jpg", rest: "The Bar",         category: "drinks",   rating: 4.8 },

            // Additional Pizza
            { id: 'f19', name: "Caviar & Crème Pizza",   desc: "Imperial caviar, crème fraîche, gold flakes, and chives.",                  price: 323, img: "../pic/food/f19.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.9 },
            { id: 'f20', name: "Prosciutto di Parma Pizza", desc: "Aged prosciutto, fresh wild figs, wild arugula, and aged balsamic glaze.",  price: 442, img: "../pic/food/f20.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.8 },
            { id: 'f21', name: "Truffle & Porcini Flatbread", desc: "Sautéed porcini mushrooms, white truffle oil, fontina, and microgreens.", price: 573, img: "../pic/food/f21.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.7 },
            { id: 'f22', name: "Smoked Salmon Royale",   desc: "House-cured wild salmon, dill cream, caper berries, and red onion.",        price: 331, img: "../pic/food/f22.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.8 },

            // Additional Burger
            { id: 'f23', name: "Imperial Wagyu Slider Set", desc: "Trio of mini A5 Wagyu burgers with caramelized shallots and blue cheese.",  price: 329, img: "../pic/food/f23.jpg", rest: "The Grill Master", category: "burger",   rating: 4.9 },
            { id: 'f24', name: "Golden Foie Gras Burger", desc: "Dry-aged beef, seared foie gras, truffle aioli, on a toasted brioche bun.",   price: 234, img: "../pic/food/f24.jpg", rest: "The Grill Master", category: "burger",   rating: 5.0 },
            { id: 'f25', name: "Crispy Soft Shell Crab Burger", desc: "Tempura soft shell crab, spicy yuzu slaw, and avocado mash.",          price: 304, img: "../pic/food/f25.jpg", rest: "The Grill Master", category: "burger",   rating: 4.8 },

            // Additional Indian
            { id: 'f26', name: "Murgh Butter Masala Elite", desc: "Charcoal-grilled chicken in a rich, buttery, fenugreek-infused tomato gravy.", price: 503,  img: "../pic/food/f26.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.9 },
            { id: 'f27', name: "Saffron Dum Biryani",    desc: "Long-grain basmati rice layered with spiced baby lamb, saffron, and fresh mint.", price: 316,  img: "../pic/food/f27.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.9 },
            { id: 'f28', name: "Paneer Tikka Mille-Feuille", desc: "Layered tandoori cottage cheese, spiced bell pepper coulis, and mint chutney.", price: 258,  img: "../pic/food/f28.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.7 },

            // Additional Chinese
            { id: 'f29', name: "Szechuan Spiced Lobster", desc: "Stir-fried lobster tail in aromatic Szechuan peppercorn chilli paste.",       price: 518, img: "../pic/food/f29.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.8 },
            { id: 'f30', name: "Golden Leaf Har Gow",    desc: "Steamed blue shrimp dumplings topped with gold leaf and micro cilantro.",    price: 408,  img: "../pic/food/f30.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.9 },
            { id: 'f31', name: "Wagyu Beef Lo Mein",     desc: "Hand-pulled noodles with thin-sliced A5 Wagyu beef and black pepper sauce.",  price: 168,  img: "../pic/food/f31.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.8 },

            // Additional Desserts
            { id: 'f32', name: "Caviar de Chocolat",     desc: "Decadent dark chocolate mousse pearls infused with grand marnier.",          price: 353,  img: "../pic/food/f32.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.9 },
            { id: 'f33', name: "Saffron Pistachio Kulfi", desc: "Traditional slow-churned Indian ice cream with saffron strands and pistachios.", price: 587,  img: "../pic/food/f33.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.8 },
            { id: 'f34', name: "Matcha Lava Cake",       desc: "Warm ceremonial matcha cake with a molten white chocolate center.",           price: 184,  img: "../pic/food/f34.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.7 },

            // Additional Drinks
            { id: 'f35', name: "Elixir of Life Martini", desc: "Rare vintage cognac, honey water, fresh lemon, topped with vintage champagne.", price: 561, img: "../pic/food/f35.jpg", rest: "The Bar",         category: "drinks",   rating: 5.0 },
            { id: 'f36', name: "Smoked Rosemary Old Fashioned", desc: "Single barrel bourbon, angostura bitters, smoked rosemary wood.",      price: 132, img: "../pic/food/f36.jpg", rest: "The Bar",         category: "drinks",   rating: 4.9 },
            { id: 'f37', name: "Gold Dust Espresso Martini", desc: "Fresh espresso, craft coffee liqueur, vodka, dusted with 24k gold.",      price: 290,  img: "../pic/food/f37.jpg", rest: "The Bar",         category: "drinks",   rating: 4.8 },
            { id: 'f38', name: "Hibiscus Rose Mocktail", desc: "Hibiscus tea, organic rose water, sparkling elderflower, and fresh mint.",     price: 373,  img: "../pic/food/f38.jpg", rest: "The Bar",         category: "drinks",   rating: 4.7 }
        ];


        const flights = [
            { id: 'fl1',  from: "Dubai",     to: "Maldives",   airline: "Emirates",       duration: "4h 10m", price: 399,  class: "First",    img: "✈️",  depTime: "08:30", arrTime: "12:40" },
            { id: 'fl2',  from: "London",    to: "New York",   airline: "British Airways", duration: "7h 45m", price: 799,  class: "Business", img: "✈️",  depTime: "10:00", arrTime: "13:45" },
            { id: 'fl3',  from: "Paris",     to: "Tokyo",      airline: "Air France",      duration: "13h 20m", price: 2200, class: "First",    img: "✈️",  depTime: "11:15", arrTime: "06:35" },
            { id: 'fl4',  from: "New York",  to: "Dubai",      airline: "Etihad",          duration: "13h 00m", price: 4000, class: "First",    img: "✈️",  depTime: "21:00", arrTime: "18:00" },
            { id: 'fl5',  from: "Singapore", to: "London",     airline: "Singapore Air",   duration: "14h 00m", price: 2200, class: "Business", img: "✈️",  depTime: "09:30", arrTime: "15:30" },
            { id: 'fl6',  from: "Mumbai",    to: "Dubai",      airline: "Air India",       duration: "3h 00m",  price: 999, class: "Business", img: "✈️",  depTime: "06:00", arrTime: "09:00" },
            { id: 'fl7',  from: "Sydney",    to: "Singapore",  airline: "Qantas",          duration: "7h 45m",  price: 5000, class: "Business", img: "✈️",  depTime: "07:00", arrTime: "12:45" },
            { id: 'fl8',  from: "Tokyo",     to: "Los Angeles",airline: "JAL",           duration: "10h 15m", price: 3500, class: "First",    img: "✈️",  depTime: "11:00", arrTime: "04:15" },
        ];

        const trains = [
            { id: 'tr1',  from: "New Delhi", to: "Mumbai",     airline: "Rajdhani Express", duration: "15h 30m", price: 3000, class: "First AC", img: "🚆",  depTime: "16:30", arrTime: "08:00" },
            { id: 'tr2',  from: "Howrah",    to: "New Delhi",  airline: "Shatabdi Exp",     duration: "17h 15m", price: 2200, class: "CC",       img: "🚆",  depTime: "06:00", arrTime: "23:15" },
            { id: 'tr3',  from: "Bengaluru", to: "Chennai",    airline: "Vande Bharat",     duration: "4h 20m",  price: 999, class: "EC",       img: "🚆",  depTime: "05:50", arrTime: "10:10" },
            { id: 'tr4',  from: "Ahmedabad", to: "Mumbai",     airline: "Tejas Express",    duration: "6h 15m",  price: 1200, class: "CC",       img: "🚆",  depTime: "06:40", arrTime: "12:55" },
        ];

        const buses = [
            { id: 'bu1',  from: "Mahagama",  to: "Bhagalpur",  airline: "Mahagama Bus Service", duration: "1h 45m",  price: 499,   class: "Standard", img: "🚌",  depTime: "08:00", arrTime: "09:45" },
            { id: 'bu2',  from: "Mahagama",  to: "Godda",      airline: "Mahagama Bus Service", duration: "1h 00m",  price: 899,   class: "Standard", img: "🚌",  depTime: "09:00", arrTime: "10:00" },
            { id: 'bu3',  from: "Mahagama",  to: "Ranchi",     airline: "Mahagama Bus Service", duration: "8h 30m",  price: 1200,  class: "AC Sleeper", img: "🚌",  depTime: "20:00", arrTime: "04:30" },
        ];

        localStorage.setItem('imxx_destinations', JSON.stringify(dests));
        localStorage.setItem('imxx_hotels', JSON.stringify(hots));
        localStorage.setItem('imxx_food', JSON.stringify(food));
        localStorage.setItem('imxx_flights', JSON.stringify(flights));
        localStorage.setItem('imxx_trains', JSON.stringify(trains));
        localStorage.setItem('imxx_buses', JSON.stringify(buses));
        localStorage.setItem('imxx_cart', JSON.stringify([]));
        localStorage.setItem('imxx_wishlist', JSON.stringify([]));
        localStorage.setItem('imxx_bookings', JSON.stringify([]));
        localStorage.setItem('imxx_orders', JSON.stringify([]));
        localStorage.setItem('imxx_settings', JSON.stringify(this.state.settings));
        localStorage.setItem('imxx_currentUser', JSON.stringify(null));
        localStorage.setItem('imxx_users', JSON.stringify([
            { id: 'u1', name: 'Alexander Wright', email: 'admin@imxx.com', password: 'imxx2024', role: 'admin' }
        ]));
    },

    loadState() {
        try {
            this.state.destinations = dedupeItems(JSON.parse(localStorage.getItem('imxx_destinations')));
            this.state.hotels       = dedupeItems(JSON.parse(localStorage.getItem('imxx_hotels')));
            this.state.foodItems    = JSON.parse(localStorage.getItem('imxx_food'));
            this.state.flights      = JSON.parse(localStorage.getItem('imxx_flights'));
            this.state.trains       = JSON.parse(localStorage.getItem('imxx_trains'));
            this.state.buses        = JSON.parse(localStorage.getItem('imxx_buses'));
        } catch(e) {
            console.error("Failed to parse state from localStorage:", e);
        }

        const hasCorrupted = Array.isArray(this.state.destinations) && this.state.destinations.some(d => !d || !d.img || d.img.includes('#') || d.img.includes('🌌') || d.img.includes('Cosmic'));

        if (!Array.isArray(this.state.destinations) || this.state.destinations.length < 40 || hasCorrupted ||
            !Array.isArray(this.state.hotels) || this.state.hotels.length === 0 ||
            !Array.isArray(this.state.foodItems) || this.state.foodItems.length === 0) {
            this.seedData();
            localStorage.setItem('imxx_version', this.VERSION.toString());
            this.state.destinations = dedupeItems(JSON.parse(localStorage.getItem('imxx_destinations'))) || [];
            this.state.hotels       = dedupeItems(JSON.parse(localStorage.getItem('imxx_hotels')))       || [];
            this.state.foodItems    = JSON.parse(localStorage.getItem('imxx_food'))         || [];
            this.state.flights      = JSON.parse(localStorage.getItem('imxx_flights'))      || [];
            this.state.trains       = JSON.parse(localStorage.getItem('imxx_trains'))       || [];
            this.state.buses        = JSON.parse(localStorage.getItem('imxx_buses'))        || [];
        }

        // Auto-heal missing or invalid image URLs across all items
        const defaultFallbacks = {
            mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
            beaches: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            planets: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
            nature: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
            'nature-forest': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
            anime: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
            hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
            dest: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'
        };

        (this.state.destinations || []).forEach(d => {
            if (!d.img || typeof d.img !== 'string' || d.img.trim() === '') {
                d.img = defaultFallbacks[d.category] || defaultFallbacks.dest;
            }
        });
        (this.state.hotels || []).forEach(h => {
            if (!h.img || typeof h.img !== 'string' || h.img.trim() === '') {
                h.img = defaultFallbacks.hotel;
            }
        });
        (this.state.foodItems || []).forEach(f => {
            if (!f.img || typeof f.img !== 'string' || f.img.trim() === '') {
                f.img = defaultFallbacks.food;
            }
        });

        this.state.cart         = JSON.parse(localStorage.getItem('imxx_cart'))         || [];
        this.state.wishlist     = JSON.parse(localStorage.getItem('imxx_wishlist'))     || [];
        this.state.bookings     = JSON.parse(localStorage.getItem('imxx_bookings'))     || [];
        this.state.orders       = JSON.parse(localStorage.getItem('imxx_orders'))       || [];
        this.state.settings     = JSON.parse(localStorage.getItem('imxx_settings'))     || this.state.settings;
        this.state.currentUser  = JSON.parse(localStorage.getItem('imxx_currentUser'))  || null;
    },

    save(key, data) {
        const lsKey = key === 'foodItems' ? 'food' : key;
        this.state[key] = data;
        localStorage.setItem(`imxx_${lsKey}`, JSON.stringify(data));
    }
};
window.Store = Store;

// ==========================================
// CORE APP CONTROLLER
// ==========================================
const app = {

    async init() {
        this.themeManager = window.themeManager;
        Store.init();
        this.syncFreeItems();
        this.applySettings();
        this.updateUserUI();
        this.setupSearch();
        
        // Render local Store state INSTANTLY (0ms delay) so items show immediately
        this.renderAll();
        this.randomizeAllBanners();
        this.renderFoodCategories();

        // Fetch API updates asynchronously in background without blocking UI render
        this.loadDestinationsFromAPI().then(() => this.renderDestinations()).catch(() => {});
        this.loadHotelsFromAPI().then(() => this.renderHotels()).catch(() => {});

        this.startBannerRotator();
        this.setupCustomAutocomplete('tr-from', 'tr-from-dropdown');
        this.setupCustomAutocomplete('tr-to', 'tr-to-dropdown');
        this.loadStationsData();
        this.setup3DTiltEffect();

        // Check sidebar state preference
        if (localStorage.getItem('sidebar_closed') === 'true') {
            this.toggleSidebar(false);
        }

        // Close profile and color dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-profile-btn')) {
                this.closeProfileDropdown();
            }
            if (!e.target.closest('.color-palette-wrapper')) {
                this.closeColorPaletteDropdown();
            }
        });

        this.syncHoverPreviewUI();
        this.setAnimationTheme(this.animationTheme, false);
        this.setLoaderBgColor(this.loaderBgColor, false);
    },

    loaderBgColor: (function() {
        try {
            const saved = localStorage.getItem('nomad_loader_bg');
            return saved || 'navy';
        } catch(e) {
            return 'navy';
        }
    })(),

    setLoaderBgColor(colorName, notify = true) {
        const validBgs = ['navy', 'cyber', 'sapphire', 'emerald', 'crimson', 'oled'];
        if (!validBgs.includes(colorName)) colorName = 'navy';

        this.loaderBgColor = colorName;
        try {
            localStorage.setItem('nomad_loader_bg', colorName);
        } catch(e) {}

        const loader = document.getElementById('nature-loader');
        if (loader) {
            validBgs.forEach(b => loader.classList.remove(`loader-bg-${b}`));
            loader.classList.add(`loader-bg-${colorName}`);
        }

        this.syncLoaderBgUI();

        if (notify && typeof this.showNotification === 'function') {
            const names = {
                navy: 'Cosmic Navy',
                cyber: 'Cyber Neon Void',
                sapphire: 'Midnight Sapphire',
                emerald: 'Emerald Void',
                crimson: 'Velvet Crimson',
                oled: 'Pitch Black OLED'
            };
            this.showNotification(`Animation Background: ${names[colorName]}`, 'info');
        }
    },

    syncLoaderBgUI() {
        const color = this.loaderBgColor || 'navy';

        document.querySelectorAll('.lbg-dot').forEach(btn => {
            if (btn.getAttribute('data-bg') === color) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const settingSelect = document.getElementById('setting-loader-bg');
        if (settingSelect) settingSelect.value = color;
    },

    toggleColorPaletteDropdown(e) {
        if (e) e.stopPropagation();
        const dd = document.getElementById('color-palette-dropdown');
        if (dd) dd.classList.toggle('open');
    },

    closeColorPaletteDropdown() {
        const dd = document.getElementById('color-palette-dropdown');
        if (dd) dd.classList.remove('open');
    },

    animationTheme: (function() {
        try {
            const saved = localStorage.getItem('nomad_animation_theme');
            return saved || 'gold';
        } catch(e) {
            return 'gold';
        }
    })(),

    setAnimationTheme(themeName, notify = true) {
        const validThemes = ['gold', 'cyberpunk', 'sapphire', 'emerald', 'rosegold'];
        if (!validThemes.includes(themeName)) themeName = 'gold';

        this.animationTheme = themeName;
        try {
            localStorage.setItem('nomad_animation_theme', themeName);
        } catch(e) {}

        const root = document.documentElement;
        const body = document.body;
        const loader = document.getElementById('nature-loader');

        validThemes.forEach(t => {
            root.classList.remove(`anim-theme-${t}`);
            body.classList.remove(`anim-theme-${t}`);
            if (loader) loader.classList.remove(`anim-theme-${t}`);
        });

        root.classList.add(`anim-theme-${themeName}`);
        body.classList.add(`anim-theme-${themeName}`);
        if (loader) loader.classList.add(`anim-theme-${themeName}`);

        // Update portal compass icon
        const iconEl = document.getElementById('portal-compass-icon');
        if (iconEl) {
            const icons = {
                gold: 'fa-solid fa-compass',
                cyberpunk: 'fa-solid fa-bolt',
                sapphire: 'fa-solid fa-gem',
                emerald: 'fa-solid fa-leaf',
                rosegold: 'fa-solid fa-wand-magic-sparkles'
            };
            iconEl.className = icons[themeName] || 'fa-solid fa-compass';
        }

        // Update antiGravityEngine canvas particles if active
        if (window.AntiGravityEngine && typeof window.AntiGravityEngine.setTheme === 'function') {
            window.AntiGravityEngine.setTheme(themeName);
        }

        this.syncAnimationThemeUI();

        if (notify && typeof this.showNotification === 'function') {
            const names = {
                gold: 'Gold & Obsidian Luxe',
                cyberpunk: 'Cyberpunk Neon Future',
                sapphire: 'Royal Sapphire Nebula',
                emerald: 'Emerald Zen Aurora',
                rosegold: 'Sunset Rose Gold Velvet'
            };
            this.showNotification(`Animation Theme: ${names[themeName]}`, 'info');
        }
    },

    syncAnimationThemeUI() {
        const theme = this.animationTheme || 'gold';

        document.querySelectorAll('.lts-btn').forEach(btn => {
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const settingSelect = document.getElementById('setting-anim-theme');
        if (settingSelect) settingSelect.value = theme;
    },

    setLayoutView(mode) {
        if (window.layoutViewManager) {
            window.layoutViewManager.setLayout(mode);
        }
    },

    async loadDestinationsFromAPI() {
        try {
            const res = await fetch(getApiUrl('/api/destinations'));
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const mapped = data.map(item => {
                        if (!item) return null;
                        const rawPrice = (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.]/g, ''));
                        return {
                            id: String(item.id || Math.random()),
                            name: item.name || 'Destination',
                            location: item.location_text || 'Global',
                            rating: typeof item.rating === 'number' ? item.rating : 5.0,
                            price: isNaN(rawPrice) ? 1500 : rawPrice,
                            img: item.image ? (item.image.startsWith('/') || item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : '../' + item.image.replace(/^\.\.\//, '')) : '../pic/destination/d1.png',
                            desc: item.description || '',
                            video_url: item.video_url || '',
                            category: item.type === 'mountain' ? 'mountains' :
                                      item.type === 'beach' ? 'beaches' :
                                      item.type === 'planets' ? 'planets' :
                                      item.category === 'Interplanetary' ? 'planets' :
                                      item.type === 'anime' ? 'anime' :
                                      item.type === 'nature' ? 'nature' :
                                      item.type === 'forest' ? 'nature-forest' :
                                      item.type === 'nature-forest' ? 'nature-forest' : 'destinations'
                        };
                    }).filter(Boolean);
                    if (mapped.length > 0) {
                        const existingIds = new Set(Store.state.destinations.map(d => String(d.id)));
                        mapped.forEach(item => {
                            if (!existingIds.has(String(item.id))) {
                                Store.state.destinations.push(item);
                            }
                        });
                        Store.state.destinations = dedupeItems(Store.state.destinations);
                        this.renderDestinations();
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load destinations from SQLite API, using local fallback:", e);
        }
    },

    async loadHotelsFromAPI() {
        try {
            const res = await fetch(getApiUrl('/api/destinations?type=hotel'));
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const mapped = data.map(item => {
                        if (!item) return null;
                        const rawPrice = (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.]/g, ''));
                        return {
                            id: String(item.id || Math.random()),
                            name: item.name || 'Luxury Stay',
                            location: item.location_text || 'Global',
                            rating: typeof item.rating === 'number' ? item.rating : 5.0,
                            price: isNaN(rawPrice) ? 2500 : rawPrice,
                            img: item.image ? (item.image.startsWith('/') || item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : '../' + item.image.replace(/^\.\.\//, '')) : '../pic/hotel/h1.jpg',
                            amenities: ['fa-spa','fa-martini-glass','fa-water','fa-wifi'],
                            desc: item.description || '',
                            video_url: item.video_url || ''
                        };
                    }).filter(Boolean);
                    if (mapped.length > 0) {
                        const existingIds = new Set(Store.state.hotels.map(h => String(h.id)));
                        mapped.forEach(item => {
                            if (!existingIds.has(String(item.id))) {
                                Store.state.hotels.push(item);
                            }
                        });
                        Store.state.hotels = dedupeItems(Store.state.hotels);
                        this.renderHotels();
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load hotels from SQLite API, using local fallback:", e);
        }
    },

    setup3DTiltEffect() {
        let ticking = false;
        let lastTarget = null;
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.hotel-card') || e.target.closest('.bk-modal-box');
            if (card) {
                lastTarget = card;
                mouseX = e.clientX;
                mouseY = e.clientY;
                if (!ticking) {
                    requestAnimationFrame(() => {
                        if (lastTarget) {
                            const rect = lastTarget.getBoundingClientRect();
                            const x = mouseX - rect.left;
                            const y = mouseY - rect.top;
                            const isBox = lastTarget.classList.contains('bk-modal-box');
                            const maxDeg = isBox ? 4 : 10;
                            const rotateY = ((x / rect.width) - 0.5) * maxDeg;
                            const rotateX = (0.5 - (y / rect.height)) * maxDeg;
                            lastTarget.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
                            lastTarget.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            }
        }, { passive: true });

        document.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.hotel-card') || e.target.closest('.bk-modal-box');
            if (card && !card.contains(e.relatedTarget)) {
                card.style.transform = '';
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease';
            }
        }, { passive: true });
    },

    syncFreeItems() {
        if (!Store.state.cart) return;
        const realItems = Store.state.cart.filter(c => c.id !== 'free-water-bottle');
        if (realItems.length > 0) {
            const hasFreeBottle = Store.state.cart.some(c => c.id === 'free-water-bottle');
            if (!hasFreeBottle) {
                Store.state.cart.push({
                    id: 'free-water-bottle',
                    name: 'Free Premium Water Bottle',
                    desc: '10 Min FAST DELIVERY complimentary water bottle.',
                    price: 0,
                    img: '../pic/food/water_bottle.jpg',
                    qty: 1
                });
            }
        } else {
            Store.state.cart = [];
        }
    },

    masterStations: [],

    getStationCode(stationName) {
        if (!stationName) return 'ANY';
        // If it's already a short code (2-4 uppercase characters), return it
        if (stationName.length >= 2 && stationName.length <= 4 && stationName === stationName.toUpperCase()) {
            return stationName;
        }
        // Check if there is a parenthesis in the name containing the code, e.g. "New Delhi (NDLS)"
        const match = stationName.match(/\(([^)]+)\)/);
        if (match) return match[1].toUpperCase();

        const nameLower = stationName.toLowerCase().trim();
        // Popular static mapping
        if (nameLower.includes('new delhi') || nameLower === 'delhi') return 'NDLS';
        if (nameLower.includes('mumbai central') || nameLower === 'mumbai') return 'MMCT';
        if (nameLower.includes('chhatrapati shivaji') || nameLower === 'csmt') return 'CSMT';
        if (nameLower.includes('howrah')) return 'HWH';
        if (nameLower.includes('bengaluru') || nameLower === 'bangalore' || nameLower === 'sbc') return 'SBC';
        if (nameLower.includes('chennai') || nameLower === 'mas') return 'MAS';
        if (nameLower.includes('ahmedabad') || nameLower === 'adi') return 'ADI';

        // Try looking up in loaded masterStations
        if (this.masterStations && this.masterStations.length > 0) {
            const found = this.masterStations.find(f => 
                f.properties.name.toLowerCase() === nameLower ||
                f.properties.name.toLowerCase().includes(nameLower)
            );
            if (found && found.properties.code) {
                return found.properties.code.toUpperCase();
            }
        }
        return stationName.substring(0, 4).trim().toUpperCase();
    },

    async loadStationsData() {
        try {
            const res = await fetch('/stations.json');
            const data = await res.json();
            if (data && data.features) {
                this.masterStations = data.features.filter(f => f.properties && f.properties.code && f.properties.name);
            }
        } catch (e) {
            console.error('Failed to load Indian Railway stations data', e);
        }
    },

    setupCustomAutocomplete(inputId, dropdownId) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        if (!input || !dropdown) return;

        const renderSuggestions = async (query) => {
            const searchLower = query.trim().toLowerCase();
            if (searchLower.length === 0) {
                dropdown.innerHTML = '';
                dropdown.style.display = 'none';
                return;
            }
            if (searchLower.length < 2) {
                dropdown.innerHTML = '<div style="padding: 12px 16px; color: var(--text-secondary); font-size: 13px;">Type at least 2 characters</div>';
                dropdown.style.display = 'block';
                return;
            }

            try {
                const res = await fetch(getApiUrl(`/api/v1/train/suggest?text=${encodeURIComponent(query)}`));
                let suggestions = await res.json();
                if (Array.isArray(suggestions)) {
                    suggestions = suggestions.slice(0, 4);
                }
                
                if (!suggestions || suggestions.length === 0) {
                    dropdown.innerHTML = '<div style="padding: 12px 16px; color: var(--text-secondary); font-size: 13px;">No stations found</div>';
                    dropdown.style.display = 'block';
                    return;
                }

                let html = `<div class="ixigo-dropdown-header">Search Results</div>`;
                suggestions.forEach(station => {
                    const code = station.code;
                    const name = station.name;
                    html += `
                        <div class="ixigo-option" data-code="${code}" data-name="${name} (${code})">
                            <div class="ixigo-option-icon">
                                <i class="fa-solid fa-train-subway"></i>
                            </div>
                            <div class="ixigo-option-text">
                                <span class="ixigo-option-name">${name} (${code})</span>
                                <span class="ixigo-option-sub">Railway Station</span>
                            </div>
                        </div>
                    `;
                });
                dropdown.innerHTML = html;
                dropdown.style.display = 'block';

                // Add click listeners to options
                dropdown.querySelectorAll('.ixigo-option').forEach(opt => {
                    opt.addEventListener('mousedown', (e) => {
                        input.value = opt.getAttribute('data-name');
                        dropdown.style.display = 'none';
                    });
                });
            } catch (e) {
                console.error("Failed to fetch suggestions from backend:", e);
                dropdown.innerHTML = '<div style="padding: 12px 16px; color: var(--text-secondary); font-size: 13px;">Error loading stations</div>';
                dropdown.style.display = 'block';
            }
        };

        let debounceTimer;
        input.addEventListener('focus', () => {
            if (input.value.trim().length === 0) {
                dropdown.innerHTML = '';
                dropdown.style.display = 'none';
                return;
            }
            renderSuggestions(input.value);
            dropdown.style.display = 'block';
        });

        input.addEventListener('click', () => {
            if (input.value.trim().length === 0) {
                dropdown.innerHTML = '';
                dropdown.style.display = 'none';
                return;
            }
            renderSuggestions(input.value);
            dropdown.style.display = 'block';
        });

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.trim().length === 0) {
                clearTimeout(debounceTimer);
                dropdown.innerHTML = '';
                dropdown.style.display = 'none';
                return;
            }
            dropdown.innerHTML = '<div style="padding: 12px 16px; color: var(--text-secondary); font-size: 13px;">Searching...</div>';
            dropdown.style.display = 'block';
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                renderSuggestions(val);
            }, 300);
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 150);
        });
    },

    startBannerRotator() {
        setInterval(() => {
            const activeView = document.querySelector('.view.active');
            if (!activeView) return;
            const viewId = activeView.id.replace('view-', '');
            this.randomizeBannerForView(viewId, false);
        }, 4000);
    },

    randomizeBannerForView(viewName, instant = false) {
        const viewEl = document.getElementById(`view-${viewName}`);
        if (!viewEl) return;
        const bannerImg = viewEl.querySelector('.hero-banner img');
        if (!bannerImg) return;

        let items = [];
        if (viewName === 'hotels' || viewName === 'luxury') {
            items = Store.state.hotels;
        } else if (viewName === 'food') {
            items = Store.state.foodItems;
        } else if (viewName === 'flights') {
            const mode = Store.state.currentTransportMode || 'flight';
            let urls = [
                '../pic/flights/airplane.jpg',
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop',
                'https://images.unsplash.com/photo-149801224118a-5698b1e4c718?q=80&w=2074&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?q=80&w=2070&auto=format&fit=crop'
            ];
            if (mode === 'bus') {
                urls = [
                    '../pic/flights/bus.jpg',
                    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1494515426402-f1980ae7a01a?q=80&w=2070&auto=format&fit=crop'
                ];
            } else if (mode === 'train') {
                urls = [
                    '../pic/flights/train.jpg',
                    '../pic/trains/luxury_train_banner.png',
                    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=2000&q=80',
                    'https://images.unsplash.com/photo-1541427468627-a365315eadc5?auto=format&fit=crop&w=2074&q=80'
                ];
            }
            items = urls.map(u => ({ img: u }));
        } else if (viewName === 'trains') {
            const urls = [
                '../pic/trains/luxury_train_banner.png',
                '../pic/flights/train.jpg',
                'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=2000&q=80',
                'https://images.unsplash.com/photo-1541427468627-a365315eadc5?auto=format&fit=crop&w=2074&q=80'
            ];
            items = urls.map(u => ({ img: u }));
        } else if (['destinations', 'explore', 'home'].includes(viewName)) {
            items = Store.state.destinations;
        } else {
            items = Store.state.destinations.filter(d => d.category === viewName);
        }

        if (items && items.length) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            const newSrc = randomItem.img;
            if (!newSrc) return;

            if (instant) {
                bannerImg.src = newSrc;
            } else {
                bannerImg.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                bannerImg.style.opacity = '0';
                bannerImg.style.transform = 'scale(1.03)';
                setTimeout(() => {
                    bannerImg.src = newSrc;
                    bannerImg.onload = () => {
                        bannerImg.style.opacity = '1';
                        bannerImg.style.transform = '';
                        setTimeout(() => {
                            bannerImg.style.transition = '';
                        }, 400);
                    };
                }, 200);
            }
        }
    },

    randomizeAllBanners() {
        const views = ['home', 'hotels', 'food', 'flights', 'trains', 'destinations', 'mountains', 'beaches', 'planets', 'nature', 'nature-forest', 'anime'];
        views.forEach(v => this.randomizeBannerForView(v, true));
    },

    toggleSidebar(show) {
        const sidebar = document.getElementById('floating-sidebar');
        const openBtn = document.getElementById('sidebar-desktop-open-btn');
        if (!sidebar) return;

        if (show) {
            sidebar.classList.remove('sidebar-closed');
            if (openBtn) openBtn.style.display = 'none';
            localStorage.setItem('sidebar_closed', 'false');
        } else {
            sidebar.classList.add('sidebar-closed');
            if (openBtn) openBtn.style.display = 'flex';
            localStorage.setItem('sidebar_closed', 'true');
        }
    },

    toggleProfileDropdown(event) {
        if (event) event.stopPropagation();
        const dd = document.getElementById('profile-dropdown');
        if (dd) {
            dd.classList.toggle('active');
        }
    },

    closeProfileDropdown() {
        const dd = document.getElementById('profile-dropdown');
        if (dd) {
            dd.classList.remove('active');
        }
    },

    handleDropdownAuth() {
        const user = Store.state.currentUser;
        if (user) {
            this.logout();
        } else {
            this.openModal('modal-login');
        }
    },

    // ---- NAVIGATION ----
    switchView(viewName) {
        if (viewName === 'explore') viewName = 'home';
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const el = document.getElementById(`view-${viewName}`);
        if (el) el.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`) || document.querySelector('.nav-item[data-view="home"]');
        if (activeNav) activeNav.classList.add('active');
        Store.state.currentView = viewName;
        document.querySelector('.views-wrapper').scrollTop = 0;
        if (viewName === 'home' || viewName === 'explore') {
            this.renderDestinations();
            this.renderHotels();
        }
        if (viewName === 'hotels') {
            this.renderHotels();
        }
        if (['destinations', 'mountains', 'beaches', 'planets', 'nature', 'nature-forest', 'explore', 'home'].includes(viewName)) {
            this.renderDestinations();
        }
        if (viewName === 'dashboard') this.renderDashboard();
        if (viewName === 'wishlist')  this.renderWishlist();
        if (viewName === 'admin')     this.renderAdmin();
        if (viewName === 'trains')    this.searchTrains();
        if (viewName === 'food')      this.renderFoodMenu(Store.state.foodCategory || 'all', true);
        this.randomizeBannerForView(viewName, false);
        // Toggle Top Header Back to Home Button
        const headerBackBtn = document.getElementById('header-back-home-btn');
        if (headerBackBtn) {
            headerBackBtn.style.display = (viewName === 'home' || viewName === 'explore') ? 'none' : 'inline-flex';
        }

        // Close mobile sidebar on navigation
        const sb = document.getElementById('floating-sidebar');
        const bd = document.getElementById('mobile-sidebar-backdrop');
        if (sb) sb.classList.remove('mobile-open');
        if (bd) bd.style.display = 'none';
    },

    switchDashTab(tabId) {
        document.querySelectorAll('.dashboard-tabs .dash-tab').forEach(t => t.classList.remove('active'));
        const activeBtn = document.querySelector(`.dashboard-tabs .dash-tab[onclick*="${tabId}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        document.querySelectorAll('.dash-content').forEach(c => c.classList.remove('active'));
        const tab = document.getElementById(tabId);
        if (tab) tab.classList.add('active');
    },

    switchAdminTab(tabId) {
        document.querySelectorAll('.admin-tabs .dash-tab').forEach(t => t.classList.remove('active'));
        const activeBtn = document.querySelector(`.admin-tabs .dash-tab[onclick*="${tabId}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
        const tab = document.getElementById(tabId);
        if (tab) tab.classList.add('active');
        this.renderAdmin();
    },

    // ---- PANELS & MODALS ----
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        const overlay = document.getElementById('side-panel-overlay');
        if (!panel) return;
        if (!panel.classList.contains('open')) {
            document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
            panel.classList.add('open');
            if (overlay) overlay.classList.add('active');
        } else {
            this.closePanels();
        }
    },

    closePanels() {
        document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
        const ov = document.getElementById('side-panel-overlay');
        if (ov) ov.classList.remove('active');
    },

    createGoldSparkleBurst(event) {
        const x = event && event.clientX ? event.clientX : window.innerWidth / 2;
        const y = event && event.clientY ? event.clientY : window.innerHeight / 2;

        // 1. Shockwave Ripple Ring
        const ring = document.createElement('div');
        ring.className = 'gold-shockwave-ring';
        ring.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 3px solid #fce055;
            box-shadow: 0 0 30px #fce055, inset 0 0 20px #ec4899;
            transform: translate(-50%, -50%) scale(1);
            pointer-events: none;
            z-index: 999999;
            opacity: 1;
            transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease-out;
        `;
        document.body.appendChild(ring);
        requestAnimationFrame(() => {
            ring.style.transform = `translate(-50%, -50%) scale(22)`;
            ring.style.opacity = '0';
        });
        setTimeout(() => ring.remove(), 700);

        // 2. Starburst Particles
        const starIcons = ['✦', '★', '✧', '♦'];
        const colors = ['#fce055', '#d4af37', '#ec4899', '#6366f1', '#38bdf8', '#ffffff'];

        for (let i = 0; i < 36; i++) {
            const isStar = i % 2 === 0;
            const particle = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 160 + 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const rot = Math.random() * 720 - 360;

            if (isStar) {
                particle.textContent = starIcons[Math.floor(Math.random() * starIcons.length)];
                particle.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    color: ${color};
                    font-size: ${Math.random() * 16 + 12}px;
                    pointer-events: none;
                    z-index: 999999;
                    text-shadow: 0 0 16px ${color};
                    transform: translate(-50%, -50%) scale(1) rotate(0deg);
                    transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s linear;
                `;
            } else {
                const size = Math.random() * 10 + 6;
                particle.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 999999;
                    box-shadow: 0 0 18px ${color};
                    transform: translate(-50%, -50%) scale(1);
                    transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s linear;
                `;
            }

            document.body.appendChild(particle);

            requestAnimationFrame(() => {
                particle.style.transform = `translate(${tx - 10}px, ${ty - 10}px) scale(0) rotate(${rot}deg)`;
                particle.style.opacity = '0';
            });

            setTimeout(() => particle.remove(), 800);
        }
    },

    openModal(modalId) {
        const ov = document.getElementById('modal-overlay');
        if (ov) ov.classList.add('active');
        document.querySelectorAll('.fullscreen-modal').forEach(m => m.classList.remove('active'));
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');

        if (modalId === 'modal-forgot-password') {
            const p1 = document.getElementById('forgot-pane-1');
            const p2 = document.getElementById('forgot-pane-2');
            const p3 = document.getElementById('forgot-pane-3');
            if (p1) p1.style.display = 'block';
            if (p2) p2.style.display = 'none';
            if (p3) p3.style.display = 'none';

            const idInput = document.getElementById('forgot-identity');
            const codeInput = document.getElementById('forgot-code');
            const passInput = document.getElementById('forgot-new-pass');
            const confirmInput = document.getElementById('forgot-confirm-pass');
            if (idInput) idInput.value = '';
            if (codeInput) codeInput.value = '';
            if (passInput) passInput.value = '';
            if (confirmInput) confirmInput.value = '';

            const desc = document.getElementById('forgot-modal-desc');
            if (desc) desc.textContent = 'Reset your password via SMS verification';

            this.forgotIdentity = '';
            this.forgotCode = '';
        }

        if (modalId === 'modal-edit-profile') {
            const user = Store.state.currentUser;
            this.tempAvatarDataUrl = user ? (user.avatarUrl || '') : '';
            const editPreview = document.getElementById('edit-avatar-preview');
            if (editPreview) {
                editPreview.src = this.tempAvatarDataUrl || '../pic/profile.png';
            }
            // Highlight matching preset or clear all
            document.querySelectorAll('.preset-avatar-btn').forEach(btn => {
                const url = btn.getAttribute('data-url');
                if (url && url === this.tempAvatarDataUrl) {
                    btn.classList.add('active');
                    btn.style.borderColor = 'var(--gold)';
                } else {
                    btn.classList.remove('active');
                    btn.style.borderColor = 'transparent';
                }
            });
        }
    },

    closeModals() {
        const ov = document.getElementById('modal-overlay');
        if (ov) ov.classList.remove('active');
        document.querySelectorAll('.fullscreen-modal').forEach(m => { if (m.id !== 'modal-p2p') m.classList.remove('active'); });

        // Pause video walkthrough on modal close
        const videoPlayer = document.getElementById('details-video-player');
        if (videoPlayer) {
            videoPlayer.pause();
        }
        const galleryVideo = document.getElementById('gallery-video-player');
        if (galleryVideo) {
            galleryVideo.pause();
        }

        // Reset Signup Modal panes to default state
        const signupForm = document.getElementById('signup-form-pane');
        const signupVerify = document.getElementById('signup-verify-pane');
        if (signupForm && signupVerify) {
            signupForm.style.display = 'block';
            signupVerify.style.display = 'none';
            const title = document.getElementById('signup-modal-title');
            const desc = document.getElementById('signup-modal-desc');
            if (title) title.textContent = 'Join IMXX Premium';
            if (desc) desc.textContent = 'Create your exclusive account';
            const codeInput = document.getElementById('signup-verify-code');
            if (codeInput) codeInput.value = '';
        }
    },

    showQRPreview(src) {
        const img = document.getElementById('qr-preview-img');
        if (img) img.src = src;
        const modal = document.getElementById('modal-qr-preview');
        if (modal) modal.classList.add('active');
        const ov = document.getElementById('modal-overlay');
        if (ov) ov.classList.add('active');
    },

    closeQRPreview() {
        const modal = document.getElementById('modal-qr-preview');
        if (modal) modal.classList.remove('active');
        const ov = document.getElementById('modal-overlay');
        if (ov) ov.classList.remove('active');
    },

    // ---- TOAST NOTIFICATIONS ----
    showNotification(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i><span>${msg}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    },

    // ---- DETAILS MODAL ----
    openDetails(type, id) {
        this.currentModalItem = { type, id };
        let item;
        if (type === 'dest')  item = Store.state.destinations.find(d => String(d.id) === String(id));
        if (type === 'hotel') item = Store.state.hotels.find(h => String(h.id) === String(id));
        if (!item) return;

        // --- Banner image (smooth cross-fade + zoom) ---
        const bannerImg = document.getElementById('details-banner-img');
        if (bannerImg) {
            bannerImg.style.opacity = '0';
            bannerImg.style.transform = 'scale(1.08)';
            bannerImg.onerror = () => this.handleImgError(bannerImg, type);
            setTimeout(() => {
                bannerImg.src = item.img;
                bannerImg.onload = () => {
                    bannerImg.style.opacity = '1';
                    bannerImg.style.transform = '';
                };
                // Also set immediately in case cached
                bannerImg.style.opacity = '1';
                bannerImg.style.transform = '';
            }, 80);
        } else {
            document.getElementById('details-img-banner').style.backgroundImage = `url(${item.img})`;
        }
        
        // --- Blurred background update ---
        const modalBg = document.getElementById('modal-details-bg');
        if (modalBg) {
            modalBg.style.backgroundImage = `url(${item.img})`;
        }

        // --- Title & Location ---
        document.getElementById('details-title').textContent   = item.name;
        document.getElementById('details-location').innerHTML  = `<i class="fa-solid fa-location-dot"></i> ${item.location}`;

        // --- Price & Rating ---
        const priceEl = document.getElementById('details-price');
        if (priceEl) priceEl.textContent = `$${item.price.toLocaleString()} ${type === 'dest' ? '/ person' : '/ night'}`;
        const ratingBadge = document.getElementById('details-rating-badge');
        if (ratingBadge) ratingBadge.textContent = `⭐ ${item.rating || 5.0}`;

        // --- Info pills: weather & flight ---
        const weatherEl = document.getElementById('details-weather');
        const flightEl  = document.getElementById('details-flight');
        const weathers  = ['23°C | Sunny', '28°C | Tropical', '18°C | Partly Cloudy', '32°C | Clear Sky', '15°C | Breezy'];
        const flights   = ['1-2 Hours Flight', '2-3 Hours Flight', '4-6 Hours Flight', '8+ Hours Flight', '30 min Flight'];
        if (weatherEl) weatherEl.textContent = weathers[Math.floor(Math.random() * weathers.length)];
        if (flightEl)  flightEl.textContent  = flights[Math.floor(Math.random() * flights.length)];

        // --- Experience Description Overview ---
        const descEl = document.getElementById('details-desc');
        if (descEl) {
            descEl.textContent = item.desc || item.description || "Indulge in a premium travel experience crafted for the discerning voyager. This exclusive destination features breathtaking vistas, bespoke luxury stays, and private, custom-tailored exploration options.";
        }

        // --- Amenities / Rating ---
        let amHtml = '';
        if (type === 'hotel' && item.amenities) {
            amHtml = item.amenities.map(a => `<div class="amenity"><i class="fa-solid ${a}"></i></div>`).join('');
        } else {
            const stars = Math.round(item.rating);
            amHtml = `<div class="rating-pill" style="color:white;display:inline-flex;width:auto;">${'★'.repeat(stars)} ${item.rating}</div>`;
            if (item.category) amHtml += `<span class="cat-badge">${item.category}</span>`;
        }
        document.getElementById('details-amenities').innerHTML = amHtml;

        // --- Wishlist btn ---
        const isWishlisted = Store.state.wishlist.includes(id);
        const wlBtn = document.getElementById('details-wishlist-btn');
        if (wlBtn) {
            wlBtn.innerHTML = isWishlisted
                ? `<i class="fa-solid fa-heart" style="color:#ff3b30"></i>`
                : `<i class="fa-regular fa-heart"></i>`;
            wlBtn.onclick = () => {
                this.toggleWishlist({ stopPropagation: () => {} }, id);
                const isNowFav = Store.state.wishlist.includes(id);
                wlBtn.innerHTML = isNowFav
                    ? `<i class="fa-solid fa-heart" style="color:#ff3b30"></i>`
                    : `<i class="fa-regular fa-heart"></i>`;
            };
        }

        // --- Book / Buy buttons ---
        const buyBtn = document.getElementById('details-buy-btn');
        if (buyBtn) {
            buyBtn.onclick = (e) => {
                this.inlineBookingItem = item;
                this.startInlineBooking(e);
            };
        }
        this.currentDetailsItem = item;
        this.showOverviewInDetails();

        // --- ADD TO CART button ---
        const cartBtn = document.getElementById('details-cart-btn');
        if (cartBtn) {
            cartBtn.onclick = () => {
                // Add travel item to cart (separate from food cart — uses destinationCart)
                const destCart = JSON.parse(localStorage.getItem('imxx_dest_cart') || '[]');
                const existing = destCart.find(c => c.id === id);
                if (existing) {
                    existing.qty = (existing.qty || 1) + 1;
                } else {
                    destCart.push({
                        id,
                        name:  item.name,
                        price: item.price,
                        img:   item.img,
                        type:  type === 'hotel' ? 'Hotel' : 'Destination',
                        location: item.location,
                        qty:   1
                    });
                }
                localStorage.setItem('imxx_dest_cart', JSON.stringify(destCart));

                // Update cart badge counter (combine food + dest carts)
                const foodCount = Store.state.cart.reduce((s, i) => s + i.qty, 0);
                const destCount = destCart.reduce((s, i) => s + (i.qty || 1), 0);
                const badge = document.getElementById('cart-badge');
                const totalCount = foodCount + destCount;
                if (badge) { badge.textContent = totalCount; badge.style.display = totalCount > 0 ? 'flex' : 'none'; }

                // Visual feedback: pulse the button
                cartBtn.style.transform = 'scale(0.93)';
                cartBtn.style.background = '#22c55e';
                setTimeout(() => {
                    cartBtn.style.transform = '';
                    cartBtn.style.background = '';
                }, 300);

                this.showNotification(`✅ "${item.name}" added to cart!`, 'success');
            };
        }

        // --- MAP button - open Google Maps ---
        const mapBtn = document.getElementById('details-map-btn');
        if (mapBtn) mapBtn.onclick = () => window.open(`https://www.google.com/maps/search/${encodeURIComponent(item.location)}`, '_blank');

        // --- UNIVERSE button ---
        const univBtn = document.getElementById('details-universe-btn');
        if (univBtn) univBtn.onclick = () => this.showNotification('Universe Mode: Coming Soon 🚀', 'info');

        // --- FEEDBACK button ---
        const fbBtn = document.getElementById('details-feedback-btn');
        if (fbBtn) fbBtn.onclick = () => this.showNotification('Thank you for your feedback! ⭐', 'success');

        // --- Setup Item Video Player ---
        const videoPlayer = document.getElementById('details-video-player');
        const videoContainer = document.getElementById('details-video-container');
        const videoPlaceholder = document.getElementById('details-video-placeholder');
        const uploadStatus = document.getElementById('details-video-upload-status');
        
        if (uploadStatus) {
            uploadStatus.style.display = 'none';
        }
        
        if (item.video_url) {
            if (videoPlayer) {
                videoPlayer.src = getApiUrl(item.video_url);
                videoPlayer.load();
            }
            if (videoContainer) videoContainer.style.display = 'block';
            if (videoPlaceholder) videoPlaceholder.style.display = 'none';
        } else {
            if (videoPlayer) {
                videoPlayer.src = '';
                videoPlayer.load();
            }
            if (videoContainer) videoContainer.style.display = 'none';
            if (videoPlaceholder) videoPlaceholder.style.display = 'block';
        }

        this.openModal('modal-details');
    },

    slideDetails(dir) {
        if (!this.currentModalItem) return;
        const { type, id } = this.currentModalItem;
        const arr = type === 'dest' ? Store.state.destinations : Store.state.hotels;
        const idx = arr.findIndex(x => x.id === id);
        if (idx === -1) return;
        let newIdx = (idx + dir) % arr.length;
        if (newIdx < 0) newIdx = arr.length - 1;

        const modal = document.getElementById('modal-details');
        if (modal) {
            modal.classList.remove('active');
            void modal.offsetWidth; // Force CSS reflow to restart entrance animations
            modal.classList.add('active');
        }
        this.openDetails(type, arr[newIdx].id);
    },

    async uploadItemVideo(event) {
        const fileInput = event.target;
        const file = fileInput.files[0];
        if (!file) return;

        if (!this.currentModalItem) {
            this.showNotification("No item selected for video upload.", "error");
            return;
        }

        const { type, id } = this.currentModalItem;
        
        const statusDiv = document.getElementById('details-video-upload-status');
        const statusText = document.getElementById('upload-status-text');
        if (statusDiv) statusDiv.style.display = 'block';
        
        const formData = new FormData();
        formData.append('video', file);

        try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    if (statusText) statusText.textContent = `Uploading... ${percent}%`;
                }
            });

            const self = this;
            xhr.addEventListener('load', () => {
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300 && result.success) {
                        self.showNotification("Video uploaded successfully!", "success");
                        
                        let item = (Store.state.destinations || []).concat(Store.state.hotels || []).find(d => d.id == id);
                        if (item) {
                            item.video_url = result.videoUrl;
                        }
                        Store.save('destinations', Store.state.destinations);
                        Store.save('hotels', Store.state.hotels);

                        const videoPlayer = document.getElementById('details-video-player');
                        const videoContainer = document.getElementById('details-video-container');
                        const videoPlaceholder = document.getElementById('details-video-placeholder');
                        
                        if (videoPlayer) {
                            videoPlayer.src = getApiUrl(result.videoUrl);
                            videoPlayer.load();
                            if (videoContainer) videoContainer.style.display = 'block';
                            if (videoPlaceholder) videoPlaceholder.style.display = 'none';
                            videoPlayer.play().catch(e => console.log("Autoplay failed", e));
                        }
                    } else {
                        self.showNotification(result.error || "Upload failed. Please try again.", "error");
                    }
                } catch (parseErr) {
                    self.showNotification("Server returned an invalid response.", "error");
                }
                if (statusDiv) statusDiv.style.display = 'none';
                fileInput.value = '';
            });

            xhr.addEventListener('error', () => {
                this.showNotification("Network error uploading video.", "error");
                if (statusDiv) statusDiv.style.display = 'none';
                fileInput.value = '';
            });

            xhr.addEventListener('abort', () => {
                this.showNotification("Upload cancelled.", "error");
                if (statusDiv) statusDiv.style.display = 'none';
                fileInput.value = '';
            });

            xhr.open('POST', getApiUrl(`/api/destinations/${id}/video`));
            xhr.send(formData);
            
        } catch (error) {
            console.error("Upload error:", error);
            this.showNotification("Error uploading video: " + error.message, "error");
        } finally {
            if (statusDiv) statusDiv.style.display = 'none';
            fileInput.value = '';
        }
    },

    openVideoGallery() {
        const destinationsWithVideo = (Store.state.destinations || []).filter(d => d.video_url);
        const hotelsWithVideo = (Store.state.hotels || []).filter(h => h.video_url);
        const allItems = [
            ...destinationsWithVideo.map(item => ({ ...item, type: 'dest' })),
            ...hotelsWithVideo.map(item => ({ ...item, type: 'hotel' }))
        ];

        const gridEl = document.getElementById('gallery-video-grid');
        const emptyEl = document.getElementById('gallery-empty-state');
        const playerContainer = document.getElementById('gallery-video-player-container');
        const player = document.getElementById('gallery-video-player');

        if (playerContainer) playerContainer.style.display = 'none';
        if (player) {
            player.src = '';
            player.load();
        }

        if (allItems.length === 0) {
            if (gridEl) gridEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (gridEl) {
                gridEl.innerHTML = allItems.map(item => `
                    <div class="hotel-card" style="cursor:pointer;" onclick="app.playGalleryVideo('${item.type}', '${item.id}', '${item.name.replace(/'/g, "\\'")}', '${item.video_url}')">
                        <div class="hotel-card-img-container" style="position:relative; height:150px; background:#111;">
                            <img src="${item.img || 'assets/images/placeholder.jpg'}" onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'" style="width:100%; height:100%; object-fit:cover;">
                            <button onclick="app.deleteItemVideo(event, '${item.type}', '${item.id}')" 
                                    style="position:absolute; top:8px; right:8px; background:rgba(239, 68, 68, 0.85); color:#fff; border:none; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:transform 0.2s; z-index:10;" 
                                    title="Delete Video"
                                    onmouseover="this.style.transform='scale(1.15)'"
                                    onmouseout="this.style.transform='scale(1)'">
                                <i class="fa-solid fa-trash-can" style="font-size:12px;"></i>
                            </button>
                            <div style="position:absolute; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;">
                                <div style="width:50px; height:50px; border-radius:50%; background:rgba(212,175,55,0.9); display:flex; align-items:center; justify-content:center; color:#000; font-size:20px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
                                    <i class="fa-solid fa-play" style="margin-left:3px;"></i>
                                </div>
                            </div>
                        </div>
                        <div class="hotel-card-content" style="padding:12px;">
                            <h4 style="font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</h4>
                            <p style="font-size:12px; color:var(--text-secondary); margin:0;"><i class="fa-solid fa-location-dot" style="margin-right:4px;"></i>${item.location || 'Unknown'}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        this.openModal('modal-video-gallery');
    },

    openUploadVideoModal() {
        // Populate the dropdown with all destinations & hotels
        const selectEl = document.getElementById('gallery-upload-select');
        if (selectEl) {
            const allDropdownItems = [
                ...(Store.state.destinations || []).map(d => ({ id: d.id, name: d.name, type: 'dest' })),
                ...(Store.state.hotels || []).map(h => ({ id: h.id, name: h.name, type: 'hotel' }))
            ];
            selectEl.innerHTML = allDropdownItems.map(item => `
                <option value="${item.type}:${item.id}">${item.name} (${item.type === 'hotel' ? 'Hotel' : 'Destination'})</option>
            `).join('');
        }

        // Reset file input, info, and toggle
        const fileInput = document.getElementById('gallery-upload-file-input');
        const fileInfo = document.getElementById('upload-file-info');
        if (fileInput) fileInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';

        const videoRadio = document.querySelector('input[name="media-type-toggle"][value="video"]');
        if (videoRadio) {
            videoRadio.checked = true;
            if (typeof this.handleMediaTypeChange === 'function') {
                this.handleMediaTypeChange('video');
            }
        }

        this.openModal('modal-upload-video');
    },

    handleMediaTypeChange(type) {
        const fileInput = document.getElementById('gallery-upload-file-input');
        const dropIcon = document.getElementById('upload-drop-icon');
        const dropHint = document.getElementById('upload-drop-hint');
        
        if (type === 'photo') {
            if (fileInput) fileInput.accept = 'image/*';
            if (dropIcon) dropIcon.className = 'fa-solid fa-image';
            if (dropHint) dropHint.textContent = 'JPG, PNG, WEBP up to 10MB';
        } else {
            if (fileInput) fileInput.accept = 'video/*';
            if (dropIcon) dropIcon.className = 'fa-solid fa-film';
            if (dropHint) dropHint.textContent = 'MP4, WEBM, MOV, AVI up to 100MB';
        }
    },

    playGalleryVideo(type, id, name, videoUrl) {
        const playerContainer = document.getElementById('gallery-video-player-container');
        const player = document.getElementById('gallery-video-player');
        const titleEl = document.getElementById('gallery-video-title');
        const viewBtn = document.getElementById('gallery-video-view-btn');

        if (playerContainer) playerContainer.style.display = 'block';
        if (titleEl) titleEl.textContent = name;
        if (player) {
            player.src = getApiUrl(videoUrl);
            player.load();
            player.play().catch(e => console.log("Gallery autoplay failed", e));
        }

        if (viewBtn) {
            viewBtn.onclick = () => {
                this.closeModals();
                this.openDetails(type, id);
            };
        }
    },

    async uploadGalleryVideo(event) {
        const selectEl = document.getElementById('gallery-upload-select');
        const fileInput = document.getElementById('gallery-upload-file-input');
        if (!selectEl || !fileInput) return;

        const val = selectEl.value;
        const file = fileInput.files[0];
        if (!val || !file) {
            this.showNotification("Please select an item and choose a video file to upload.", "error");
            return;
        }

        const [type, rawId] = val.split(':');
        const id = (rawId && rawId.match(/\d+/)) ? rawId.match(/\d+/)[0] : rawId;

        const statusDiv = document.getElementById('gallery-upload-status');
        const statusText = document.getElementById('gallery-upload-status-text');
        const progressBar = document.getElementById('upload-progress-bar');
        const progressFill = document.getElementById('upload-progress-fill');
        const progressPercent = document.getElementById('upload-progress-percent');

        if (statusDiv) statusDiv.style.display = 'block';
        if (statusText) statusText.textContent = 'Preparing upload...';
        if (progressBar) progressBar.style.display = 'block';
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';

        const mediaTypeToggle = document.querySelector('input[name="media-type-toggle"]:checked');
        const mediaType = mediaTypeToggle ? mediaTypeToggle.value : 'video';

        const formData = new FormData();
        formData.append(mediaType === 'photo' ? 'image' : 'video', file);

        // Use XMLHttpRequest for upload progress tracking
        const xhr = new XMLHttpRequest();
        const self = this;

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                if (progressFill) progressFill.style.width = percent + '%';
                if (progressPercent) progressPercent.textContent = percent + '%';
                if (statusText) {
                    const loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
                    const totalMB = (e.total / (1024 * 1024)).toFixed(1);
                    statusText.textContent = `Uploading ${loadedMB}MB / ${totalMB}MB`;
                }
            }
        });

        xhr.upload.addEventListener('load', () => {
            if (progressFill) progressFill.style.width = '100%';
            if (progressPercent) progressPercent.textContent = '100%';
            if (statusText) statusText.textContent = 'Saving to database...';
        });

        xhr.addEventListener('load', () => {
            try {
                const result = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && result.success) {
                    self.showNotification(`✅ ${mediaType === 'photo' ? 'Photo' : 'Video'} uploaded & saved to database!`, "success");

                    // Update memory & local database state
                    let item = (Store.state.destinations || []).concat(Store.state.hotels || []).find(d => d.id == id || d.id == rawId);
                    if (item) {
                        if (mediaType === 'photo') {
                            item.image = result.imageUrl;
                        } else {
                            item.video_url = result.videoUrl;
                        }
                    }
                    Store.save('destinations', Store.state.destinations);
                    Store.save('hotels', Store.state.hotels);

                    // Close upload modal, open gallery to show uploaded videos
                    self.closeModals();
                    
                    if (mediaType === 'photo') {
                        // Re-render everything to show the new image
                        if (type === 'hotel') self.renderHotels();
                        else self.renderDestinations();
                        self.renderGalleryGrid();
                    } else {
                        setTimeout(() => {
                            self.openVideoGallery();
                            self.playGalleryVideo(type, id, item ? item.name : '', result.videoUrl);
                        }, 300);
                    }
                } else {
                    self.showNotification(result.error || "Upload failed. Please try again.", "error");
                }
            } catch (parseErr) {
                self.showNotification("Server returned an invalid response.", "error");
            }
            if (statusDiv) statusDiv.style.display = 'none';
            if (progressBar) progressBar.style.display = 'none';
            fileInput.value = '';
            const fileInfo = document.getElementById('upload-file-info');
            if (fileInfo) fileInfo.style.display = 'none';
        });

        xhr.addEventListener('error', () => {
            self.showNotification("Network error uploading video. Check your connection.", "error");
            if (statusDiv) statusDiv.style.display = 'none';
            if (progressBar) progressBar.style.display = 'none';
            fileInput.value = '';
        });

        xhr.addEventListener('abort', () => {
            self.showNotification("Upload cancelled.", "error");
            if (statusDiv) statusDiv.style.display = 'none';
            if (progressBar) progressBar.style.display = 'none';
            fileInput.value = '';
        });

        xhr.open('POST', getApiUrl(`/api/destinations/${id}/${mediaType === 'photo' ? 'image' : 'video'}`));
        xhr.send(formData);
    },

    async deleteItemVideo(event, type, id) {
        if (event) {
            event.stopPropagation();
        }

        if (!confirm("Are you sure you want to delete this promotional video? This cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(getApiUrl(`/api/destinations/${id}/video`), {
                method: 'DELETE'
            });

            const result = await response.json();
            if (response.ok && result.success) {
                this.showNotification("Video deleted successfully.", "success");

                // Update state
                let item;
                if (type === 'dest')  item = Store.state.destinations.find(d => d.id === id);
                if (type === 'hotel') item = Store.state.hotels.find(h => h.id === id);
                if (item) {
                    item.video_url = null;
                }

                // If this video is currently playing in the gallery player, stop it
                const player = document.getElementById('gallery-video-player');
                const playerContainer = document.getElementById('gallery-video-player-container');
                if (player && player.src.includes(`/api/destinations/${id}/video`)) {
                    player.pause();
                    player.src = '';
                    player.load();
                    if (playerContainer) playerContainer.style.display = 'none';
                }

                // Refresh the gallery grid
                this.openVideoGallery();
            } else {
                this.showNotification(result.error || "Delete failed.", "error");
            }
        } catch (error) {
            console.error("Delete error:", error);
            this.showNotification("Error deleting video: " + error.message, "error");
        }
    },

    // ---- WISHLIST ----
    toggleWishlist(e, id) {
        e.stopPropagation();
        const wl = Store.state.wishlist;
        const idx = wl.indexOf(id);
        const isFav = idx === -1;
        if (!isFav) { wl.splice(idx, 1); this.showNotification('Removed from wishlist', 'info'); }
        else        { wl.push(id);       this.showNotification('Added to wishlist! ✨ ❤️', 'success'); }
        Store.save('wishlist', wl);
        
        document.querySelectorAll(`[onclick*="app.toggleWishlist(event,'${id}')"]`).forEach(el => {
            if (el.classList.contains('fav-btn')) {
                isFav ? el.classList.add('active') : el.classList.remove('active');
            }
            const icon = el.querySelector('i');
            if (icon) {
                icon.className = (isFav ? 'fa-solid' : 'fa-regular') + ' fa-heart';
            }
        });
        
        if (Store.state.currentView === 'wishlist')  this.renderWishlist();
        if (Store.state.currentView === 'dashboard') this.renderDashboard();
    },

    // ==========================================
    // RENDER ENGINE
    // ==========================================
    renderAll() {
        this.renderDestinations();
        this.renderHotels();
        this.renderFoodMenu('all', true);
        this.updateCartUI();
        this.renderDashboard();
        this.renderAdmin();
        this.searchFlights(); // Added to render flights initially
        this.searchTrains();  // Added to render trains initially
    },

    handleImgError(el, category = 'dest') {
        if (!el) return;
        const rawSrc = el.getAttribute('src') || '';
        
        if (!el.dataset.tryStep) {
            el.dataset.tryStep = '1';
            if (rawSrc.startsWith('../pic/')) {
                el.src = rawSrc.replace('../pic/', 'pic/');
                return;
            } else if (rawSrc.startsWith('pic/')) {
                el.src = '../' + rawSrc;
                return;
            } else if (rawSrc.startsWith('assets/')) {
                el.src = '../' + rawSrc;
                return;
            } else if (rawSrc.startsWith('../assets/')) {
                el.src = rawSrc.replace('../assets/', 'assets/');
                return;
            }
        }
        
        el.onerror = () => {
            el.onerror = null;
            el.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231a1a24"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d4af37" font-family="sans-serif" font-size="20" font-weight="bold">IMXX Luxury Experience</text></svg>';
        };

        const fallbacks = {
            mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
            beaches: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            planets: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
            nature: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
            'nature-forest': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
            anime: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
            hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
            flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
            dest: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'
        };
        el.src = fallbacks[category] || fallbacks[el.dataset.category] || fallbacks.dest;
    },

    // --- Hover Popover Logic ---
    hoverPreviewEnabled: (function() {
        try {
            const saved = localStorage.getItem('nomad_hover_preview');
            return saved !== null ? saved === 'true' : true;
        } catch(e) {
            return true;
        }
    })(),

    toggleHoverPreview(explicitState) {
        if (typeof explicitState === 'boolean') {
            this.hoverPreviewEnabled = explicitState;
        } else {
            this.hoverPreviewEnabled = !this.hoverPreviewEnabled;
        }
        try {
            localStorage.setItem('nomad_hover_preview', this.hoverPreviewEnabled ? 'true' : 'false');
        } catch(e) {}

        if (!this.hoverPreviewEnabled) {
            this.hideHoverPopover();
        }

        this.syncHoverPreviewUI();
        this.showNotification(`Hover Image Preview ${this.hoverPreviewEnabled ? 'Enabled' : 'Disabled'}`, 'info');
    },

    syncHoverPreviewUI() {
        const isEnabled = this.hoverPreviewEnabled !== false;
        
        // 1. Settings view switch
        const settingCb = document.getElementById('setting-hover-popover');
        if (settingCb) settingCb.checked = isEnabled;

        // 2. Header action toggle button
        const btn = document.getElementById('header-hover-preview-toggle');
        const icon = document.getElementById('header-hover-preview-icon');
        if (btn) {
            if (isEnabled) {
                btn.classList.add('active');
                btn.title = "Hover Image Preview: Enabled (Click to turn off)";
            } else {
                btn.classList.remove('active');
                btn.title = "Hover Image Preview: Disabled (Click to turn on)";
            }
        }
        if (icon) {
            icon.className = isEnabled ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
        }
    },

    showHoverPopover(e, id, type) {
        if (this.hoverPreviewEnabled === false) return;

        let item = null;
        if (type === 'dest') item = Store.state.destinations.find(d => String(d.id) === String(id));
        if (type === 'hotel') item = Store.state.hotels.find(h => String(h.id) === String(id));
        if (!item) return;

        const popover = document.getElementById('hover-popover');
        if (!popover) return;

        document.getElementById('hp-img').src = item.img || '';
        document.getElementById('hp-title').textContent = item.name || '';
        document.getElementById('hp-loc').textContent = item.location || item.location_text || 'Global';
        document.getElementById('hp-desc').textContent = item.desc || item.description || '';
        
        const rawPrice = (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.]/g, ''));
        const priceNum = isNaN(rawPrice) ? 0 : rawPrice;
        document.getElementById('hp-price').textContent = `$${priceNum.toLocaleString()} ${type === 'dest' ? '/ person' : '/ night'}`;
        document.getElementById('hp-badge').textContent = `⭐ ${item.rating || 5.0}`;

        this.moveHoverPopover(e);
        popover.classList.add('active');
    },

    moveHoverPopover(e) {
        if (this.hoverPreviewEnabled === false) return;
        // Disabled: User requested fixed position in top-left instead of following mouse.
    },

    hideHoverPopover() {
        const popover = document.getElementById('hover-popover');
        if (popover) {
            popover.classList.remove('active');
        }
    },

    // --- Inline Booking Methods inside Details Modal (No Modal Jumping) ---
    inlineStep: 1,
    inlineBookingItem: null,
    inlineGuests: 2,
    inlinePaymentMethod: 'Credit Card',

    startInlineBooking(e) {
        if (e) e.stopPropagation();
        const overviewView = document.getElementById('details-view-overview');
        const bookingView  = document.getElementById('details-view-booking');
        const backBtn      = document.getElementById('details-back-to-overview-btn');

        if (overviewView) overviewView.style.display = 'none';
        if (bookingView)  bookingView.style.display  = 'flex';
        if (backBtn)      backBtn.style.display      = 'flex';

        this.inlineStep   = 1;
        this.inlineGuests = 2;

        const utrInput = document.getElementById('inline-b-utr-input');
        if (utrInput) utrInput.value = '';

        const item = this.inlineBookingItem || this.currentDetailsItem;
        const payingForEl = document.getElementById('inline-b-paying-for');
        if (payingForEl && item) {
            payingForEl.textContent = item.name ? `Booking: ${item.name}` : '';
        }
        const priceNoteEl = document.getElementById('inline-b-price-note');
        if (priceNoteEl && item) {
            const rawPrice = (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.]/g, ''));
            const priceNum = isNaN(rawPrice) ? 1500 : rawPrice;
            priceNoteEl.textContent = `$${priceNum.toLocaleString()} / night (Guaranteed Best Rate)`;
        }

        this.goInlineStep(1);
    },

    showOverviewInDetails() {
        const overviewView = document.getElementById('details-view-overview');
        const bookingView  = document.getElementById('details-view-booking');
        const backBtn      = document.getElementById('details-back-to-overview-btn');

        if (overviewView) overviewView.style.display = 'flex';
        if (bookingView)  bookingView.style.display  = 'none';
        if (backBtn)      backBtn.style.display      = 'none';

        this.inlineStep = 1;
        const nextBtn = document.getElementById('inline-b-next-btn');
        if (nextBtn) {
            nextBtn.innerHTML = `<span>Next</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
    },

    updateInlineGuests(delta) {
        const next = (this.inlineGuests || 2) + delta;
        if (next >= 1 && next <= 20) {
            this.inlineGuests = next;
            const el = document.getElementById('inline-b-guest-count');
            if (el) el.textContent = this.inlineGuests;
        }
    },

    selectInlinePayment(pm, el) {
        this.inlinePaymentMethod = pm;
        document.querySelectorAll('#in-step-4 .payment-method-card').forEach(c => c.classList.remove('active'));
        if (el) el.classList.add('active');

        const qrBox = document.getElementById('inline-upi-qr-box');
        if (qrBox) {
            qrBox.style.display = (pm === 'UPI') ? 'flex' : 'none';
        }
    },

    inlineRoomMultiplier: 1.0,

    selectInlineRoom(mult, el) {
        this.inlineRoomMultiplier = parseFloat(mult) || 1.0;
        document.querySelectorAll('#in-step-3 .payment-method-card').forEach(c => c.classList.remove('active'));
        if (el) el.classList.add('active');
    },

    triggerSuccessConfetti() {
        const container = document.getElementById('details-modal-card') || document.body;
        const colors = ['#f5c842', '#10b981', '#ffffff', '#d4a017', '#38bdf8', '#ec4899'];
        
        for (let i = 0; i < 45; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            const size = Math.floor(Math.random() * 8) + 6;
            const bg = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const animDuration = (Math.random() * 2 + 1.5).toFixed(2);
            const animDelay = (Math.random() * 0.4).toFixed(2);

            confetti.style.cssText = `
                position: absolute;
                top: -10px;
                left: ${left}%;
                width: ${size}px;
                height: ${size * (Math.random() > 0.5 ? 1 : 2.2)}px;
                background: ${bg};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                z-index: 99999;
                pointer-events: none;
                box-shadow: 0 0 10px ${bg};
                animation: confettiFall ${animDuration}s cubic-bezier(0.25, 1, 0.5, 1) ${animDelay}s forwards;
            `;
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), (parseFloat(animDuration) + parseFloat(animDelay)) * 1000 + 200);
        }
    },

    goInlineStep(step) {
        if (step < 1) {
            this.showOverviewInDetails();
            return;
        }

        if (step === 6) {
            this.submitInlineUTRAndComplete();
            return;
        }

        this.inlineStep = step;

        document.querySelectorAll('#inline-booking-steps .bk-step-item').forEach((s, i) => {
            const stepIdx = i + 1;
            s.classList.remove('active', 'completed');
            if (stepIdx === step) {
                s.classList.add('active');
            } else if (stepIdx < step) {
                s.classList.add('completed');
            }
        });

        document.querySelectorAll('.in-b-step').forEach(s => s.style.display = 'none');
        const activeStepEl = document.getElementById(`in-step-${step}`);
        if (activeStepEl) activeStepEl.style.display = 'block';

        const backBtn = document.getElementById('inline-b-back-btn');
        if (backBtn) backBtn.style.display = 'flex';

        const nextBtn = document.getElementById('inline-b-next-btn');
        if (nextBtn) {
            if (step === 5) {
                nextBtn.innerHTML = `<span>Verify UTR & Complete</span> <i class="fa-solid fa-circle-check"></i>`;
                nextBtn.onclick = () => this.submitInlineUTRAndComplete();
            } else if (step === 4) {
                nextBtn.innerHTML = `<span>Confirm Payment</span> <i class="fa-solid fa-arrow-right"></i>`;
                nextBtn.onclick = () => this.nextInlineStep();
            } else {
                nextBtn.innerHTML = `<span>Next</span> <i class="fa-solid fa-arrow-right"></i>`;
                nextBtn.onclick = () => this.nextInlineStep();
            }
        }
    },

    submitInlineUTRAndComplete() {
        const utrInput = document.getElementById('inline-b-utr-input');
        let utrVal = utrInput ? utrInput.value.trim() : '';

        if (!utrVal) {
            utrVal = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
            if (utrInput) utrInput.value = utrVal;
        }

        const item = this.inlineBookingItem || this.currentDetailsItem || {};
        const rawPrice = (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : parseFloat(String(item.price || '').replace(/[^0-9.]/g, ''));
        const priceNum = isNaN(rawPrice) ? 1500 : rawPrice;
        const total = priceNum * (this.inlineGuests || 1);
        const bookingId = 'IMXX-' + Math.floor(100000 + Math.random() * 900000) + '-LUX';

        const booking = {
            id: bookingId,
            utr: utrVal,
            name: item.name || 'Luxury Escape',
            guests: this.inlineGuests || 2,
            suite: 'Deluxe Suite',
            paymentMethod: this.inlinePaymentMethod || 'Credit Card / UPI',
            price: priceNum,
            total: total,
            date: new Date().toISOString()
        };

        const bkgs = Store.state.bookings || [];
        bkgs.push(booking);
        Store.save('bookings', bkgs);

        // Close details modal
        this.closeModals();

        // Trigger grand payment success animation with UTR details
        this.showPaymentSuccess(
            bookingId,
            'Order Completed & UTR Verified! 🎉',
            `UTR Ref: ${utrVal} • Reservation Confirmed`,
            total,
            [
                { icon: 'fa-solid fa-receipt', text: `UTR: ${utrVal}` },
                { icon: 'fa-solid fa-hotel', text: item.name || 'Luxury Villa' },
                { icon: 'fa-solid fa-users', text: `${this.inlineGuests || 2} Guests` }
            ]
        );
    },

    nextInlineStep() {
        this.goInlineStep((this.inlineStep || 1) + 1);
    },

    // --- Destination card ---
    renderDestCard(d) {
        if (!d) return '';
        const idStr = String(d.id || '');
        const wl = Array.isArray(Store.state.wishlist) && idStr ? Store.state.wishlist.includes(idStr) : false;
        const cat = d.category || 'dest';
        const rawPrice = (typeof d.price === 'number' && !isNaN(d.price)) ? d.price : parseFloat(String(d.price || '').replace(/[^0-9.]/g, ''));
        const priceNum = isNaN(rawPrice) ? 1500 : rawPrice;
        const rating = d.rating || 5.0;
        const name = d.name || 'Luxury Destination';
        const loc = d.location || 'Global';
        const img = d.img || '../pic/destination/d1.png';
        return `
            <div class="hotel-card" onclick="app.openDetails('dest','${idStr}')" onmouseenter="app.showHoverPopover(event, '${idStr}', 'dest')" onmousemove="app.moveHoverPopover(event)" onmouseleave="app.hideHoverPopover()">
                <div class="hotel-img-wrap">
                    <img src="${img}" alt="${name}" loading="lazy" data-category="${cat}" onerror="app.handleImgError(this,'${cat}')">
                    <div class="fav-btn ${wl ? 'active' : ''}" style="position:absolute;top:12px;right:12px" onclick="app.toggleWishlist(event,'${idStr}')">
                        <i class="${wl ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </div>
                    <div class="hotel-badge">⭐ ${rating}</div>
                </div>
                <div class="hotel-info">
                    <h4>${name}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${loc}</p>
                    <p style="margin-top:8px;margin-bottom:12px;height:36px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:var(--text-secondary);font-size:13px">${d.desc || ''}</p>
                    <div class="hotel-footer">
                        <div class="dest-price">$${priceNum.toLocaleString()} <span>/ person</span></div>
                        <button class="btn-premium" style="width:auto;padding:8px 16px;font-size:12px" onclick="event.stopPropagation();app.openDetails('dest','${idStr}')">View</button>
                    </div>
                </div>
            </div>`;
    },

    renderDestinations(filterFn) {
        if (!Array.isArray(Store.state.destinations) || Store.state.destinations.length === 0) {
            Store.seedData();
            Store.loadState();
        }
        const deduped = dedupeItems(Store.state.destinations);
        const all   = filterFn ? deduped.filter(filterFn) : deduped;
        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

        const mts   = shuffle(all.filter(d => d.category === 'mountains'));
        const bch   = shuffle(all.filter(d => d.category === 'beaches'));
        const plt   = shuffle(all.filter(d => d.category === 'planets'));
        const anm   = shuffle(all.filter(d => d.category === 'anime'));
        const nat   = shuffle(all.filter(d => d.category === 'nature'));
        const forest = shuffle(all.filter(d => d.category === 'nature-forest'));

        const fill = (id, arr) => {
            const el = document.getElementById(id);
            if (!el) return;
            try {
                const cardsHtml = arr.map(d => {
                    try { return this.renderDestCard(d); } catch(e) { console.error(e); return ''; }
                }).filter(Boolean).join('');
                el.innerHTML = cardsHtml.length ? cardsHtml : `<p style="color:var(--text-secondary);grid-column:1/-1;padding:40px 0">No items found.</p>`;
            } catch(err) {
                console.error("Failed filling container " + id, err);
            }
        };

        const shuffledAll = shuffle(all);
        fill('home-destinations',  shuffledAll);
        fill('cat-destinations',   shuffledAll);
        fill('cat-mountains',      mts.length ? mts : shuffledAll);
        fill('cat-beaches',        bch.length ? bch : shuffledAll);
        fill('cat-planets',        plt.length ? plt : shuffledAll);
        fill('cat-anime',          anm.length ? anm : shuffledAll);
        fill('cat-nature',         nat.length ? nat : shuffledAll);
        fill('cat-nature-forest',  forest.length ? forest : shuffledAll);
    },

    // --- Hotel card ---
    renderHotelCard(h) {
        if (!h) return '';
        const idStr = String(h.id || '');
        const wl = Array.isArray(Store.state.wishlist) && idStr ? Store.state.wishlist.includes(idStr) : false;
        const rawPrice = (typeof h.price === 'number' && !isNaN(h.price)) ? h.price : parseFloat(String(h.price || '').replace(/[^0-9.]/g, ''));
        const priceNum = isNaN(rawPrice) ? 2500 : rawPrice;
        const rating = h.rating || 5.0;
        const name = h.name || 'Luxury Stay';
        const loc = h.location || 'Global';
        const img = h.img || '../pic/hotel/h1.jpg';
        const amenities = Array.isArray(h.amenities) ? h.amenities : ['fa-spa','fa-martini-glass','fa-water','fa-wifi'];
        return `
            <div class="hotel-card" onclick="app.openDetails('hotel','${idStr}')" onmouseenter="app.showHoverPopover(event, '${idStr}', 'hotel')" onmousemove="app.moveHoverPopover(event)" onmouseleave="app.hideHoverPopover()">
                <div class="hotel-img-wrap">
                    <img src="${img}" alt="${name}" loading="lazy" onerror="app.handleImgError(this,'hotel')">
                    <div class="fav-btn ${wl ? 'active' : ''}" style="position:absolute;top:12px;right:12px" onclick="app.toggleWishlist(event,'${idStr}')">
                        <i class="${wl ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </div>
                    <div class="hotel-badge">⭐ ${rating}</div>
                </div>
                <div class="hotel-info">
                    <h4>${name}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${loc}</p>
                    <div class="hotel-amenities">${amenities.slice(0,4).map(a => `<div class="amenity"><i class="fa-solid ${a}"></i></div>`).join('')}</div>
                    <div class="hotel-footer">
                        <div class="dest-price">$${priceNum.toLocaleString()} <span>/ night</span></div>
                        <div style="display:flex;gap:8px">
                            <button class="add-btn" onclick="event.stopPropagation();app.toggleWishlist(event,'${idStr}')"><i class="${wl ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
                            <button class="btn-premium" style="width:auto;padding:8px 16px;font-size:12px" onclick="event.stopPropagation();app.bookingEngine.start(Store.state.hotels.find(item=>item.id==='${idStr}'))">Book</button>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    renderHotels(filterFn) {
        if (!Array.isArray(Store.state.hotels) || Store.state.hotels.length === 0) {
            Store.seedData();
            Store.loadState();
        }
        const deduped = dedupeItems(Store.state.hotels);
        const all  = filterFn ? deduped.filter(filterFn) : deduped;
        const shuffledHotels = [...all].sort(() => Math.random() - 0.5);
        const fillGrid = (id, arr) => {
            const el = document.getElementById(id);
            if (!el) return;
            try {
                const cardsHtml = arr.map(h => {
                    try { return this.renderHotelCard(h); } catch(e) { console.error(e); return ''; }
                }).filter(Boolean).join('');
                el.innerHTML = cardsHtml.length ? cardsHtml : `<p style="color:var(--text-secondary);grid-column:1/-1;padding:40px 0">No stays found.</p>`;
            } catch(err) {
                console.error("Failed filling hotel container " + id, err);
            }
        };
        fillGrid('all-hotels',  shuffledHotels);
        fillGrid('home-hotels', shuffledHotels);
    },

    // --- Food ---
    renderFoodCategories() {
        const cats = [
            { id: 'all',     icon: '🍽️', label: 'All' },
            { id: 'pizza',   icon: '🍕', label: 'Pizza' },
            { id: 'burger',  icon: '🍔', label: 'Burger' },
            { id: 'indian',  icon: '🍛', label: 'Indian' },
            { id: 'chinese', icon: '🥢', label: 'Chinese' },
            { id: 'desserts',icon: '🍰', label: 'Desserts' },
            { id: 'drinks',  icon: '🥂', label: 'Drinks' },
        ];
        const el = document.getElementById('food-categories-container');
        if (!el) return;
        el.innerHTML = cats.map(c => `
            <div class="food-cat ${c.id === 'all' ? 'active' : ''}" id="fcat-${c.id}" onclick="app.renderFoodMenu('${c.id}')">
                <span style="font-size:22px">${c.icon}</span>${c.label}
            </div>`).join('');
    },

    renderFoodMenu(category = 'all', shouldShuffle = false) {
        Store.state.foodCategory = category;
        // Update active tab
        document.querySelectorAll('.food-cat').forEach(el => el.classList.remove('active'));
        const activeTab = document.getElementById(`fcat-${category}`);
        if (activeTab) activeTab.classList.add('active');

        const title = document.getElementById('food-menu-title');
        if (title) title.textContent = category === 'all' ? 'All Menus' : category.charAt(0).toUpperCase() + category.slice(1);

        const container = document.getElementById('food-menu-container');
        if (!container) return;

        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

        const allCategories = {
            pizza: 'Gourmet Pizzas',
            burger: 'Signature Burgers',
            indian: 'Indian Delicacies',
            chinese: 'Chinese Specialties',
            desserts: 'Exquisite Desserts',
            drinks: 'Premium Drinks'
        };

        const renderItemCard = (f) => {
            const cartItem = Store.state.cart.find(c => c.id === f.id);
            const qty = cartItem ? cartItem.qty : 0;
            const buttonHtml = qty > 0 ? `
                <div class="qty-controls" style="margin-top:0; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); border-radius:30px; padding:2px 8px; display:inline-flex; align-items:center; gap:6px;">
                    <button class="qty-btn" style="width:24px; height:24px; font-size:10px; background:rgba(255,255,255,0.15);" onclick="event.stopPropagation(); app.cartSystem.update('${f.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                    <span style="font-weight:700; font-size:13px; color:var(--gold); min-width:14px; text-align:center;">${qty}</span>
                    <button class="qty-btn" style="width:24px; height:24px; font-size:10px; background:rgba(255,255,255,0.15);" onclick="event.stopPropagation(); app.cartSystem.update('${f.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            ` : `
                <button class="add-btn" style="padding:8px 16px;font-size:12px" onclick="event.stopPropagation();app.cartSystem.add('${f.id}')"><i class="fa-solid fa-plus"></i> Add</button>
            `;

            return `
                <div class="hotel-card" onclick="app.openDetails('food','${f.id}')">
                    <div class="hotel-img-wrap">
                        <img src="${f.img}" alt="${f.name}" loading="lazy" onerror="app.handleImgError(this,'food')">
                        <div class="hotel-badge">⭐ ${f.rating}</div>
                    </div>
                    <div class="hotel-info">
                        <span class="cat-badge" style="margin-bottom:8px">${f.rest}</span>
                        <h4 style="margin-top:6px">${f.name}</h4>
                        <p style="margin-bottom:12px;height:36px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:var(--text-secondary);font-size:13px">${f.desc}</p>
                        <div class="hotel-footer" style="border-top:1px solid rgba(255,255,255,0.05);padding-top:16px">
                            <div class="dest-price">$${f.price.toLocaleString()}</div>
                            ${buttonHtml}
                        </div>
                    </div>
                </div>`;
        };

        if (category === 'all') {
            let html = '';
            for (const [catKey, catTitle] of Object.entries(allCategories)) {
                const items = shuffle(Store.state.foodItems.filter(f => f.category === catKey));
                if (items.length) {
                    html += `
                        <div class="food-category-section" style="margin-bottom: 40px;">
                            <div class="section-header" style="margin-top: 30px; margin-bottom: 16px;">
                                <h3 style="font-size: 20px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; margin: 0;">
                                    <span>${catTitle}</span>
                                    <span style="font-size: 13px; font-weight: 500; color: var(--text-secondary); background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 12px;">${items.length} items</span>
                                </h3>
                            </div>
                            <div class="grid-3">
                                ${items.map(renderItemCard).join('')}
                            </div>
                        </div>
                    `;
                }
            }
            container.innerHTML = html || `<p style="color:var(--text-secondary);text-align:center;padding:60px;">No items found.</p>`;
        } else {
            const items = shuffle(Store.state.foodItems.filter(f => f.category === category));
            container.innerHTML = items.length ? `
                <div class="grid-3" style="margin-top: 16px;">
                    ${items.map(renderItemCard).join('')}
                </div>
            ` : `<p style="color:var(--text-secondary);text-align:center;padding:60px;">No items in this category.</p>`;
        }
    },

    // --- Wishlist ---
    renderWishlist() {
        const allItems = [...Store.state.destinations, ...Store.state.hotels];
        const saved    = allItems.filter(i => Store.state.wishlist.includes(i.id));
        const grid     = document.getElementById('wishlist-grid');
        if (!grid) return;
        if (!saved.length) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--text-secondary)"><i class="fa-regular fa-heart" style="font-size:60px;margin-bottom:20px;display:block;color:var(--gold)"></i><h3>Your wishlist is empty</h3><p style="margin-top:8px">Heart any destination or hotel to save it here.</p></div>`;
            return;
        }
        grid.innerHTML = saved.map(item => {
            const isHotel = Store.state.hotels.some(h => h.id === item.id);
            return isHotel ? this.renderHotelCard(item) : this.renderDestCard(item);
        }).join('');
    },

    // --- Dashboard ---
    renderDashboard() {
        const el = id => document.getElementById(id);
        if (el('stat-bookings')) el('stat-bookings').textContent = Store.state.bookings.length;
        if (el('stat-orders'))   el('stat-orders').textContent   = Store.state.orders.length;
        if (el('stat-saved'))    el('stat-saved').textContent    = Store.state.wishlist.length;

        const bList = el('booking-list');
        if (bList) bList.innerHTML = Store.state.bookings.length
            ? Store.state.bookings.map(b => {
                const imgUrl = this.getBookingImage(b);
                return `
                <div class="history-item" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="app.showBookingDetails('${b.id}')">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <img src="${imgUrl}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;" onerror="this.src='../pic/hotel/h1.jpg'">
                        <div>
                            <h4 style="color:var(--gold);margin-bottom:5px">${b.id}</h4>
                            <h3>${b.hotelName || b.destination || 'Booking'}</h3>
                            <p style="color:var(--text-secondary);font-size:13px;margin-top:5px">${b.dates || ''} ${b.guests ? `• ${b.guests} Guests` : ''} ${b.room ? `• ${b.room}` : ''} ${b.type ? `• ${b.type}` : ''}</p>
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div class="dest-price">$${(b.total||0).toLocaleString()}</div>
                        <span class="status-badge confirmed">Confirmed</span>
                    </div>
                </div>`;
            }).join('')
            : `<div class="empty-state"><i class="fa-solid fa-suitcase-rolling"></i><p>No bookings yet. Start exploring!</p></div>`;

        const oList = el('order-list');
        if (oList) oList.innerHTML = Store.state.orders.length
            ? Store.state.orders.map(o => `
                <div class="history-item" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="app.showOrderDetails('${o.id}')">
                    <div style="display:flex; align-items:center; gap:16px;">
                        ${o.items && o.items[0] && o.items[0].img ? `<img src="${o.items[0].img}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;" onerror="this.style.display='none'">` : ''}
                        <div>
                            <h4 style="color:var(--gold);margin-bottom:5px">${o.id}</h4>
                            <p style="color:var(--text-secondary);font-size:13px">${o.items.length} item(s) → ${o.address}</p>
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div class="dest-price">$${(o.total||0).toLocaleString()}</div>
                        <span class="status-badge ${o.status.toLowerCase()}">${o.status}</span>
                    </div>
                </div>`).join('')
            : `<div class="empty-state"><i class="fa-solid fa-utensils"></i><p>No food orders yet.</p></div>`;

        // update profile name
        const user = Store.state.currentUser;
        const nameEl = document.getElementById('dash-user-name');
        if (nameEl) nameEl.textContent = user ? user.name : 'Alexander Wright';
    },

    showOrderDetails(orderId) {
        const order = Store.state.orders.find(o => o.id === orderId);
        if (!order) return;
        
        let itemsHtml = order.items.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${item.img}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;" onerror="this.style.display='none'">
                    <div>
                        <h4 style="margin:0; font-size:14px; color:var(--text);">${item.name}</h4>
                        <span style="font-size:12px; color:var(--text-secondary);">Qty: ${item.qty}</span>
                    </div>
                </div>
                <div style="font-weight:700; color:var(--gold);">$${(item.price * item.qty).toLocaleString()}</div>
            </div>
        `).join('');

        const content = `
            <div style="margin-bottom:16px; text-align:left;">
                <h3 style="color:var(--gold); margin:0 0 4px 0;">${order.id}</h3>
                <p style="margin:0; font-size:13px; color:var(--text-secondary);"><i class="fa-solid fa-clock"></i> ${new Date(order.date).toLocaleString()}</p>
                <span class="status-badge ${order.status.toLowerCase()}" style="margin-top:8px; display:inline-block;">${order.status}</span>
            </div>
            <div style="background:var(--bg-glass); border-radius:12px; padding:16px; margin-bottom:16px; text-align:left;">
                ${itemsHtml}
            </div>
            <div style="background:var(--bg-glass); border-radius:12px; padding:16px; text-align:left;">
                ${order.name ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--text-secondary); font-size:14px;">Customer Name</span>
                    <span style="color:var(--text); font-size:14px; font-weight:600;">${order.name}</span>
                </div>
                ` : ''}
                ${order.phone ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--text-secondary); font-size:14px;">Contact Number</span>
                    <span style="color:var(--text); font-size:14px; font-weight:600;">${order.phone}</span>
                </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; margin-top:10px;">
                    <span style="color:var(--text-secondary); font-size:14px;">Delivery Address</span>
                </div>
                <p style="margin:0; font-size:14px; color:var(--text);">${order.address}</p>
                <hr style="border-color:rgba(255,255,255,0.1); margin:12px 0;">
                <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:var(--gold);">
                    <span>Total</span>
                    <span>$${order.total.toLocaleString()}</span>
                </div>
                <button class="btn-premium" style="width:100%; margin-top:20px; padding:12px; display:flex; justify-content:center; gap:8px; border-radius:8px;" onclick="app.viewInvoice('${order.id}', 'food')">
                    <i class="fa-solid fa-file-invoice"></i> View / Print Bill
                </button>
            </div>
        `;
        document.getElementById('order-details-content').innerHTML = content;
        document.getElementById('modal-order-details').classList.add('active');
    },

    getBookingImage(b) {
        if (b.img) return b.img;
        const lowerName = (b.hotelName || b.destination || '').toLowerCase();
        const lowerType = (b.type || '').toLowerCase();
        if (lowerType.includes('train') || lowerName.includes('express') || lowerName.includes('exp:') || lowerName.includes('exp ')) {
            return '../pic/trains/luxury_train_banner.png';
        } else if (lowerType.includes('flight') || lowerType.includes('plane') || lowerName.includes('flight')) {
            return '../pic/mountain/m1.jpg';
        } else {
            const matchedHotel = Store.state.hotels.find(h => lowerName.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(lowerName));
            if (matchedHotel) return matchedHotel.img;
            const matchedDest = Store.state.destinations.find(d => lowerName.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(lowerName));
            if (matchedDest) return matchedDest.img;
            return '../pic/hotel/h1.jpg';
        }
    },

    showBookingDetails(bookingId) {
        const booking = Store.state.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const imgUrl = this.getBookingImage(booking);
        const isTrain = (booking.type && booking.type.toLowerCase().includes('train')) || 
                        (booking.hotelName && (booking.hotelName.toLowerCase().includes('express') || booking.hotelName.toLowerCase().includes('exp:')));
        const isFlight = (booking.type && booking.type.toLowerCase().includes('flight'));

        const content = `
            <div style="text-align:left;">
                <div style="position:relative; border-radius:12px; overflow:hidden; margin-bottom:20px; height:180px; box-shadow:0 8px 32px rgba(0,0,0,0.3)">
                    <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='../pic/hotel/h1.jpg'">
                    <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent, rgba(0,0,0,0.85)); padding:16px 20px;">
                        <span style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--gold); font-weight:700;">
                            ${booking.type || (isTrain ? 'Train Journey' : isFlight ? 'Flight Journey' : 'Hotel Stay')}
                        </span>
                        <h3 style="margin:4px 0 0 0; color:#fff; font-size:20px; font-weight:800;">
                            ${booking.hotelName || booking.destination || 'Luxury Booking'}
                        </h3>
                    </div>
                </div>

                <div style="background:var(--bg-glass); border-radius:12px; padding:20px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px;">
                        <div>
                            <span style="font-size:12px; color:var(--text-secondary); display:block; text-transform:uppercase;">Booking ID</span>
                            <strong style="color:var(--gold); font-size:16px;">${booking.id}</strong>
                        </div>
                        <div style="text-align:right;">
                            <span style="font-size:12px; color:var(--text-secondary); display:block; text-transform:uppercase;">Status</span>
                            <span class="status-badge confirmed" style="display:inline-block; font-size:12px; padding:4px 10px;">Confirmed</span>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div>
                            <span style="font-size:12px; color:var(--text-secondary); display:block; text-transform:uppercase;">Date/Schedule</span>
                            <span style="font-size:14px; font-weight:600;"><i class="fa-solid fa-calendar-days" style="color:var(--gold); margin-right:6px;"></i>${booking.dates || 'Open Dates'}</span>
                        </div>
                        <div>
                            <span style="font-size:12px; color:var(--text-secondary); display:block; text-transform:uppercase;">Guests</span>
                            <span style="font-size:14px; font-weight:600;"><i class="fa-solid fa-users" style="color:var(--gold); margin-right:6px;"></i>${booking.guests || 1} Person(s)</span>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div>
                            <span style="font-size:12px; color:var(--text-secondary); display:block; text-transform:uppercase;">Class / Room Type</span>
                            <span style="font-size:14px; font-weight:600;"><i class="fa-solid fa-ticket" style="color:var(--gold); margin-right:6px;"></i>${booking.room || 'Standard'}</span>
                        </div>
                        <div>
                            <span style="font-size:12px; color:var(--text-secondary); display:block; text-transform:uppercase;">Booking Date</span>
                            <span style="font-size:14px; font-weight:600;"><i class="fa-solid fa-clock" style="color:var(--gold); margin-right:6px;"></i>${booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div style="background:var(--bg-glass); border-radius:12px; padding:20px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span style="color:var(--text-secondary); font-size:14px;">Payment Method</span>
                        <span style="font-weight:600; font-size:14px; color:var(--text);">${booking.paymentMethod || 'Credit Card'}</span>
                    </div>
                    <hr style="border-color:rgba(255,255,255,0.05); margin:12px 0;">
                    <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:800; color:var(--gold);">
                        <span>Total Paid</span>
                        <span>$${(booking.total||0).toLocaleString()}</span>
                    </div>
                    <button class="btn-premium" style="width:100%; margin-top:20px; padding:12px; display:flex; justify-content:center; gap:8px; border-radius:8px;" onclick="app.viewInvoice('${booking.id}', 'booking')">
                        <i class="fa-solid fa-file-invoice"></i> View / Print Bill
                    </button>
                </div>
            </div>
        `;
        document.getElementById('booking-details-content').innerHTML = content;
        document.getElementById('modal-booking-details').classList.add('active');
    },

    // ==========================================
    // CART & FOOD CHECKOUT
    // ==========================================
    cartSystem: {
        add(id) {
            const item     = Store.state.foodItems.find(f => f.id === id);
            if (!item) return;
            const existing = Store.state.cart.find(c => c.id === id);
            if (existing) existing.qty++;
            else Store.state.cart.push({ ...item, qty: 1 });
            app.syncFreeItems();
            Store.save('cart', Store.state.cart);
            app.updateCartUI();
            app.showNotification(`${item.name} added to cart 🛒`, 'success');
        },
        update(id, delta) {
            if (id === 'free-water-bottle') return;
            const item = Store.state.cart.find(c => c.id === id);
            if (!item) return;
            item.qty += delta;
            if (item.qty <= 0) Store.state.cart = Store.state.cart.filter(c => c.id !== id);
            app.syncFreeItems();
            Store.save('cart', Store.state.cart);
            app.updateCartUI();
        },
        remove(id) {
            if (id === 'free-water-bottle') return;
            Store.state.cart = Store.state.cart.filter(c => c.id !== id);
            app.syncFreeItems();
            Store.save('cart', Store.state.cart);
            app.updateCartUI();
        }
    },

    updateCartUI() {
        const badge    = document.getElementById('cart-badge');
        const content  = document.getElementById('cart-content');
        const count    = Store.state.cart.filter(c => c.id !== 'free-water-bottle').reduce((s, i) => s + i.qty, 0);
        const subtotal = Store.state.cart.reduce((s, i) => s + i.price * i.qty, 0);
        const tax      = subtotal * 0.15;
        const total    = subtotal + tax;

        if (badge) { badge.style.display = count > 0 ? 'flex' : 'none'; badge.textContent = count; }
        const el = id => document.getElementById(id);
        if (el('cart-subtotal')) el('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        if (el('cart-tax'))      el('cart-tax').textContent      = `$${tax.toFixed(2)}`;
        if (el('cart-total'))    el('cart-total').textContent    = `$${total.toFixed(2)}`;

        if (!content) return;
        if (!Store.state.cart.length) {
            content.innerHTML = `<div class="empty-state" style="margin-top:60px"><i class="fa-solid fa-bag-shopping"></i><p>Your cart is empty</p></div>`;
            return;
        }
        content.innerHTML = Store.state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" onerror="app.handleImgError(this, 'food')">
                <div class="cart-info">
                    <h4>${item.name}</h4>
                    <div style="color:var(--gold);font-weight:700;margin:4px 0">${item.price === 0 ? 'FREE' : '$' + item.price}</div>
                    ${item.id === 'free-water-bottle' ? `
                    <div style="font-size:12px;color:var(--gold);font-weight:600;display:flex;align-items:center;gap:6px;margin-top:8px">
                        <i class="fa-solid fa-gift"></i> Complimentary Gift
                    </div>
                    ` : `
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="app.cartSystem.update('${item.id}',-1)"><i class="fa-solid fa-minus"></i></button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="app.cartSystem.update('${item.id}',1)"><i class="fa-solid fa-plus"></i></button>
                        <button class="qty-btn" style="margin-left:auto;background:rgba(255,59,48,0.15);color:#ff3b30" onclick="app.cartSystem.remove('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    `}
                </div>
            </div>`).join('');

        // Refresh the food menu grid so quantity selectors sync in real-time
        if (Store.state.currentView === 'food') {
            this.renderFoodMenu(Store.state.foodCategory || 'all', false);
        }
    },

    startFoodCheckout() {
        if (!Store.state.cart.length) { this.showNotification('Your cart is empty!', 'warning'); return; }
        this.closePanels();
        const subtotal = Store.state.cart.reduce((s, i) => s + i.price * i.qty, 0);
        const tax = subtotal * 0.15;
        const total = subtotal + tax;
        const el = document.getElementById('checkout-receipt');
        if (el) el.innerHTML = Store.state.cart.map(i => `
            <div class="receipt-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <img src="${i.img}" alt="${i.name}" onerror="app.handleImgError(this, 'food')" style="width:40px;height:40px;border-radius:8px;object-fit:cover;border:1px solid rgba(255,255,255,0.08);">
                    <span>${i.qty}× ${i.name} ${i.id === 'free-water-bottle' ? '<span style="color:var(--gold);font-size:10px;font-weight:700;margin-left:6px;border:1px solid var(--gold);padding:1px 4px;border-radius:4px;text-transform:uppercase">Free</span>' : ''}</span>
                </div>
                <span>${i.price === 0 ? 'FREE' : '$' + (i.price*i.qty).toFixed(2)}</span>
            </div>`).join('')
            + `<hr style="border-color:rgba(255,255,255,0.1);margin:12px 0">
               <div class="receipt-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
               <div class="receipt-row"><span>Tax & Delivery (15%)</span><span>$${tax.toFixed(2)}</span></div>
               <div class="receipt-row" style="color:var(--gold);font-size:18px;font-weight:700"><span>Total</span><span>$${total.toFixed(2)}</span></div>`;
        this.openModal('modal-food-checkout');
        if (typeof selectFoodPaymentMethod === 'function') {
            selectFoodPaymentMethod('Credit Card');
        }

        // Auto-fill Name & Contact details if user is logged in
        const user = Store.state.currentUser;
        if (user) {
            const nameEl = document.getElementById('checkout-name');
            const phoneEl = document.getElementById('checkout-phone');
            if (nameEl && !nameEl.value.trim()) {
                nameEl.value = user.fullName || user.name || '';
            }
            if (phoneEl && !phoneEl.value.trim()) {
                phoneEl.value = user.phone || user.phoneNumber || '';
            }
        }
    },

    async placeFoodOrder() {
        const nameEl = document.getElementById('checkout-name');
        const phoneEl = document.getElementById('checkout-phone');
        const addressEl = document.getElementById('checkout-address');

        const name = nameEl ? nameEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const address = addressEl ? addressEl.value.trim() : '';
        const payment = document.getElementById('checkout-payment').value;

        if (!name) { this.showNotification('Please enter your full name', 'warning'); return; }
        if (!phone) { this.showNotification('Please enter contact number', 'warning'); return; }
        if (!address) { this.showNotification('Please enter a delivery address', 'warning'); return; }

        const subtotal = Store.state.cart.reduce((s, i) => s + i.price * i.qty, 0);
        const total = +(subtotal * 1.15).toFixed(2);

        // P2P Payment Direct Transfer Support
        const token = localStorage.getItem('nomad_token');
        if (payment === 'UPI' || payment === 'Bank Transfer') {
            try {
                const foodUtrEl = document.getElementById('food-b-utr');
                const foodUtrValue = foodUtrEl ? foodUtrEl.value.trim() : '';

                const body = {
                    itemName: 'Food Order (' + Store.state.cart.length + ' items)',
                    totalPrice: total,
                    utr: foodUtrValue || 'P2P_SCREENSHOT',
                    destinationId: null,
                    checkIn: '', checkOut: '', guests: 1,
                    guestName: name,
                    guestEmail: Store.state.currentUser?.email || '',
                    guestPhone: phone,
                    specialRequests: 'Delivery Address: ' + address,
                    addons: null
                };

                const response = await fetch(getApiUrl('/api/bookings/direct-transfer'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(body)
                });
                const resData = await response.json();
                
                if (!response.ok) {
                    this.showNotification(resData.error || 'Failed to submit direct transfer.', 'error');
                    return;
                }

                // Clear cart and modals
                if (nameEl) nameEl.value = '';
                if (phoneEl) phoneEl.value = '';
                if (addressEl) addressEl.value = '';
                if (foodUtrEl) foodUtrEl.value = '';
                Store.save('cart', []);
                this.updateCartUI();
                this.closeModals();

                // Launch P2P payment wizard modal
                app.p2p.open(resData.bookingId, 'Food Order', total, foodUtrValue);
                return;

            } catch (err) {
                console.error("Direct transfer API failed:", err);
                this.showNotification('Offline/Connection Error. Order saved locally.', 'warning');
            }
        }
        const order = {
            id:      'ORD-' + Math.floor(Math.random() * 100000),
            items:   [...Store.state.cart],
            total, name, phone, address, payment,
            status:  'Preparing 🔥',
            date:    new Date().toISOString()
        };
        const orders = Store.state.orders; orders.push(order);
        Store.save('orders', orders);
        Store.save('cart', []);

        if (nameEl) nameEl.value = '';
        if (phoneEl) phoneEl.value = '';
        if (addressEl) addressEl.value = '';

        this.updateCartUI();
        this.closeModals();
        
        // Trigger payment success animation
        this.showPaymentSuccess(
            order.id, 
            'Order Placed Successfully!', 
            'Your food is being prepared and will arrive soon.', 
            total, 
            [{icon:'fa-solid fa-utensils', text: `${order.items.length} item(s)`}]
        );
    },

    // ==========================================
    // TRANSPORT
    // ==========================================
    switchTransport(mode) {
        Store.state.currentTransportMode = mode;
        ['flight', 'train', 'bus'].forEach(m => {
            const el = document.getElementById(`tab-${m}`);
            if (el) el.classList.remove('active');
        });
        const activeTab = document.getElementById(`tab-${mode}`);
        if (activeTab) activeTab.classList.add('active');

        const title = document.getElementById('transport-title');
        const subtitle = document.getElementById('transport-subtitle');
        const img = document.getElementById('transport-banner-img');
        const resultsTitle = document.getElementById('transport-results-title');

        if (mode === 'flight') {
            if(title) title.textContent = "First Class Flights.";
            if(subtitle) subtitle.textContent = "Private jets and premium cabin booking for elite travellers.";
            if(resultsTitle) resultsTitle.textContent = "Available Flights";
        } else if (mode === 'train') {
            if(title) title.textContent = "Luxury Trains.";
            if(subtitle) subtitle.textContent = "Scenic routes and first-class rail travel across continents.";
            if(resultsTitle) resultsTitle.textContent = "Available Trains";
        } else if (mode === 'bus') {
            if(title) title.textContent = "Mahagama Bus Service.";
            if(subtitle) subtitle.textContent = "Reliable, comfortable local travel from Mahagama.";
            if(resultsTitle) resultsTitle.textContent = "Available Buses";
        }
        
        this.randomizeBannerForView('flights', false);
        
        // Reset inputs
        if(document.getElementById('fl-from')) document.getElementById('fl-from').value = '';
        if(document.getElementById('fl-to')) document.getElementById('fl-to').value = '';

        this.searchFlights();
    },

    searchFlights() {
        const mode = Store.state.currentTransportMode || 'flight';
        const from  = (document.getElementById('fl-from')?.value || '').trim().toLowerCase();
        const to    = (document.getElementById('fl-to')?.value || '').trim().toLowerCase();
        const date  = document.getElementById('fl-date')?.value || '';
        const cls   = document.getElementById('fl-class')?.value || '';

        let dataSource = Store.state.flights;
        if (mode === 'train') dataSource = Store.state.trains;
        if (mode === 'bus') dataSource = Store.state.buses;

        let results = dataSource || [];
        if (from && from !== 'any') results = results.filter(f => f.from.toLowerCase().includes(from));
        if (to && to !== 'any')   results = results.filter(f => f.to.toLowerCase().includes(to));
        if (cls && cls !== 'any') results = results.filter(f => f.class === cls);

        // If no specific match, show all flights with a note
        const showAll = results.length === 0;
        if (showAll) results = Store.state.flights || [];

        const grid = document.getElementById('flight-results');
        if (!grid) return;

        if (from || to || (cls && cls !== 'any')) {
            if (showAll) {
                this.showNotification(`No direct match — showing all available routes`, 'info');
            } else {
                this.showNotification(`Found ${results.length} route(s)`, 'success');
            }
        }

        const modeIcon = mode === 'train' ? 'fa-train' : (mode === 'bus' ? 'fa-bus' : 'fa-plane');
        const modeLabel = mode === 'train' ? 'Train' : (mode === 'bus' ? 'Bus' : 'Flight');

        grid.innerHTML = results.map(f => `
            <div class="flight-card">
                <div class="flight-airline">
                    <span class="airline-emoji">${f.img}</span>
                    <div>
                        <h4>${f.airline}</h4>
                        <span class="flight-class-badge">${f.class}</span>
                    </div>
                </div>
                <div class="flight-route">
                    <div class="flight-city">
                        <span class="flight-time">${f.depTime}</span>
                        <span class="flight-city-name">${f.from}</span>
                    </div>
                    <div class="flight-line">
                        <span class="flight-duration">${f.duration}</span>
                        <div class="flight-line-bar"><div></div><i class="fa-solid ${modeIcon}"></i></div>
                        <span style="font-size:11px;color:var(--text-secondary)">Direct</span>
                    </div>
                    <div class="flight-city">
                        <span class="flight-time">${f.arrTime}</span>
                        <span class="flight-city-name">${f.to}</span>
                    </div>
                </div>
                <div class="flight-price-block">
                    <div class="dest-price">$${f.price.toLocaleString()}</div>
                    <span style="font-size:12px;color:var(--text-secondary)">per person</span>
                    <button class="btn-premium" style="margin-top:12px;width:auto;padding:10px 20px" onclick="app.bookFlight('${f.id}','${date}', '${mode}')">Book Now</button>
                </div>
            </div>`).join('');
    },
    async checkPNR() {
        const pnrInput = document.getElementById('tr-pnr-input');
        const pnrResult = document.getElementById('pnr-result');
        if (!pnrInput || !pnrResult) return;

        const pnr = pnrInput.value.trim();
        if (!pnr || pnr.length !== 10) {
            this.showNotification('Please enter a valid 10-digit PNR number.', 'error');
            return;
        }

        pnrResult.style.display = 'block';
        pnrResult.innerHTML = '<div style="display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-spinner fa-spin"></i> Checking PNR Status...</div>';

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': token ? `Bearer ${token}` : '' } : {};
            const res = await fetch(getApiUrl(`/api/v1/train/pnr?pnr=${pnr}`), { headers });
            const result = await res.json();

            if (result.success && result.data) {
                // RapidAPI nests the result inside an inner `data` object
                const data = result.data.data || result.data;
                
                // Fallback rendering in case structure is slightly different
                let html = `
                    <h3 style="margin-bottom:15px; border-bottom:1px solid #1e293b; padding-bottom:10px;">
                        PNR: ${pnr} - ${data.trainName || 'Train'} (${data.trainNumber || ''})
                    </h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <div><span style="color:#94a3b8">From:</span> ${data.sourceStation || ''}</div>
                        <div><span style="color:#94a3b8">To:</span> ${data.destinationStation || ''}</div>
                        <div><span style="color:#94a3b8">Date:</span> ${data.journeyDate || data.dateOfJourney || ''}</div>
                        <div><span style="color:#94a3b8">Class:</span> ${data.journeyClass || ''}</div>
                        <div><span style="color:#94a3b8">Quota:</span> ${data.quota || ''}</div>
                        <div><span style="color:#94a3b8">Charting:</span> ${data.chartStatus || (data.chartPrepared ? 'Prepared' : 'Not Prepared')}</div>
                    </div>
                `;

                if (data.passengerList && data.passengerList.length > 0) {
                    html += `<h4 style="margin-top:15px; margin-bottom:10px;">Passenger Status</h4>`;
                    data.passengerList.forEach((pax, idx) => {
                        const statusDetails = pax.currentStatusDetails || pax.currentStatus || pax.bookingStatusDetails || pax.bookingStatus || '';
                        const isCnf = statusDetails.includes('CNF') || statusDetails.includes('Confirmed');
                        html += `
                        <div style="background:#1e293b; padding:10px; border-radius:5px; margin-bottom:5px; display:flex; justify-content:space-between;">
                            <span>Passenger ${idx + 1}</span>
                            <span style="font-weight:bold; color:${isCnf ? '#10b981' : '#f59e0b'}">
                                ${statusDetails}
                            </span>
                        </div>`;
                    });
                } else if (data.passengerInfo) {
                     // Alternate schema fallback
                     html += `<div style="background:#1e293b; padding:10px; border-radius:5px; margin-bottom:5px;">
                         ${JSON.stringify(data.passengerInfo)}
                     </div>`;
                }

                pnrResult.innerHTML = html;
            } else {
                pnrResult.innerHTML = `<div style="color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${result.message || 'Could not fetch PNR details'}</div>`;
            }
        } catch (err) {
            console.error('PNR Check Error:', err);
            pnrResult.innerHTML = `<div style="color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Error connecting to PNR service.</div>`;
        }
    },


    async searchTrains() {
        const mode = 'train';
        const fromInput = (document.getElementById('tr-from')?.value || '').trim().toLowerCase();
        let from = fromInput || 'ndls'; // Default to NDLS if empty to always show live trains
        const fromMatch = from.match(/\(([^)]+)\)/);
        if (fromMatch) from = fromMatch[1];

        const toInput = (document.getElementById('tr-to')?.value || '').trim().toLowerCase();
        let to = toInput;
        const toMatch = to.match(/\(([^)]+)\)/);
        if (toMatch) to = toMatch[1];

        const date  = document.getElementById('tr-date')?.value || '';

        const grid = document.getElementById('train-results');
        if (!grid) return;

        let liveTrainsData = [];
        let isApiSuccess = false;

        let dateOfJourney = '';
        if (date) {
            try {
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate.getTime())) {
                    const yyyy = parsedDate.getFullYear();
                    const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(parsedDate.getDate()).padStart(2, '0');
                    dateOfJourney = `${yyyy}-${mm}-${dd}`;
                }
            } catch (e) {
                console.error("Failed to parse journey date:", e);
            }
        }

        // If a station is provided, try calling the RapidAPI directly
        if (from) {
            this.showNotification('Fetching live train data...', 'info');
            grid.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">Loading live trains...</div>';

            // 1. Try to fetch from local backend proxy
            let backendUrl = '';
            if (from && to && to !== 'any') {
                backendUrl = getApiUrl(`/api/v1/train/search?fromStationCode=${from}&toStationCode=${to}`);
                if (dateOfJourney) backendUrl += `&dateOfJourney=${dateOfJourney}`;
            } else {
                backendUrl = getApiUrl(`/api/v1/train/live?stationCode=${from}`);
            }

            try {
                const response = await fetch(backendUrl);
                const result = await response.json();
                
                if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                    liveTrainsData = result.data.map((t, idx) => {
                        const tNum = t.trainNumber || t.id || String(idx);
                        return {
                            id: `api_${tNum}_${idx}`,
                            from: t.fromCode || t.from || from.toUpperCase(),
                            to: t.toCode || t.to || (to ? to.toUpperCase() : 'Any'),
                            airline: t.operatorName || t.airline || 'IRCTC Train',
                            duration: t.durationString || t.duration || 'Unknown',
                            price: t.price || t.pricingTier || 450,
                            class: t.class || 'Premium',
                            img: '🚆',
                            depTime: t.departureTime || 'N/A',
                            arrTime: t.arrivalTime || 'N/A'
                        };
                    });
                    isApiSuccess = true;
                } else if (result.quotaExceeded) {
                    console.warn("Backend proxy reports RapidAPI quota exceeded. Falling back to direct fetch/mock fallback.");
                }
            } catch (e) {
                console.warn("Backend proxy fetch failed, trying direct RapidAPI fetch...", e);
            }

            // 2. Try direct RapidAPI fetch from browser if backend proxy did not succeed
            if (!isApiSuccess) {
                let directUrl = '';
                if (from && to && to !== 'any') {
                    directUrl = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${from}&toStationCode=${to}`;
                    if (dateOfJourney) directUrl += `&dateOfJourney=${dateOfJourney}`;
                } else {
                    directUrl = `https://irctc1.p.rapidapi.com/api/v3/getLiveStation?fromStationCode=${from}&hours=8`;
                }

                const options = {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': 'ed5ba27edemsh201895dc4c22d7ep15745fjsn0590258bd9dc',
                        'x-rapidapi-host': 'irctc1.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    }
                };

                try {
                    const response = await fetch(directUrl, options);
                    const result = await response.json();
                    
                    let rawList = null;
                    if (result.status && result.data) {
                        if (Array.isArray(result.data)) {
                            rawList = result.data;
                        } else if (Array.isArray(result.data.trains)) {
                            rawList = result.data.trains;
                        }
                    }

                    if (rawList && rawList.length > 0) {
                        liveTrainsData = rawList.map((t, idx) => ({
                            id: `api_${t.train_number || t.trainNumber || idx}_${idx}`,
                            from: t.from_station_code || t.from || from.toUpperCase(),
                            to: t.to_station_code || t.to || (to ? to.toUpperCase() : 'Any'),
                            airline: t.train_name || t.trainName || 'IRCTC Train',
                            duration: t.duration || t.train_type || t.trainType || 'Unknown',
                            price: t.min_price || t.price || t.fare || t.ticket_fare || 450, // use real API price if available
                            class: (t.classes && t.classes.length > 0) ? t.classes.map(c => c.value || c).join(', ') : 'Premium',
                            img: '🚆',
                            depTime: t.departure_time || t.scheduled_departure || t.departureTime || 'N/A',
                            arrTime: t.arrival_time || t.scheduled_arrival || t.arrivalTime || 'N/A'
                        }));
                        isApiSuccess = true;
                    }
                } catch (error) {
                    console.error("Direct RapidAPI call error:", error);
                }
            }
        }

        let results = [];
        if (isApiSuccess && liveTrainsData.length > 0) {
            results = liveTrainsData;
            this.showNotification(`Found ${results.length} live route(s)`, 'success');
        } else {
            // Default mock fallback / simulated live search
            let rawMock = Store.state.trains || [];
            if (from && from !== 'any') {
                rawMock = rawMock.filter(f => 
                    f.from.toLowerCase().includes(from) || 
                    this.getStationCode(f.from).toLowerCase().includes(from)
                );
            }
            if (to && to !== 'any') {
                rawMock = rawMock.filter(f => 
                    f.to.toLowerCase().includes(to) || 
                    this.getStationCode(f.to).toLowerCase().includes(to)
                );
            }

            const showAll = rawMock.length === 0;
            if (showAll) {
                if (from && to && to !== 'any') {
                    const fromCode = from.toUpperCase();
                    const toCode = to.toUpperCase();
                    const fromStation = this.masterStations.find(s => s.properties.code.toUpperCase() === fromCode) || { properties: { name: fromCode } };
                    const toStation = this.masterStations.find(s => s.properties.code.toUpperCase() === toCode) || { properties: { name: toCode } };
                    
                    const fromShort = (fromStation.properties.name || '').split(' ')[0].replace(/[^a-zA-Z]/g, '') || fromCode;
                    const toShort = (toStation.properties.name || '').split(' ')[0].replace(/[^a-zA-Z]/g, '') || toCode;
                    
                    results = [
                        {
                            id: 'api_12301_0',
                            from: fromStation.properties.name,
                            to: toStation.properties.name,
                            airline: `${fromShort} - ${toShort} Rajdhani Express`,
                            duration: '15h 30m',
                            price: 1860,
                            class: 'Premium',
                            img: '🚆',
                            depTime: '16:30',
                            arrTime: '08:00'
                        },
                        {
                            id: 'api_12323_1',
                            from: fromStation.properties.name,
                            to: toStation.properties.name,
                            airline: `${fromShort} - ${toShort} Humsafar Express`,
                            duration: '17h 15m',
                            price: 1450,
                            class: 'Premium',
                            img: '🚆',
                            depTime: '08:15',
                            arrTime: '01:30'
                        },
                        {
                            id: 'api_12254_2',
                            from: fromStation.properties.name,
                            to: toStation.properties.name,
                            airline: `${fromShort} - ${toShort} Duronto Express`,
                            duration: '15h 45m',
                            price: 2150,
                            class: 'Premium',
                            img: '🚆',
                            depTime: '20:00',
                            arrTime: '11:45'
                        }
                    ];
                    this.showNotification(`Simulated live search results from ${fromCode} to ${toCode}`, 'success');
                } else {
                    results = Store.state.trains || [];
                    if (from || to) {
                        this.showNotification(`No direct match — showing all available routes`, 'info');
                    }
                }
            } else {
                results = rawMock;
                if (from || to) {
                    this.showNotification(`Found ${results.length} route(s)`, 'success');
                }
            }
        }

        this.lastSearchedTrains = results;

        grid.innerHTML = results.map((f, index) => {
            const classesHtml = ['3A', '2A', '1A', 'SL'].map((cName, i) => {
                const isGreen = i % 2 !== 0;
                const colorClass = isGreen ? 'text-green' : 'text-orange';
                const bgClass = isGreen ? 'wl-green' : 'wl-orange';
                const wlNum = Math.floor(Math.random() * 50) + 10;
                const chance = Math.floor(Math.random() * 60) + 30;
                const timeAgo = i === 1 ? 'Just now' : `${Math.floor(Math.random() * 40) + 2} mins ago`;
                
                let price = f.price || 450;
                if (cName === '3A') price = Math.round(price * 2.6);
                else if (cName === '2A') price = Math.round(price * 3.7);
                else if (cName === '1A') price = Math.round(price * 6.2);
                
                return `
                <div class="ixigo-tc-class-col">
                    <span class="ixigo-tc-class-time">${timeAgo}</span>
                    <div class="ixigo-tc-class-box" onclick="app.bookFlight('${f.id}', document.getElementById('tr-date').value || 'Any', 'train', '${cName}', ${price})">
                        <div class="ixigo-tc-class-top">
                            <span>${cName}</span>
                            <span class="ixigo-tc-class-price">₹${price}</span>
                        </div>
                        <div class="ixigo-tc-class-status">
                            WL ${wlNum} ${isGreen ? '<i class="fa-solid fa-shield-halved" style="font-size:12px;"></i>' : ''}
                        </div>
                        <div class="ixigo-tc-class-prob">
                            ${isGreen ? 'Waitlist' : `${chance}% Chance`}
                        </div>
                    </div>
                </div>
                `;
            }).join('');

            const displayFromCode = this.getStationCode(f.from);
            const displayToCode = this.getStationCode(f.to);

            return `
            <div class="ixigo-train-card">
                <div class="ixigo-tc-header">
                    <div class="ixigo-tc-title" style="font-size: 1.3rem; font-weight: bold;">
                        <span style="font-size: 1.4rem;">${f.airline}</span> (${f.id.split('_')[1] || ('123' + (14 + index))})
                    </div>
                    <div class="ixigo-tc-rating-box">
                        <i class="fa-solid fa-utensils"></i>
                        <div class="ixigo-tc-rating"><i class="fa-solid fa-star"></i> 4.3</div>
                    </div>
                </div>
                <div class="ixigo-tc-schedule">
                    <div class="ixigo-tc-route">
                        <span class="ixigo-tc-route-station">${f.depTime} ${displayFromCode}</span>
                        <span class="ixigo-tc-route-time">— ${f.duration} →</span>
                        <span class="ixigo-tc-route-station">${f.arrTime} ${displayToCode}</span>
                    </div>
                    <div class="ixigo-tc-schedule-link">Schedule</div>
                </div>
                <div class="ixigo-tc-classes">
                    ${classesHtml}
                </div>
            </div>
            `;
        }).join('');
    },

    bookFlight(flightId, date, mode, chosenClass, chosenPrice) {
        let dataSource = Store.state.flights;
        if (mode === 'train') {
            dataSource = Store.state.trains;
            if (this.lastSearchedTrains && this.lastSearchedTrains.length > 0) {
                dataSource = [...dataSource, ...this.lastSearchedTrains];
            }
        }
        if (mode === 'bus') dataSource = Store.state.buses;
        
        const fl = dataSource.find(f => f.id === flightId);
        if (!fl) return;
        const pax = parseInt(document.getElementById('fl-pax').value) || 1;
        
        const flPrice = (mode === 'train' && chosenPrice !== undefined) ? chosenPrice : (fl.price || 450);
        const flClass = (mode === 'train' && chosenClass !== undefined) ? chosenClass : (fl.class || 'Premium');
        
        const booking = {
            id:          'BKG-' + Math.floor(Math.random() * 100000),
            type:        `${mode.charAt(0).toUpperCase() + mode.slice(1)} ${fl.img}`,
            hotelName:   `${fl.airline}: ${fl.from} → ${fl.to}`,
            dates:       date || 'Open Dates',
            guests:      pax,
            room:        flClass,
            total:       flPrice * pax,
            date:        new Date().toISOString(),
            img:         mode === 'train' ? '../pic/trains/luxury_train_banner.png' : '../pic/mountain/m1.jpg'
        };
        const bkgs = Store.state.bookings; bkgs.push(booking);
        Store.save('bookings', bkgs);
        this.showNotification(`${mode.charAt(0).toUpperCase() + mode.slice(1)} booked! ${booking.id} — ${fl.from} → ${fl.to} 🎉`, 'success');
        setTimeout(() => this.switchView('dashboard'), 1500);
    },

    // ==========================================
    // 7-STEP HOTEL BOOKING ENGINE
    // ==========================================
    bookingEngine: {
        currentHotel: null,
        guests: 2,
        destOverride: null,

        start(hotel, destName, destImg, event) {
            if (event) {
                app.createGoldSparkleBurst(event);
            }
            if (!hotel) return;
            this.currentHotel  = hotel;
            this.destOverride  = destName || null;
            this.guests        = 2;
            this.currentStep   = 1;
            const gc = document.getElementById('b-guest-count');
            if (gc) gc.textContent = this.guests;
            const ci = document.getElementById('b-checkin');
            const co = document.getElementById('b-checkout');
            if (ci) ci.value = '';
            if (co) co.value = '';
            const hn = document.getElementById('b-hotel-name');
            if (hn) hn.textContent = destName ? `${hotel.name} — for "${destName}"` : hotel.name;
            const hl = document.getElementById('b-hotel-loc');
            if (hl) hl.textContent = hotel.location;
            const hp = document.getElementById('b-hotel-price');
            if (hp) hp.textContent = `$${hotel.price.toLocaleString()} / night (base)`;

            // Set destination/hotel image & rating badge
            const imgEl = document.getElementById('booking-hotel-img');
            if (imgEl) {
                imgEl.src = destImg ? destImg : hotel.img;
                imgEl.onerror = () => app.handleImgError(imgEl, 'dest');
            }
            const ratingBadge = document.getElementById('booking-rating-badge');
            if (ratingBadge) {
                ratingBadge.textContent = `⭐ ${hotel.rating || 4.9}`;
            }

            this.goStep(1);
            app.openModal('modal-hotel-booking');
        },

        updateGuests(delta) {
            const next = this.guests + delta;
            if (next >= 1 && next <= 20) {
                this.guests = next;
                const el = document.getElementById('b-guest-count');
                if (el) el.textContent = this.guests;
            }
        },

        goStep(step) {
            this.currentStep = step;
            document.querySelectorAll('#booking-steps-ui .bk-step-item').forEach((s, i) => {
                const stepIndex = i + 1;
                s.classList.remove('active', 'completed');
                if (stepIndex === step) {
                    s.classList.add('active');
                } else if (stepIndex < step) {
                    s.classList.add('completed');
                }
            });
            document.querySelectorAll('.b-step').forEach(s => s.classList.remove('active'));
            const el = document.getElementById(`b-step-${step}`);
            if (el) el.classList.add('active');

            // --- Toggle Header Back Button ---
            const backBtn = document.getElementById('booking-back-btn');
            if (backBtn) {
                backBtn.style.display = step > 1 ? 'flex' : 'none';
            }

            // --- Contextual Header & Payment Summary ---
            const titleEl = document.getElementById('booking-header-title');
            const nameEl  = document.getElementById('b-hotel-name');
            const locEl   = document.getElementById('b-hotel-loc');
            const pfContainer = document.getElementById('booking-paying-for-container');
            const pfVal       = document.getElementById('booking-paying-for-val');

            if (step >= 4) {
                if (titleEl) titleEl.innerHTML = `Complete Your Payment`;
                if (nameEl) nameEl.style.display = 'none';
                if (locEl) locEl.style.display = 'none';

                if (pfContainer && pfVal) {
                    pfContainer.style.display = 'block';
                    // Calculate current total price dynamically
                    let days = 1;
                    const ciEl = document.getElementById('b-checkin');
                    const coEl = document.getElementById('b-checkout');
                    if (ciEl && coEl && ciEl.value && coEl.value) {
                        const ci = new Date(ciEl.value);
                        const co = new Date(coEl.value);
                        if (co > ci) {
                            days = Math.max(1, Math.ceil((co - ci) / 86400000));
                        }
                    }
                    const sel = document.getElementById('b-room-type');
                    const mult = sel ? parseFloat(sel.value) : 1.0;
                    const base = this.currentHotel ? (this.currentHotel.price * days * mult) : 0;
                    const tax  = base * 0.10;
                    const total = base + tax;
                    pfVal.textContent = `${this.destOverride || this.currentHotel.name} ($${total.toLocaleString()})`;
                }
            } else {
                if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-gem" style="color:var(--gold);margin-right:10px"></i>Booking Engine`;
                if (nameEl) nameEl.style.display = 'block';
                if (locEl) locEl.style.display = 'block';
                if (pfContainer) pfContainer.style.display = 'none';
            }
        },

        nextStep(step) {
            // Validate dates before leaving step 1
            if (step === 2) {
                const ci = document.getElementById('b-checkin').value;
                const co = document.getElementById('b-checkout').value;
                if (!ci || !co) { app.showNotification('Please select check-in and check-out dates', 'warning'); return; }
                if (new Date(co) <= new Date(ci)) { app.showNotification('Check-out must be after check-in', 'warning'); return; }
            }
            if (step === 6) this.calculateTotal();
            this.goStep(step);
        },

        calculateTotal() {
            const ci   = new Date(document.getElementById('b-checkin').value);
            const co   = new Date(document.getElementById('b-checkout').value);
            const days = Math.max(1, Math.ceil((co - ci) / 86400000));
            const sel  = document.getElementById('b-room-type');
            const mult = parseFloat(sel.value);
            const roomName = sel.options[sel.selectedIndex].text;
            const base  = this.currentHotel.price * days * mult;
            const tax   = base * 0.10;
            const total = base + tax;

            document.getElementById('b-receipt').innerHTML = `
                <div class="receipt-row"><span>Hotel</span><span>${this.currentHotel.name}</span></div>
                ${this.destOverride ? `<div class="receipt-row"><span>Destination</span><span>${this.destOverride}</span></div>` : ''}
                <div class="receipt-row"><span>Check-in</span><span>${ci.toLocaleDateString()}</span></div>
                <div class="receipt-row"><span>Check-out</span><span>${co.toLocaleDateString()}</span></div>
                <div class="receipt-row"><span>Nights</span><span>${days}</span></div>
                <div class="receipt-row"><span>Guests</span><span>${this.guests}</span></div>
                <div class="receipt-row"><span>Room</span><span>${roomName}</span></div>
                <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0">
                <div class="receipt-row"><span>Subtotal</span><span>$${base.toLocaleString()}</span></div>
                <div class="receipt-row"><span>Taxes & Fees (10%)</span><span>$${tax.toLocaleString()}</span></div>
                <div class="receipt-row" style="color:var(--gold);font-size:18px;font-weight:700"><span>Grand Total</span><span>$${total.toLocaleString()}</span></div>`;

            this.tempData = {
                hotelName: this.currentHotel.name,
                dates: `${ci.toLocaleDateString()} → ${co.toLocaleDateString()}`,
                guests: this.guests, room: roomName, total,
                img: this.currentHotel.img || (this.currentDest ? this.currentDest.img : '')
            };
        },

        confirmBooking() {
            const selectedPm = document.querySelector('input[name="payment_method"]:checked');
            const pm = selectedPm ? selectedPm.value : null;
            if (!pm) { app.showNotification('Please select a payment method', 'warning'); return; }
            
            app.bookingEngine.finalizeBooking(pm);
        },

        async finalizeBooking(pm) {
            const token = localStorage.getItem('nomad_token');
            if (pm === 'UPI' || pm === 'Bank Transfer') {
                try {
                    const utrInput = pm === 'UPI' 
                        ? document.getElementById('b-utr')
                        : document.getElementById('b-bank-ref');
                    const utrValue = utrInput ? utrInput.value.trim() : '';

                    const body = {
                        itemName: this.tempData.hotelName,
                        totalPrice: this.tempData.total,
                        utr: utrValue || 'P2P_SCREENSHOT',
                        destinationId: this.currentHotel ? this.currentHotel.id : null,
                        checkIn: document.getElementById('b-checkin').value,
                        checkOut: document.getElementById('b-checkout').value,
                        guests: this.guests,
                        guestName: document.getElementById('b-guest-name')?.value || '',
                        guestEmail: Store.state.currentUser?.email || '',
                        guestPhone: document.getElementById('b-guest-phone')?.value || '',
                        specialRequests: document.getElementById('b-guest-special-requests')?.value || '',
                        addons: null
                    };

                    const response = await fetch(getApiUrl('/api/bookings/direct-transfer'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify(body)
                    });
                    const resData = await response.json();
                    if (!response.ok) {
                        app.showNotification(resData.error || 'Failed to submit direct transfer.', 'error');
                        return;
                    }

                    app.closeModals();
                    
                    // Launch P2P payment wizard modal
                    const bookingId = resData.bookingId;
                    app.p2p.open(bookingId, this.tempData.hotelName, this.tempData.total, utrValue);
                    return;

                } catch (err) {
                    console.error("Direct transfer API failed:", err);
                    app.showNotification('Offline/Connection Error. Booking saved locally.', 'warning');
                }
            }

            // Local fallback
            const booking = {
                id: 'BKG-' + Math.floor(Math.random() * 100000),
                ...this.tempData,
                paymentMethod: pm,
                date: new Date().toISOString()
            };
            const bkgs = Store.state.bookings || []; 
            bkgs.push(booking);
            Store.save('bookings', bkgs);
            app.closeModals();
            
            // Trigger payment success animation
            app.showPaymentSuccess(
                booking.id, 
                'Booking Confirmed!', 
                'Your luxury stay has been successfully reserved.', 
                booking.total, 
                [
                    {icon:'fa-solid fa-bed', text: booking.room},
                    {icon:'fa-solid fa-calendar', text: booking.dates.split(' → ')[0]}
                ]
            );
        }
    },

    // ==========================================
    // GLOBAL SEARCH
    // ==========================================
    setupSearch() {
        const input = document.getElementById('global-search');
        const drop  = document.getElementById('search-dropdown');
        if (!input || !drop) return;

        input.addEventListener('input', async (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (q.length < 2) { drop.classList.remove('active'); return; }

            let d = [];
            try {
                const res = await fetch(getApiUrl(`/api/destinations?query=${encodeURIComponent(q)}`));
                const data = await res.json();
                d = data.map(item => ({
                    id: item.id.toString(),
                    name: item.name,
                    location: item.location_text,
                    rating: item.rating,
                    price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0 : item.price,
                    img: item.image,
                    desc: item.description,
                    type: item.type === 'hotel' ? 'hotel' : 'dest',
                    label: item.category || item.type
                }));
            } catch (err) {
                console.error("Search fetch failed, fallback to local:", err);
                d = Store.state.destinations.filter(x => x.name.toLowerCase().includes(q) || x.location.toLowerCase().includes(q) || x.category.includes(q)).map(x => ({ ...x, type: 'dest', label: x.category }));
            }

            const h  = Store.state.hotels.filter(x => x.name.toLowerCase().includes(q) || x.location.toLowerCase().includes(q)).map(x => ({ ...x, type: 'hotel', label: 'Hotel' }));
            const f  = Store.state.foodItems.filter(x => x.name.toLowerCase().includes(q) || x.rest.toLowerCase().includes(q)).map(x => ({ ...x, type: 'food', label: x.category }));
            const fl = Store.state.flights.filter(x => x.from.toLowerCase().includes(q) || x.to.toLowerCase().includes(q) || x.airline.toLowerCase().includes(q)).map(x => ({ ...x, type: 'flight', label: 'Flight', img: '', name: `${x.from} → ${x.to}`, location: x.airline }));

            const results = [...d, ...h, ...f, ...fl].slice(0, 7);
            if (!results.length) {
                drop.innerHTML = `<div style="padding:16px;color:var(--text-secondary);text-align:center"><i class="fa-solid fa-magnifying-glass" style="font-size:24px;margin-bottom:8px;display:block"></i>No results for "${q}"</div>`;
            } else {
                drop.innerHTML = results.map(r => `
                    <div class="search-item" onclick="app.handleSearchClick('${r.type}','${r.id}')">
                        ${r.img ? `<img src="${r.img}" onerror="this.style.display='none'">` : `<div style="width:40px;height:40px;background:rgba(212,175,55,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px">✈️</div>`}
                        <div class="search-item-info">
                            <h4>${r.name}</h4>
                            <p>${(r.label || r.type).toUpperCase()} • ${r.location || r.rest || ''}</p>
                        </div>
                    </div>`).join('');
            }
            drop.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ai-search-wrapper')) drop.classList.remove('active');
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') drop.classList.remove('active');
        });
    },

    handleSearchClick(type, id) {
        document.getElementById('search-dropdown').classList.remove('active');
        document.getElementById('global-search').value = '';
        if (type === 'food')   this.switchView('food');
        else if (type === 'flight') this.switchView('flights');
        else                    this.openDetails(type, id);
    },

    // ==========================================
    // FILTERS PER SECTION
    // ==========================================
    async applyFilter(section) {
        const q      = (document.getElementById(`filter-${section}-search`)?.value || '').toLowerCase();
        const budget = document.getElementById(`filter-${section}-budget`)?.value || 'all';
        const rating = parseFloat(document.getElementById(`filter-${section}-rating`)?.value || '0');

        const budgetRanges = { all: [0, Infinity], budget: [0, 10000], mid: [10000, 30000], luxury: [30000, Infinity] };
        const [minB, maxB] = budgetRanges[budget] || [0, Infinity];

        let type = 'all';
        if (section === 'hotels') {
            type = 'hotel';
        } else if (section === 'mountains') {
            type = 'mountain';
        } else if (section === 'beaches') {
            type = 'beach';
        } else if (section === 'nature') {
            type = 'nature';
        } else if (section === 'nature-forest') {
            type = 'forest';
        } else if (section === 'planets') {
            type = 'destination';
        } else if (section === 'destinations') {
            type = 'destination';
        }

        try {
            let url = `/api/destinations?type=${type}`;
            if (q) {
                url += `&query=${encodeURIComponent(q)}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            
            const mapped = data.map(item => ({
                id: item.id.toString(),
                name: item.name,
                location: item.location_text,
                rating: item.rating,
                price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0 : item.price,
                img: item.image,
                desc: item.description,
                category: section,
                amenities: ['fa-spa','fa-martini-glass','fa-water','fa-wifi']
            })).filter(x => x.price >= minB && x.price <= maxB && x.rating >= rating);

            if (section === 'hotels') {
                const fillGrid = (id, arr) => { const el = document.getElementById(id); if (el) el.innerHTML = arr.map(h => this.renderHotelCard(h)).join(''); };
                fillGrid('all-hotels', mapped);
            } else {
                const idMap = {
                    'mountains': 'cat-mountains',
                    'beaches': 'cat-beaches',
                    'planets': 'cat-planets',
                    'anime': 'cat-anime',
                    'nature': 'cat-nature',
                    'nature-forest': 'cat-nature-forest',
                    'destinations': 'cat-destinations'
                };
                const el = document.getElementById(idMap[section]);
                if (el) {
                    el.innerHTML = mapped.length ? mapped.map(d => this.renderDestCard(d)).join('') : `<p style="color:var(--text-secondary);grid-column:1/-1;padding:40px 0">No items found.</p>`;
                }
            }
        } catch (err) {
            console.error("Failed to filter categories from SQLite database:", err);
        }
    },

    // ==========================================
    // USER AUTHENTICATION
    // ==========================================
    async login() {
        const email = document.getElementById('login-email').value.trim();
        const pass  = document.getElementById('login-pass').value;
        if (!email || !pass) { this.showNotification('Please fill in all fields', 'warning'); return; }

        let user = null;
        let token = null;

        try {
            const response = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });
            const data = await response.json();
            if (response.ok) {
                token = data.token;
                user = data.user;
                user.name = user.fullName || user.name;
                user.phone = user.phoneNumber || user.phone || '';
            } else {
                this.showNotification(data.error || 'Invalid email or password', 'error');
                return;
            }
        } catch (err) {
            console.warn('[Backend Error] Offline or unreachable. Checking local storage fallback...');
            const users = JSON.parse(localStorage.getItem('imxx_users') || '[]');
            const term = email.toLowerCase();
            const localUser = users.find(u => 
                ((u.email && u.email.toLowerCase() === term) || 
                 (u.username && u.username.toLowerCase() === term) || 
                 (u.phone && u.phone === email) || 
                 (u.phoneNumber && u.phoneNumber === email)) && 
                u.password === pass
            );
            if (localUser) {
                user = localUser;
                user.fullName = user.name;
                user.phone = user.phoneNumber || user.phone || '';
            }
        }

        if (user) {
            Store.state.currentUser = user;
            Store.save('currentUser', user);
            if (token) {
                localStorage.setItem('nomad_token', token);
            }
            this.closeModals();
            this.updateUserUI();
            this.renderDashboard();
            this.showNotification(`Welcome back, ${user.name}! 👋`, 'success');
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    },

    async signupRequest(isResend = false) {
        const name  = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const pass  = document.getElementById('signup-pass').value;
        const phone = document.getElementById('signup-phone') ? document.getElementById('signup-phone').value.trim() : '';

        if (!name || !email || !pass) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        if (pass.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'warning');
            return;
        }

        try {
            const response = await fetch(getApiUrl('/api/auth/signup-request'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password: pass,
                    fullName: name,
                    username: name.toLowerCase().replace(/\s+/g, ''),
                    phoneNumber: phone
                })
            });
            const data = await response.json();
            if (response.ok) {
                this.showNotification(isResend ? 'Verification code resent!' : 'Verification code sent via Email!', 'success');
                this.pendingSignupData = { name, email, pass, phone };
                
                if (data.smsDebugCode) {
                    this.showNotification(`[DEBUG] Verification code: ${data.smsDebugCode}`, 'info');
                    console.log(`[EMAIL SIGNUP CODE] ${data.smsDebugCode}`);
                }

                // Switch panes in the modal
                document.getElementById('signup-form-pane').style.display = 'none';
                document.getElementById('signup-verify-pane').style.display = 'block';
                document.getElementById('signup-verify-code').focus();
            } else {
                this.showNotification(data.error || 'Signup request failed', 'error');
            }
        } catch (err) {
            console.warn('[Backend Error] Offline or unreachable. Falling back to local/simulated Email verification...');
            this.pendingSignupData = { name, email, pass, phone, localCode: '123456' };
            this.showNotification('Offline mode: Verification code "123456" simulated!', 'info');
            
            // Switch panes in the modal
            document.getElementById('signup-form-pane').style.display = 'none';
            document.getElementById('signup-verify-pane').style.display = 'block';
            document.getElementById('signup-verify-code').focus();
        }
    },

    async signupVerify() {
        const code = document.getElementById('signup-verify-code').value.trim();
        if (!code || code.length !== 6) {
            this.showNotification('Please enter a valid 6-digit code', 'warning');
            return;
        }

        const pending = this.pendingSignupData;
        if (!pending) {
            this.showNotification('Session expired. Please try signing up again.', 'error');
            document.getElementById('signup-form-pane').style.display = 'block';
            document.getElementById('signup-verify-pane').style.display = 'none';
            return;
        }

        try {
            if (pending.localCode) {
                if (pending.localCode !== code) {
                    this.showNotification('Invalid verification code.', 'error');
                    return;
                }
                
                const users = JSON.parse(localStorage.getItem('imxx_users') || '[]');
                if (users.find(u => u.email === pending.email)) {
                    this.showNotification('Email already registered', 'error');
                    return;
                }

                const localUser = {
                    id: 'u' + Date.now(),
                    name: pending.name,
                    email: pending.email,
                    password: pending.pass,
                    role: 'user',
                    fullName: pending.name,
                    phone: pending.phone,
                    phoneNumber: pending.phone,
                    avatarUrl: '../pic/logo.png'
                };
                users.push(localUser);
                localStorage.setItem('imxx_users', JSON.stringify(users));
                
                Store.state.currentUser = localUser;
                Store.save('currentUser', localUser);
                this.closeModals();
                this.updateUserUI();
                this.showNotification(`Account created! Welcome, ${localUser.name} 🎉`, 'success');
                return;
            }

            const response = await fetch(getApiUrl('/api/auth/signup-verify'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: pending.email,
                    code: code
                })
            });
            const data = await response.json();
            if (response.ok) {
                const token = data.token;
                const user = data.user;
                user.name = user.fullName || user.name;
                user.phone = user.phoneNumber || user.phone || '';

                Store.state.currentUser = user;
                Store.save('currentUser', user);
                if (token) {
                    localStorage.setItem('nomad_token', token);
                }
                
                document.getElementById('signup-verify-code').value = '';
                this.closeModals();
                this.updateUserUI();
                this.showNotification(`Account created! Welcome, ${user.name} 🎉`, 'success');
            } else {
                this.showNotification(data.error || 'Verification failed', 'error');
            }
        } catch (err) {
            this.showNotification('Verification request failed. Connection error.', 'error');
        }
    },

    async forgotPasswordRequest() {
        const identity = document.getElementById('forgot-identity').value.trim();
        if (!identity) {
            this.showNotification('Please enter your email or phone number.', 'warning');
            return;
        }

        try {
            const response = await fetch(getApiUrl('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrPhone: identity })
            });
            const data = await response.json();
            if (response.ok) {
                this.forgotIdentity = identity;
                
                // Show verification code in toast for easy local testing
                this.showNotification(`[SMS Gateway] Code sent: ${data.smsDebugCode}`, 'success');
                
                const p1 = document.getElementById('forgot-pane-1');
                const p2 = document.getElementById('forgot-pane-2');
                if (p1) p1.style.display = 'none';
                if (p2) p2.style.display = 'block';
                const desc = document.getElementById('forgot-modal-desc');
                if (desc) desc.textContent = 'Enter the 6-digit verification code sent to your device.';
            } else {
                this.showNotification(data.error || 'Failed to send verification code.', 'error');
            }
        } catch (err) {
            console.warn('[Backend Error] Offline or unreachable. Using local storage fallback for forgot-password...');
            const users = JSON.parse(localStorage.getItem('imxx_users') || '[]');
            const term = identity.toLowerCase();
            const localUser = users.find(u => 
                (u.email && u.email.toLowerCase() === term) || 
                (u.phone && u.phone === identity) || 
                (u.phoneNumber && u.phoneNumber === identity) || 
                (u.fullName && u.fullName.toLowerCase() === term)
            );

            if (!localUser) {
                this.showNotification('No account found with this email or phone number.', 'error');
                return;
            }

            // Generate mock code
            const localCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

            localUser.resetCode = localCode;
            localUser.resetCodeExpires = expires;
            localStorage.setItem('imxx_users', JSON.stringify(users));

            this.forgotIdentity = identity;
            this.showNotification(`[Local SMS Simulation] Reset code: ${localCode}`, 'success');

            const p1 = document.getElementById('forgot-pane-1');
            const p2 = document.getElementById('forgot-pane-2');
            if (p1) p1.style.display = 'none';
            if (p2) p2.style.display = 'block';
            const desc = document.getElementById('forgot-modal-desc');
            if (desc) desc.textContent = 'Enter the 6-digit verification code sent to your device.';
        }
    },

    async verifyResetCode() {
        const code = document.getElementById('forgot-code').value.trim();
        if (!code || code.length !== 6 || isNaN(code)) {
            this.showNotification('Please enter a valid 6-digit numeric code.', 'warning');
            return;
        }

        try {
            const response = await fetch(getApiUrl('/api/auth/verify-reset-code'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrPhone: this.forgotIdentity, code })
            });
            const data = await response.json();
            if (response.ok) {
                this.forgotCode = code;
                const p2 = document.getElementById('forgot-pane-2');
                const p3 = document.getElementById('forgot-pane-3');
                if (p2) p2.style.display = 'none';
                if (p3) p3.style.display = 'block';
                const desc = document.getElementById('forgot-modal-desc');
                if (desc) desc.textContent = 'Create a secure new password for your account.';
            } else {
                this.showNotification(data.error || 'Invalid or expired verification code.', 'error');
            }
        } catch (err) {
            console.warn('[Backend Error] Offline. Using local storage verification...');
            const users = JSON.parse(localStorage.getItem('imxx_users') || '[]');
            const term = this.forgotIdentity.toLowerCase();
            const localUser = users.find(u => 
                (u.email && u.email.toLowerCase() === term) || 
                (u.phone && u.phone === this.forgotIdentity) || 
                (u.phoneNumber && u.phoneNumber === this.forgotIdentity)
            );

            if (!localUser || localUser.resetCode !== code) {
                this.showNotification('Invalid verification code.', 'error');
                return;
            }

            if (new Date(localUser.resetCodeExpires) < new Date()) {
                this.showNotification('Verification code has expired.', 'error');
                return;
            }

            this.forgotCode = code;
            const p2 = document.getElementById('forgot-pane-2');
            const p3 = document.getElementById('forgot-pane-3');
            if (p2) p2.style.display = 'none';
            if (p3) p3.style.display = 'block';
            const desc = document.getElementById('forgot-modal-desc');
            if (desc) desc.textContent = 'Create a secure new password for your account.';
        }
    },

    async resetPasswordSubmit() {
        const newPass = document.getElementById('forgot-new-pass').value;
        const confirmPass = document.getElementById('forgot-confirm-pass').value;

        if (!newPass || newPass.length < 8) {
            this.showNotification('Password must be at least 8 characters long.', 'warning');
            return;
        }

        if (newPass !== confirmPass) {
            this.showNotification('Passwords do not match.', 'warning');
            return;
        }

        try {
            const response = await fetch(getApiUrl('/api/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailOrPhone: this.forgotIdentity,
                    code: this.forgotCode,
                    newPassword: newPass
                })
            });
            const data = await response.json();
            if (response.ok) {
                this.closeModals();
                this.showNotification('Password reset successfully! Please log in.', 'success');
                
                // Clear state
                this.forgotIdentity = '';
                this.forgotCode = '';
                
                // Switch back to login modal
                setTimeout(() => {
                    this.openModal('modal-login');
                }, 400);
            } else {
                this.showNotification(data.error || 'Failed to reset password.', 'error');
            }
        } catch (err) {
            console.warn('[Backend Error] Offline. Resetting password locally...');
            const users = JSON.parse(localStorage.getItem('imxx_users') || '[]');
            const term = this.forgotIdentity.toLowerCase();
            const idx = users.findIndex(u => 
                (u.email && u.email.toLowerCase() === term) || 
                (u.phone && u.phone === this.forgotIdentity) || 
                (u.phoneNumber && u.phoneNumber === this.forgotIdentity)
            );

            if (idx === -1) {
                this.showNotification('Failed to reset password locally. Account not found.', 'error');
                return;
            }

            users[idx].password = newPass;
            delete users[idx].resetCode;
            delete users[idx].resetCodeExpires;
            localStorage.setItem('imxx_users', JSON.stringify(users));

            this.closeModals();
            this.showNotification('Password reset successfully (Local)! Please log in.', 'success');

            // Clear state
            this.forgotIdentity = '';
            this.forgotCode = '';

            setTimeout(() => {
                this.openModal('modal-login');
            }, 400);
        }
    },

    logout() {
        Store.state.currentUser = null;
        localStorage.setItem('imxx_currentUser', JSON.stringify(null));
        localStorage.removeItem('nomad_token');
        this.updateUserUI();
        this.showNotification('Logged out successfully', 'info');
        this.switchView('home');
    },

    updateUserUI() {
        const user      = Store.state.currentUser;
        const nameEl    = document.getElementById('top-user-name');
        const logoutBtn = document.getElementById('logout-btn');
        const loginBtn  = document.getElementById('login-btn');

        if (nameEl)    nameEl.textContent    = user ? (user.name || user.fullName || '').split(' ')[0] : 'Login';
        if (logoutBtn) logoutBtn.style.display = user ? 'flex' : 'none';
        if (loginBtn)  loginBtn.style.display  = user ? 'none' : 'flex';

        // Update top bar profile avatar
        const topAvatarImg = document.querySelector('.user-profile-btn img');
        if (topAvatarImg) {
            topAvatarImg.src = (user && user.avatarUrl) ? user.avatarUrl : "../pic/profile.png";
        }

        // Update dropdown header elements
        const ddName = document.getElementById('dropdown-user-name');
        const ddRole = document.getElementById('dropdown-user-role');
        const ddAvatar = document.getElementById('dropdown-user-avatar');
        const ddAuth = document.getElementById('dropdown-auth-action');

        if (ddName)   ddName.textContent = user ? (user.name || user.fullName || 'Traveler') : 'Guest Traveler';
        if (ddRole)   ddRole.textContent = user ? (user.role === 'admin' ? 'ADMIN PANEL' : 'ELITE MEMBER') : 'ANONYMOUS';
        if (ddAvatar) ddAvatar.src = (user && user.avatarUrl) ? user.avatarUrl : "../pic/profile.png";
        if (ddAuth) {
            ddAuth.innerHTML = user
                ? `<i class="fa-solid fa-right-from-bracket"></i> Logout`
                : `<i class="fa-solid fa-right-to-bracket"></i> Login / Signup`;
        }

        // Update Dashboard elements
        const dashName = document.getElementById('dash-user-name');
        const dashAvatar = document.querySelector('.profile-header img');
        if (dashName)   dashName.textContent = user ? (user.name || user.fullName || 'Traveler') : 'Guest Traveler';
        if (dashAvatar) dashAvatar.src = (user && user.avatarUrl) ? user.avatarUrl : "../pic/profile.png";

        // Pre-populate Edit Profile Modal fields
        const editName   = document.getElementById('edit-name');
        const editEmail  = document.getElementById('edit-email');
        const editPhone  = document.getElementById('edit-phone');
        const editPreview = document.getElementById('edit-avatar-preview');

        if (user) {
            if (editName)   editName.value   = user.name || user.fullName || '';
            if (editEmail)  editEmail.value  = user.email || '';
            if (editPhone)  editPhone.value  = user.phone || user.phoneNumber || '';
            
            this.tempAvatarDataUrl = user.avatarUrl || '';
            if (editPreview) editPreview.src = user.avatarUrl || '../pic/profile.png';
            
            // Highlight selected preset if applicable
            document.querySelectorAll('.preset-avatar-btn').forEach(btn => {
                const url = btn.getAttribute('data-url');
                if (url && url === this.tempAvatarDataUrl) {
                    btn.classList.add('active');
                    btn.style.borderColor = 'var(--gold)';
                } else {
                    btn.classList.remove('active');
                    btn.style.borderColor = 'transparent';
                }
            });
        }
    },

    async saveProfile() {
        const name      = document.getElementById('edit-name').value.trim();
        const email     = document.getElementById('edit-email').value.trim();
        const phone     = document.getElementById('edit-phone').value.trim();

        if (!name || !email) {
            this.showNotification('Name and email are required', 'warning');
            return;
        }

        let currentUser = Store.state.currentUser;
        if (!currentUser) {
            currentUser = { id: 'dummy', role: 'user' };
        }

        currentUser.name = name;
        currentUser.fullName = name;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.phoneNumber = phone;
        currentUser.avatarUrl = this.tempAvatarDataUrl || currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=000`;

        // --- Backend Sync with Local Fallback ---
        const token = localStorage.getItem('nomad_token');
        if (token) {
            try {
                const profileRes = await fetch(getApiUrl('/api/user/profile'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        fullName: name,
                        username: currentUser.username || name.toLowerCase().replace(/\s+/g, ''),
                        email: email,
                        currency: currentUser.currency || 'USD',
                        phoneNumber: phone
                    })
                });
                
                if (profileRes.ok) {
                    await fetch(getApiUrl('/api/user/avatar'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify({ avatarUrl: currentUser.avatarUrl })
                    });
                }
            } catch (err) {
                console.warn('[Backend Sync Error] Fallback to local storage:', err.message);
            }
        }

        Store.state.currentUser = currentUser;
        Store.save('currentUser', currentUser);

        if (currentUser.id !== 'dummy') {
            const users = JSON.parse(localStorage.getItem('imxx_users') || '[]');
            const idx = users.findIndex(u => u.id === currentUser.id);
            if (idx !== -1) {
                users[idx] = { ...users[idx], ...currentUser };
                localStorage.setItem('imxx_users', JSON.stringify(users));
            }
        }

        this.updateUserUI();
        this.renderDashboard();
        this.closeModals();
        this.showNotification('Profile updated successfully ✅', 'success');
    },

    handleAvatarFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 1.5MB to be safe for LocalStorage and DB)
        if (file.size > 1.5 * 1024 * 1024) {
            this.showNotification('Image must be under 1.5MB', 'warning');
            event.target.value = ''; // clear input
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Data = e.target.result;
            this.tempAvatarDataUrl = base64Data;
            
            // Update preview
            const editPreview = document.getElementById('edit-avatar-preview');
            if (editPreview) {
                editPreview.src = base64Data;
            }
            
            // Clear selected presets border
            document.querySelectorAll('.preset-avatar-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.borderColor = 'transparent';
            });
        };
        reader.readAsDataURL(file);
    },

    selectPresetAvatar(imgEl) {
        // Remove active class / custom border from all buttons
        document.querySelectorAll('.preset-avatar-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.borderColor = 'transparent';
        });
        
        // Add active style to selected
        imgEl.classList.add('active');
        imgEl.style.borderColor = 'var(--gold)';
        
        const url = imgEl.getAttribute('data-url');
        this.tempAvatarDataUrl = url;
        
        // Update modal preview
        const editPreview = document.getElementById('edit-avatar-preview');
        if (editPreview) {
            editPreview.src = url;
        }
    },

    // ==========================================
    // SETTINGS
    // ==========================================
    applySettings() {
        const s = Store.state.settings;
        const el = id => document.getElementById(id);
        if (el('setting-dark-mode'))    el('setting-dark-mode').checked    = s.darkMode;
        if (el('setting-lang'))         el('setting-lang').value           = s.language;
        if (el('setting-notif-email'))  el('setting-notif-email').checked  = s.notifEmail;
        if (el('setting-notif-sms'))    el('setting-notif-sms').checked    = s.notifSms;
        this.toggleDarkMode(s.darkMode, false);
    },

    saveSettings() {
        const el = id => document.getElementById(id);
        Store.state.settings = {
            darkMode:   el('setting-dark-mode')   ? el('setting-dark-mode').checked   : true,
            language:   el('setting-lang')         ? el('setting-lang').value          : 'en',
            notifEmail: el('setting-notif-email')  ? el('setting-notif-email').checked : true,
            notifSms:   el('setting-notif-sms')    ? el('setting-notif-sms').checked   : false,
        };
        Store.save('settings', Store.state.settings);
    },

    themeManager: window.themeManager,

    toggleDarkMode(isDark, notify = true) {
        if (window.themeManager) {
            window.themeManager.setTheme(isDark ? 'dark' : 'light', notify);
        } else {
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
                document.documentElement.classList.remove('light-mode');
                if (document.body) {
                    document.body.classList.add('dark-mode');
                    document.body.classList.remove('light-mode');
                }
            } else {
                document.documentElement.classList.add('light-mode');
                document.documentElement.classList.remove('dark-mode');
                if (document.body) {
                    document.body.classList.add('light-mode');
                    document.body.classList.remove('dark-mode');
                }
            }
            this.saveSettings();
        }
    },

    // ==========================================
    // ADMIN PANEL & SYSTEM GOVERNANCE
    // ==========================================
    adminCurrentType: null,
    adminEditId: null,
    adminSearchQuery: '',
    cachedAdminUsers: [],
    cachedAdminBookings: [],

    filterAdminTable(query) {
        this.adminSearchQuery = (query || '').toLowerCase().trim();
        this.renderAdmin();
    },

    async renderAdmin() {
        const query = this.adminSearchQuery;
        const statusFilter = (document.getElementById('admin-status-filter')?.value || 'ALL');

        // Helper filter function
        const matchesQuery = (obj, fields) => {
            if (!query) return true;
            return fields.some(f => String(obj[f] || '').toLowerCase().includes(query));
        };

        const fillTable = (id, rows) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = rows;
        };

        // 1. Destinations
        const filteredDestinations = Store.state.destinations.filter(d => matchesQuery(d, ['name', 'location', 'category', 'desc']));
        fillTable('table-destinations', filteredDestinations.map(d => `
            <tr>
                <td><img src="${d.img}" style="width:50px;height:40px;object-fit:cover;border-radius:8px" onerror="this.src='../pic/destination/d1.png'"></td>
                <td><strong>${d.name}</strong></td>
                <td>${d.location}</td>
                <td><span class="cat-badge">${d.category}</span></td>
                <td>$${d.price.toLocaleString()}</td>
                <td>⭐ ${d.rating}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="action-btn btn-edit" title="Edit Destination" onclick="app.adminEdit('destinations','${d.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn btn-delete" title="Delete Destination" onclick="app.adminDelete('destinations','${d.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--text-secondary); padding:20px;">No destinations found</td></tr>`);

        // 2. Hotels
        const filteredHotels = Store.state.hotels.filter(h => matchesQuery(h, ['name', 'location', 'desc']));
        fillTable('table-hotels', filteredHotels.map(h => `
            <tr>
                <td><img src="${h.img}" style="width:50px;height:40px;object-fit:cover;border-radius:8px" onerror="this.src='../pic/hotel/h1.png'"></td>
                <td><strong>${h.name}</strong></td>
                <td>${h.location}</td>
                <td>$${h.price.toLocaleString()}/night</td>
                <td>⭐ ${h.rating}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="action-btn btn-edit" title="Edit Hotel" onclick="app.adminEdit('hotels','${h.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn btn-delete" title="Delete Hotel" onclick="app.adminDelete('hotels','${h.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding:20px;">No hotels found</td></tr>`);

        // 3. Food
        const filteredFood = Store.state.foodItems.filter(f => matchesQuery(f, ['name', 'rest', 'category', 'desc']));
        fillTable('table-food', filteredFood.map(f => `
            <tr>
                <td><img src="${f.img}" style="width:50px;height:40px;object-fit:cover;border-radius:8px" onerror="this.src='../pic/food/f1.png'"></td>
                <td><strong>${f.name}</strong></td>
                <td>${f.rest}</td>
                <td><span class="cat-badge">${f.category}</span></td>
                <td>$${f.price}</td>
                <td>⭐ ${f.rating}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="action-btn btn-edit" title="Edit Food Item" onclick="app.adminEdit('foodItems','${f.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn btn-delete" title="Delete Food Item" onclick="app.adminDelete('foodItems','${f.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--text-secondary); padding:20px;">No food items found</td></tr>`);

        // 4. Flights
        const filteredFlights = Store.state.flights.filter(fl => matchesQuery(fl, ['airline', 'from', 'to', 'class']));
        fillTable('table-flights', filteredFlights.map(fl => `
            <tr>
                <td><strong>${fl.airline}</strong></td>
                <td>${fl.from} → ${fl.to}</td>
                <td>${fl.duration || '2h 30m'}</td>
                <td><span class="cat-badge">${fl.class || 'Economy'}</span></td>
                <td>$${fl.price.toLocaleString()}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="action-btn btn-edit" title="Edit Flight" onclick="app.adminEdit('flights','${fl.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn btn-delete" title="Delete Flight" onclick="app.adminDelete('flights','${fl.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding:20px;">No flights found</td></tr>`);

        // 5. Ledger & Bookings
        const token = localStorage.getItem('nomad_token');
        let dbBookings = [];
        let totalRevenueSum = 0;

        if (token) {
            try {
                const response = await fetch(getApiUrl('/api/admin/bookings'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const resData = await response.json();
                    dbBookings = resData.data || [];
                    this.cachedAdminBookings = dbBookings;
                }
            } catch (err) {
                console.error("Failed to load admin bookings from API", err);
            }
        }

        if (dbBookings.length === 0 && this.cachedAdminBookings.length > 0) {
            dbBookings = this.cachedAdminBookings;
        }

        let ledgerRows = [];
        if (dbBookings.length > 0) {
            ledgerRows = dbBookings.filter(b => {
                if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
                if (!query) return true;
                return (
                    (b.bookingRef || '').toLowerCase().includes(query) ||
                    (b.item_name || '').toLowerCase().includes(query) ||
                    (b.user_name || '').toLowerCase().includes(query) ||
                    (b.user_email || '').toLowerCase().includes(query) ||
                    (b.utr || '').toLowerCase().includes(query)
                );
            }).map(b => {
                totalRevenueSum += parseFloat(b.total_price || 0);

                let statusHtml = '';
                if (b.status === 'PENDING') {
                    statusHtml = `
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="role-badge pending" style="background:rgba(217,119,6,0.18); color:#f59e0b; border:1px solid rgba(217,119,6,0.3);">PENDING</span>
                            <button class="btn-premium" style="font-size:10px; padding:4px 10px; width:auto; border-radius:6px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; cursor:pointer;" onclick="app.adminVerifyBooking(${b.id}, 'SUCCESS')"><i class="fa-solid fa-check"></i> Approve</button>
                        </div>
                    `;
                } else if (b.status === 'AWAITING_CONFIRMATION') {
                    statusHtml = `
                        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-start;">
                            <span class="role-badge" style="background:rgba(59,130,246,0.18); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);">AWAITING CONFIRMATION</span>
                            <div style="display:flex; gap:6px;">
                                <button class="btn-premium" style="font-size:10px; padding:4px 8px; width:auto; border-radius:6px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; cursor:pointer;" onclick="app.adminVerifyBooking(${b.id}, 'SUCCESS')"><i class="fa-solid fa-check"></i> Approve</button>
                                <button class="add-btn" style="font-size:10px; padding:4px 8px; width:auto; border-radius:6px; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); cursor:pointer;" onclick="app.adminVerifyBooking(${b.id}, 'REJECTED')"><i class="fa-solid fa-xmark"></i> Reject</button>
                            </div>
                        </div>
                    `;
                } else if (b.status === 'REJECTED') {
                    statusHtml = `<span class="role-badge" style="background:rgba(239,68,68,0.18); color:#ef4444; border:1px solid rgba(239,68,68,0.3);">REJECTED</span>`;
                } else {
                    statusHtml = `<span class="role-badge" style="background:rgba(16,185,129,0.18); color:#10b981; border:1px solid rgba(16,185,129,0.3);">SUCCESS</span>`;
                }

                return `
                    <tr>
                        <td><span style="font-family:monospace; font-weight:700; color:var(--gold);">${b.bookingRef || ('IMXX-' + b.id)}</span></td>
                        <td>
                            <strong>${b.item_name}</strong>
                            <div style="font-size:11px; color:var(--text-secondary); margin-top:3px; line-height:1.45;">
                                User: ${b.user_name} (${b.user_email})<br/>
                                Ref: <span style="font-family:monospace; color:#60a5fa; font-weight:600;">${b.utr || 'N/A'}</span>
                                ${b.screenshot_path ? `<br/>Proof: <a href="${b.screenshot_path}" target="_blank" style="color:var(--gold); text-decoration:underline; font-weight:600;"><i class="fa-solid fa-receipt"></i> View Screenshot</a>` : ''}
                                ${b.payment_message ? `<br/>Note: <span style="color:#e2e8f0; font-style:italic;">"${b.payment_message}"</span>` : ''}
                            </div>
                        </td>
                        <td>$${parseFloat(b.total_price || 0).toLocaleString()}</td>
                        <td>${new Date(b.created_at).toLocaleDateString()}</td>
                        <td>${statusHtml}</td>
                    </tr>
                `;
            }).join('');
        } else {
            const localLedger = [
                ...Store.state.bookings.map(b => ({ ...b, t: b.type || 'Hotel' })),
                ...Store.state.orders.map(o => ({ ...o, t: 'Food Order' }))
            ];
            ledgerRows = localLedger.filter(l => {
                if (!query) return true;
                return String(l.id).toLowerCase().includes(query) || String(l.t).toLowerCase().includes(query);
            }).map(l => {
                totalRevenueSum += parseFloat(l.total || 0);
                return `
                    <tr>
                        <td><span style="font-family:monospace; color:var(--gold); font-weight:700;">${l.id}</span></td>
                        <td><strong>${l.t}</strong></td>
                        <td>$${(l.total || 0).toLocaleString()}</td>
                        <td>${new Date(l.date || Date.now()).toLocaleDateString()}</td>
                        <td><span class="role-badge" style="background:rgba(16,185,129,0.18); color:#10b981; border:1px solid rgba(16,185,129,0.3);">Completed</span></td>
                    </tr>
                `;
            }).join('');
        }
        fillTable('table-orders', ledgerRows || `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding:20px;">No ledger entries found</td></tr>`);

        // 6. Users & Roles Management
        let usersData = [];
        if (token) {
            try {
                const response = await fetch(getApiUrl('/api/admin/users'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const resData = await response.json();
                    usersData = resData.data || [];
                    this.cachedAdminUsers = usersData;
                }
            } catch (err) {
                console.error("Failed to load users from API", err);
            }
        }

        if (usersData.length === 0 && this.cachedAdminUsers.length > 0) {
            usersData = this.cachedAdminUsers;
        }

        if (usersData.length === 0) {
            // Local fallback users
            usersData = [
                { id: 1, name: 'Alexander Wright', email: 'admin@imxx.com', role: 'admin', created_at: new Date().toISOString() },
                { id: 2, name: 'Elena Rostova', email: 'elena@imxx.com', role: 'user', created_at: new Date().toISOString() },
                { id: 3, name: 'Marco Vance', email: 'vendor@imxx.com', role: 'vendor', created_at: new Date().toISOString() }
            ];
        }

        const filteredUsers = usersData.filter(u => {
            if (!query) return true;
            return (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query);
        });

        fillTable('table-users', filteredUsers.map(u => `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${u.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'User')}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid var(--gold);">
                        <strong>${u.name || 'User'}</strong>
                    </div>
                </td>
                <td>${u.email}</td>
                <td><span class="role-badge ${u.role}">${(u.role || 'user').toUpperCase()}</span></td>
                <td>${new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <select class="admin-select" style="padding:4px 8px; font-size:12px;" onchange="app.adminUpdateUserRole(${u.id}, this.value)">
                            <option value="user" ${u.role==='user'?'selected':''}>User</option>
                            <option value="vendor" ${u.role==='vendor'?'selected':''}>Vendor</option>
                            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                        </select>
                        <button class="action-btn btn-delete" title="Delete User" onclick="app.adminDeleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding:20px;">No users found</td></tr>`);

        // 7. Update System KPI Metrics Cards with Smooth Animated Counter
        const totalItemsCount = Store.state.destinations.length + Store.state.hotels.length + Store.state.foodItems.length + Store.state.flights.length;
        const totalBookingsCount = dbBookings.length > 0 ? dbBookings.length : (Store.state.bookings.length + Store.state.orders.length);

        const animateCounter = (el, target, isCurrency = false) => {
            if (!el) return;
            const startVal = 0;
            const duration = 500;
            const startTime = performance.now();
            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeOut * target);
                el.textContent = isCurrency ? `$${current.toLocaleString()}` : current.toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        animateCounter(document.getElementById('kpi-total-revenue'), totalRevenueSum, true);
        animateCounter(document.getElementById('kpi-total-bookings'), totalBookingsCount, false);
        animateCounter(document.getElementById('kpi-total-items'), totalItemsCount, false);
        animateCounter(document.getElementById('kpi-total-users'), usersData.length, false);
    },


    async adminUpdateUserRole(userId, newRole) {
        const token = localStorage.getItem('nomad_token');
        if (!token) {
            this.showNotification('Updated role in local session.', 'info');
            return;
        }
        try {
            const response = await fetch(getApiUrl(`/api/admin/users/${userId}/role`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await response.json();
            if (response.ok) {
                this.showNotification(`User role updated to ${newRole.toUpperCase()}! 🎉`, 'success');
                this.renderAdmin();
            } else {
                this.showNotification(data.error || 'Failed to update user role.', 'error');
            }
        } catch (err) {
            console.error("Role update failed:", err);
            this.showNotification('Network error while updating role.', 'error');
        }
    },

    async adminDeleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user account permanently?')) return;
        const token = localStorage.getItem('nomad_token');
        if (!token) {
            this.showNotification('Deleted user from local session.', 'info');
            return;
        }
        try {
            const response = await fetch(getApiUrl(`/api/admin/users/${userId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                this.showNotification('User deleted successfully.', 'success');
                this.renderAdmin();
            } else {
                this.showNotification(data.error || 'Failed to delete user.', 'error');
            }
        } catch (err) {
            console.error("Delete user failed:", err);
            this.showNotification('Network error while deleting user.', 'error');
        }
    },

    exportLedgerCSV() {
        const bookings = this.cachedAdminBookings.length > 0 ? this.cachedAdminBookings : [
            ...Store.state.bookings.map(b => ({ bookingRef: b.id, item_name: b.name || 'Hotel Booking', user_name: 'Guest', user_email: 'guest@nomad.com', total_price: b.total, created_at: b.date, status: 'SUCCESS' })),
            ...Store.state.orders.map(o => ({ bookingRef: o.id, item_name: 'Food Order', user_name: 'Guest', user_email: 'guest@nomad.com', total_price: o.total, created_at: o.date, status: 'SUCCESS' }))
        ];

        let csvContent = "data:text/csv;charset=utf-8,Reference,Item Name,User Name,User Email,Total Price,Date,Status\n";
        bookings.forEach(b => {
            const row = [
                `"${b.bookingRef || ('IMXX-' + b.id)}"`,
                `"${(b.item_name || '').replace(/"/g, '""')}"`,
                `"${(b.user_name || '').replace(/"/g, '""')}"`,
                `"${(b.user_email || '').replace(/"/g, '""')}"`,
                `"${b.total_price || 0}"`,
                `"${new Date(b.created_at || Date.now()).toISOString().split('T')[0]}"`,
                `"${b.status || 'SUCCESS'}"`
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `nomad_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('Ledger CSV exported successfully 📥', 'success');
    },

    async adminVerifyBooking(bookingId, status = 'SUCCESS') {
        const actionText = status === 'SUCCESS' ? 'approve' : 'reject';
        if (!confirm(`Are you sure you want to ${actionText} this booking?`)) return;
        const token = localStorage.getItem('nomad_token');
        if (!token) return;

        try {
            const response = await fetch(getApiUrl(`/api/admin/bookings/${bookingId}/verify`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ status })
            });
            const resData = await response.json();
            if (response.ok) {
                this.showNotification(`Booking successfully ${actionText}d! 🎉`, 'success');
                this.renderAdmin();
            } else {
                this.showNotification(resData.error || `Failed to ${actionText} booking.`, 'error');
            }
        } catch (err) {
            console.error("Verify booking API failed:", err);
            this.showNotification('Connection error while updating status.', 'error');
        }
    },

    adminDelete(key, id) {
        if (!confirm('Delete this item permanently?')) return;
        Store.save(key, Store.state[key].filter(i => i.id !== id));
        this.renderAdmin();
        this.renderAll();
        this.showNotification('Item deleted', 'info');
    },

    adminEdit(key, id) {
        const item = Store.state[key].find(i => i.id === id);
        if (!item) return;
        this.adminCurrentType = key === 'destinations' ? 'destination' : (key === 'foodItems' ? 'food' : key.replace('s', ''));
        this.adminEditId = id;
        this.openAdminModal(this.adminCurrentType, item);
    },

    openAdminModal(type, prefill = null) {
        this.adminCurrentType = type;
        this.adminEditId = prefill ? prefill.id : null;
        document.getElementById('admin-form-title').textContent = prefill ? `Edit ${type.toUpperCase()}` : `Add New ${type.toUpperCase()}`;

        const val = (key) => prefill ? (prefill[key] || '') : '';

        let html = '';
        if (type === 'destination') {
            html = `
                <input type="text" id="af-name"     class="form-input" placeholder="Destination Name" value="${val('name')}">
                <input type="text" id="af-location" class="form-input" placeholder="Location (City, Country)" value="${val('location')}">
                <input type="number" id="af-price"  class="form-input" placeholder="Price ($)" value="${val('price')}">
                <input type="number" id="af-rating" class="form-input" placeholder="Rating (4.0–5.0)" value="${val('rating')}" step="0.1" min="0" max="5">
                <select id="af-category" class="form-input">
                    ${['mountains','beaches','nature','nature-forest','planets','destinations'].map(c => `<option value="${c}" ${val('category')===c?'selected':''}>${c}</option>`).join('')}
                </select>
                <input type="text" id="af-img" class="form-input" placeholder="Image URL (e.g. /pic/destination/d1.png)" value="${val('img')}">
                <textarea id="af-desc" class="form-input" placeholder="Description & Details" rows="3">${val('desc')}</textarea>`;
        } else if (type === 'hotel') {
            html = `
                <input type="text"   id="af-name"     class="form-input" placeholder="Hotel Name" value="${val('name')}">
                <input type="text"   id="af-location" class="form-input" placeholder="Location" value="${val('location')}">
                <input type="number" id="af-price"    class="form-input" placeholder="Price/night ($)" value="${val('price')}">
                <input type="number" id="af-rating"   class="form-input" placeholder="Rating" value="${val('rating')}" step="0.1">
                <input type="text"   id="af-img"      class="form-input" placeholder="Image URL" value="${val('img')}">
                <textarea id="af-desc" class="form-input" placeholder="Description & Amenities" rows="3">${val('desc')}</textarea>`;
        } else if (type === 'food') {
            html = `
                <input type="text"   id="af-name"     class="form-input" placeholder="Dish Name" value="${val('name')}">
                <input type="text"   id="af-rest"     class="form-input" placeholder="Restaurant Name" value="${val('rest')}">
                <input type="number" id="af-price"    class="form-input" placeholder="Price ($)" value="${val('price')}">
                <input type="number" id="af-rating"   class="form-input" placeholder="Rating" value="${val('rating')}" step="0.1">
                <select id="af-category" class="form-input">
                    ${['pizza','burger','indian','chinese','desserts','drinks'].map(c => `<option value="${c}" ${val('category')===c?'selected':''}>${c}</option>`).join('')}
                </select>
                <input type="text" id="af-img" class="form-input" placeholder="Image URL" value="${val('img')}">
                <textarea id="af-desc" class="form-input" placeholder="Description" rows="3">${val('desc')}</textarea>`;
        } else if (type === 'flight') {
            html = `
                <input type="text"   id="af-airline"  class="form-input" placeholder="Airline Name (e.g. Emirates, Delta)" value="${val('airline')}">
                <input type="text"   id="af-from"     class="form-input" placeholder="From (City / Airport Code)" value="${val('from')}">
                <input type="text"   id="af-to"       class="form-input" placeholder="To (City / Airport Code)" value="${val('to')}">
                <input type="text"   id="af-duration" class="form-input" placeholder="Duration (e.g. 3h 45m)" value="${val('duration')}">
                <select id="af-class" class="form-input">
                    ${['Economy','Business','First Class'].map(c => `<option value="${c}" ${val('class')===c?'selected':''}>${c}</option>`).join('')}
                </select>
                <input type="number" id="af-price"    class="form-input" placeholder="Ticket Price ($)" value="${val('price')}">`;
        }
        document.getElementById('admin-form-fields').innerHTML = html;
        this.openModal('modal-admin-form');
    },

    adminSaveEntity() {
        const v = id => { const el = document.getElementById(id); return el ? el.value : ''; };

        if (this.adminEditId) {
            // EDIT
            let key = 'destinations';
            if (this.adminCurrentType === 'hotel') key = 'hotels';
            else if (this.adminCurrentType === 'food') key = 'foodItems';
            else if (this.adminCurrentType === 'flight') key = 'flights';

            const arr = Store.state[key];
            const idx = arr.findIndex(i => i.id === this.adminEditId);
            if (idx > -1) {
                arr[idx] = { ...arr[idx],
                    name:     v('af-name') || arr[idx].name,
                    price:    parseFloat(v('af-price')) || arr[idx].price || 0,
                    rating:   parseFloat(v('af-rating')) || arr[idx].rating || 5.0,
                    img:      v('af-img') || arr[idx].img,
                    desc:     v('af-desc') || arr[idx].desc,
                    location: v('af-location') || arr[idx].location,
                    category: v('af-category') || arr[idx].category,
                    rest:     v('af-rest') || arr[idx].rest,
                    airline:  v('af-airline') || arr[idx].airline,
                    from:     v('af-from') || arr[idx].from,
                    to:       v('af-to') || arr[idx].to,
                    duration: v('af-duration') || arr[idx].duration,
                    class:    v('af-class') || arr[idx].class
                };
                Store.save(key, arr);
            }
        } else {
            // ADD NEW
            const obj = {
                id:       'ID-' + Date.now(),
                name:     v('af-name'),
                price:    parseFloat(v('af-price')) || 0,
                rating:   parseFloat(v('af-rating')) || 5.0,
                img:      v('af-img') || '../pic/destination/d1.png',
                desc:     v('af-desc'),
            };
            if (this.adminCurrentType === 'destination') {
                obj.location = v('af-location'); obj.category = v('af-category') || 'destinations';
                Store.state.destinations.push(obj); Store.save('destinations', Store.state.destinations);
            } else if (this.adminCurrentType === 'hotel') {
                obj.location = v('af-location'); obj.amenities = ['fa-wifi','fa-water','fa-spa'];
                Store.state.hotels.push(obj); Store.save('hotels', Store.state.hotels);
            } else if (this.adminCurrentType === 'food') {
                obj.rest = v('af-rest'); obj.category = v('af-category') || 'pizza';
                Store.state.foodItems.push(obj); Store.save('foodItems', Store.state.foodItems);
            } else if (this.adminCurrentType === 'flight') {
                obj.airline = v('af-airline') || 'Nomad Airways';
                obj.from = v('af-from') || 'NYC';
                obj.to = v('af-to') || 'LON';
                obj.duration = v('af-duration') || '7h 15m';
                obj.class = v('af-class') || 'Economy';
                Store.state.flights.push(obj); Store.save('flights', Store.state.flights);
            }
        }

        this.adminEditId = null;
        this.closeModals();
        this.renderAdmin();
        this.renderAll();
        this.showNotification('Database entry saved successfully ✅', 'success');
    },

    resetDatabase() {
        if (!confirm('⚠️ This will reset ALL data to defaults. This cannot be undone. Continue?')) return;
        localStorage.clear();
        this.showNotification('Database reset. Reloading...', 'warning');
        setTimeout(() => location.reload(), 1000);
    },


    // ==========================================
    // PAYMENT SUCCESS ANIMATION
    // ==========================================
    showPaymentSuccess(bookingId, title, subtitle, amount, metaArray = []) {
        const overlay = document.getElementById('payment-success-overlay');
        if(!overlay) return;

        document.getElementById('ps-booking-id').textContent = bookingId;
        document.querySelector('.ps-title').textContent = title || 'Payment Successful!';
        document.getElementById('ps-subtitle-text').textContent = subtitle || 'Your booking has been confirmed.';
        
        // Build meta row
        let metaHtml = `<div class="ps-meta-pill"><i class="fa-solid fa-file-invoice-dollar"></i> $${amount.toLocaleString()}</div>`;
        if(metaArray && metaArray.length) {
            metaArray.forEach(m => {
                metaHtml += `<div class="ps-meta-pill"><i class="${m.icon}"></i> ${m.text}</div>`;
            });
        }
        document.getElementById('ps-meta-row').innerHTML = metaHtml;

        // Reset checkmark animation by cloning it
        const svg = document.querySelector('.ps-check-svg');
        if (svg) {
            const newSvg = svg.cloneNode(true);
            svg.parentNode.replaceChild(newSvg, svg);
        }

        // Reset progress bar animation
        const bar = document.getElementById('ps-progress-bar');
        if (bar) {
            bar.style.animation = 'none';
            bar.offsetHeight; /* trigger reflow */
            bar.style.animation = null;
        }

        // Show overlay
        overlay.classList.add('ps-active');
        
        // Trigger confetti
        this.triggerConfetti();

        // Auto close after 3.5 seconds
        this.psTimeout = setTimeout(() => {
            this.closePaymentSuccess();
        }, 3500);
    },

    closePaymentSuccess() {
        const overlay = document.getElementById('payment-success-overlay');
        if (overlay) overlay.classList.remove('ps-active');
        if (this.psTimeout) clearTimeout(this.psTimeout);
        this.closeModals();
        this.switchView('home');
        this.showNotification("🎉 Payment & UTR Verified! Order complete. Welcome back to Home Screen.", "success");
    },

    copyBookingId() {
        const id = document.getElementById('ps-booking-id').textContent;
        navigator.clipboard.writeText(id).then(() => {
            this.showNotification('Booking ID copied to clipboard!', 'success');
        });
    },

    triggerConfetti() {
        // 1. Floating Emojis
        const emojis = ['✨','🎉','💳','🍾','💎','🥂','🏆','🌟'];
        for(let i=0; i<20; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'ps-emoji-particle';
                el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                el.style.left = (Math.random() * 90 + 5) + 'vw';
                el.style.top = (60 + Math.random() * 30) + 'vh';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2500);
            }, i * 80);
        }

        // 2. High-Density Dual-Cannon Confetti Streamers
        const canvas = document.getElementById('confetti-canvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#fce055', '#d4af37', '#34d399', '#ec4899', '#6366f1', '#38bdf8', '#ffffff'];

        for(let i=0; i<180; i++) {
            const isLeft = i % 2 === 0;
            particles.push({
                x: isLeft ? 40 : canvas.width - 40,
                y: canvas.height - 40,
                r: Math.random() * 8 + 4,
                dx: isLeft ? (Math.random() * 14 + 4) : -(Math.random() * 14 + 4),
                dy: -(Math.random() * 16 + 10),
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.floor(Math.random() * 12) - 6,
                tiltAngleInc: (Math.random() * 0.08) + 0.04,
                tiltAngle: Math.random() * Math.PI
            });
        }

        let frameId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            particles.forEach(p => {
                p.tiltAngle += p.tiltAngleInc;
                p.x += p.dx;
                p.y += p.dy;
                p.dy += 0.28;
                p.dx *= 0.985;

                if (p.y <= canvas.height) active = true;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                ctx.stroke();
            });
            if (active) frameId = requestAnimationFrame(draw);
        };
        draw();

        setTimeout(() => cancelAnimationFrame(frameId), 4500);
    },

    getInvoiceHTML(id, type, isStandalone = false) {
        let order, title, itemsHtml = '', total = 0, date = '', name = '', method = '';
        
        if (type === 'food') {
            order = Store.state.orders.find(o => o.id === id);
            if (!order) return '';
            title = 'Food Order Receipt';
            total = order.total;
            date = new Date(order.date).toLocaleString();
            name = order.name || 'Guest';
            method = order.payment || 'Credit Card';
            itemsHtml = order.items.map(i => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; color:#333;">${i.name}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color:#333;">${i.qty}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color:#333;">$${(i.price * i.qty).toLocaleString()}</td>
                </tr>
            `).join('');
        } else {
            order = Store.state.bookings.find(b => b.id === id);
            if (!order) return '';
            title = 'Booking Invoice';
            total = order.total;
            date = order.date ? new Date(order.date).toLocaleString() : new Date().toLocaleString();
            name = Store.state.currentUser ? Store.state.currentUser.name : 'Guest User';
            method = order.paymentMethod || 'Credit Card';
            itemsHtml = `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; color:#333;">${order.hotelName || order.destination || 'Luxury Booking'}<br><small style="color:#666">${order.dates || ''}</small></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color:#333;">1</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color:#333;">$${(order.total || 0).toLocaleString()}</td>
                </tr>
            `;
        }

        const taxBase = total / 1.18;
        const cgst = taxBase * 0.09;
        const sgst = taxBase * 0.09;
        
        // Generate a mock transaction ID based on the order ID
        const txnId = 'TXN-' + id.replace(/[^0-9]/g, '') + Math.floor(Math.random() * 90 + 10);

        const innerContent = `
            <div class="invoice-box" style="${isStandalone ? 'max-width: 850px; margin: auto; padding: 40px; border: 1px solid #ddd; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);' : 'padding: 30px;'} font-size: 14px; line-height: 22px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff;">
                <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #D4AF37; padding-bottom: 20px;">
                    <div>
                        <h1 style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">NOMAD</h1>
                        <p style="margin: 4px 0 2px; font-weight: 700; font-size: 16px;">IMXX Premium Hospitality Private Limited</p>
                        <p style="margin: 0; color: #666; font-size: 12px; line-height: 18px;">
                            Plot 44, Sector 18, Cyber City<br>
                            Gurugram, Haryana - 122002<br>
                            <strong>GSTIN:</strong> 06AAACI9988C1Z2<br>
                            <strong>CIN:</strong> U55101HR2026PTC099887
                        </p>
                    </div>
                    <div class="info" style="text-align: right; color: #333;">
                        <strong style="font-size: 18px; color: #D4AF37; text-transform: uppercase;">TAX INVOICE</strong><br>
                        <span style="font-size:12px; color:#666;">Original for Recipient</span><br><br>
                        <strong>Invoice ID:</strong> ${id}<br>
                        <strong>Transaction ID:</strong> ${txnId}<br>
                        <strong>Date & Time:</strong> ${date}<br>
                        <strong>Place of Supply:</strong> Haryana (06)
                    </div>
                </div>
                
                <div class="details" style="display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9f9f9; padding: 16px; border-radius: 8px;">
                    <div>
                        <strong style="color:#555; font-size:12px; text-transform:uppercase;">Billed To:</strong><br>
                        <strong style="font-size:15px;">${name}</strong><br>
                        ${type === 'food' ? (order.address + '<br>') : ''}
                    </div>
                    <div style="text-align: right;">
                        <strong style="color:#555; font-size:12px; text-transform:uppercase;">Payment Method:</strong><br>
                        <strong>${method}</strong><br>
                        <span style="display:inline-block; margin-top:8px; padding:4px 12px; background:#e8f5e9; color:#2e7d32; border:radius:4px; font-size:12px; font-weight:bold; letter-spacing:1px; border:1px solid #c8e6c9;">PAID VIA RAZORPAY</span>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th style="background: #f1f3f5; padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd; border-top: 1px solid #ddd; font-size:13px; text-transform:uppercase; color:#555;">Description of Goods / Services</th>
                            ${type === 'booking' ? '<th style="background: #f1f3f5; padding: 12px; text-align: center; font-weight: 700; border-bottom: 2px solid #ddd; border-top: 1px solid #ddd; font-size:13px; text-transform:uppercase; color:#555;">SAC Code</th>' : ''}
                            <th style="background: #f1f3f5; padding: 12px; text-align: center; font-weight: 700; border-bottom: 2px solid #ddd; border-top: 1px solid #ddd; font-size:13px; text-transform:uppercase; color:#555;">Qty</th>
                            <th style="background: #f1f3f5; padding: 12px; text-align: right; font-weight: 700; border-bottom: 2px solid #ddd; border-top: 1px solid #ddd; font-size:13px; text-transform:uppercase; color:#555;">Total (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${type === 'booking' ? `
                        <tr>
                            <td style="padding: 14px 12px; border-bottom: 1px solid #eee;"><strong>${order.hotelName || order.destination || 'Luxury Booking'}</strong><br><small style="color:#666">Stay Dates: ${order.dates || 'Open Dates'}</small></td>
                            <td style="padding: 14px 12px; border-bottom: 1px solid #eee; text-align: center; color:#666;">996311</td>
                            <td style="padding: 14px 12px; border-bottom: 1px solid #eee; text-align: center;">1</td>
                            <td style="padding: 14px 12px; border-bottom: 1px solid #eee; text-align: right;">${(order.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                        ` : itemsHtml}
                    </tbody>
                </table>

                <div style="display:flex; justify-content:flex-end;">
                    <table style="width: 350px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 12px; color: #555;">Subtotal (Taxable Value):</td>
                            <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${taxBase.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 12px; color: #555;">CGST @ 9.00%:</td>
                            <td style="padding: 8px 12px; text-align: right;">${cgst.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 12px; color: #555; border-bottom: 1px solid #ddd;">SGST @ 9.00%:</td>
                            <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #ddd;">${sgst.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr style="font-size: 18px; font-weight: 800; background: #fafafa;">
                            <td style="padding: 16px 12px; color: #1a1a1a;">GRAND TOTAL (INR):</td>
                            <td style="padding: 16px 12px; text-align: right; color: #D4AF37;">${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="footer" style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 11px; color: #888; line-height: 16px;">
                    <strong>Compliance Notices & Legal Footnotes:</strong><br>
                    1. All figures are dynamically computed in Indian Rupees (INR) and are accurate to two decimal places.<br>
                    2. This is a computer-generated tax invoice and requires no physical signature.<br>
                    3. Supply attracted under forward charge mechanism.<br>
                    4. For discrepancies or refund inquiries, present Invoice ID <strong>${id}</strong> to the Explore World Ltd. billing department.
                </div>
            </div>
        `;

        if (isStandalone) {
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice ${id}</title>
                    <style>
                        body { margin: 0; padding: 40px; background: #fff; }
                        @media print { .invoice-box { border: none !important; box-shadow: none !important; padding: 0 !important; } }
                    </style>
                </head>
                <body>
                    ${innerContent}
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `;
        }
        
        return innerContent;
    },

    viewInvoice(id, type) {
        // Hide the order/booking detail modal
        document.getElementById('modal-order-details').classList.remove('active');
        document.getElementById('modal-booking-details').classList.remove('active');
        
        // Show invoice modal
        const html = this.getInvoiceHTML(id, type, false);
        if (!html) return;
        
        document.getElementById('invoice-content').innerHTML = html;
        document.getElementById('modal-invoice').classList.add('active');

        // Bind the print button
        document.getElementById('btn-print-invoice').onclick = () => {
            this.printInvoice(id, type);
        };
    },

    printInvoice(id, type) {
        const fullHtml = this.getInvoiceHTML(id, type, true);
        if (!fullHtml) return;
        const win = window.open('', '_blank');
        win.document.write(fullHtml);
        win.document.close();
    },

    p2p: {
        currentBookingId: null,
        currentScreenshotPath: null,
        currentStep: 1,
        pollingInterval: null,
        timerInterval: null,
        selectedFile: null,

        open(bookingId, itemName, totalAmount, initialUtr = '') {
            this.currentBookingId = bookingId;
            this.currentScreenshotPath = null;
            this.currentStep = 2;
            this.selectedFile = null;

            const nameEl = document.getElementById('p2p-item-name');
            const amtEl = document.getElementById('p2p-total-amount');
            const orderIdEl = document.getElementById('p2p-order-id');
            const fileInput = document.getElementById('p2p-file-input');
            const uploadText = document.getElementById('p2p-upload-text');
            const messageInput = document.getElementById('p2p-message-input');
            const utrInput = document.getElementById('p2p-utr-input');

            if (nameEl) nameEl.textContent = itemName;
            if (amtEl) amtEl.textContent = `$${parseFloat(totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
            if (orderIdEl) orderIdEl.textContent = `IMXX-${String(bookingId).padStart(6, '0')}`;
            if (fileInput) fileInput.value = '';
            if (uploadText) uploadText.innerHTML = 'Choose screenshot or drag &amp; drop';
            if (utrInput) utrInput.value = initialUtr || '';
            if (messageInput) messageInput.value = '';

            const zone = document.getElementById('p2p-upload-zone');
            if (zone) {
                zone.classList.remove('dragover');
                if (!zone.dataset.dragBound) {
                    zone.dataset.dragBound = 'true';
                    zone.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        zone.classList.add('dragover');
                    });
                    zone.addEventListener('dragleave', () => {
                        zone.classList.remove('dragover');
                    });
                    zone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        zone.classList.remove('dragover');
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            this.handleFile(e.dataTransfer.files[0]);
                        }
                    });
                }
            }

            this.goStep(2);
            
            const modal = document.getElementById('modal-p2p');
            if (modal) modal.classList.add('active');

            const ov = document.getElementById('modal-overlay');
            if (ov) ov.classList.add('active');
        },

        close() {
            this.stopPolling();
            this.stopTimer();
            const modal = document.getElementById('modal-p2p');
            if (modal) modal.classList.remove('active');
            const ov = document.getElementById('modal-overlay');
            if (ov) ov.classList.remove('active');
        },

        goStep(step) {
            this.currentStep = step;
            
            document.getElementById('p2p-step-1').style.display = 'none';
            document.getElementById('p2p-step-2').style.display = 'none';
            document.getElementById('p2p-step-3').style.display = 'none';

            document.getElementById(`p2p-step-${step}`).style.display = 'block';

            const indicators = [1, 2, 3];
            indicators.forEach(i => {
                const ind = document.getElementById(`p2p-step-ind-${i}`);
                if (ind) {
                    ind.className = 'p2p-step-indicator';
                    if (i < step) {
                        ind.classList.add('completed');
                        ind.innerHTML = '<i class="fa-solid fa-check"></i>';
                    } else if (i === step) {
                        ind.classList.add('active');
                        ind.innerHTML = i;
                    } else {
                        ind.innerHTML = i;
                    }
                }
            });

            const bar = document.getElementById('p2p-progress-bar');
            if (bar) {
                const percent = ((step - 1) / 2) * 100;
                bar.style.width = `${percent}%`;
            }

            if (step === 3) {
                this.startTimer(300); // 5 minutes timer
                this.startPolling();
            } else {
                this.stopTimer();
                this.stopPolling();
            }
        },

        startTimer(durationSeconds) {
            this.stopTimer();
            let remaining = durationSeconds;
            const timerEl = document.getElementById('p2p-timer');
            if (!timerEl) return;

            const format = (sec) => {
                const m = Math.floor(sec / 60);
                const s = sec % 60;
                return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            };

            timerEl.textContent = format(remaining);

            this.timerInterval = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(this.timerInterval);
                    timerEl.textContent = "00:00";
                    // ✅ Auto-confirm payment after 5 minutes
                    this.autoConfirmPayment();
                    return;
                }
                timerEl.textContent = format(remaining);
            }, 1000);
        },

        async autoConfirmPayment() {
            try {
                app.showNotification('Auto-confirming your payment...', 'info');
                const response = await fetch(getApiUrl(`/api/bookings/${this.currentBookingId}/auto-confirm`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    this.stopPolling();
                    this.close();
                    const itemName = document.getElementById('p2p-item-name')?.textContent || 'Your booking';
                    const amount = document.getElementById('p2p-total-amount')?.textContent || '';
                    app.showPaymentSuccess(
                        `IMXX-${String(this.currentBookingId).padStart(6, '0')}`,
                        'Booking Confirmed! 🎉',
                        'Your payment has been verified and your booking is confirmed.',
                        amount,
                        [
                            { icon: 'fa-solid fa-circle-check', text: 'Status: CONFIRMED' },
                            { icon: 'fa-solid fa-file-invoice-dollar', text: itemName }
                        ]
                    );
                    app.loadUserBookings();
                    app.renderAdmin();
                } else {
                    app.showNotification('Auto-confirmation failed. Please contact support.', 'warning');
                }
            } catch (err) {
                console.warn('Auto-confirm error:', err);
                app.showNotification('Verification is taking longer than expected. Please wait.', 'warning');
            }
        },

        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },

        handleFileChange(event) {
            if (event.target.files && event.target.files[0]) {
                this.handleFile(event.target.files[0]);
            }
        },

        handleFile(file) {
            if (file.size > 5 * 1024 * 1024) {
                app.showNotification('File must be under 5MB', 'warning');
                return;
            }
            this.selectedFile = file;
            const uploadText = document.getElementById('p2p-upload-text');
            if (uploadText) {
                uploadText.innerHTML = `<i class="fa-solid fa-file-circle-check" style="color:#10b981; margin-right:6px;"></i> Selected: <strong>${file.name}</strong>`;
            }
        },

        async uploadProof() {
            if (!this.selectedFile) {
                app.showNotification('Please select a payment confirmation screenshot to upload.', 'warning');
                return;
            }

            const utr = document.getElementById('p2p-utr-input')?.value.trim() || '';
            if (!utr) {
                app.showNotification('Please enter your UTR / transaction reference number.', 'warning');
                return;
            }

            const token = localStorage.getItem('nomad_token');
            const msg = document.getElementById('p2p-message-input')?.value || '';
            const formData = new FormData();
            formData.append('screenshot', this.selectedFile);
            formData.append('message', msg);
            formData.append('utr', utr);

            try {
                app.showNotification('Uploading screenshot proof...', 'info');
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const response = await fetch(getApiUrl(`/api/bookings/${this.currentBookingId}/upload-screenshot`), {
                    method: 'POST',
                    headers,
                    body: formData
                });
                const resData = await response.json();
                if (response.ok) {
                    this.currentScreenshotPath = resData.screenshotPath;
                    app.showNotification('Screenshot and UTR submitted successfully!', 'success');
                    this.goStep(3);

                    // Populate order ID in waiting screen
                    const orderEl = document.getElementById('p2p-order-id');
                    if (orderEl) orderEl.textContent = `IMXX-${String(this.currentBookingId).padStart(6, '0')}`;
                } else {
                    app.showNotification(resData.error || 'Failed to upload screenshot.', 'error');
                }
            } catch (err) {
                console.error("Upload failed:", err);
                app.showNotification('Connection error while uploading proof.', 'error');
            }
        },

        startPolling() {
            this.stopPolling();
            this.pollStatus();
            this.pollingInterval = setInterval(() => this.pollStatus(), 5000);
        },

        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },

        async pollStatus() {
            const token = localStorage.getItem('nomad_token');
            // Allow guests (no token) to poll status too
            try {
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const response = await fetch(getApiUrl(`/api/bookings/${this.currentBookingId}/status`), {
                    headers
                });
                if (response.ok) {
                    const resData = await response.json();
                    if (resData.status === 'SUCCESS' || resData.status === 'confirmed') {
                        this.stopPolling();
                        app.showNotification('Payment verified successfully! 🎉', 'success');
                        this.close();

                        app.showPaymentSuccess(
                            `IMXX-${String(this.currentBookingId).padStart(6, '0')}`, 
                            'Booking Confirmed!', 
                            'Your luxury stay is confirmed and payment is verified.', 
                            resData.totalPrice, 
                            [
                                {icon:'fa-solid fa-circle-check', text: 'Status: SUCCESS'},
                                {icon:'fa-solid fa-file-invoice-dollar', text: resData.itemName}
                            ]
                        );

                        app.loadUserBookings();
                        app.renderAdmin();
                    } else if (resData.status === 'REJECTED') {
                        this.stopPolling();
                        app.showNotification('Payment verification rejected by admin. Please contact support.', 'error');
                        this.close();
                    }
                }
            } catch (err) {
                console.warn("Polling error:", err);
            }
        },

        openWhatsApp() {
            const phoneNumber = "918340249563";
            const itemName = document.getElementById('p2p-item-name')?.textContent || 'booking';
            const amount = document.getElementById('p2p-total-amount')?.textContent || '';
            const orderId = `IMXX-${String(this.currentBookingId).padStart(6, '0')}`;
            const backendBase = getApiUrl('');
            const screenshotUrl = this.currentScreenshotPath ? `${backendBase}${this.currentScreenshotPath}` : '';
            const yesLink = `${backendBase}/api/bookings/${this.currentBookingId}/whatsapp-confirm?status=YES`;
            const noLink = `${backendBase}/api/bookings/${this.currentBookingId}/whatsapp-confirm?status=NO`;
            
            let waMessage = `⚠️ Manual Support Request!\n\nOrder ID: ${orderId}\nItem: ${itemName}\nAmount: ${amount}\n\nI am facing issues verifying my payment. Please assist.\n\n`;
            if (screenshotUrl) {
                waMessage += `🖼️ View Uploaded Screenshot:\n${screenshotUrl}\n\n`;
            }
            waMessage += `Confirm Payment?\n👉 Click to Approve (YES):\n${yesLink}\n\n👉 Click to Reject (NO):\n${noLink}`;
            
            const encodedText = encodeURIComponent(waMessage);
            const waUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
            window.open(waUrl, '_blank');
        }
    }
};

// ==========================================
// NATURE OPENING ANIMATION & PARTICLE ENGINE
// ==========================================
function initNatureLoader() {
    const loader = document.getElementById('nature-loader');
    const canvas = document.getElementById('nature-canvas');
    if (!loader || !canvas) return;

    let engine = null;

    // Utilize high-performance AntiGravityEngine if initialized
    if (typeof AntiGravityEngine !== 'undefined' && AntiGravityEngine.create) {
        engine = AntiGravityEngine.create(canvas, {
            particleCount: 65,
            antiGravityForce: 0.09,
            repulsionRadius: 180,
            repulsionStrength: 450,
            dragCoefficient: 0.985,
            enablePointerInteraction: true
        });
        engine.start();
    } else {
        // Fallback canvas setup with resize handler cleanup
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize, { passive: true });

        let animId = null;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            animId = requestAnimationFrame(animate);
        };
        animate();

        loader._fallbackCleanup = () => {
            window.removeEventListener('resize', handleResize);
            if (animId) cancelAnimationFrame(animId);
        };
    }

    // Progress bar animation (0% to 100%)
    let progress = 0;
    const bar = document.getElementById('nature-progress-bar');
    const text = document.getElementById('nature-progress-text');

    const compassIcon = document.getElementById('portal-compass-icon');

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            if (bar) bar.style.width = '100%';
            if (text) text.textContent = '100%';
            if (compassIcon) compassIcon.style.transform = 'rotate(360deg)';

            setTimeout(() => {
                loader.classList.add('fade-out');
                document.body.classList.add('app-loaded');
                setTimeout(() => {
                    if (engine) {
                        engine.destroy();
                    } else if (loader._fallbackCleanup) {
                        loader._fallbackCleanup();
                    }
                    loader.style.display = 'none';
                }, 300);
            }, 10);
        } else {
            if (bar) bar.style.width = progress + '%';
            if (text) text.textContent = progress + '%';
            if (compassIcon) compassIcon.style.transform = `rotate(${progress * 3.6}deg)`;
        }
    }, 16);
}

// ==========================================
// BOOT INITIALIZATION & KEYBOARD SHORTCUTS
// ==========================================
function bootApp() {
    window.app = app;
    window.Store = Store;

    try {
        if (typeof initNatureLoader === 'function') {
            initNatureLoader();
        }
    } catch (e) {
        console.warn("initNatureLoader exception:", e);
    }

    // Global Fast UX Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC key closes any open modal, drawer, or search dropdown
        if (e.key === 'Escape') {
            if (typeof app !== 'undefined' && typeof app.closeModals === 'function') {
                app.closeModals();
            }
            document.querySelectorAll('.side-panel.open').forEach(p => p.classList.remove('open'));
            document.querySelectorAll('.panel-overlay.active').forEach(o => o.classList.remove('active'));
            const searchDropdown = document.getElementById('search-dropdown');
            if (searchDropdown) searchDropdown.style.display = 'none';
        }
        
        // Ctrl+K / Cmd+K / Slash key focuses search bar instantly
        if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    // Pick a random image for the hero banner
    try {
        if (Store && Store.state && Array.isArray(Store.state.destinations) && Store.state.destinations.length > 0) {
            const randomDest = Store.state.destinations[Math.floor(Math.random() * Store.state.destinations.length)];
            const heroBannerImg = document.getElementById('main-hero-banner');
            if (heroBannerImg && randomDest && randomDest.img) {
                heroBannerImg.src = randomDest.img;
            }
        }
    } catch(e) {
        console.warn("Hero banner randomizer error:", e);
    }
    
    // Global Interactive Click Ripple Animation Engine
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.hotel-card, .dest-card, .food-item, .btn-premium, .add-btn, .quick-cat, #details-img-banner, .view-all, .nav-item');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

        if (window.getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }
        card.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    if (typeof app !== 'undefined' && typeof app.init === 'function') {
        app.init();
    } else if (window.app && typeof window.app.init === 'function') {
        window.app.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
} else {
    bootApp();
}
