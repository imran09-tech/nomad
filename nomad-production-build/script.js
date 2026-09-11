// ==========================================
// IMXX PREMIUM — COMPLETE FUNCTIONAL ENGINE v3.0
// ==========================================

// ==========================================
// STORE & DATA MANAGEMENT
const Store = {
    VERSION: 21,

    init() {
        const ver = parseInt(localStorage.getItem('imxx_version') || '0');
        if (ver < this.VERSION) {
            this.seedData();
            localStorage.setItem('imxx_version', this.VERSION);
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
            { id: 'd1',  name: "Dolomite Peaks",      location: "Italy",          rating: 5.0, price: 0.01, img: "../pic/mountain/m1.jpg",  desc: "Breathtaking alpine valleys with luxury chalets and world-class skiing.",       category: "mountains" },
            { id: 'd2',  name: "Banff Highland",       location: "Canada",         rating: 4.9, price: 0.01, img: "../pic/mountain/m2.jpg",  desc: "Crystal-clear turquoise lakes surrounded by snow-capped Rocky peaks.",          category: "mountains" },
            { id: 'd3',  name: "Matterhorn Vista",     location: "Switzerland",    rating: 4.9, price: 0.01, img: "../pic/mountain/m3.jpg",  desc: "Iconic alpine scenery with private ski chalets and gourmet fondue.",            category: "mountains" },
            { id: 'd4',  name: "Himalayan Retreat",    location: "Nepal",          rating: 4.8, price: 0.01, img: "../pic/mountain/m4.jpg",  desc: "Serene mountain sanctuary with panoramic Everest views.",                       category: "mountains" },
            { id: 'd5',  name: "Rockies Escape",       location: "USA",            rating: 4.7, price: 0.01, img: "../pic/mountain/m5.jpg",  desc: "Rugged wilderness with private cabins and helicopter tours.",                   category: "mountains" },
            { id: 'dm6',  name: "Snowy Summit",       location: "Alps",           rating: 4.8, price: 0.01, img: "../pic/mountain/m6.jpg",  desc: "Experience the pure mountain air at this majestic snowy summit.", category: "mountains" },
            { id: 'dm7',  name: "Glacier Peak",       location: "Andes",          rating: 4.9, price: 0.01, img: "../pic/mountain/m7.jpg",  desc: "Breathtaking views of ancient glaciers and rugged terrain.", category: "mountains" },
            { id: 'dm8',  name: "Highland Ridge",     location: "Scotland",       rating: 4.7, price: 0.01, img: "../pic/mountain/m8.jpg",  desc: "Rolling misty mountains and deep valleys for the perfect escape.", category: "mountains" },
            { id: 'dm9',  name: "Alpine Valley",      location: "Austria",        rating: 4.8, price: 0.01, img: "../pic/mountain/m9.jpg",  desc: "A lush valley surrounded by towering alpine peaks.", category: "mountains" },
            { id: 'dm10', name: "Rocky Ascent",       location: "Colorado, USA",  rating: 4.6, price: 0.01, img: "../pic/mountain/m10.jpg", desc: "Challenging trails leading to spectacular mountain lookouts.", category: "mountains" },
            { id: 'dm11', name: "Misty Mountain",     location: "New Zealand",    rating: 4.9, price: 0.01, img: "../pic/mountain/m11.jpg", desc: "Mysterious peaks wrapped in clouds, perfect for explorers.", category: "mountains" },
            { id: 'dm12', name: "Eagle's Nest",       location: "Germany",        rating: 4.8, price: 0.01, img: "../pic/mountain/m12.jpg", desc: "Perched high above the valley with unmatched panoramic views.", category: "mountains" },
            { id: 'dm13', name: "Sierra Nevada",      location: "Spain",          rating: 4.7, price: 0.01, img: "../pic/mountain/m13.jpg", desc: "Sun-drenched mountains offering unique trails and culture.", category: "mountains" },
            { id: 'dm14', name: "Mount Fuji View",    location: "Japan",          rating: 5.0, price: 0.01, img: "../pic/mountain/m14.jpg", desc: "Iconic volcanic mountain with serene surrounding lakes.", category: "mountains" },
            { id: 'dm15', name: "Andean Heights",     location: "Peru",           rating: 4.9, price: 0.01, img: "../pic/mountain/m15.jpg", desc: "High-altitude adventures among ancient ruins and peaks.", category: "mountains" },
            { id: 'dm16', name: "Carpathian Wild",    location: "Romania",        rating: 4.6, price: 0.01,  img: "../pic/mountain/m16.jpg", desc: "Untamed mountain wilderness rich in wildlife and legends.", category: "mountains" },
            { id: 'dm17', name: "Tatra Mountains",    location: "Slovakia",       rating: 4.8, price: 0.01, img: "../pic/mountain/m17.jpg", desc: "Dramatic rocky peaks and crystal clear mountain lakes.", category: "mountains" },
            { id: 'dm18', name: "Pyrenees Pass",      location: "France/Spain",   rating: 4.7, price: 0.01, img: "../pic/mountain/m18.jpg", desc: "A rugged natural border offering thrilling hikes and views.", category: "mountains" },
            { id: 'dm19', name: "Caucasus Summit",    location: "Georgia",        rating: 4.8, price: 0.01, img: "../pic/mountain/m19.jpg", desc: "Discover the hidden gems of these towering, majestic peaks.", category: "mountains" },
            { id: 'dm20', name: "Atlas Mountains",    location: "Morocco",        rating: 4.6, price: 0.01,  img: "../pic/mountain/m20.jpg", desc: "Stark and beautiful mountains rising from the desert landscape.", category: "mountains" },
            { id: 'dm21', name: "Southern Alps",      location: "New Zealand",    rating: 4.9, price: 0.01, img: "../pic/mountain/m21.jpg", desc: "Spectacular glaciated mountain ranges and deep fjords.", category: "mountains" },
            { id: 'dm22', name: "Drakensberg",        location: "South Africa",   rating: 4.7, price: 0.01, img: "../pic/mountain/m22.jpg", desc: "The 'Dragon Mountains' with dramatic basalt cliffs.", category: "mountains" },
            { id: 'dm23', name: "Tien Shan",          location: "Kyrgyzstan",     rating: 4.8, price: 0.01, img: "../pic/mountain/m23.jpg", desc: "The 'Celestial Mountains' offering pristine, remote wilderness.", category: "mountains" },
            { id: 'dm24', name: "Pamir Knot",         location: "Tajikistan",     rating: 4.7, price: 0.01, img: "../pic/mountain/m24.jpg", desc: "The 'Roof of the World' with towering snow-clad peaks.", category: "mountains" },
            { id: 'dm25', name: "Altai Mountains",    location: "Russia/Mongolia",rating: 4.6, price: 0.01, img: "../pic/mountain/m25.jpg", desc: "Golden mountains with a rich nomadic heritage and untouched nature.", category: "mountains" },
            { id: 'dm26', name: "Mount Kilimanjaro",  location: "Tanzania",       rating: 5.0, price: 0.01, img: "../pic/mountain/m26.jpg", desc: "The roof of Africa, an iconic solitary volcanic peak.", category: "mountains" },
            { id: 'dm27', name: "Mount Kenya",        location: "Kenya",          rating: 4.8, price: 0.01, img: "../pic/mountain/m27.jpg", desc: "Rugged glacier-clad summits right on the equator.", category: "mountains" },
            { id: 'dm28', name: "Rwenzori Mountains", location: "Uganda",         rating: 4.7, price: 0.01, img: "../pic/mountain/m28.jpg", desc: "The mystical 'Mountains of the Moon' with unique flora.", category: "mountains" },
            { id: 'dm29', name: "Simien Mountains",   location: "Ethiopia",       rating: 4.8, price: 0.01, img: "../pic/mountain/m29.jpg", desc: "Dramatic escarpments and deep valleys with rare wildlife.", category: "mountains" },
            { id: 'dm30', name: "Appalachian Trail",  location: "USA",            rating: 4.6, price: 0.01,  img: "../pic/mountain/m30.jpg", desc: "Ancient rolling mountains covered in lush temperate forests.", category: "mountains" },
            { id: 'dm31', name: "White Mountains",    location: "New Hampshire",  rating: 4.7, price: 0.01,  img: "../pic/mountain/m31.jpg", desc: "Rugged granite peaks known for challenging weather and hikes.", category: "mountains" },
            { id: 'dm32', name: "Grand Teton",        location: "Wyoming, USA",   rating: 4.9, price: 0.01, img: "../pic/mountain/m32.jpg", desc: "Jagged peaks rising abruptly from the valley floor.", category: "mountains" },
            { id: 'dm33', name: "Glacier National",   location: "Montana, USA",   rating: 4.9, price: 0.01, img: "../pic/mountain/m33.jpg", desc: "Carved valleys and pristine alpine lakes in the Rockies.", category: "mountains" },
            { id: 'dm34', name: "Mount Rainier",      location: "Washington, USA",rating: 4.8, price: 0.01, img: "../pic/mountain/m34.jpg", desc: "An iconic stratovolcano with massive glaciers and wildflower meadows.", category: "mountains" },
            { id: 'dm35', name: "Denali Peak",        location: "Alaska, USA",    rating: 5.0, price: 0.01, img: "../pic/mountain/m35.jpg", desc: "The highest peak in North America, a true wilderness challenge.", category: "mountains" },
            { id: 'dm36', name: "Mount Logan",        location: "Yukon, Canada",  rating: 4.8, price: 0.01, img: "../pic/mountain/m36.jpg", desc: "Massive glaciated peak in the remote St. Elias Mountains.", category: "mountains" },
            { id: 'dm37', name: "Aconcagua",          location: "Argentina",      rating: 4.9, price: 0.01, img: "../pic/mountain/m37.jpg", desc: "The highest mountain outside of Asia, a mountaineer's dream.", category: "mountains" },
            { id: 'dm38', name: "Fitz Roy",           location: "Patagonia",      rating: 4.9, price: 0.01, img: "../pic/mountain/m38.jpg", desc: "Iconic granite spires rising above glacial lakes.", category: "mountains" },
            { id: 'dm39', name: "Torres del Paine",   location: "Chile",          rating: 5.0, price: 0.01, img: "../pic/mountain/m39.jpg", desc: "Spectacular horn-shaped peaks and vivid blue icebergs.", category: "mountains" },
            { id: 'dm40', name: "Mount Vinson",       location: "Antarctica",     rating: 4.8, price: 0.01, img: "../pic/mountain/m40.jpg", desc: "The ultimate remote peak in the frozen continent.", category: "mountains" },
            { id: 'dm41', name: "Mount Cook",         location: "New Zealand",    rating: 4.9, price: 0.01, img: "../pic/mountain/m41.jpg", desc: "Aoraki, the highest mountain in New Zealand, surrounded by glaciers.", category: "mountains" },
            { id: 'dm42', name: "Mount Kinabalu",     location: "Malaysia",       rating: 4.7, price: 0.01, img: "../pic/mountain/m42.jpg", desc: "A towering granite peak rising above lush tropical rainforest.", category: "mountains" },
            { id: 'dm43', name: "Puncak Jaya",        location: "Indonesia",      rating: 4.8, price: 0.01, img: "../pic/mountain/m43.jpg", desc: "The highest island peak in the world, surrounded by jungle.", category: "mountains" },
            { id: 'dm44', name: "Mount Elbrus",       location: "Russia",         rating: 4.8, price: 0.01, img: "../pic/mountain/m44.jpg", desc: "The highest peak in Europe, a dormant twin-peaked volcano.", category: "mountains" },
            { id: 'dm45', name: "Mont Blanc",         location: "France/Italy",   rating: 4.9, price: 0.01, img: "../pic/mountain/m45.jpg", desc: "The majestic white mountain, the highest in the Alps.", category: "mountains" },
            { id: 'dm46', name: "K2 Base Camp",       location: "Pakistan",       rating: 5.0, price: 0.01, img: "../pic/mountain/m46.jpg", desc: "Trek to the base of the savage mountain, the second highest on Earth.", category: "mountains" },

            { id: 'd6',  name: "Zakynthos Blue",       location: "Greece",         rating: 5.0, price: 0.01, img: "../pic/sea/s1.jpg",       desc: "Iconic blue lagoons and secret sea caves in the Ionian islands.",              category: "beaches" },
            { id: 'ds2',  name: "Coral Cove",          location: "Fiji",           rating: 4.8, price: 0.01, img: "../pic/sea/s2.png",       desc: "Spectacular coral reefs accessible right from your beach villa.", category: "beaches" },
            { id: 'd7',  name: "Bora Bora Lagoon",     location: "French Polynesia", rating: 5.0, price: 0.01, img: "../pic/sea/s3.jpg",     desc: "Overwater bungalows floating above the world's clearest lagoons.",             category: "beaches" },
            { id: 'd8',  name: "Maldive Atoll",        location: "Maldives",       rating: 4.9, price: 0.01, img: "../pic/sea/s4.jpg",       desc: "Private atolls with coral reefs, butler service, and sunset cruises.",         category: "beaches" },
            { id: 'd9',  name: "Phuket Sands",         location: "Thailand",       rating: 4.7, price: 0.01,  img: "../pic/sea/s5.jpg",       desc: "Pristine white sands with cliffside infinity pools.",                          category: "beaches" },
            { id: 'd10', name: "Amalfi Cliffs",        location: "Italy",          rating: 4.8, price: 0.01, img: "../pic/sea/s6.jpg",       desc: "Dramatic coastal cliffs with lemon groves and private villas.",                category: "beaches" },
            { id: 'ds7',  name: "Azure Bay",           location: "Bahamas",        rating: 4.7, price: 0.01, img: "../pic/sea/s7.jpg",       desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds8',  name: "Golden Sands",        location: "Seychelles",     rating: 4.9, price: 0.01, img: "../pic/sea/s8.jpg",       desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds9',  name: "Sunset Haven",        location: "Hawaii",         rating: 4.8, price: 0.01, img: "../pic/sea/s9.jpg",       desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds10', name: "Tropical Escape",     location: "Mauritius",      rating: 4.7, price: 0.01, img: "../pic/sea/s10.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds11', name: "Island Retreat",      location: "Caribbean",      rating: 4.8, price: 0.01, img: "../pic/sea/s11.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds12', name: "Ocean Breeze",        location: "Palau",          rating: 4.9, price: 0.01, img: "../pic/sea/s12.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds13', name: "Palm Coast",          location: "Bermuda",        rating: 4.6, price: 0.01, img: "../pic/sea/s13.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds14', name: "Crystal Waters",      location: "Tahiti",         rating: 4.9, price: 0.01, img: "../pic/sea/s14.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds15', name: "Serene Shores",       location: "Barbados",       rating: 4.7, price: 0.01, img: "../pic/sea/s15.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds16', name: "Sapphire Sea",        location: "Cook Islands",   rating: 4.8, price: 0.01, img: "../pic/sea/s16.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds17', name: "Hidden Cove",         location: "Jamaica",        rating: 4.6, price: 0.01, img: "../pic/sea/s17.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds18', name: "Breezy Point",        location: "Aruba",          rating: 4.8, price: 0.01, img: "../pic/sea/s18.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds19', name: "White Sands",         location: "Turks and Caicos",rating: 4.9, price: 0.01, img: "../pic/sea/s19.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds20', name: "Pearl Beach",         location: "St. Lucia",      rating: 4.7, price: 0.01, img: "../pic/sea/s20.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds21', name: "Emerald Isle",        location: "Fiji",           rating: 4.8, price: 0.01, img: "../pic/sea/s21.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds22', name: "Paradise Bay",        location: "Antigua",        rating: 4.9, price: 0.01, img: "../pic/sea/s22.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds23', name: "Sunny Horizon",       location: "Cayman Islands", rating: 4.7, price: 0.01, img: "../pic/sea/s23.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds24', name: "Tropic Haven",        location: "Belize",         rating: 4.8, price: 0.01, img: "../pic/sea/s24.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds25', name: "Coastal Charm",       location: "Costa Rica",     rating: 4.6, price: 0.01, img: "../pic/sea/s25.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds26', name: "Island Bliss",        location: "Dominican Rep.", rating: 4.7, price: 0.01, img: "../pic/sea/s26.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds27', name: "Sandy Solitude",      location: "Grenada",        rating: 4.8, price: 0.01, img: "../pic/sea/s27.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds28', name: "Aqua Marine",         location: "Martinique",     rating: 4.9, price: 0.01, img: "../pic/sea/s28.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds29', name: "Blue Lagoon",         location: "Guadeloupe",     rating: 4.7, price: 0.01, img: "../pic/sea/s29.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds30', name: "Seaside Serenity",    location: "St. Vincent",    rating: 4.8, price: 0.01, img: "../pic/sea/s30.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds31', name: "Oceanic Splendor",    location: "St. Kitts",      rating: 4.6, price: 0.01, img: "../pic/sea/s31.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds32', name: "Reef Rest",           location: "Anguilla",       rating: 4.9, price: 0.01, img: "../pic/sea/s32.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds33', name: "Coastal Dream",       location: "St. Barts",      rating: 5.0, price: 0.01, img: "../pic/sea/s33.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds34', name: "Waves Edge",          location: "BVI",            rating: 4.8, price: 0.01, img: "../pic/sea/s34.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds35', name: "Saltwater Springs",   location: "USVI",           rating: 4.7, price: 0.01, img: "../pic/sea/s35.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds36', name: "Tropical Oasis",      location: "Curaçao",        rating: 4.8, price: 0.01, img: "../pic/sea/s36.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds37', name: "Island Pearl",        location: "Bonaire",        rating: 4.6, price: 0.01, img: "../pic/sea/s37.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds38', name: "Sunset Beach",        location: "Sint Maarten",   rating: 4.7, price: 0.01, img: "../pic/sea/s38.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds39', name: "Coral Reef Bay",      location: "San Blas",       rating: 4.9, price: 0.01, img: "../pic/sea/s39.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds40', name: "Azure Waters",        location: "Roatán",         rating: 4.8, price: 0.01, img: "../pic/sea/s40.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds41', name: "Golden Sunrise",      location: "Corn Islands",   rating: 4.7, price: 0.01, img: "../pic/sea/s41.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds42', name: "Crystal Cove",        location: "Isla Mujeres",   rating: 4.8, price: 0.01, img: "../pic/sea/s42.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds43', name: "Sandy Shores",        location: "Cozumel",        rating: 4.9, price: 0.01, img: "../pic/sea/s43.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds45', name: "Palm Tree Hideout",   location: "Tulum",          rating: 4.8, price: 0.01, img: "../pic/sea/s45.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds46', name: "Mermaid's Tale",      location: "Los Cabos",      rating: 4.7, price: 0.01, img: "../pic/sea/s46.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds47', name: "Ocean Whisper",       location: "Puerto Vallarta",rating: 4.8, price: 0.01, img: "../pic/sea/s47.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds48', name: "Tidal Waves",         location: "Sayulita",       rating: 4.6, price: 0.01, img: "../pic/sea/s48.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds49', name: "Sea Breeze",          location: "Mazatlán",       rating: 4.7, price: 0.01, img: "../pic/sea/s49.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds50', name: "Pristine Sands",      location: "Acapulco",       rating: 4.8, price: 0.01, img: "../pic/sea/s50.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds51', name: "Tropical Paradise",   location: "Zihuatanejo",    rating: 4.9, price: 0.01, img: "../pic/sea/s51.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds52', name: "Sunny Outlook",       location: "Huatulco",       rating: 4.7, price: 0.01, img: "../pic/sea/s52.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds53', name: "Aqua Bay",            location: "Cancún",         rating: 4.8, price: 0.01, img: "../pic/sea/s53.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds54', name: "Reef Discovery",      location: "Playa del Carmen",rating: 4.9, price: 0.01, img: "../pic/sea/s54.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds55', name: "Island Hop",          location: "Holbox",         rating: 4.8, price: 0.01, img: "../pic/sea/s55.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds56', name: "Secluded Shore",      location: "Bacalar",        rating: 4.7, price: 0.01, img: "../pic/sea/s56.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds57', name: "Tropic Delight",      location: "Mahahual",       rating: 4.6, price: 0.01, img: "../pic/sea/s57.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds58', name: "Breezy Bay",          location: "Punta Cana",     rating: 4.8, price: 0.01, img: "../pic/sea/s58.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds59', name: "Sandy Peak",          location: "Bávaro",         rating: 4.9, price: 0.01, img: "../pic/sea/s59.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds60', name: "Ocean Frontier",      location: "Cap Cana",       rating: 5.0, price: 0.01, img: "../pic/sea/s60.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds61', name: "Coastal Treasure",    location: "Samaná",         rating: 4.8, price: 0.01, img: "../pic/sea/s61.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },
            { id: 'ds62', name: "Secret Beach",        location: "Las Terrenas",   rating: 4.7, price: 0.01, img: "../pic/sea/s62.jpg",      desc: "Relax on pristine white sand beaches and swim in crystal clear waters.", category: "beaches" },

            { id: 'd11', name: "Amazon Reserve",       location: "Brazil",         rating: 4.6, price: 0.01,  img: "../pic/nature/n1.jpg",    desc: "Deep jungle luxury eco-lodges with private naturalist guides.",                category: "nature" },
            { id: 'd12', name: "Bali Ubud Jungle",     location: "Indonesia",      rating: 4.8, price: 0.01, img: "../pic/nature/n2.jpg",    desc: "Lush terraced rice fields, sacred temples, and volcanic hot springs.",         category: "nature" },
            { id: 'd13', name: "Serengeti Safari",     location: "Tanzania",       rating: 4.9, price: 0.01, img: "../pic/nature/n3.jpg",    desc: "Witness the Great Migration from your private luxury tented camp.",            category: "nature" },
            { id: 'd14', name: "Patagonia Wild",       location: "Argentina",      rating: 4.7, price: 0.01, img: "../pic/nature/n4.jpg",    desc: "Pristine wilderness at the end of the earth, Torres del Paine peaks.",        category: "nature" },
            { id: 'dn1', name: "Mystic Valley",        location: "New Zealand",     rating: 4.9, price: 0.01, img: "../pic/nature/f1.jpg",    desc: "Fog-shrouded valleys with ancient ferns and private eco-lodges.",              category: "nature" },
            { id: 'dn2', name: "Cloud Forest Trails",  location: "Ecuador",         rating: 4.8, price: 0.01, img: "../pic/nature/f2.jpg",    desc: "Hike through cloud-draped forest trails with rare orchids and wildlife.",      category: "nature" },
            { id: 'dn3', name: "Misty Highlands",      location: "Scotland",        rating: 4.7, price: 0.01, img: "../pic/nature/f4.jpg",    desc: "Rolling heather moorlands, dramatic glens, and ancient castle ruins.",         category: "nature" },
            { id: 'dn4', name: "Canyon Wilderness",    location: "USA",             rating: 4.8, price: 0.01, img: "../pic/nature/f5.jpg",    desc: "Vast red rock canyons with luxury glamping under the stars.",                  category: "nature" },
            { id: 'dn5', name: "Emerald Rainforest",   location: "Brazil",          rating: 4.9, price: 0.01,  img: "../pic/nature/f6.jpg",    desc: "Immerse in the emerald expanse of the world's greatest tropical rainforest.",  category: "nature" },
            { id: 'dn6', name: "Volcanic Peaks",       location: "Iceland",         rating: 5.0, price: 0.01, img: "../pic/nature/f7.jpg",    desc: "Dramatic volcanic landscapes with private hot springs and aurora views.",       category: "nature" },
            { id: 'dn7', name: "Alpine Meadows",       location: "Austria",         rating: 4.7, price: 0.01, img: "../pic/nature/f9.jpg",    desc: "Wildflower-filled alpine meadows with panoramic mountain lodge stays.",        category: "nature" },
            { id: 'dn8', name: "Jungle Canopy Lodge",  location: "Costa Rica",      rating: 4.8, price: 0.01, img: "../pic/nature/f10.jpg",   desc: "Luxury treehouse lodges above a vibrant tropical jungle canopy.",               category: "nature" },
            { id: 'dn9', name: "Ancient Woodland",     location: "Germany",         rating: 4.6, price: 0.01,  img: "../pic/nature/f11.jpg",   desc: "Centuries-old forest with private cabin retreats and deer trails.",             category: "nature" },
            { id: 'dn10',name: "Bamboo Sanctuary",     location: "China",           rating: 4.9, price: 0.01, img: "../pic/nature/f12.jpg",   desc: "Tranquil bamboo groves with mindfulness retreats and zen gardens.",             category: "nature" },
            { id: 'dn11',name: "Sacred Forest",        location: "Japan",           rating: 5.0, price: 0.01, img: "../pic/nature/f13.jpg",   desc: "Ancient cedar forests shrouding sacred Shinto shrines and meditation trails.", category: "nature" },
            { id: 'dn12',name: "Fjord Wilderness",     location: "Norway",          rating: 4.9, price: 0.01, img: "../pic/nature/f14.jpg",   desc: "Dramatic fjord scenery with private kayaking and cliff-edge lodges.",           category: "nature" },
            { id: 'dn13',name: "Desert Oasis",         location: "Namibia",         rating: 4.8, price: 0.01, img: "../pic/nature/f16.jpg",   desc: "Private oasis retreat amidst sweeping red sand dunes at sunset.",              category: "nature" },
            { id: 'dn14',name: "Wetland Paradise",     location: "Botswana",        rating: 4.7, price: 0.01, img: "../pic/nature/f17.jpg",   desc: "Float through the Okavango Delta in a private mokoro among wild elephants.",   category: "nature" },
            { id: 'dn15',name: "Glacier Retreat",      location: "Alaska, USA",     rating: 4.9, price: 0.01, img: "../pic/nature/f18.jpg",   desc: "Watch calving glaciers from your private blue-ice cabin at the edge of the world.", category: "nature" },
            { id: 'dn16',name: "Autumn Forest Lodge",  location: "Canada",          rating: 4.8, price: 0.01, img: "../pic/nature/f19.jpg",   desc: "Blaze of golden maple forests surrounding luxury lakeside log cabins.",         category: "nature" },
            { id: 'dn17',name: "Savanna Sunrise",      location: "Kenya",           rating: 5.0, price: 0.01, img: "../pic/nature/f20.jpg",   desc: "Wake to golden savanna sunrises in a luxury mobile camp in the Masai Mara.",   category: "nature" },
            { id: 'dn18',name: "Tropical River Lodge", location: "Thailand",        rating: 4.7, price: 0.01, img: "../pic/nature/f21.jpg",   desc: "Stilted river lodge immersed in lush jungle with private pool villas.",         category: "nature" },

            { id: 'df1', name: "Redwood Canopy",       location: "California, USA", rating: 4.9, price: 0.01, img: "../pic/nature/forest1.png", desc: "Experience luxury treehouse stays nestled among ancient towering redwoods.", category: "nature-forest" },
            { id: 'df2', name: "Kyoto Bamboo Paths",   location: "Japan",           rating: 5.0, price: 0.01, img: "../pic/nature/forest2.png", desc: "Wander the mystical pathways of the historic Arashiyama bamboo forest.",   category: "nature-forest" },
            { id: 'df3', name: "Black Forest Hideaway", location: "Germany",         rating: 4.8, price: 0.01, img: "../pic/nature/forest3.png", desc: "Cozy chalets hidden deep in the foggy whispering pines of the Black Forest.",category: "nature-forest" },
            { id: 'df4', name: "Costa Rica Rainforest",location: "Costa Rica",      rating: 4.9, price: 0.01, img: "../pic/nature/forest4.png", desc: "Luxury eco-resort surrounded by waterfalls, exotic fauna, and thick canopy.",category: "nature-forest" },

            { id: 'd15', name: "Mars Olympus Base",    location: "Mars",           rating: 4.9, price: 0.01, img: "../pic/planets/p1.jpg", desc: "Experience 1/3rd gravity in pressurised luxury domes at Olympus Mons.",       category: "planets" },
            { id: 'd16', name: "Lunar Gateway",        location: "Moon",           rating: 4.7, price: 0.01, img: "../pic/planets/p2.jpg", desc: "Earthrise views from your private lunar suite at Tycho Crater.",              category: "planets" },
            { id: 'd17', name: "ISS Penthouse",        location: "Low Earth Orbit", rating: 5.0, price: 0.01, img: "../pic/planets/p3.png", desc: "16 sunrises per day from the most exclusive address in the universe.",       category: "planets" },
            { id: 'd18', name: "Europa Ocean",         location: "Jupiter Moon",   rating: 4.8, price: 0.01, img: "../pic/planets/p4.jpg", desc: "Submarine luxury exploring potential life beneath the icy surface.",           category: "planets" },

            { id: 'dd1',  name: "Kyoto Zen Temple",        location: "Japan",           rating: 5.0, price: 0.01,    img: "../pic/destination/d1.png",  desc: "Experience the serene beauty of traditional Japanese pagodas surrounded by vibrant spring cherry blossoms.", category: "destinations" },
            { id: 'dd2',  name: "St. Stephen's Cathedral", location: "Austria",         rating: 4.9, price: 0.01,    img: "../pic/destination/d2.png",  desc: "Discover the stunning Gothic architecture and colorful tiled roofs in the heart of historic Vienna.", category: "destinations" },
            { id: 'dd3',  name: "Sydney Harbour",          location: "Australia",       rating: 4.8, price: 0.01,    img: "../pic/destination/d3.png",  desc: "Take in the breathtaking sunset views of the iconic Opera House and Sydney Harbour Bridge.", category: "destinations" },
            { id: 'dd4',  name: "The Colosseum",           location: "Italy",           rating: 4.7, price: 0.01,    img: "../pic/destination/d4.png",  desc: "Step back in time at this ancient Roman amphitheater glowing beautifully in the sunset light.", category: "destinations" },
            { id: 'dd5',  name: "Hyangwonjeong Pavilion",  location: "South Korea",     rating: 5.0, price: 0.01,    img: "../pic/destination/d5.png",  desc: "Relax by the tranquil lake reflecting traditional architecture with the N Seoul Tower in the distance.", category: "destinations" },
            { id: 'dd6',  name: "Dubai Skyline",           location: "UAE",             rating: 4.8, price: 0.01,    img: "../pic/destination/d6.png",  desc: "Marvel at the futuristic cityscape and the towering Burj Khalifa rising above the sparkling marina.", category: "destinations" },
            { id: 'dd7',  name: "Amalfi Riviera",          location: "Italy",           rating: 4.9, price: 0.01, img: "../pic/destination/d7.png",  desc: "Colourful clifftop villages cascading down to the cobalt Tyrrhenian Sea.",  category: "destinations" },
            { id: 'dd8',  name: "Maldives Pearl",          location: "Maldives",        rating: 5.0, price: 0.01, img: "../pic/destination/d8.png",  desc: "Private-island overwater villas on a pristine turquoise lagoon.",            category: "destinations" },
            { id: 'dd9',  name: "Bali Spirit",             location: "Indonesia",       rating: 4.7, price: 0.01, img: "../pic/destination/d9.png",  desc: "Sacred temples, terraced rice paddies, and world-class wellness retreats.", category: "destinations" },
            { id: 'dd10', name: "Great Barrier Reef",      location: "Australia",       rating: 4.8, price: 0.01, img: "../pic/destination/d10.png", desc: "Explore the world's largest coral reef system, home to diverse marine life and pristine islands.", category: "destinations" },
            { id: 'dd11', name: "Marrakech Medina",    location: "Morocco",         rating: 4.6, price: 0.01,  img: "../pic/destination/d11.png", desc: "Labyrinthine souks, rooftop riads, and fragrant spice gardens.",            category: "destinations" },
            { id: 'dd12', name: "Cappadocia Skies",    location: "Turkey",          rating: 4.9, price: 0.01, img: "../pic/destination/d12.png", desc: "Hot-air balloon flights over a surreal volcanic landscape at dawn.",         category: "destinations" },
            { id: 'dd13', name: "Prague Castle",       location: "Czech Republic",  rating: 4.7, price: 0.01, img: "../pic/destination/d13.png", desc: "Gothic spires, baroque palaces, and cobblestone lanes in bohemian grandeur.", category: "destinations" },
            { id: 'dd14', name: "Rio Carnival",        location: "Brazil",          rating: 4.8, price: 0.01, img: "../pic/destination/d14.png", desc: "Samba, Carnival, Christ the Redeemer, and sugar-loaf sunsets.",             category: "destinations" },
            { id: 'dd15', name: "Cape Town Radiance",  location: "South Africa",    rating: 4.9, price: 0.01, img: "../pic/destination/d15.png", desc: "Table Mountain, penguin beaches, and world-class winelands.",               category: "destinations" },
            { id: 'dd16', name: "Amsterdam Canals",    location: "Netherlands",     rating: 4.7, price: 0.01, img: "../pic/destination/d16.png", desc: "Golden-age architecture reflected in centuries-old canal waterways.",        category: "destinations" },
            { id: 'dd17', name: "Singapore Glow",      location: "Singapore",       rating: 4.9, price: 0.01, img: "../pic/destination/d17.png", desc: "Gardens by the Bay, infinity sky pools, and extraordinary street food.",    category: "destinations" },
            { id: 'dd18', name: "Tuscany Vineyards",   location: "Italy",           rating: 5.0, price: 0.01, img: "../pic/destination/d18.png", desc: "Rolling cypress hills, private villas, and legendary Brunello wines.",       category: "destinations" },
            { id: 'dd19', name: "Queenstown Peak",     location: "New Zealand",     rating: 4.8, price: 0.01, img: "../pic/destination/d19.png", desc: "Adrenaline capital of the world with fjord-side luxury lodges.",             category: "destinations" },
            { id: 'dd20', name: "Havana Rhythm",       location: "Cuba",            rating: 4.6, price: 0.01,  img: "../pic/destination/d20.png", desc: "Vintage cars, salsa beats, and colonial architecture by the Caribbean.",     category: "destinations" },
            { id: 'dd21', name: "Petra by Night",      location: "Jordan",          rating: 4.9, price: 0.01, img: "../pic/destination/d21.png", desc: "Rose-red rock city of the Nabataeans, lit by a thousand candles at dusk.",  category: "destinations" },
            { id: 'dd22', name: "Reykjavik Aurora",    location: "Iceland",         rating: 5.0, price: 0.01, img: "../pic/destination/d22.png", desc: "Northern Lights, geothermal spas, and midnight sun adventures.",            category: "destinations" },
            { id: 'dd23', name: "Kyoto Arashiyama",    location: "Japan",           rating: 4.8, price: 0.01, img: "../pic/destination/d23.jpg", desc: "Bamboo groves, monkey parks, and peaceful boat rides on the Oi River.",     category: "destinations" },
            { id: 'dd24', name: "Vienna Opera",        location: "Austria",         rating: 4.7, price: 0.01, img: "../pic/destination/d24.jpg", desc: "Imperial palaces, Viennese coffee culture, and world-famous opera houses.", category: "destinations" },
            { id: 'dd25', name: "Sahara Starcamp",     location: "Morocco",         rating: 4.9, price: 0.01, img: "../pic/destination/d25.jpg", desc: "Luxury desert camps beneath a billion stars in the great Sahara.",          category: "destinations" },
            { id: 'dd26', name: "Galapagos Wild",      location: "Ecuador",         rating: 5.0, price: 0.01, img: "../pic/destination/d26.jpg", desc: "Encounter giant tortoises, marine iguanas, and blue-footed boobies.",        category: "destinations" },
            { id: 'dd27', name: "Lisbon Fado",         location: "Portugal",        rating: 4.6, price: 0.01,  img: "../pic/destination/d27.jpg", desc: "Tram rides, azulejo tiles, and soulful fado music over Atlantic views.",    category: "destinations" },
            { id: 'dd28', name: "Bangkok Grand",       location: "Thailand",        rating: 4.7, price: 0.01, img: "../pic/destination/d28.jpg", desc: "Grand Palace, floating markets, and rooftop bars above the Chao Phraya.",  category: "destinations" },
            { id: 'dd29', name: "Positano Dream",      location: "Italy",           rating: 4.9, price: 0.01, img: "../pic/destination/d29.jpg", desc: "Pastel-coloured houses draped over cliffs above the Amalfi Coast.",         category: "destinations" },
            { id: 'dd30', name: "Bruges Fairytale",    location: "Belgium",         rating: 4.7, price: 0.01, img: "../pic/destination/d30.jpg", desc: "Medieval canals, Belgian chocolate, and horse-drawn carriage rides.",        category: "destinations" },
            { id: 'dd31', name: "Zanzibar Spice",      location: "Tanzania",        rating: 4.8, price: 0.01, img: "../pic/destination/d31.jpg", desc: "White-sand beaches, Stone Town spice markets, and turquoise reef dives.",  category: "destinations" },
            { id: 'dd32', name: "Bruges Canal",        location: "Belgium",         rating: 4.6, price: 0.01, img: "../pic/destination/d32.jpg", desc: "Lace-making heritage, belfry towers, and craft beer in a living museum.",   category: "destinations" },
            { id: 'dd33', name: "Phuket Horizon",      location: "Thailand",        rating: 4.7, price: 0.01, img: "../pic/destination/d33.jpg", desc: "Clifftop infinity pools, emerald sea kayaking, and vibrant night bazaars.", category: "destinations" },
            { id: 'dd34', name: "Montreal Winter",     location: "Canada",          rating: 4.6, price: 0.01, img: "../pic/destination/d34.jpg", desc: "Underground city, jazz festivals, and world-class French-Canadian cuisine.", category: "destinations" },
            { id: 'dd35', name: "Oman Desert Rose",    location: "Oman",            rating: 4.8, price: 0.01, img: "../pic/destination/d35.jpg", desc: "Wadis, forts, and luxury desert resorts beneath the Arabian stars.",         category: "destinations" },
            { id: 'dd36', name: "Cartagena Gold",      location: "Colombia",        rating: 4.7, price: 0.01,  img: "../pic/destination/d36.jpg", desc: "Walled old city, Caribbean beaches, and Colombia's best seafood.",          category: "destinations" },
            { id: 'dd37', name: "Maldives Overwater",  location: "Maldives",        rating: 5.0, price: 0.01, img: "../pic/destination/d37.jpg", desc: "Ultimate seclusion in glass-floor overwater bungalows above the reef.",     category: "destinations" },
            { id: 'dd38', name: "Lake Como Villa",     location: "Italy",           rating: 4.9, price: 0.01, img: "../pic/destination/d38.jpg", desc: "Belle époque villas, celebrity retreats, and Alpine lake tranquility.",     category: "destinations" },
            { id: 'dd39', name: "Edinburgh Castle",    location: "Scotland",        rating: 4.7, price: 0.01, img: "../pic/destination/d39.jpg", desc: "Volcanic rock fortress, whisky distilleries, and Highland wilderness.",     category: "destinations" },
            { id: 'dd40', name: "Fiji Islands",        location: "Fiji",            rating: 5.0, price: 0.01, img: "../pic/destination/d40.jpg", desc: "333 tropical islands with private resorts, reefs, and Fijian hospitality.", category: "destinations" },
            { id: 'dd41', name: "Athens Acropolis",    location: "Greece",          rating: 4.8, price: 0.01, img: "../pic/destination/d41.jpg", desc: "Birthplace of democracy, ancient agora walks, and sunset from the Parthenon.", category: "destinations" },
            { id: 'dd42', name: "Alaska Wilderness",   location: "USA",             rating: 4.9, price: 0.01, img: "../pic/destination/d42.jpg", desc: "Glaciers, grizzly bears, and the Northern Lights from a private lodge.",    category: "destinations" },
            { id: 'dd43', name: "Bora Bora Escape",    location: "French Polynesia",rating: 5.0, price: 0.01, img: "../pic/destination/d43.jpg", desc: "Turquoise lagoon, coral gardens, and the most romantic island on Earth.",   category: "destinations" },
            { id: 'dd44', name: "Nairobi Safari Gate", location: "Kenya",           rating: 4.8, price: 0.01, img: "../pic/destination/d44.jpg", desc: "Big Five safari from luxury tented camps in the Masai Mara.",               category: "destinations" },
            { id: 'dd45', name: "Cinque Terre Light",  location: "Italy",           rating: 4.9, price: 0.01, img: "../pic/destination/d45.jpg", desc: "Five coastal villages linked by cliff trails and crystal Ligurian waters.", category: "destinations" },
        ];

        const hots = [
            { id: 'h1',  name: "Atlantis The Royal",    location: "Dubai, UAE",        rating: 4.9, price: 0.01, img: "../pic/hotel/h1.jpg",  amenities: ['fa-spa','fa-martini-glass','fa-water','fa-wifi'],        desc: "The pinnacle of ultra-luxury in Dubai — private pools, exclusive restaurants, and aquaventure access." },
            { id: 'h2',  name: "Four Seasons Maldives", location: "Maldives",          rating: 5.0, price: 0.01, img: "../pic/hotel/h2.jpg",  amenities: ['fa-plane','fa-water','fa-wifi','fa-fish'],               desc: "Overwater bungalows with glass floors and private infinity pools above the reef." },
            { id: 'h3',  name: "Aman Tokyo",            location: "Tokyo, Japan",      rating: 4.8, price: 0.01, img: "../pic/hotel/h3.jpg",  amenities: ['fa-city','fa-spa','fa-dumbbell','fa-wifi'],              desc: "A serene sanctuary on the 33rd floor with panoramic city views and Japanese wellness rituals." },
            { id: 'h4',  name: "The Plaza",             location: "New York, USA",     rating: 4.7, price: 0.01, img: "../pic/hotel/h4.png",  amenities: ['fa-city','fa-martini-glass','fa-wifi','fa-concierge-bell'], desc: "Iconic luxury at Central Park South — history, elegance, and unrivalled service." },
            { id: 'h5',  name: "Burj Al Arab",          location: "Dubai, UAE",        rating: 5.0, price: 0.01, img: "../pic/hotel/h5.png",  amenities: ['fa-water','fa-spa','fa-plane','fa-helicopter'],          desc: "The world's most iconic luxury hotel — a sail-shaped icon in the Arabian Gulf." },
            { id: 'h6',  name: "Bvlgari Resort Bali",   location: "Uluwatu, Bali",     rating: 4.9, price: 0.01, img: "../pic/hotel/h6.png",  amenities: ['fa-swimming-pool','fa-spa','fa-wine-glass','fa-wifi'],   desc: "Clifftop villas above the Indian Ocean with Italian flair and Balinese spirit." },
            { id: 'h7',  name: "Ritz Paris",            location: "Paris, France",     rating: 5.0, price: 0.01, img: "../pic/hotel/h7.jpg",  amenities: ['fa-champagne-glasses','fa-spa','fa-city','fa-wifi'],     desc: "The legendary jewel of Place Vendôme — where history meets haute couture." },
            { id: 'h8',  name: "Mandarin Oriental",     location: "Bangkok, Thailand", rating: 4.8, price: 0.01, img: "../pic/hotel/h8.png",  amenities: ['fa-spa','fa-water','fa-utensils','fa-wifi'],             desc: "A historic riverside retreat in the heart of Bangkok, reimagined for the modern traveller." },
            { id: 'h9',  name: "One & Only Reethi Rah", location: "North Malé, Maldives", rating: 5.0, price: 0.01, img: "../pic/hotel/h9.png", amenities: ['fa-water','fa-fish','fa-plane','fa-spa'],             desc: "The most romantic private island in the Maldives with barefoot luxury." },
            { id: 'h10', name: "Amangiri",              location: "Utah, USA",         rating: 4.9, price: 0.01, img: "../pic/hotel/h10.jpg", amenities: ['fa-mountain','fa-spa','fa-horse','fa-wifi'],             desc: "Desert luxury carved into the canyon landscape of southern Utah." },
            { id: 'h11', name: "Singita Grumeti",       location: "Serengeti, Tanzania", rating: 5.0, price: 0.01, img: "../pic/hotel/h11.jpg", amenities: ['fa-paw','fa-utensils','fa-spa','fa-wifi'],            desc: "Private game reserve lodge with uninterrupted views of the Serengeti migration." },
            { id: 'h12', name: "Soneva Jani",           location: "Noonu Atoll, Maldives", rating: 4.9, price: 0.01, img: "../pic/hotel/h12.jpg", amenities: ['fa-water','fa-film','fa-spa','fa-wifi'],           desc: "Overwater villas with retractable roofs for stargazing from your bed." },
            { id: 'h13', name: "Capella Singapore",     location: "Sentosa, Singapore", rating: 4.7, price: 0.01, img: "../pic/hotel/h13.jpg", amenities: ['fa-spa','fa-golf-ball','fa-wifi','fa-pool'],          desc: "Colonial heritage meets modern glamour on Sentosa island." },
            { id: 'h14', name: "Badrutt's Palace",      location: "St. Moritz, Switzerland", rating: 4.8, price: 0.01, img: "../pic/hotel/h14.jpg", amenities: ['fa-snowflake','fa-spa','fa-champagne-glasses','fa-wifi'], desc: "The grandest winter palace in the Swiss Alps since 1896." },
            { id: 'h15', name: "Amanpuri",              location: "Phuket, Thailand",  rating: 5.0, price: 0.01, img: "../pic/hotel/h15.jpg", amenities: ['fa-water','fa-spa','fa-utensils','fa-wifi'],             desc: "The original Aman property — a private peninsula of Thai pavilions and pure serenity." },
        ];

        const food = [
            // Pizza
            { id: 'f1',  name: "Truffle Margherita",    desc: "San Marzano tomatoes, fresh buffalo mozzarella, and shaved black truffle.",  price: 14,  img: "../pic/food/f1.jpg",  rest: "La Trattoria",    category: "pizza",    rating: 4.9 },
            { id: 'f2',  name: "Lobster Bianca",         desc: "White sauce, Maine lobster, roasted garlic, burrata, and fresh basil.",      price: 18, img: "../pic/food/f2.jpg",    rest: "La Trattoria",    category: "pizza",    rating: 4.8 },
            { id: 'f3',  name: "Wagyu Pepperoni",        desc: "Hand-stretched dough, wagyu beef pepperoni, grana padano, and honey drizzle.", price: 16, img: "../pic/food/f3.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.7 },

            // Burger
            { id: 'f4',  name: "Wagyu Gold Burger",      desc: "A5 Wagyu patty, foie gras, black truffle, gold leaf on brioche bun.",        price: 20, img: "../pic/food/f4.jpg",  rest: "The Grill Master", category: "burger",   rating: 5.0 },
            { id: 'f5',  name: "Lobster Smash",          desc: "Butter-poached lobster claw, crispy shallots, saffron aioli, and chives.",   price: 19, img: "../pic/food/f5.jpg",    rest: "The Grill Master", category: "burger",   rating: 4.9 },
            { id: 'f6',  name: "Black Truffle Smash",    desc: "Prime smash patty, black truffle mayo, aged cheddar, and caramelised onion.", price: 15, img: "../pic/food/f6.jpg",  rest: "The Grill Master", category: "burger",   rating: 4.7 },

            // Indian
            { id: 'f7',  name: "Dal Makhani Royale",     desc: "Slow-cooked black lentils in Lahori butter sauce with cream and spices.",    price: 9,  img: "../pic/food/f7.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.8 },
            { id: 'f8',  name: "Tandoori Lobster",       desc: "Whole Canadian lobster marinated in saffron-yoghurt and grilled in tandoor.", price: 20, img: "../pic/food/f8.jpg",    rest: "Maharaja Dining", category: "indian",   rating: 4.9 },
            { id: 'f9',  name: "Lamb Rogan Josh",        desc: "Slow-braised Kashmiri lamb in aromatic whole spice masala with naan.",       price: 13,  img: "../pic/food/f9.jpg",  rest: "Maharaja Dining", category: "indian",   rating: 4.7 },

            // Chinese
            { id: 'f10', name: "Peking Duck",            desc: "Imperial-style roasted Peking duck with hoisin, pancakes, and spring onion.", price: 18, img: "../pic/food/f10.jpg",  rest: "Jade Dragon",     category: "chinese",  rating: 4.9 },
            { id: 'f11', name: "Abalone Dim Sum",        desc: "Handcrafted har gow with fresh abalone and golden prawn, steamed to order.", price: 17, img: "../pic/food/f11.jpg",    rest: "Jade Dragon",     category: "chinese",  rating: 5.0 },
            { id: 'f12', name: "Black Cod Miso",         desc: "Nobu-style black cod marinated in miso, sake, and mirin for 72 hours.",      price: 20, img: "../pic/food/f12.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.8 },

            // Desserts
            { id: 'f13', name: "Gold Leaf Soufflé",      desc: "Valrhona dark chocolate soufflé topped with 24k gold leaf and crème fraîche.", price: 12, img: "../pic/food/f13.jpg",  rest: "Patisserie Elite", category: "desserts", rating: 4.9 },
            { id: 'f14', name: "Mango Caviar Parfait",   desc: "Mango spherification caviar with Tahitian vanilla cream and coconut foam.",  price: 14,  img: "../pic/food/f14.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.8 },
            { id: 'f15', name: "Truffle Cheesecake",     desc: "New York cheesecake infused with Italian white truffle and fig compote.",    price: 13,  img: "../pic/food/f15.jpg",    rest: "Patisserie Elite", category: "desserts", rating: 4.7 },

            // Drinks
            { id: 'f16', name: "Dom Pérignon Vintage",   desc: "2012 Dom Pérignon vintage champagne, served in crystal Riedel flutes.",      price: 20, img: "../pic/food/f16.jpg",  rest: "The Bar",         category: "drinks",   rating: 5.0 },
            { id: 'f17', name: "Japanese Whisky Flight",  desc: "Yamazaki 18, Hibiki 21, and Nikka Yoichi tasting set with water stones.",    price: 18, img: "../pic/food/f17.jpg",    rest: "The Bar",         category: "drinks",   rating: 4.9 },
            { id: 'f18', name: "Saffron Martini",        desc: "Persian saffron-infused Grey Goose vodka, elderflower, and citrus zest.",    price: 15,  img: "../pic/food/f18.jpg", rest: "The Bar",         category: "drinks",   rating: 4.8 },

            // Additional Pizza
            { id: 'f19', name: "Caviar & Crème Pizza",   desc: "Imperial caviar, crème fraîche, gold flakes, and chives.",                  price: 19, img: "../pic/food/f19.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.9 },
            { id: 'f20', name: "Prosciutto di Parma Pizza", desc: "Aged prosciutto, fresh wild figs, wild arugula, and aged balsamic glaze.",  price: 17, img: "../pic/food/f20.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.8 },
            { id: 'f21', name: "Truffle & Porcini Flatbread", desc: "Sautéed porcini mushrooms, white truffle oil, fontina, and microgreens.", price: 16, img: "../pic/food/f21.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.7 },
            { id: 'f22', name: "Smoked Salmon Royale",   desc: "House-cured wild salmon, dill cream, caper berries, and red onion.",        price: 15, img: "../pic/food/f22.jpg", rest: "La Trattoria",    category: "pizza",    rating: 4.8 },

            // Additional Burger
            { id: 'f23', name: "Imperial Wagyu Slider Set", desc: "Trio of mini A5 Wagyu burgers with caramelized shallots and blue cheese.",  price: 18, img: "../pic/food/f23.jpg", rest: "The Grill Master", category: "burger",   rating: 4.9 },
            { id: 'f24', name: "Golden Foie Gras Burger", desc: "Dry-aged beef, seared foie gras, truffle aioli, on a toasted brioche bun.",   price: 20, img: "../pic/food/f24.jpg", rest: "The Grill Master", category: "burger",   rating: 5.0 },
            { id: 'f25', name: "Crispy Soft Shell Crab Burger", desc: "Tempura soft shell crab, spicy yuzu slaw, and avocado mash.",          price: 17, img: "../pic/food/f25.jpg", rest: "The Grill Master", category: "burger",   rating: 4.8 },

            // Additional Indian
            { id: 'f26', name: "Murgh Butter Masala Elite", desc: "Charcoal-grilled chicken in a rich, buttery, fenugreek-infused tomato gravy.", price: 11,  img: "../pic/food/f26.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.9 },
            { id: 'f27', name: "Saffron Dum Biryani",    desc: "Long-grain basmati rice layered with spiced baby lamb, saffron, and fresh mint.", price: 13,  img: "../pic/food/f27.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.9 },
            { id: 'f28', name: "Paneer Tikka Mille-Feuille", desc: "Layered tandoori cottage cheese, spiced bell pepper coulis, and mint chutney.", price: 9,  img: "../pic/food/f28.jpg", rest: "Maharaja Dining", category: "indian",   rating: 4.7 },

            // Additional Chinese
            { id: 'f29', name: "Szechuan Spiced Lobster", desc: "Stir-fried lobster tail in aromatic Szechuan peppercorn chilli paste.",       price: 19, img: "../pic/food/f29.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.8 },
            { id: 'f30', name: "Golden Leaf Har Gow",    desc: "Steamed blue shrimp dumplings topped with gold leaf and micro cilantro.",    price: 12,  img: "../pic/food/f30.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.9 },
            { id: 'f31', name: "Wagyu Beef Lo Mein",     desc: "Hand-pulled noodles with thin-sliced A5 Wagyu beef and black pepper sauce.",  price: 15,  img: "../pic/food/f31.jpg", rest: "Jade Dragon",     category: "chinese",  rating: 4.8 },

            // Additional Desserts
            { id: 'f32', name: "Caviar de Chocolat",     desc: "Decadent dark chocolate mousse pearls infused with grand marnier.",          price: 11,  img: "../pic/food/f32.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.9 },
            { id: 'f33', name: "Saffron Pistachio Kulfi", desc: "Traditional slow-churned Indian ice cream with saffron strands and pistachios.", price: 8,  img: "../pic/food/f33.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.8 },
            { id: 'f34', name: "Matcha Lava Cake",       desc: "Warm ceremonial matcha cake with a molten white chocolate center.",           price: 10,  img: "../pic/food/f34.jpg", rest: "Patisserie Elite", category: "desserts", rating: 4.7 },

            // Additional Drinks
            { id: 'f35', name: "Elixir of Life Martini", desc: "Rare vintage cognac, honey water, fresh lemon, topped with vintage champagne.", price: 20, img: "../pic/food/f35.jpg", rest: "The Bar",         category: "drinks",   rating: 5.0 },
            { id: 'f36', name: "Smoked Rosemary Old Fashioned", desc: "Single barrel bourbon, angostura bitters, smoked rosemary wood.",      price: 16, img: "../pic/food/f36.jpg", rest: "The Bar",         category: "drinks",   rating: 4.9 },
            { id: 'f37', name: "Gold Dust Espresso Martini", desc: "Fresh espresso, craft coffee liqueur, vodka, dusted with 24k gold.",      price: 14,  img: "../pic/food/f37.jpg", rest: "The Bar",         category: "drinks",   rating: 4.8 },
            { id: 'f38', name: "Hibiscus Rose Mocktail", desc: "Hibiscus tea, organic rose water, sparkling elderflower, and fresh mint.",     price: 7,  img: "../pic/food/f38.jpg", rest: "The Bar",         category: "drinks",   rating: 4.7 }
        ];


        const flights = [
            { id: 'fl1',  from: "Dubai",     to: "Maldives",   airline: "Emirates",       duration: "4h 10m", price: 0.01,  class: "First",    img: "✈️",  depTime: "08:30", arrTime: "12:40" },
            { id: 'fl2',  from: "London",    to: "New York",   airline: "British Airways", duration: "7h 45m", price: 0.01,  class: "Business", img: "✈️",  depTime: "10:00", arrTime: "13:45" },
            { id: 'fl3',  from: "Paris",     to: "Tokyo",      airline: "Air France",      duration: "13h 20m", price: 0.01, class: "First",    img: "✈️",  depTime: "11:15", arrTime: "06:35" },
            { id: 'fl4',  from: "New York",  to: "Dubai",      airline: "Etihad",          duration: "13h 00m", price: 0.01, class: "First",    img: "✈️",  depTime: "21:00", arrTime: "18:00" },
            { id: 'fl5',  from: "Singapore", to: "London",     airline: "Singapore Air",   duration: "14h 00m", price: 0.01, class: "Business", img: "✈️",  depTime: "09:30", arrTime: "15:30" },
            { id: 'fl6',  from: "Mumbai",    to: "Dubai",      airline: "Air India",       duration: "3h 00m",  price: 0.01, class: "Business", img: "✈️",  depTime: "06:00", arrTime: "09:00" },
            { id: 'fl7',  from: "Sydney",    to: "Singapore",  airline: "Qantas",          duration: "7h 45m",  price: 0.01, class: "Business", img: "✈️",  depTime: "07:00", arrTime: "12:45" },
            { id: 'fl8',  from: "Tokyo",     to: "Los Angeles",airline: "JAL",           duration: "10h 15m", price: 0.01, class: "First",    img: "✈️",  depTime: "11:00", arrTime: "04:15" },
        ];

        const trains = [
            { id: 'tr1',  from: "New Delhi", to: "Mumbai",     airline: "Rajdhani Express", duration: "15h 30m", price: 0.01, class: "First AC", img: "🚆",  depTime: "16:30", arrTime: "08:00" },
            { id: 'tr2',  from: "Howrah",    to: "New Delhi",  airline: "Shatabdi Exp",     duration: "17h 15m", price: 0.01, class: "CC",       img: "🚆",  depTime: "06:00", arrTime: "23:15" },
            { id: 'tr3',  from: "Bengaluru", to: "Chennai",    airline: "Vande Bharat",     duration: "4h 20m",  price: 0.01, class: "EC",       img: "🚆",  depTime: "05:50", arrTime: "10:10" },
            { id: 'tr4',  from: "Ahmedabad", to: "Mumbai",     airline: "Tejas Express",    duration: "6h 15m",  price: 0.01, class: "CC",       img: "🚆",  depTime: "06:40", arrTime: "12:55" },
        ];

        const buses = [
            { id: 'bu1',  from: "Mahagama",  to: "Bhagalpur",  airline: "Mahagama Bus Service", duration: "1h 45m",  price: 0.01,   class: "Standard", img: "🚌",  depTime: "08:00", arrTime: "09:45" },
            { id: 'bu2',  from: "Mahagama",  to: "Godda",      airline: "Mahagama Bus Service", duration: "1h 00m",  price: 0.01,   class: "Standard", img: "🚌",  depTime: "09:00", arrTime: "10:00" },
            { id: 'bu3',  from: "Mahagama",  to: "Ranchi",     airline: "Mahagama Bus Service", duration: "8h 30m",  price: 0.01,  class: "AC Sleeper", img: "🚌",  depTime: "20:00", arrTime: "04:30" },
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
        this.state.destinations = JSON.parse(localStorage.getItem('imxx_destinations')) || [];
        this.state.hotels       = JSON.parse(localStorage.getItem('imxx_hotels'))       || [];
        this.state.foodItems    = JSON.parse(localStorage.getItem('imxx_food'))         || [];
        this.state.flights      = JSON.parse(localStorage.getItem('imxx_flights'))      || [];
        this.state.trains       = JSON.parse(localStorage.getItem('imxx_trains'))       || [];
        this.state.buses        = JSON.parse(localStorage.getItem('imxx_buses'))        || [];
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

// ==========================================
// CORE APP CONTROLLER
// ==========================================
const app = {

    init() {
        Store.init();
        this.syncFreeItems();
        this.applySettings();
        this.updateUserUI();
        this.setupSearch();
        this.renderAll();
        this.randomizeAllBanners();
        this.renderFoodCategories();
        this.startBannerRotator();
        this.setupCustomAutocomplete('tr-from', 'tr-from-dropdown');
        this.setupCustomAutocomplete('tr-to', 'tr-to-dropdown');
        this.loadStationsData();

        // Check sidebar state preference
        if (localStorage.getItem('sidebar_closed') === 'true') {
            this.toggleSidebar(false);
        }

        // Close profile dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-profile-btn')) {
                this.closeProfileDropdown();
            }
        });
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
                const res = await fetch(`http://localhost:5000/api/v1/train/suggest?text=${encodeURIComponent(query)}`);
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
        const views = ['home', 'hotels', 'food', 'flights', 'trains', 'destinations', 'mountains', 'beaches', 'planets', 'nature', 'nature-forest'];
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
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const el = document.getElementById(`view-${viewName}`);
        if (el) el.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (activeNav) activeNav.classList.add('active');
        Store.state.currentView = viewName;
        document.querySelector('.views-wrapper').scrollTop = 0;
        if (viewName === 'home') {
            this.renderDestinations();
            this.renderHotels();
        }
        if (viewName === 'hotels') {
            this.renderHotels();
        }
        if (['destinations', 'mountains', 'beaches', 'planets', 'nature', 'nature-forest'].includes(viewName)) {
            this.renderDestinations();
        }
        if (viewName === 'dashboard') this.renderDashboard();
        if (viewName === 'wishlist')  this.renderWishlist();
        if (viewName === 'admin')     this.renderAdmin();
        if (viewName === 'trains')    this.searchTrains();
        if (viewName === 'food')      this.renderFoodMenu(Store.state.foodCategory || 'all', true);
        this.randomizeBannerForView(viewName, false);
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
        document.querySelectorAll('.fullscreen-modal').forEach(m => m.classList.remove('active'));

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
        if (type === 'dest')  item = Store.state.destinations.find(d => d.id === id);
        if (type === 'hotel') item = Store.state.hotels.find(h => h.id === id);
        if (!item) return;

        // --- Banner image (smooth cross-fade + zoom) ---
        const bannerImg = document.getElementById('details-banner-img');
        if (bannerImg) {
            bannerImg.style.opacity = '0';
            bannerImg.style.transform = 'scale(1.08)';
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

        // --- Title & Location ---
        document.getElementById('details-title').textContent   = item.name;
        document.getElementById('details-location').innerHTML  = `<i class="fa-solid fa-location-dot"></i> ${item.location}`;

        // --- Price pill ---
        const priceEl = document.getElementById('details-price');
        if (priceEl) priceEl.textContent = `$${item.price.toLocaleString()} ${type === 'dest' ? '/ person' : '/ night'}`;

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
                this.openDetails(type, id);
            };
        }

        // --- Book / Buy buttons ---
        const actionFn = () => {
            this.closeModals();
            if (type === 'hotel') {
                this.bookingEngine.start(item);
            } else {
                const hotel = Store.state.hotels[Math.floor(Math.random() * Store.state.hotels.length)];
                this.bookingEngine.start(hotel, item.name, item.img);
            }
        };
        const btn    = document.getElementById('details-action-btn');
        const buyBtn = document.getElementById('details-buy-btn');
        if (btn)    btn.onclick    = actionFn;
        if (buyBtn) buyBtn.onclick = actionFn;

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
        this.openDetails(type, arr[newIdx].id);
    },

    // ---- WISHLIST ----
    toggleWishlist(e, id) {
        e.stopPropagation();
        const wl = Store.state.wishlist;
        const idx = wl.indexOf(id);
        if (idx > -1) { wl.splice(idx, 1); this.showNotification('Removed from wishlist', 'info'); }
        else          { wl.push(id);         this.showNotification('Added to wishlist! ❤️', 'success'); }
        Store.save('wishlist', wl);
        this.renderDestinations();
        this.renderHotels();
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

    // --- Destination card ---
    renderDestCard(d) {
        const wl = Store.state.wishlist.includes(d.id);
        return `
            <div class="hotel-card" onclick="app.openDetails('dest','${d.id}')">
                <div class="hotel-img-wrap">
                    <img src="${d.img}" alt="${d.name}" loading="lazy" onerror="this.src='../pic/destination/d1.png'">
                    <div class="fav-btn ${wl ? 'active' : ''}" style="position:absolute;top:12px;right:12px" onclick="app.toggleWishlist(event,'${d.id}')">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    <div class="hotel-badge">⭐ ${d.rating}</div>
                </div>
                <div class="hotel-info">
                    <h4>${d.name}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${d.location}</p>
                    <p style="margin-top:8px;margin-bottom:12px;height:36px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:var(--text-secondary);font-size:13px">${d.desc || ''}</p>
                    <div class="hotel-footer">
                        <div class="dest-price">$${d.price.toLocaleString()} <span>/ person</span></div>
                        <button class="btn-premium" style="width:auto;padding:8px 16px;font-size:12px" onclick="event.stopPropagation();app.openDetails('dest','${d.id}')">View</button>
                    </div>
                </div>
            </div>`;
    },

    renderDestinations(filterFn) {
        const all   = filterFn ? Store.state.destinations.filter(filterFn) : Store.state.destinations;
        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

        const mts   = shuffle(all.filter(d => d.category === 'mountains'));
        const bch   = shuffle(all.filter(d => d.category === 'beaches'));
        const plt   = shuffle(all.filter(d => d.category === 'planets'));
        const nat   = shuffle(all.filter(d => d.category === 'nature'));
        const forest = shuffle(all.filter(d => d.category === 'nature-forest'));

        const fill = (id, arr) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = arr.length ? arr.map(d => this.renderDestCard(d)).join('') : `<p style="color:var(--text-secondary);grid-column:1/-1;padding:40px 0">No items found.</p>`;
        };

        const shuffledAll = shuffle(all);
        fill('home-destinations',  shuffledAll);
        fill('cat-destinations',   shuffledAll);
        fill('cat-mountains',      mts);
        fill('cat-beaches',        bch);
        fill('cat-planets',        plt);
        fill('cat-nature',         nat);
        fill('cat-nature-forest',  forest);
    },

    // --- Hotel card ---
    renderHotelCard(h) {
        const wl = Store.state.wishlist.includes(h.id);
        return `
            <div class="hotel-card" onclick="app.openDetails('hotel','${h.id}')">
                <div class="hotel-img-wrap">
                    <img src="${h.img}" alt="${h.name}" loading="lazy" onerror="this.src='../pic/hotel/h1.jpg'">
                    <div class="fav-btn ${wl ? 'active' : ''}" style="position:absolute;top:12px;right:12px" onclick="app.toggleWishlist(event,'${h.id}')">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    <div class="hotel-badge">⭐ ${h.rating}</div>
                </div>
                <div class="hotel-info">
                    <h4>${h.name}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${h.location}</p>
                    <div class="hotel-amenities">${h.amenities.slice(0,4).map(a => `<div class="amenity"><i class="fa-solid ${a}"></i></div>`).join('')}</div>
                    <div class="hotel-footer">
                        <div class="dest-price">$${h.price.toLocaleString()} <span>/ night</span></div>
                        <div style="display:flex;gap:8px">
                            <button class="add-btn" onclick="event.stopPropagation();app.toggleWishlist(event,'${h.id}')"><i class="fa-solid fa-heart"></i></button>
                            <button class="btn-premium" style="width:auto;padding:8px 16px;font-size:12px" onclick="event.stopPropagation();app.bookingEngine.start(Store.state.hotels.find(h=>h.id==='${h.id}'))">Book</button>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    renderHotels(filterFn) {
        const all  = filterFn ? Store.state.hotels.filter(filterFn) : Store.state.hotels;
        const shuffledHotels = [...all].sort(() => Math.random() - 0.5);
        const fillGrid = (id, arr) => { const el = document.getElementById(id); if (el) el.innerHTML = arr.map(h => this.renderHotelCard(h)).join(''); };
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
                        <img src="${f.img}" alt="${f.name}" loading="lazy" onerror="this.src='../pic/food/fine_dining.png'">
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
                <img src="${item.img}" alt="${item.name}" onerror="this.src='../pic/food/fine_dining.png'">
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
                    <img src="${i.img}" alt="${i.name}" onerror="this.src='../pic/food/fine_dining.png'" style="width:40px;height:40px;border-radius:8px;object-fit:cover;border:1px solid rgba(255,255,255,0.08);">
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

    placeFoodOrder() {
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
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`http://localhost:5000/api/v1/train/pnr?pnr=${pnr}`, { headers });
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
                backendUrl = `http://localhost:5000/api/v1/train/search?fromStationCode=${from}&toStationCode=${to}`;
                if (dateOfJourney) backendUrl += `&dateOfJourney=${dateOfJourney}`;
            } else {
                backendUrl = `http://localhost:5000/api/v1/train/live?stationCode=${from}`;
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

        start(hotel, destName, destImg) {
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

            // Set destination/hotel image (shows destination cover image if booking a destination)
            const imgEl = document.getElementById('booking-hotel-img');
            if (imgEl) {
                imgEl.src = destImg ? destImg : hotel.img;
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
            document.querySelectorAll('#booking-steps-ui .step').forEach((s, i) => {
                const isActive = (i + 1) === step;
                const isDone   = (i + 1) < step;
                s.style.color = (isActive || isDone) ? 'var(--gold)' : 'var(--text-secondary)';
                s.style.fontWeight = isActive ? '700' : '600';
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

        async confirmBooking() {
            const checkoutBtn = document.getElementById('checkout-btn');
            
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.innerHTML = '<span>Redirecting to Razorpay...</span><i class="fa-solid fa-spinner fa-spin"></i>';
            }
            
            // Redirect user to the specific Razorpay.me payment page
            window.open('https://razorpay.me/@mdimran8600', '_blank');
            
            // Finalize the booking in the UI after redirecting
            setTimeout(() => {
                app.bookingEngine.finalizeBooking('Razorpay Link');
                if (checkoutBtn) {
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = '<span>Proceed to Payment</span><i class="fa-solid fa-arrow-right"></i>';
                }
            }, 2000);
        },

        finalizeBooking(pm) {
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

        input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (q.length < 2) { drop.classList.remove('active'); return; }

            const d  = Store.state.destinations.filter(x => x.name.toLowerCase().includes(q) || x.location.toLowerCase().includes(q) || x.category.includes(q)).map(x => ({ ...x, type: 'dest', label: x.category }));
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
    applyFilter(section) {
        const q      = (document.getElementById(`filter-${section}-search`)?.value || '').toLowerCase();
        const budget = document.getElementById(`filter-${section}-budget`)?.value || 'all';
        const rating = parseFloat(document.getElementById(`filter-${section}-rating`)?.value || '0');

        const budgetRanges = { all: [0, Infinity], budget: [0, 10000], mid: [10000, 30000], luxury: [30000, Infinity] };
        const [minB, maxB] = budgetRanges[budget] || [0, Infinity];

        if (section === 'hotels') {
            this.renderHotels(h =>
                (h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q)) &&
                h.price >= minB && h.price <= maxB &&
                h.rating >= rating
            );
        } else {
            const cat = section;
            this.renderDestinations(d =>
                (d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)) &&
                d.price >= minB && d.price <= maxB &&
                d.rating >= rating &&
                (d.category === cat)
            );
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
            const response = await fetch('http://localhost:5000/api/auth/login', {
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

        if (!name || !email || !pass || !phone) {
            this.showNotification('Please fill in all fields including phone number', 'warning');
            return;
        }
        if (pass.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'warning');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup-request', {
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
                this.showNotification(isResend ? 'Verification code resent!' : 'Verification code sent via SMS!', 'success');
                this.pendingSignupData = { name, email, pass, phone };
                
                if (data.smsDebugCode) {
                    this.showNotification(`[DEBUG] Verification code: ${data.smsDebugCode}`, 'info');
                    console.log(`[SMS SIGNUP CODE] ${data.smsDebugCode}`);
                }

                // Switch panes in the modal
                document.getElementById('signup-form-pane').style.display = 'none';
                document.getElementById('signup-verify-pane').style.display = 'block';
                document.getElementById('signup-modal-title').textContent = 'Verify Phone Number';
                document.getElementById('signup-modal-desc').textContent = 'Confirm your SMS verification code';
                document.getElementById('signup-verify-code').focus();
            } else {
                this.showNotification(data.error || 'Signup request failed', 'error');
            }
        } catch (err) {
            console.warn('[Backend Error] Offline or unreachable. Falling back to local/simulated SMS verification...');
            this.pendingSignupData = { name, email, pass, phone, localCode: '123456' };
            this.showNotification('Offline mode: Verification code "123456" simulated!', 'info');
            
            // Switch panes in the modal
            document.getElementById('signup-form-pane').style.display = 'none';
            document.getElementById('signup-verify-pane').style.display = 'block';
            document.getElementById('signup-modal-title').textContent = 'Verify Phone Number';
            document.getElementById('signup-modal-desc').textContent = 'Confirm your SMS verification code';
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

            const response = await fetch('http://localhost:5000/api/auth/signup-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: pending.phone,
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
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
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
            const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
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
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
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
                const profileRes = await fetch('http://localhost:5000/api/user/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
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
                    await fetch('http://localhost:5000/api/user/avatar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
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

    toggleDarkMode(isDark, notify = true) {
        if (isDark) document.body.classList.add('dark-mode');
        else        document.body.classList.remove('dark-mode');
        this.saveSettings();
        if (notify) this.showNotification(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
    },

    // ==========================================
    // ADMIN PANEL
    // ==========================================
    adminCurrentType: null,

    renderAdmin() {
        const fillTable = (id, rows) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = rows;
        };

        fillTable('table-destinations', Store.state.destinations.map(d => `
            <tr>
                <td><img src="${d.img}" style="width:50px;height:40px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"></td>
                <td><strong>${d.name}</strong></td>
                <td>${d.location}</td>
                <td><span class="cat-badge">${d.category}</span></td>
                <td>$${d.price.toLocaleString()}</td>
                <td>⭐ ${d.rating}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="app.adminEdit('destinations','${d.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn btn-delete" onclick="app.adminDelete('destinations','${d.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`).join(''));

        fillTable('table-hotels', Store.state.hotels.map(h => `
            <tr>
                <td><img src="${h.img}" style="width:50px;height:40px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"></td>
                <td><strong>${h.name}</strong></td>
                <td>${h.location}</td>
                <td>$${h.price.toLocaleString()}/night</td>
                <td>⭐ ${h.rating}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="app.adminEdit('hotels','${h.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn btn-delete" onclick="app.adminDelete('hotels','${h.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`).join(''));

        fillTable('table-food', Store.state.foodItems.map(f => `
            <tr>
                <td><img src="${f.img}" style="width:50px;height:40px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"></td>
                <td><strong>${f.name}</strong></td>
                <td>${f.rest}</td>
                <td><span class="cat-badge">${f.category}</span></td>
                <td>$${f.price}</td>
                <td>⭐ ${f.rating}</td>
                <td>
                    <button class="action-btn btn-delete" onclick="app.adminDelete('foodItems','${f.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`).join(''));

        fillTable('table-flights', Store.state.flights.map(fl => `
            <tr>
                <td><strong>${fl.airline}</strong></td>
                <td>${fl.from} → ${fl.to}</td>
                <td>${fl.duration}</td>
                <td>${fl.class}</td>
                <td>$${fl.price.toLocaleString()}</td>
                <td><button class="action-btn btn-delete" onclick="app.adminDelete('flights','${fl.id}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`).join(''));

        const allLedger = [
            ...Store.state.bookings.map(b => ({ ...b, t: b.type || 'Hotel' })),
            ...Store.state.orders.map(o => ({ ...o, t: 'Food Order' }))
        ];
        fillTable('table-orders', allLedger.map(l => `
            <tr>
                <td>${l.id}</td>
                <td>${l.t}</td>
                <td>$${(l.total || 0).toLocaleString()}</td>
                <td>${new Date(l.date).toLocaleDateString()}</td>
                <td><span class="status-badge confirmed">Completed</span></td>
            </tr>`).join(''));
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
        this.adminCurrentType = key === 'destinations' ? 'destination' : key.replace('s', '');
        this.adminEditId = id;
        this.openAdminModal(this.adminCurrentType, item);
    },

    openAdminModal(type, prefill = null) {
        this.adminCurrentType = type;
        this.adminEditId = prefill ? prefill.id : null;
        document.getElementById('admin-form-title').textContent = prefill ? `Edit ${type}` : `Add New ${type}`;

        const val = (key) => prefill ? (prefill[key] || '') : '';

        let html = '';
        if (type === 'destination') {
            html = `
                <input type="text" id="af-name"     class="form-input" placeholder="Name"     value="${val('name')}">
                <input type="text" id="af-location" class="form-input" placeholder="Location" value="${val('location')}">
                <input type="number" id="af-price"  class="form-input" placeholder="Price"    value="${val('price')}">
                <input type="number" id="af-rating" class="form-input" placeholder="Rating (4.0–5.0)" value="${val('rating')}" step="0.1" min="0" max="5">
                <select id="af-category" class="form-input">
                    ${['mountains','beaches','nature','nature-forest','planets','destinations'].map(c => `<option value="${c}" ${val('category')===c?'selected':''}>${c}</option>`).join('')}
                </select>
                <input type="text" id="af-img" class="form-input" placeholder="Image path (e.g. ../pic/mountain/m5.jpg)" value="${val('img')}">
                <textarea id="af-desc" class="form-input" placeholder="Description" rows="3">${val('desc')}</textarea>`;
        } else if (type === 'hotel') {
            html = `
                <input type="text"   id="af-name"     class="form-input" placeholder="Hotel Name" value="${val('name')}">
                <input type="text"   id="af-location" class="form-input" placeholder="Location"   value="${val('location')}">
                <input type="number" id="af-price"    class="form-input" placeholder="Price/night" value="${val('price')}">
                <input type="number" id="af-rating"   class="form-input" placeholder="Rating" value="${val('rating')}" step="0.1">
                <input type="text"   id="af-img"      class="form-input" placeholder="Image path" value="${val('img')}">
                <textarea id="af-desc" class="form-input" placeholder="Description" rows="3">${val('desc')}</textarea>`;
        } else if (type === 'food') {
            html = `
                <input type="text"   id="af-name"     class="form-input" placeholder="Dish Name" value="${val('name')}">
                <input type="text"   id="af-rest"     class="form-input" placeholder="Restaurant" value="${val('rest')}">
                <input type="number" id="af-price"    class="form-input" placeholder="Price" value="${val('price')}">
                <input type="number" id="af-rating"   class="form-input" placeholder="Rating" value="${val('rating')}" step="0.1">
                <select id="af-category" class="form-input">
                    ${['pizza','burger','indian','chinese','desserts','drinks'].map(c => `<option value="${c}" ${val('category')===c?'selected':''}>${c}</option>`).join('')}
                </select>
                <input type="text" id="af-img" class="form-input" placeholder="Image path" value="${val('img')}">
                <textarea id="af-desc" class="form-input" placeholder="Description" rows="3">${val('desc')}</textarea>`;
        }
        document.getElementById('admin-form-fields').innerHTML = html;
        this.openModal('modal-admin-form');
    },

    adminSaveEntity() {
        const v = id => { const el = document.getElementById(id); return el ? el.value : ''; };

        if (this.adminEditId) {
            // EDIT
            const key = this.adminCurrentType === 'destination' ? 'destinations' : this.adminCurrentType + 's';
            const arr = Store.state[key];
            const idx = arr.findIndex(i => i.id === this.adminEditId);
            if (idx > -1) {
                arr[idx] = { ...arr[idx],
                    name:     v('af-name'),
                    price:    parseFloat(v('af-price')) || 0,
                    rating:   parseFloat(v('af-rating')) || 5.0,
                    img:      v('af-img') || arr[idx].img,
                    desc:     v('af-desc'),
                    location: v('af-location') || arr[idx].location,
                    category: v('af-category') || arr[idx].category,
                    rest:     v('af-rest') || arr[idx].rest,
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
            }
        }

        this.adminEditId = null;
        this.closeModals();
        this.renderAdmin();
        this.renderAll();
        this.showNotification('Saved to database ✅', 'success');
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
        if(overlay) overlay.classList.remove('ps-active');
        if(this.psTimeout) clearTimeout(this.psTimeout);
        this.switchView('dashboard');
    },

    copyBookingId() {
        const id = document.getElementById('ps-booking-id').textContent;
        navigator.clipboard.writeText(id).then(() => {
            this.showNotification('Booking ID copied to clipboard!', 'success');
        });
    },

    triggerConfetti() {
        // Emojis floating up
        const emojis = ['✨','🎉','💳','🍾','💎','🥂'];
        for(let i=0; i<15; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'ps-emoji-particle';
                el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                el.style.left = (Math.random() * 100) + 'vw';
                el.style.top = (60 + Math.random() * 40) + 'vh';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2500);
            }, i * 100);
        }

        // Basic canvas confetti implementation
        const canvas = document.getElementById('confetti-canvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#D4AF37', '#F9D976', '#ffffff', '#AA8321'];

        for(let i=0; i<100; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2 + 50,
                r: Math.random() * 6 + 2,
                dx: Math.random() * 10 - 5,
                dy: Math.random() * -10 - 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleInc: (Math.random() * 0.07) + 0.05,
                tiltAngle: 0
            });
        }

        let frameId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            particles.forEach(p => {
                p.tiltAngle += p.tiltAngleInc;
                p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle) * 2;
                p.dy += 0.1; // gravity
                p.x += p.dx;
                p.y += p.dy;
                
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
        
        // Stop canvas animation after 4 seconds to save CPU
        setTimeout(() => cancelAnimationFrame(frameId), 4000);
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
    }
};

// ==========================================
// BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', () => app.init());
