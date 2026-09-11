const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../nomad.db');
const db = new sqlite3.Database(dbPath);

// Wrap db operations in a promise-based helper
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const initializeDatabase = async () => {
  // 1. Create tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      avatar_url TEXT,
      phone_number TEXT,
      reset_code TEXT,
      reset_code_expires DATETIME,
      role TEXT DEFAULT 'user'
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS pending_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      verification_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL
    )
  `);


  // Run dynamic migrations to add new columns if the users table already exists
  try {
    await dbRun(`ALTER TABLE users ADD COLUMN phone_number TEXT`);
  } catch(e) {}
  try {
    await dbRun(`ALTER TABLE users ADD COLUMN reset_code TEXT`);
  } catch(e) {}
  try {
    await dbRun(`ALTER TABLE users ADD COLUMN reset_code_expires DATETIME`);
  } catch(e) {}
  try {
    await dbRun(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
  } catch(e) {}

  await dbRun(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      total_price TEXT NOT NULL,
      utr TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // ── Dynamic migrations: add wizard-step columns if they don't exist yet ──────
  const bookingMigrations = [
    `ALTER TABLE bookings ADD COLUMN destination_id INTEGER REFERENCES destinations(id)`,
    `ALTER TABLE bookings ADD COLUMN check_in TEXT`,
    `ALTER TABLE bookings ADD COLUMN check_out TEXT`,
    `ALTER TABLE bookings ADD COLUMN guests INTEGER DEFAULT 1`,
    `ALTER TABLE bookings ADD COLUMN guest_name TEXT`,
    `ALTER TABLE bookings ADD COLUMN guest_email TEXT`,
    `ALTER TABLE bookings ADD COLUMN guest_phone TEXT`,
    `ALTER TABLE bookings ADD COLUMN guest_address TEXT`,
    `ALTER TABLE bookings ADD COLUMN guest_country TEXT`,
    `ALTER TABLE bookings ADD COLUMN special_requests TEXT`,
    `ALTER TABLE bookings ADD COLUMN addons TEXT`,
    `ALTER TABLE bookings ADD COLUMN payment_intent_id TEXT`,
    `ALTER TABLE bookings ADD COLUMN screenshot_path TEXT`,
    `ALTER TABLE bookings ADD COLUMN payment_message TEXT`,
    `ALTER TABLE bookings ADD COLUMN screenshot_uploaded_at TEXT`,
  ];
  for (const sql of bookingMigrations) {
    try { await dbRun(sql); } catch (_) { /* column already exists */ }
  }

  await dbRun(`
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'hotel', 'university', 'forest', 'ride', 'destination'
      location_text TEXT NOT NULL, -- e.g., 'Tokyo', 'India'
      price TEXT, -- e.g., '$1650' or 'Free Tour'
      rating REAL,
      description TEXT,
      image TEXT,
      category TEXT, -- e.g., 'Accommodation', 'Interplanetary', 'Education'
      data_location_tags TEXT -- for search filtering tags
    )
  `);

  const destinationMigrations = [
    `ALTER TABLE destinations ADD COLUMN video_url TEXT`,
    `ALTER TABLE destinations ADD COLUMN video_blob BLOB`,
    `ALTER TABLE destinations ADD COLUMN video_mime TEXT`
  ];
  for (const sql of destinationMigrations) {
    try { await dbRun(sql); } catch (_) { /* column already exists */ }
  }

  await dbRun(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      rating INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // ── IMXX NOMAD MARKETPLACE: Multi-Vendor Payout Tables ─────────────────────

  /**
   * hostel_owners — HostelOwner partner data model
   *
   * Fields:
   *   stripe_connect_account_id  The Stripe Connect Express/Standard account ID
   *                              (format: acct_XXXXXXXXXXXXXXXX) that receives
   *                              vendor payouts via Stripe Transfer API.
   *   bank_account_last4         Last 4 digits of linked bank account. NEVER store
   *                              full account numbers.
   *   commission_rate            Decimal fraction in [0.01, 0.50].
   *                              0.12 = 12% IMXX platform cut.
   *   is_verified                0 = pending review, 1 = approved to receive payouts.
   */
  await dbRun(`
    CREATE TABLE IF NOT EXISTS hostel_owners (
      id                         INTEGER PRIMARY KEY AUTOINCREMENT,
      business_name              TEXT    NOT NULL,
      contact_email              TEXT    UNIQUE NOT NULL,
      stripe_connect_account_id  TEXT    NOT NULL,
      bank_holder_name           TEXT    NOT NULL,
      bank_account_last4         TEXT    NOT NULL,
      commission_rate            REAL    NOT NULL DEFAULT 0.12,
      is_verified                INTEGER NOT NULL DEFAULT 0,
      created_at                 DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /**
   * hostel_listings — Individual hostel properties on the marketplace
   *
   * Links a bookable hostel listing to its owner, storing pricing and
   * availability metadata used during the checkout + payout flow.
   */
  await dbRun(`
    CREATE TABLE IF NOT EXISTS hostel_listings (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      hostel_owner_id  INTEGER NOT NULL,
      hostel_name      TEXT    NOT NULL,
      location         TEXT    NOT NULL,
      price_per_night  REAL    NOT NULL,
      image_url        TEXT,
      description      TEXT,
      is_active        INTEGER NOT NULL DEFAULT 1,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(hostel_owner_id) REFERENCES hostel_owners(id)
    )
  `);

  /**
   * hostel_payout_ledger — Immutable financial audit trail for every split payment
   *
   * Every successful booking webhook creates one ledger entry. This record
   * is never updated (payout_status changes use a separate audit event model
   * in production). It answers: "For booking X, how much did IMXX keep, and
   * how much did we send to the partner, and when?"
   *
   * payout_status values:
   *   'pending'     - Split calculated, Transfer not yet initiated
   *   'processing'  - Transfer API call made to Stripe
   *   'transferred' - Stripe confirmed the transfer succeeded
   *   'failed'      - Transfer failed; requires manual intervention
   */
  await dbRun(`
    CREATE TABLE IF NOT EXISTS hostel_payout_ledger (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id           INTEGER NOT NULL,
      hostel_owner_id      INTEGER NOT NULL,
      hostel_listing_id    INTEGER,
      booking_total        REAL    NOT NULL,
      commission_rate      REAL    NOT NULL,
      commission_amount    REAL    NOT NULL,
      vendor_payout_amount REAL    NOT NULL,
      payout_status        TEXT    NOT NULL DEFAULT 'pending',
      payout_reference     TEXT,
      stripe_transfer_id   TEXT,
      created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id)      REFERENCES bookings(id),
      FOREIGN KEY(hostel_owner_id) REFERENCES hostel_owners(id)
    )
  `);

  // Create performance indexes for common dashboard query patterns
  await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_ledger_owner_id
    ON hostel_payout_ledger(hostel_owner_id)
  `);
  await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_ledger_booking_id
    ON hostel_payout_ledger(booking_id)
  `);
  await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_listings_owner_id
    ON hostel_listings(hostel_owner_id)
  `);

  // ── P2P Crypto Trading Tables ─────────────────────
  await dbRun(`
    CREATE TABLE IF NOT EXISTS p2p_trades (
      id TEXT PRIMARY KEY,
      buyer_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      crypto_amount REAL NOT NULL,
      crypto_asset TEXT NOT NULL,
      fiat_amount REAL NOT NULL,
      fiat_currency TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING_PAYMENT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(buyer_id) REFERENCES users(id),
      FOREIGN KEY(seller_id) REFERENCES users(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS p2p_payment_proofs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trade_id TEXT NOT NULL,
      buyer_id INTEGER NOT NULL,
      utr_reference TEXT NOT NULL,
      proof_image_url TEXT NOT NULL,
      message_note TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(trade_id) REFERENCES p2p_trades(id),
      FOREIGN KEY(buyer_id) REFERENCES users(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS p2p_admin_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trade_id TEXT NOT NULL,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL, -- 'APPROVE', 'REJECT'
      rejection_reason TEXT,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(trade_id) REFERENCES p2p_trades(id),
      FOREIGN KEY(admin_id) REFERENCES users(id)
    )
  `);

  console.log("SQLite tables initialized.");
  console.log("✅ Multi-vendor payout tables (hostel_owners, hostel_listings, hostel_payout_ledger) ready.");



  // 2. Seed Default Test User if not exists
  const testUser = await dbGet("SELECT * FROM users WHERE email = ?", ["imran@example.com"]);
  if (!testUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("password123", salt);
    await dbRun(
      "INSERT INTO users (email, password_hash, full_name, username, currency, avatar_url, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "imran@example.com",
        hash,
        "Imran King",
        "imranking",
        "USD",
        "https://ui-avatars.com/api/?name=Imran+King&background=F59E0B&color=fff&size=80",
        "8340249563",
        "user"
      ]
    );
    console.log("Seeded default test user: imran@example.com / password123 (Phone: 8340249563)");
  } else {
    // Make sure the default test user has the phone number updated if they exist
    await dbRun("UPDATE users SET phone_number = ? WHERE email = ?", ["8340249563", "imran@example.com"]);
  }

  // Seed default admin user
  const adminUser = await dbGet("SELECT * FROM users WHERE email = ?", ["admin@imxx.com"]);
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("imxx2024", salt);
    await dbRun(
      "INSERT INTO users (email, password_hash, full_name, username, currency, avatar_url, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "admin@imxx.com",
        hash,
        "IMXX Admin",
        "admin",
        "USD",
        "https://ui-avatars.com/api/?name=IMXX+Admin&background=D4AF37&color=000&size=80",
        "0000000000",
        "admin"
      ]
    );
    console.log("Seeded default admin user: admin@imxx.com / imxx2024");
  } else {
    await dbRun("UPDATE users SET role = 'admin' WHERE email = ?", ["admin@imxx.com"]);
  }

  // 3. Seed Destinations (with checks to avoid duplicates)
  console.log("Checking and seeding destinations dataset...");
  
  // Seed initial terrestrial, interplanetary, and job/employment records
  const initialDestinations = [
    // Terrestrial Destinations
    { name: "Ganga Sagar Sanctuary", type: "destination", location_text: "India", price: "$2,100 / person", rating: 5, description: "Immerse in the sacred confluence of the Ganges and the Bay of Bengal from a private heritage pavilion.", image: "destination/d1.png", category: "India", tags: "ganga sagar sanctuary india asia nature forest river water scenery heritage luxury" },
    { name: "Ganga Sagar Estate", type: "destination", location_text: "India", price: "$2,250 / person", rating: 5, description: "Experience spiritual tranquility and bespoke lakeside luxury in the serene landscapes of West Bengal.", image: "destination/d2.png", category: "India", tags: "ganga sagar estate india asia nature forest river water scenery estate luxury" },
    { name: "Shimda Pahad Retreat", type: "destination", location_text: "India", price: "$2,400 / person", rating: 5, description: "Unwind in a private mountain chalet nestled in the pristine highlands, featuring signature Ayurvedic spa services.", image: "destination/d3.png", category: "India", tags: "shimda pahad retreat india asia nature forest river water scenery mountain luxury" },
    { name: "Urjanagar ECO Sanctuary", type: "destination", location_text: "India", price: "$1,950 / person", rating: 5, description: "Discover a private ecological wonderland, featuring lakefront glass villas, organic dining, and bird sanctuaries.", image: "destination/d4.png", category: "India", tags: "urjanagar eco sanctuary india asia nature forest river water eco luxury" },
    { name: "Urjanagar Lake Pavilion", type: "destination", location_text: "India", price: "$2,050 / person", rating: 5, description: "A serene waterside sanctuary offering private solar boat cruises and luxury tent accommodations under the stars.", image: "destination/d5.png", category: "India", tags: "urjanagar lake pavilion india asia nature forest river water lake pavilion luxury" },
    { name: "Urjanagar Heritage Plaza", type: "destination", location_text: "India", price: "$1,850 / person", rating: 5, description: "Celebrate cultural heritage and festive elegance with VIP access to private local artisan bazaars and curated dining.", image: "destination/d6.png", category: "India", tags: "urjanagar heritage plaza india asia nature forest river water heritage plaza luxury" },
    { name: "America Viewpoint", type: "destination", location_text: "India", price: "$2,150 / person", rating: 5, description: "A breathtaking high-altitude overlook offering panoramic views of rolling clouds and deep valley forests.", image: "destination/d7.png", category: "India", tags: "america viewpoint india asia nature forest river water scenery mountain viewpoint luxury" },
    { name: "Santorini, Greece", type: "destination", location_text: "Europe", price: "$2,500 / person", rating: 4.9, description: "Savor spectacular caldera sunsets and pristine whitewashed cliffside estates overlooking the cobalt Aegean Sea.", image: "destination/d9.png", category: "Europe", tags: "santorini greece europe beach island caldera luxury view" },
    { name: "Kyoto, Japan", type: "destination", location_text: "Asia", price: "$2,800 / person", rating: 4.9, description: "Immerse in ancient zen gardens, golden pavilions, and exclusive geisha tea houses in the heart of historic Japan.", image: "destination/d10.png", category: "Asia", tags: "kyoto japan asia temple spring garden castle luxury" },
    { name: "New York City, USA", type: "destination", location_text: "North America", price: "$3,200 / person", rating: 4.8, description: "Experience the pinnacle of urban luxury with penthouse stays, private Broadway lounges, and helicopter skyline transits.", image: "destination/d11.png", category: "North America", tags: "new york usa america city urban penthouse skyline luxury" },
    { name: "Paris, France", type: "destination", location_text: "Europe", price: "$3,500 / person", rating: 4.9, description: "Indulge in haute couture and Michelin-starred dining from a private balcony facing the glittering Eiffel Tower.", image: "destination/d12.png", category: "Europe", tags: "paris france europe city eiffel tower fashion dining luxury" },
    { name: "Bali, Indonesia", type: "destination", location_text: "Asia", price: "$2,200 / person", rating: 4.8, description: "Unwind in a secluded cliffside villa in Uluwatu, featuring private infinity pools and dedicated spiritual butler service.", image: "destination/d13.png", category: "Asia", tags: "bali indonesia asia beach tropical villa forest luxury pool" },
    { name: "Cape Town, South Africa", type: "destination", location_text: "Africa", price: "$2,400 / person", rating: 4.9, description: "Bask in oceanfront grandeur nestled between the majestic Table Mountain and the pristine Atlantic seaboard.", image: "destination/d14.png", category: "Africa", tags: "cape town south africa mountain coastal sea safari luxury" },
    { name: "Rome, Italy", type: "destination", location_text: "Europe", price: "$2,900 / person", rating: 4.8, description: "Step through historic wonders with VIP private access to the Colosseum and bespoke Roman palace lodging.", image: "destination/d15.png", category: "Europe", tags: "rome italy europe city history ancient architecture colosseum luxury" },
    { name: "Machu Picchu, Peru", type: "destination", location_text: "South America", price: "$2,600 / person", rating: 4.9, description: "Discover the lost sanctuary of the Incas with luxury Hiram Bingham train passage and mountainside suites.", image: "destination/d16.png", category: "South America", tags: "machu picchu peru south america mountains inca ruins luxury train" },
    { name: "Dubai, UAE", type: "destination", location_text: "Middle East", price: "$4,500 / person", rating: 5, description: "Indulge in sky-high luxury, private desert yachting, and gold-plated amenities in the world's most opulent metropolis.", image: "destination/d17.png", category: "Middle East", tags: "dubai uae middle east modern luxury desert shopping skyscraper" },
    { name: "Sydney, Australia", type: "destination", location_text: "Oceania", price: "$2,700 / person", rating: 4.8, description: "Cruise the private harbor in a luxury yacht and dine at the Opera House gates with front-row harbor views.", image: "destination/d18.png", category: "Oceania", tags: "sydney australia opera house harbor ocean luxury beach" },
    { name: "Banff, Canada", type: "destination", location_text: "North America", price: "$2,300 / person", rating: 4.9, description: "Stay at the iconic alpine castles overlooking the turquoise waters of Lake Louise and glacial peaks.", image: "destination/d19.png", category: "North America", tags: "banff canada north america mountains nature lake castle snow luxury" },
    { name: "Maldives", type: "destination", location_text: "Asia", price: "$4,800 / person", rating: 5, description: "Escape to ultra-luxury overwater villas with private water slides, glass floors, and underwater dining rooms.", image: "destination/d20.png", category: "Asia", tags: "maldives asia island tropical ocean beach luxury overwater" },
    { name: "Amazon Rainforest", type: "destination", location_text: "South America", price: "$2,100 / person", rating: 4.8, description: "Journey deep into the jungle in a luxury canopy villa, with custom wildlife tracking and private river safaris.", image: "destination/d21.png", category: "South America", tags: "amazon rainforest brazil south america nature forest jungle luxury" },
    { name: "Seoul, South Korea", type: "destination", location_text: "Asia", price: "$2,400 / person", rating: 4.8, description: "Discover high-tech luxury suites, ancient palaces, and Michelin-starred cuisine in the heart of East Asia.", image: "destination/d22.png", category: "Asia", tags: "seoul south korea asia city lights urban palace luxury tech" },
    { name: "Rio de Janeiro, Brazil", type: "destination", location_text: "South America", price: "$2,300 / person", rating: 4.8, description: "Enjoy VIP beachside penthouses in Copacabana and private helicopter flights over Christ the Redeemer.", image: "destination/d23.jpg", category: "South America", tags: "rio de janeiro brazil south america beach statue copacabana luxury" },
    { name: "Swiss Alps, Switzerland", type: "destination", location_text: "Europe", price: "$3,600 / person", rating: 4.9, description: "Ski-in, ski-out of an elite alpine chalet in Zermatt, featuring private thermal baths and Matterhorn vistas.", image: "destination/d24.jpg", category: "Europe", tags: "swiss alps switzerland europe snow mountains chalet ski luxury" },
    { name: "Amalfi Coast, Italy", type: "destination", location_text: "Europe", price: "$3,400 / person", rating: 4.9, description: "Relax in cliffside vintage villas, private yachts, and terrace dining overlooking the shimmering Mediterranean.", image: "destination/d25.jpg", category: "Europe", tags: "amalfi coast italy europe ocean villa mediterranean luxury yacht" },
    { name: "Marrakech, Morocco", type: "destination", location_text: "Africa", price: "$2,000 / person", rating: 4.7, description: "Retreat to a private, luxury riad in the Medina, complete with private courtyard pools and bespoke spa hammams.", image: "destination/d26.jpg", category: "Africa", tags: "marrakech morocco africa desert market riad pool luxury" },
    { name: "Bora Bora", type: "destination", location_text: "Oceania", price: "$4,200 / person", rating: 5, description: "Unwind in the ultimate overwater sanctuary, featuring private plunge pools and direct access to pristine coral lagoons.", image: "destination/d27.jpg", category: "Oceania", tags: "bora bora french polynesia oceania island resort villa luxury lagoons" },
    { name: "Reykjavik, Iceland", type: "destination", location_text: "Europe", price: "$2,600 / person", rating: 4.9, description: "Chase the aurora borealis from a heated glass dome, with private glacier hikes and geothermal pool access.", image: "destination/d28.jpg", category: "Europe", tags: "reykjavik iceland europe aurora snow nature springs luxury" },
    { name: "Barcelona, Spain", type: "destination", location_text: "Europe", price: "$2,800 / person", rating: 4.8, description: "Marvel at Gaudi's masterpieces with private guides, and enjoy beachside luxury suites along the Mediterranean.", image: "destination/d29.jpg", category: "Europe", tags: "barcelona spain europe city beach gaudi architecture luxury" },
    { name: "Queenstown, New Zealand", type: "destination", location_text: "Oceania", price: "$2,900 / person", rating: 4.9, description: "Experience high-end adventure, helicopter vineyard tours, and luxury lakeside alpine retreats.", image: "destination/d30.jpg", category: "Oceania", tags: "queenstown new zealand oceania lake mountain adventure wine luxury" },
    { name: "Serengeti National Park", type: "destination", location_text: "Africa", price: "$3,800 / person", rating: 4.9, description: "Bask in luxury safari tents with private viewing decks, hot air balloon rides, and elite wildlife drives.", image: "destination/d31.jpg", category: "Africa", tags: "serengeti tanzania africa safari wildlife nature wilderness luxury" },
    { name: "Venice, Italy", type: "destination", location_text: "Europe", price: "$3,100 / person", rating: 4.8, description: "Glide along historic canals in private luxury water taxis, staying in a centuries-old grand palazzo.", image: "destination/d32.jpg", category: "Europe", tags: "venice italy europe canal gondola palazzo history luxury water" },
    { name: "Taj Mahal, India", type: "destination", location_text: "Asia", price: "$2,500 / person", rating: 4.9, description: "Witness the timeless monument of love from a private terrace suite, with exclusive VIP heritage access.", image: "destination/d35.jpg", category: "Asia", tags: "taj mahal agra india asia heritage monument landmark luxury" },
    { name: "Petra, Jordan", type: "destination", location_text: "Middle East", price: "$2,700 / person", rating: 4.8, description: "Explore the rose-red city carved into canyon walls, followed by ultra-luxury stargazing in desert domes.", image: "destination/d36.jpg", category: "Middle East", tags: "petra jordan middle east canyon ancient history desert dome luxury" },
    { name: "Tahiti, French Polynesia", type: "destination", location_text: "Oceania", price: "$3,000 / person", rating: 4.8, description: "Relax on black sand beaches, explore wish volcanic valleys, and stay in premium coastal estates.", image: "destination/d37.jpg", category: "Oceania", tags: "tahiti french polynesia oceania island beach volcano resort luxury" },
    { name: "Great Barrier Reef", type: "destination", location_text: "Oceania", price: "$3,500 / person", rating: 4.9, description: "Stay on a private tropical island, with private seaplane transfers and guided diving in pristine coral reefs.", image: "destination/d38.jpg", category: "Oceania", tags: "great barrier reef australia oceania reef coral dive sea island luxury" },
    { name: "Grand Canyon, USA", type: "destination", location_text: "North America", price: "$2,400 / person", rating: 4.8, description: "Soar in private helicopters over deep red canyons, staying in an ultra-premium glamping canyon retreat.", image: "destination/d39.jpg", category: "North America", tags: "grand canyon usa america mountains valley glamping helicopter luxury" },
    { name: "Zermatt Village", type: "destination", location_text: "Europe", price: "$3,700 / person", rating: 4.9, description: "Retreat to a spectacular alpine village at the foot of Matterhorn, with private indoor spas and fireside dining.", image: "destination/d40.jpg", category: "Europe", tags: "zermatt switzerland europe mountain alpine snow ski spa luxury" },
    { name: "Maui Oasis, Hawaii", type: "destination", location_text: "North America", price: "$3,300 / person", rating: 4.9, description: "Relax in a luxury oceanfront resort in Maui, featuring private cabanas, helicopter volcano tours, and surfing.", image: "destination/d41.jpg", category: "North America", tags: "maui hawaii usa america tropical beach surf luxury resort" },
    { name: "Phuket Shores", type: "destination", location_text: "Asia", price: "$2,100 / person", rating: 4.8, description: "Unwind in a luxury cliffside pool villa overlooking the Andaman Sea, with private yacht charters to Phi Phi.", image: "destination/d42.jpg", category: "Asia", tags: "phuket thailand asia beach resort tropical pool villa yacht luxury" },
    { name: "Tokyo Skyline", type: "destination", location_text: "Asia", price: "$2,900 / person", rating: 4.9, description: "Experience the high-tech skyline, private sushi master classes, and quiet luxury temple gardens.", image: "destination/d43.jpg", category: "Asia", tags: "tokyo japan asia city lights urban gardens temple sushi luxury" },
    { name: "London Heritage", type: "destination", location_text: "Europe", price: "$3,000 / person", rating: 4.8, description: "Indulge in royal treatment at historic five-star hotels, private museum viewings, and afternoon tea curation.", image: "destination/d44.jpg", category: "Europe", tags: "london uk europe city palace royal history museum luxury" },
    { name: "Cairo, Egypt", type: "destination", location_text: "Africa", price: "$2,200 / person", rating: 4.7, description: "Unlock ancient pyramids with private Egyptologist guides and stay in premium Nile-view suites.", image: "destination/d45.jpg", category: "Africa", tags: "cairo egypt africa pyramids desert ancient history nile luxury" },
    
    // Hotels Dataset
    { name: "Aman Tokyo", type: "hotel", location_text: "Tokyo", price: "$1,650", rating: 4.9, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Tokyo.", image: "hotel/h1.jpg", category: "Tokyo Luxury", tags: "hotel accommodation aman tokyo tokyo luxury" },
    { name: "Mandarin Oriental", type: "hotel", location_text: "Bangkok", price: "$950", rating: 4.8, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Bangkok.", image: "hotel/h2.jpg", category: "Bangkok Luxury", tags: "hotel accommodation mandarin oriental bangkok luxury" },
    { name: "Singita Boulders Lodge", type: "hotel", location_text: "Kruger National Park", price: "$2,100", rating: 5.0, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Kruger National Park.", image: "hotel/h3.jpg", category: "Kruger Luxury", tags: "hotel accommodation singita boulders lodge kruger luxury" },
    { name: "Burj Al Arab Jumeirah", type: "hotel", location_text: "Dubai", price: "$4,500", rating: 5.0, description: "Iconic sail-shaped 7-star hotel in Dubai featuring 24k gold iPads, private butlers, and ocean-view suites.", image: "hotel/h4.png", category: "Dubai Luxury", tags: "hotel accommodation booking burj al arab dubai luxury" },
    { name: "The Plaza Hotel", type: "hotel", location_text: "New York", price: "$1,200", rating: 4.8, description: "Experience timeless elegance and classic grandeur overlooking Central Park in Manhattan.", image: "hotel/h5.png", category: "New York Luxury", tags: "hotel booking plaza new york central park" },
    { name: "Ritz Paris", type: "hotel", location_text: "Paris", price: "$2,800", rating: 5.0, description: "World-renowned French luxury and opulence favored by royalty, featuring exquisite grand suites.", image: "hotel/h6.png", category: "Paris Luxury", tags: "hotel booking ritz paris france luxury" },
    { name: "Belmond Hotel Caruso", type: "hotel", location_text: "Amalfi Coast", price: "$1,450", rating: 4.9, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Amalfi Coast.", image: "hotel/h7.jpg", category: "Amalfi Luxury", tags: "hotel accommodation belmond hotel caruso amalfi luxury" },
    { name: "One&Only Reethi Rah", type: "hotel", location_text: "Maldives", price: "$2,200", rating: 5.0, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Maldives.", image: "hotel/h10.jpg", category: "Maldives Luxury", tags: "hotel accommodation one&only reethi rah maldives luxury" },
    { name: "Hotel de Paris Monte-Carlo", type: "hotel", location_text: "Monaco", price: "$1,900", rating: 4.8, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Monaco.", image: "hotel/h11.jpg", category: "Monaco Luxury", tags: "hotel accommodation hotel de paris monte-carlo monaco luxury" },
    { name: "Badrutt's Palace Hotel", type: "hotel", location_text: "St. Moritz", price: "$1,750", rating: 4.9, description: "Top-tier luxury accommodation bringing signature elegance and elite service to St. Moritz.", image: "hotel/h14.jpg", category: "St. Moritz Luxury", tags: "hotel accommodation badrutt's palace hotel st. moritz luxury" },
    { name: "Grand Hotel Tremezzo", type: "hotel", location_text: "Lake Como", price: "$1,350", rating: 4.8, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Lake Como.", image: "hotel/h15.jpg", category: "Lake Como Luxury", tags: "hotel accommodation grand hotel tremezzo lake como luxury" },
    { name: "Claridge's", type: "hotel", location_text: "London", price: "$1,100", rating: 4.7, description: "Top-tier luxury accommodation bringing signature elegance and elite service to London.", image: "hotel/h16.jpg", category: "London Luxury", tags: "hotel accommodation claridge's london luxury" },
    { name: "The Savoy", type: "hotel", location_text: "London", price: "$950", rating: 4.8, description: "Top-tier luxury accommodation bringing signature elegance and elite service to London.", image: "hotel/h17.jpg", category: "London Luxury", tags: "hotel accommodation the savoy london luxury" },
    { name: "Château Frontenac", type: "hotel", location_text: "Quebec City", price: "$850", rating: 4.7, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Quebec City.", image: "hotel/h20.jpg", category: "Quebec Luxury", tags: "hotel accommodation chateau frontenac quebec luxury" },
    { name: "Beverly Hills Hotel", type: "hotel", location_text: "Los Angeles", price: "$1,250", rating: 4.8, description: "Top-tier luxury accommodation bringing signature elegance and elite service to Los Angeles.", image: "hotel/h21.jpg", category: "Los Angeles Luxury", tags: "hotel accommodation beverly hills hotel los angeles luxury" },

    // Universities Dataset
    { name: "Harvard University", type: "university", location_text: "Cambridge, USA", price: "Free Tour", rating: 4.9, description: "Historic Ivy League institution known for academic excellence and historic brick campus.", image: "college/elite_college.png", category: "Education & Heritage", tags: "university college education study historic harvard university cambridge usa" },
    { name: "University of Oxford", type: "university", location_text: "Oxford, UK", price: "Free Tour", rating: 5.0, description: "The oldest university in the English-speaking world, featuring stunning gothic architecture.", image: "college/classic_gothic_university_1776062947121.png", category: "Education & Heritage", tags: "university college education study historic university of oxford oxford uk" },
    { name: "Stanford University", type: "university", location_text: "Stanford, USA", price: "Free Tour", rating: 4.9, description: "Lush Silicon Valley campus featuring modern tech laboratories and Spanish-colonial style arches.", image: "college/modern_university_building_1776062926866.png", category: "Education & Heritage", tags: "university college education study historic stanford university stanford usa" },
    { name: "MIT", type: "university", location_text: "Cambridge, USA", price: "Free Tour", rating: 4.8, description: "World leader in technological research with a striking futuristic and retro-modernist campus.", image: "college/col_tech_campus_1776063983293.png", category: "Education & Heritage", tags: "university college education study historic mit cambridge usa" },
    { name: "University of Cambridge", type: "university", location_text: "Cambridge, UK", price: "Free Tour", rating: 4.9, description: "Iconic historic clocktower, manicured lawns, and traditional collegiate structures by the river.", image: "college/historic_college_clocktower_1776063439029.png", category: "Education & Heritage", tags: "university college education study historic university of cambridge cambridge uk" },
    { name: "Indian Institute of Science", type: "university", location_text: "Bangalore, India", price: "Free Tour", rating: 4.7, description: "Elite research university surrounded by green canopies and classic heritage stone facades.", image: "college/col_indian_heritage_1776063716860.png", category: "Education & Heritage", tags: "university college education study historic indian institute of science bangalore india" },
    { name: "Sorbonne University", type: "university", location_text: "Paris, France", price: "Free Tour", rating: 4.8, description: "A prestigious historic campus in the heart of Paris with classic European vintage facades.", image: "college/col_vintage_facade_1776064004722.png", category: "Education & Heritage", tags: "university college education study historic sorbonne university paris france" },
    { name: "Kyoto University", type: "university", location_text: "Kyoto, Japan", price: "Free Tour", rating: 4.8, description: "A top national university known for scientific breakthroughs, combining tradition and innovation.", image: "college/classical_arts_college_1776063460377.png", category: "Education & Heritage", tags: "university college education study historic kyoto university kyoto japan" },

    // Forests Dataset
    { name: "Sagano Bamboo Forest", type: "forest", location_text: "Japan", price: "$15", rating: 4.9, description: "Wander through towering green stalks of bamboo whispering in the wind.", image: "nature/n1.jpg", category: "Wildlife & Nature", tags: "forest nature wildlife trees hiking wood sagano bamboo forest japan" },
    { name: "Black Forest", type: "forest", location_text: "Germany", price: "$25", rating: 4.8, description: "A mystical, dark pine canopy filled with folklore, hiking trails, and clear streams.", image: "nature/n2.jpg", category: "Wildlife & Nature", tags: "forest nature wildlife trees hiking wood black forest germany" },
    { name: "Urjanagar ECO Park", type: "forest", location_text: "India", price: "$5", rating: 4.7, description: "Serene lakeside forest paths and lush gardens tucked away in Mahagama.", image: "nature/n3.jpg", category: "Wildlife & Nature", tags: "forest nature wildlife trees hiking wood urjanagar eco park india" },
    { name: "Redwood National Park", type: "forest", location_text: "USA", price: "$35", rating: 4.9, description: "Marvel at some of the tallest and most ancient living tree giants on Earth.", image: "nature/n4.jpg", category: "Wildlife & Nature", tags: "forest nature wildlife trees hiking wood redwood national park usa" },
    { name: "Daintree Rainforest", type: "forest", location_text: "Australia", price: "$40", rating: 4.8, description: "Where the ancient jungle meets the white sands of the Coral Sea.", image: "nature/f5.jpg", category: "Wildlife & Nature", tags: "forest nature wildlife trees hiking wood daintree rainforest australia" },
    { name: "Amazon Jungle Trail", type: "forest", location_text: "Brazil", price: "$120", rating: 4.9, description: "Embark on a deep river expedition through the world's most biodiverse rainforest.", image: "nature/n6.jpg", category: "Wildlife & Nature", tags: "forest nature wildlife trees hiking wood amazon jungle trail brazil" },

    // Luxury Rides Dataset
    { name: "Tesla Model S Plaid", type: "ride", location_text: "Electric Sedan", price: "$299", rating: 4.9, description: "Specifications: 1,020 HP | 0-60 in 1.99s. Premium driving experience built for luxury travel.", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070", category: "Electric Sedan", tags: "car ride vehicle supercar transport drive tesla model s plaid electric sedan" },
    { name: "Lamborghini Aventador SVJ", type: "ride", location_text: "Supercar", price: "$899", rating: 5.0, description: "Specifications: 770 HP V12 | Max 217 mph. Premium driving experience built for luxury travel.", image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=2070", category: "Supercar", tags: "car ride vehicle supercar transport drive lamborghini aventador svj supercar" },
    { name: "Rolls-Royce Phantom", type: "ride", location_text: "Chauffeur Luxury", price: "$1,200", rating: 5.0, description: "Specifications: V12 | Starlight Headliner. Premium driving experience built for luxury travel.", image: "https://images.unsplash.com/photo-1631217818202-90ef4a851c58?q=80&w=2070", category: "Chauffeur Luxury", tags: "car ride vehicle supercar transport drive rolls-royce phantom chauffeur luxury" },
    { name: "Interstellar Lunar Rover", type: "ride", location_text: "Cosmic Expedition", price: "$25,000", rating: 4.9, description: "Specifications: Low-gravity suspension | Airless tires. Premium driving experience built for luxury travel.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072", category: "Cosmic Expedition", tags: "car ride vehicle supercar transport drive interstellar lunar rover cosmic expedition" },
    { name: "Cyber Hoverbike Concept", type: "ride", location_text: "Futuristic Glide", price: "$4,500", rating: 4.8, description: "Specifications: Dual thrusters | Autonomous stabilization. Premium driving experience built for luxury travel.", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070", category: "Futuristic Glide", tags: "car ride vehicle supercar transport drive cyber hoverbike concept futuristic glide" },

    // Jobs / Employment Dataset
    { name: "Software Engineer", type: "job", location_text: "Google - Mountain View, USA", price: "$150k - $220k / yr", rating: 4.8, description: "Build next-generation search algorithms, AI architectures, and cloud services.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072", category: "Technology", tags: "job employ employment tech software engineer developer google usa" },
    { name: "Data Scientist", type: "job", location_text: "OpenAI - San Francisco, USA", price: "$185k - $260k / yr", rating: 4.9, description: "Research, train, and deploy advanced multi-modal models and large-scale AI pipelines.", image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=2074", category: "Artificial Intelligence", tags: "job employ employment tech data scientist developer ai openai usa" },
    { name: "Product Designer", type: "job", location_text: "Apple - Cupertino, USA", price: "$140k - $210k / yr", rating: 4.9, description: "Craft highly intuitive user interfaces and sleek hardware-software ecosystem integrations.", image: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=2064", category: "Design", tags: "job employ employment tech product designer ui ux apple usa" },
    { name: "Investment Analyst", type: "job", location_text: "Goldman Sachs - London, UK", price: "$95k - $145k / yr", rating: 4.7, description: "Develop complex quantitative valuation models and drive global market strategies.", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070", category: "Finance", tags: "job employ employment finance analyst goldman sachs london uk" },
    { name: "Sustainability Lead", type: "job", location_text: "Patagonia - Ventura, USA", price: "$100k - $150k / yr", rating: 4.8, description: "Pioneer environmental impact policies and scale circular product life cycle designs.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070", category: "Sustainability", tags: "job employ employment environmental science sustainability patagonia usa" }
  ];

  // Dynamically seed Forests Dataset using correct nature image paths
  const existingNatureImages = [
    "nature/n1.jpg", "nature/n2.jpg", "nature/n3.jpg", "nature/n4.jpg", "nature/f5.jpg", "nature/n6.jpg",
    "nature/f1.jpg", "nature/f2.jpg", "nature/f4.jpg", "nature/f6.jpg", "nature/f7.jpg", "nature/f9.jpg",
    "nature/f10.jpg", "nature/f11.jpg", "nature/f12.jpg", "nature/f13.jpg", "nature/f14.jpg", "nature/f16.jpg",
    "nature/f17.jpg", "nature/f18.jpg", "nature/f19.jpg", "nature/f20.jpg", "nature/n21.jpg", "nature/f21.jpg",
    "nature/f22.jpg", "nature/n23.jpg", "nature/f23.jpg", "nature/n24.jpg", "nature/f24.jpg", "nature/f25.jpg",
    "nature/f26.jpg", "nature/f27.jpg", "nature/n32.jpg", "nature/n35.jpg", "nature/n36.jpg", "nature/n37.jpg",
    "nature/n39.jpg", "nature/n41.jpg", "nature/n42.jpg", "nature/n43.jpg", "nature/n44.jpg", "nature/n45.jpg",
    "nature/n46.jpg", "nature/n47.jpg", "nature/h48.jpg", "nature/n49.jpg"
  ];
  const forestLocations = [
    "Sherwood Forest", "Yakushima Forest", "Monteverde Cloud Forest", "Bwindi Impenetrable Forest",
    "Tongass National Forest", "Arashiyama Bamboo Grove", "Crooked Forest", "Aokigahara Forest",
    "Jiuzhaigou Valley Forest", "Congo Basin Jungle", "Taiga Boreal Forest", "Bialowieza Forest",
    "Waipoua Kauri Forest", "Eucalyptus Valley", "Great Bear Rainforest", "Valdivian Temperate Rainforest",
    "Tsingy Stone Forest", "Sundarbans Mangrove", "Dragon's Blood Forest", "Olympic Hoh Rain Forest",
    "Muir Redwoods Woods", "Tikal Jungle Trails", "Yosemite Valley Pines", "Daintree Ancient Woods",
    "Bako Coastal Forest", "Kinabalu Jungle", "Tarkine Wilderness", "Coconino Pine Forest",
    "Gila Wilderness Woods", "Pisgah Forest Reserve", "Shenandoah Woodlands", "Smoky Mountains Forest",
    "White Mountain Pines", "Green Mountain Canopy", "Black Hills Forest", "Eldorado National Forest",
    "Siskiyou Wilderness", "Tongass Wilderness", "Valdivian Evergreen Forest", "Kakadu Monsoon Forest",
    "Tsingy de Bemaraha Woods", "Knysna Forest"
  ];
  const forestTypes = [
    "Eco Lodge", "Canopy Retreat", "Jungle Pavilion", "Nature Sanctuary", 
    "Wilderness Chalet", "Bamboo Oasis", "Green Haven", "Trekking Base"
  ];
  const forestPrefixes = [
    "Imperial", "Royal", "Scenic", "Ancient", "Secret", "Whispering", "Emerald", "Mystical"
  ];
  const forestTemplates = [
    "Immerse yourself in the tranquility of {location}, featuring private eco-cabins, guided night safaris, and stunning canopy walk access.",
    "Unwind in a luxury green pavilion at {location}, surrounded by ancient trees, scenic hiking trails, and clear natural streams.",
    "A hidden oasis nestled in the woodlands of {location}, offering rustic elegance, local wildlife viewing, and organic dining.",
    "Explore the deep trails and diverse ecology of {location}, staying in premium forest chalets with panoramic nature views."
  ];

  for (let i = 7; i <= 48; i++) {
    const prefix = forestPrefixes[(i - 7) % forestPrefixes.length];
    const loc = forestLocations[(i - 7) % forestLocations.length];
    const type = forestTypes[(i * 3) % forestTypes.length];
    const name = `${prefix} ${loc} ${type}`;
    const description = forestTemplates[(i - 7) % forestTemplates.length].replace("{location}", loc);
    const priceVal = 15 + ((i * 19) % 150);
    const price = `$${priceVal}`;
    const rating = parseFloat((4.6 + ((i * 7) % 5) * 0.1).toFixed(1));
    const image = existingNatureImages[(i - 1) % existingNatureImages.length];
    const tags = `forest nature wildlife trees hiking wood ${loc.toLowerCase()} ${type.toLowerCase()} luxury`;

    initialDestinations.push({
      name: name,
      type: "forest",
      location_text: loc.split(" ")[0],
      price: price,
      rating: rating,
      description: description,
      image: image,
      category: "Wildlife & Nature",
      tags: tags
    });
  }

  // Dynamically seed Mountains Dataset
  const mountainLocations = [
    "Mont Blanc", "Matterhorn", "Mount Fuji", "Denali", "Aspen Peak", 
    "St. Moritz Peak", "Kitzbühel Ridge", "Cortina d'Ampezzo", "Chamonix Needle", 
    "Zermatt Pinnacle", "Whistler Summit", "Niseko Powder", "Vail Valley", 
    "Garmisch Crest", "Banff Heights", "Patagonia Spires", "Andean Ridge", 
    "Swiss Valley", "Dolomite Crags", "Himalayan Summit"
  ];
  const mountainTypes = [
    "Ultra-Luxe Chalet", "Summit Sanctuary", "Alpine Retreat", "Glacier Estate", 
    "Grand Lodge", "Horizon Villa", "Elite Refuge", "Peak Pavilion", 
    "Thermal Springs Oasis", "Starlight Cabin"
  ];
  const mountainPrefixes = [
    "The Royal", "Grand", "Elite", "Alpine", "Imperial", "Majestic", "Vanguard", "Summit", "Exclusive", "Pristine", "Sovereign", "Crestview"
  ];
  const mountainTemplates = [
    "Experience an ultra-luxury cabin stay at the foot of {peak}, featuring private heated outdoor pools, private butler service, and majestic snowy peak views.",
    "Embark on a guided high-altitude trekking expedition around {peak}, returning to a premium alpine suite with gourmet dining and thermal spa access.",
    "Nestled in the pristine powder of {peak}, this ski-in ski-out lodge offers panoramic summit views, stone fireplaces, and an exclusive champagne salon.",
    "A private mountaintop estate at {peak} combining rustic stone elegance with modern wellness centers, massage rooms, and helicopter access.",
    "Wander the scenic alpine trails of {peak} during the day, and relax in a signature glass-domed chalet designed for optimal northern lights and stargazing views.",
    "The pinnacle of high-altitude luxury at {peak}, offering customized climbing tours, indoor rock walls, and private chef-prepared menus."
  ];

  for (let i = 1; i <= 46; i++) {
    const prefix = mountainPrefixes[(i - 1) % mountainPrefixes.length];
    const loc = mountainLocations[(i - 1) % mountainLocations.length];
    const type = mountainTypes[(i * 7) % mountainTypes.length];
    const name = `${prefix} ${loc} ${type}`;
    const description = mountainTemplates[(i - 1) % mountainTemplates.length].replace("{peak}", loc);
    const priceVal = 1800 + ((i * 123) % 3500);
    const price = `$${priceVal.toLocaleString()} / person`;
    const rating = parseFloat((4.7 + ((i * 7) % 4) * 0.1).toFixed(1));
    const tags = `mountain peak range ski cabin trekking snow ${loc.toLowerCase()} ${type.toLowerCase()} luxury`;

    initialDestinations.push({
      name: name,
      type: "mountain",
      location_text: loc,
      price: price,
      rating: rating,
      description: description,
      image: `mountain/m${i}.jpg`,
      category: "Mountain",
      tags: tags
    });
  }

  // Dynamically seed Planets to match static HTML cards
  const spaceDestinations = [
    { name: "Luna Base Alpha", image: "planets/p1.jpg", tags: "moon space lunar gateway future" },
    { name: "Mars Olympus Dome", image: "planets/p2.jpg", tags: "mars space planet future" },
    { name: "Europa Subglacial Lodge", image: "planets/p3.png", tags: "europa space moon ocean ice future" },
    { name: "Titan Methane Haven", image: "planets/p4.jpg", tags: "titan space moon atmosphere methane future" },
    { name: "Venus Cloud Oasis", image: "planets/p5.jpg", tags: "venus space atmosphere cloud city future" },
    { name: "Enceladus Geyser Retreat", image: "planets/p6.jpg", tags: "enceladus space moon ice geyser future" },
    { name: "Mercury Sunshield Resort", image: "planets/p7.jpg", tags: "mercury space planet sun future" },
    { name: "Ceres Station Lounge", image: "planets/p8.jpg", tags: "ceres space asteroid future" },
    { name: "Ganymede Ice Dome", image: "planets/p9.jpg", tags: "ganymede space moon ice future" },
    { name: "Io Obsidian Chalet", image: "planets/p10.jpg", tags: "io space moon volcano lava future" },
    { name: "Neptune Windward Lodge", image: "planets/p11.jpg", tags: "neptune space planet wind storm future" },
    { name: "Uranus Sapphire Ring", image: "planets/p12.jpg", tags: "uranus space planet rings future" },
    { name: "Kepler Exoplanet Resort", image: "planets/p13.jpg", tags: "kepler space exoplanet goldilocks future" },
    { name: "Saturn Rings Observation", image: "planets/p14.jpg", tags: "saturn space planet rings future" },
    { name: "Titan Ocean Resort", image: "planets/p15.jpg", tags: "titan space moon methane ocean liquid future" },
    { name: "Mars Valles Vista", image: "planets/p16.jpg", tags: "mars space planet canyon vista future" },
    { name: "Alpha Centauri Outpost", image: "planets/p17.jpg", tags: "alphacentauri space deepspace stars future" },
    { name: "Jupiter Stormview Hub", image: "planets/p18.jpg", tags: "jupiter space planet gasgiant storm future" },
    { name: "Venus Sky City", image: "planets/p13.jpg", tags: "venus space floating cloud city atmosphere future" }
  ];

  const spaceDescriptions = [
    "Experience ultimate luxury on the Moon. Play low-gravity golf and watch Earthrise from your private crater suite.",
    "Unwind in a climate-controlled dome on the slopes of Olympus Mons, featuring simulated earth gravity and red desert vistas.",
    "Journey beneath Europa's thick ice crust to stay in a pressurized glass dome overlooking a bioluminescent alien ocean.",
    "A high-end sanctuary floating in Titan's nitrogen-rich atmosphere, offering liquid methane lake tours and organic sky views.",
    "Float high above the crushing Venusian surface in our state-of-the-art aerostat resort. Witness fiery sunsets in the clouds.",
    "Witness spectacular cryogenic geysers from a premium heated observatory on Saturn's most active icy moon.",
    "Relax behind giant electromagnetic heat shields in a luxury resort offering uninhibited views of solar flares.",
    "A luxury transit hub inside Ceres' hollowed-out asteroid core, featuring micro-gravity gardens and dining.",
    "Stay in a vast, magnetic-shielded ice cavern on Jupiter's largest moon, boasting indoor hot springs and gas giant views.",
    "Observe spectacular silicate volcanic eruptions from a safe, lead-shielded luxury chalet orbiting Io.",
    "Stay in a orbital station tethered high above Neptune's supersonic winds, witnessing neon-blue gas storms.",
    "Dine while orbiting Uranus' majestic dark rings in a luxury space yacht with panoramic sapphire views.",
    "Experience the ultimate long-distance cruise to Kepler-186f, staying in a dome surrounded by red-foliage forests.",
    "A multi-year luxury cruise to the outer solar system. Dine while orbiting the majestic rings of Saturn.",
    "Relax in an insulated submarine hotel floating in Titan's liquid ethane seas, featuring underwater sonar displays.",
    "Stay on the precipice of Valles Marineris, the solar system's grandest canyon, with private drone excursions.",
    "An ultra-exclusive interstellar outpost orbiting Alpha Centauri, offering tri-star solar sunrise views.",
    "Dine on gourmet molecular cuisine while suspended in a zero-gravity pod looking deep into Jupiter's Great Red Spot.",
    "Float in absolute elegance inside a luxury double-hulled airship nestled in the temperate upper clouds of Venus."
  ];

  const spacePrices = [
    "$8,500,000", "$12,000,000", "$25,000,000", "$18,500,000", "$45,000,000", 
    "$32,000,000", "$60,000,000", "$15,000,000", "$28,000,000", "$35,000,000", 
    "$75,000,000", "$90,000,000", "$110,000,000", "$150,000,000", "$55,000,000", 
    "$19,500,000", "$220,000,000", "$130,000,000", "$40,000,000"
  ];

  for (let i = 1; i <= 19; i++) {
    const sDest = spaceDestinations[i - 1];
    const rating = parseFloat((4.7 + ((i * 13) % 4) * 0.1).toFixed(1));
    initialDestinations.push({
      name: sDest.name,
      type: "destination",
      location_text: "Space",
      price: spacePrices[i - 1],
      rating: rating,
      description: spaceDescriptions[i - 1],
      image: sDest.image,
      category: "Interplanetary",
      tags: sDest.tags
    });
  }

  // Dynamically seed Beaches Dataset
  const beachLocations = [
    "Bora Bora", "Maldives", "Santorini", "Amalfi Coast", "Seychelles", 
    "Mykonos", "Fiji Islands", "Maui Hawaii", "St. Barts", "Capri", 
    "Ibiza", "Zanzibar", "St. Tropez", "Phuket", "Tahiti", 
    "Turks & Caicos", "Bahamas Out Islands", "Cabo San Lucas", "Sardinia", "Palawan"
  ];
  const beachTypes = [
    "Overwater Royal Villa", "Elite Private Cove", "Glass-Bottom Bungalow", "Sunset Beach Club", 
    "Azure Lagoon Retreat", "Oceanic Sanctuary", "Paradise Pavilion", "Coral Reef Estate", 
    "VIP Beachfront Lodge", "Whispering Sands Manor"
  ];
  const beachPrefixes = [
    "Royal", "Grand", "Elite", "Majestic", "Imperial", "Sovereign", "Pristine", "Vanguard", "Azure", "Golden", "Emerald", "Coral"
  ];
  const beachTemplates = [
    "An ultra-luxury overwater villa overlooking the crystal clear waters of {location}, featuring a private infinity pool and direct lagoon access.",
    "Escape to a secluded beachfront oasis in {location}, complete with private beach lounges, cabana dining, and custom yacht excursions.",
    "Unwind in a premium glass-bottom bungalow in {location}, surrounded by vibrant coral reefs, private outdoor showers, and bespoke butler service.",
    "Indulge in the ultimate coastal getaway at {location}, offering private white-sand beach access, luxury spa pavilions, and daily sunset cruises.",
    "A spectacular tropical estate in {location} featuring panoramic ocean views, infinity edge pools, and an exclusive open-air dining terrace.",
    "Savor signature gourmet cuisine and premium cocktails at a private beach club in {location}, nestled under swaying palms on pristine sands."
  ];

  for (let i = 1; i <= 62; i++) {
    if (i === 44) continue; // Skip missing image s44.jpg

    const prefix = beachPrefixes[(i - 1) % beachPrefixes.length];
    const loc = beachLocations[(i - 1) % beachLocations.length];
    const type = beachTypes[(i * 7) % beachTypes.length];
    const name = `${prefix} ${loc} ${type}`;
    const description = beachTemplates[(i - 1) % beachTemplates.length].replace("{location}", loc);
    const priceVal = 2500 + ((i * 187) % 5500);
    const price = `$${priceVal.toLocaleString()} / person`;
    const rating = parseFloat((4.7 + ((i * 11) % 4) * 0.1).toFixed(1));
    const tags = `beach ocean sea tropical lagoon island resort villa ${loc.toLowerCase()} ${type.toLowerCase()} luxury`;

    initialDestinations.push({
      name: name,
      type: "beach",
      location_text: loc,
      price: price,
      rating: rating,
      description: description,
      image: i === 2 ? "sea/s2.png" : `sea/s${i}.jpg`,
      category: "Sea-Beach",
      tags: tags
    });
  }

  for (const dest of initialDestinations) {
    const exists = await dbGet("SELECT id FROM destinations WHERE name = ? AND type = ?", [dest.name, dest.type]);
    if (exists) {
      await dbRun(
        "UPDATE destinations SET location_text = ?, price = ?, rating = ?, description = ?, image = ?, category = ?, data_location_tags = ? WHERE id = ?",
        [
          dest.location_text,
          dest.price,
          dest.rating,
          dest.description,
          dest.image,
          dest.category,
          dest.tags,
          exists.id
        ]
      );
    } else {
      await dbRun(
        "INSERT INTO destinations (name, type, location_text, price, rating, description, image, category, data_location_tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          dest.name,
          dest.type,
          dest.location_text,
          dest.price,
          dest.rating,
          dest.description,
          dest.image,
          dest.category,
          dest.tags
        ]
      );
    }
  }
  console.log("Destinations dataset check & seeding complete.");
};

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initializeDatabase
};
