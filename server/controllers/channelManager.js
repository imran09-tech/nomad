/**
 * =============================================================================
 * IMXX NOMAD — Channel Manager GDS Integration Layer
 * utils/channelManager.js
 *
 * Purpose:
 *   A self-contained, stateless adapter between the IMXX Nomad platform and
 *   any Channel Manager / GDS API (Cloudbeds, AxisRooms, SiteMinder, etc.).
 *
 *   This module owns three concerns:
 *     1. buildSearchPayload()  — translate our params → CM search format
 *     2. mapPropertyToNative() — transform raw CM JSON → our UI data structure
 *     3. applyMarkup()         — apply dynamic per-property pricing rules
 *     4. buildBookingPayload() — compile a confirmed booking to send back to CM
 *     5. generateBookingRef()  — produce a collision-resistant IMXX booking ref
 *
 *   All functions are pure (no I/O, no side effects) and independently testable.
 *
 * Channel Manager API spec modelled on (AxisRooms / Cloudbeds hybrid):
 *   POST /search         → returns array of property objects with rate plans
 *   POST /reservations   → creates a confirmed reservation (locks inventory)
 *   GET  /reservations/:id → retrieves confirmation status
 * =============================================================================
 */

'use strict';

const crypto = require('crypto');

// ── Pricing Constants ─────────────────────────────────────────────────────────

/**
 * Default IMXX platform markup multiplier applied to ALL channel manager net rates.
 * 1.12 → add a 12% markup on top of what we pay the CM (net rate).
 * This is distinct from the commission SPLIT on payout — see paymentSplitter.js.
 *
 * These are overrideable per-property via the CM's rate plan metadata.
 */
const DEFAULT_MARKUP_MULTIPLIER = parseFloat(process.env.CM_DEFAULT_MARKUP || '1.12');

/**
 * Minimum markup cap: even if the channel manager supplies a promo rate,
 * never display a price with less than 5% margin.
 */
const MINIMUM_MARKUP_MULTIPLIER = 1.05;

/**
 * Maximum markup cap: never show more than 40% above net rate (prevents
 * rate parity violations on most OTA contracts).
 */
const MAXIMUM_MARKUP_MULTIPLIER = 1.4;

// ── 1. SEARCH PAYLOAD BUILDER ─────────────────────────────────────────────────

/**
 * Translate IMXX Nomad search parameters into a Channel Manager API request body.
 *
 * CM-facing fields follow the AxisRooms/Cloudbeds JSON contract.
 * Our internal fields (camelCase) are mapped to CM snake_case conventions.
 *
 * @param {object} params
 * @param {string} params.destination    - City, region, or property name query
 * @param {string} params.checkInDate    - ISO 8601 date string 'YYYY-MM-DD'
 * @param {string} params.checkOutDate   - ISO 8601 date string 'YYYY-MM-DD'
 * @param {number} params.guests         - Number of adults (default: 1)
 * @param {string} [params.currency]     - Response currency code (default: USD)
 * @param {number} [params.maxResults]   - Page size cap (default: 40)
 * @param {string} [params.propertyType] - 'hostel'|'hotel'|'guesthouse'|'all'
 * @returns {object} CM-format search request body
 */
function buildSearchPayload(params) {
  const {
    destination,
    checkInDate,
    checkOutDate,
    guests = 1,
    currency = 'USD',
    maxResults = 40,
    propertyType = 'all',
  } = params;

  // ── Date validation ────────────────────────────────────────────────────────
  const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!ISO_DATE_RE.test(checkInDate)) throw new Error('checkInDate must be YYYY-MM-DD');
  if (!ISO_DATE_RE.test(checkOutDate)) throw new Error('checkOutDate must be YYYY-MM-DD');

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) throw new Error('checkInDate cannot be in the past');
  if (checkOut <= checkIn) throw new Error('checkOutDate must be after checkInDate');

  const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  // ── Guest count validation ─────────────────────────────────────────────────
  const guestCount = parseInt(guests, 10);
  if (isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
    throw new Error('guests must be between 1 and 20');
  }

  return {
    // CM API envelope
    api_version: '2.1',
    request_id: crypto.randomUUID(),
    channel: 'IMXX_NOMAD',

    // Search criteria (CM snake_case format)
    search: {
      destination: destination.trim(),
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      nights,
      guests: {
        adults: guestCount,
        children: 0,
      },
      property_types:
        propertyType === 'all'
          ? ['hostel', 'hotel', 'guesthouse', 'villa', 'apartment']
          : [propertyType],
      currency_code: currency.toUpperCase(),
      max_results: Math.min(maxResults, 100),
      include_unavailable: false,
    },
  };
}

// ── 2. DATA MAPPING ENGINE ────────────────────────────────────────────────────

/**
 * Map a single raw Channel Manager property object to the IMXX Nomad
 * native UI data structure.
 *
 * This function is the critical schema bridge between the CM's inconsistent
 * field naming and our clean frontend data model.
 *
 * @param {object}  rawProperty - A single property object from the CM API response
 * @param {object}  options
 * @param {number}  options.nights      - Number of nights (for price computation)
 * @param {number}  options.guests      - Guest count (passed through to UI)
 * @param {string}  options.checkInDate
 * @param {string}  options.checkOutDate
 * @returns {object} IMXX Nomad native property object (ready for frontend)
 */
function mapPropertyToNative(rawProperty, options = {}) {
  const { nights = 1, guests = 1, checkInDate = '', checkOutDate = '' } = options;

  // ── Defensive access helpers ───────────────────────────────────────────────
  const safe = (val, fallback = '') => (val !== null && val !== undefined ? val : fallback);
  const safeN = (val, fallback = 0) => (typeof val === 'number' && isFinite(val) ? val : fallback);
  const safeArr = (val) => (Array.isArray(val) ? val : []);

  // ── Property Identity ──────────────────────────────────────────────────────
  const propertyId = safe(
    rawProperty.property_id || rawProperty.id,
    `cm-${crypto.randomBytes(4).toString('hex')}`
  );
  const propertyName = safe(
    rawProperty.property_name || rawProperty.name || rawProperty.title,
    'Unnamed Property'
  );

  // ── Location Block ─────────────────────────────────────────────────────────
  const loc = rawProperty.location || rawProperty.address || {};
  const location = {
    city: safe(loc.city || rawProperty.city || rawProperty.destination),
    country: safe(loc.country || rawProperty.country),
    countryCode: safe(loc.country_code || rawProperty.country_code),
    region: safe(loc.region || rawProperty.region),
    fullAddress: safe(loc.full_address || loc.address || rawProperty.address_line),
    coordinates: {
      lat: safeN(loc.latitude || rawProperty.lat),
      lng: safeN(loc.longitude || rawProperty.lng),
    },
  };

  // ── Imagery Array ──────────────────────────────────────────────────────────
  // CM APIs return images in many inconsistent structures — we normalise all.
  let rawImages = [];
  if (Array.isArray(rawProperty.images)) {
    rawImages = rawProperty.images;
  } else if (Array.isArray(rawProperty.photos)) {
    rawImages = rawProperty.photos;
  } else if (rawProperty.hero_image) {
    rawImages = [{ url: rawProperty.hero_image, caption: propertyName, is_hero: true }];
  }

  const images = rawImages
    .map((img, idx) => ({
      url: safe(img.url || img.src || img.link),
      caption: safe(img.caption || img.alt || img.title || `${propertyName} — Photo ${idx + 1}`),
      isHero: !!(img.is_hero || img.is_primary || idx === 0),
      width: safeN(img.width, 1920),
      height: safeN(img.height, 1080),
    }))
    .filter((img) => img.url); // remove any entries with no URL

  // Ensure there is always at least one hero image fallback
  if (images.length === 0) {
    images.push({
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(propertyName)}&size=800&background=c9a44d&color=0d0f1e`,
      caption: propertyName,
      isHero: true,
    });
  }

  // ── Rating & Review Block ──────────────────────────────────────────────────
  const ratingRaw = rawProperty.rating || rawProperty.star_rating || rawProperty.review_score || {};
  const ratingValue =
    typeof ratingRaw === 'number'
      ? ratingRaw
      : safeN(ratingRaw.overall || ratingRaw.value || ratingRaw.score);

  // Normalize to 0-5 scale (some CMs use 0-10 or 0-100)
  const ratingNormalised =
    ratingValue > 10
      ? parseFloat((ratingValue / 20).toFixed(1)) // 0-100 → 0-5
      : ratingValue > 5
        ? parseFloat((ratingValue / 2).toFixed(1)) // 0-10  → 0-5
        : parseFloat(ratingValue.toFixed(1)); // already 0-5

  const reviewCount = safeN(rawProperty.review_count || rawProperty.num_reviews || ratingRaw.count);

  // ── Amenities Normalisation ────────────────────────────────────────────────
  const rawAmenities = safeArr(
    rawProperty.amenities || rawProperty.facilities || rawProperty.features
  );
  const amenities = rawAmenities
    .map((a) => (typeof a === 'string' ? a : safe(a.name || a.label || a.description)))
    .filter(Boolean);

  // ── Room Types (Rate Plans) ────────────────────────────────────────────────
  const rawRooms = safeArr(rawProperty.room_types || rawProperty.rate_plans || rawProperty.rooms);

  const roomTypes = rawRooms.map((room) => {
    const netRate = safeN(room.net_rate || room.rate || room.price || room.base_price);
    const { displayPrice, markup, netRateUsed } = applyMarkup(netRate, rawProperty);

    return {
      id: safe(room.room_type_id || room.id),
      name: safe(room.room_type_name || room.name || room.type, 'Standard Room'),
      description: safe(room.description || room.room_description),
      maxOccupancy: safeN(room.max_occupancy || room.capacity, guests),
      bedConfiguration: safe(room.bed_type || room.bed_configuration, 'Standard Bed'),
      netRatePerNight: netRate, // what we pay CM (hidden from user)
      displayPricePerNight: displayPrice, // what user sees (includes markup)
      totalDisplayPrice: parseFloat((displayPrice * nights).toFixed(2)),
      markupApplied: markup,
      available: !!(room.is_available !== false && room.available !== false),
      cancellationPolicy: safe(
        room.cancellation_policy || rawProperty.cancellation_policy,
        'Standard'
      ),
      mealPlan: safe(room.meal_plan || room.board_type, 'Room Only'),
      remainingRooms: safeN(room.rooms_available || room.remaining_inventory, null),
    };
  });

  // Compute the "hero" price for the search results card (cheapest available room)
  const availableRooms = roomTypes.filter((r) => r.available);
  const heroRoom =
    availableRooms.sort((a, b) => a.displayPricePerNight - b.displayPricePerNight)[0] || null;
  const heroDisplayPrice = heroRoom ? heroRoom.displayPricePerNight : null;

  // ── Policies Block ─────────────────────────────────────────────────────────
  const policies = rawProperty.policies || {};

  // ── Assembled Native Object ────────────────────────────────────────────────
  return {
    // Identity
    id: `gds-${propertyId}`,
    externalId: propertyId,
    source: 'channel_manager',
    name: propertyName,
    slug: propertyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),

    // Location
    location,

    // Imagery
    images,
    heroImage: images.find((i) => i.isHero) || images[0],

    // Rating
    rating: ratingNormalised,
    reviewCount,
    starRating: safeN(rawProperty.star_rating || rawProperty.stars),

    // Pricing (display-ready)
    pricePerNight: heroDisplayPrice,
    currency: safe(rawProperty.currency || rawProperty.currency_code, 'USD'),
    isAvailable: availableRooms.length > 0,

    // Room types (full detail for booking modal)
    roomTypes,

    // Amenities
    amenities,

    // Search context (echoed back for client-side use)
    searchContext: { checkInDate, checkOutDate, nights, guests },

    // Policies
    policies: {
      checkIn: safe(policies.check_in_time || rawProperty.check_in_time, '14:00'),
      checkOut: safe(policies.check_out_time || rawProperty.check_out_time, '11:00'),
      cancellation: safe(policies.cancellation || rawProperty.cancellation_policy),
      deposit: safe(policies.deposit || rawProperty.deposit_policy),
      minAge: safeN(policies.minimum_age || rawProperty.minimum_age, 18),
    },

    // CM metadata (for outbound reservation POST)
    _cm: {
      channelPropertyId: propertyId,
      channelCode: safe(rawProperty.channel_code || rawProperty.source_channel),
      rateKey: safe(rawProperty.rate_key || rawProperty.channel_rate_id),
    },
  };
}

// ── 3. DYNAMIC MARKUP ENGINE ──────────────────────────────────────────────────

/**
 * Apply IMXX platform markup to a Channel Manager net rate.
 *
 * Business Rules (in priority order):
 *  1. If the CM provides an explicit `imxx_markup_multiplier` in its response
 *     metadata, use that (partner-negotiated override).
 *  2. If the CM provides a `suggested_sell_rate`, use it directly (already
 *     includes their own margin suggestion).
 *  3. Otherwise, apply DEFAULT_MARKUP_MULTIPLIER (1.12 = +12%).
 *
 * All results are clamped to [MINIMUM_MARKUP_MULTIPLIER, MAXIMUM_MARKUP_MULTIPLIER]
 * to avoid pricing violations.
 *
 * Arithmetic is integer-cent safe to prevent floating-point drift.
 *
 * @param {number}  netRate     - CM net rate per night (what we pay, in USD)
 * @param {object}  rawProperty - Full raw CM property object (for override extraction)
 * @returns {{ displayPrice: number, markup: number, netRateUsed: number }}
 */
function applyMarkup(netRate, rawProperty = {}) {
  if (!netRate || netRate <= 0) {
    return { displayPrice: 0, markup: DEFAULT_MARKUP_MULTIPLIER, netRateUsed: 0 };
  }

  let multiplier = DEFAULT_MARKUP_MULTIPLIER;

  // Rule 1: Partner-negotiated override in CM response
  const partnerOverride = parseFloat(rawProperty.imxx_markup_multiplier || 0);
  if (partnerOverride >= MINIMUM_MARKUP_MULTIPLIER) {
    multiplier = partnerOverride;
  }

  // Rule 2: CM-suggested sell rate takes full priority if present
  const suggestedSell = parseFloat(rawProperty.suggested_sell_rate || 0);
  if (suggestedSell > 0 && suggestedSell >= netRate) {
    const impliedMultiplier = suggestedSell / netRate;
    multiplier = impliedMultiplier;
  }

  // Clamp to business bounds
  multiplier = Math.max(MINIMUM_MARKUP_MULTIPLIER, Math.min(MAXIMUM_MARKUP_MULTIPLIER, multiplier));

  // Integer-cent arithmetic to prevent float drift
  const netCents = Math.round(netRate * 100);
  const displayCents = Math.round(netCents * multiplier);
  const displayPrice = parseFloat((displayCents / 100).toFixed(2));

  return {
    displayPrice, // shown to user
    markup: parseFloat(multiplier.toFixed(4)), // multiplier used
    netRateUsed: netRate, // what we pay CM (internal)
  };
}

// ── 4. BOOKING CONFIRMATION PAYLOAD BUILDER ───────────────────────────────────

/**
 * Compile the full reservation payload to POST back to the Channel Manager
 * when a user confirms a booking on IMXX Nomad.
 *
 * This locks the room in the CM's inventory system, preventing double-booking.
 *
 * @param {object} params
 * @param {object} params.property       - Mapped native property object (from mapPropertyToNative)
 * @param {object} params.roomType       - The specific room type being booked
 * @param {object} params.customer       - Verified customer data from req.user
 * @param {string} params.checkInDate
 * @param {string} params.checkOutDate
 * @param {number} params.guests
 * @param {string} params.imxxBookingRef - Our internal booking reference
 * @param {string} params.paymentIntentId - Stripe PaymentIntent ID (proof of payment)
 * @param {object} [params.specialRequests]
 * @returns {object} CM-format reservation creation payload
 */
function buildBookingPayload(params) {
  const {
    property,
    roomType,
    customer,
    checkInDate,
    checkOutDate,
    guests,
    imxxBookingRef,
    paymentIntentId,
    specialRequests = {},
  } = params;

  const nights = Math.round(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );

  return {
    // CM API envelope
    api_version: '2.1',
    request_id: crypto.randomUUID(),
    channel: 'IMXX_NOMAD',
    request_type: 'CREATE_RESERVATION',

    // Property & room identifiers (CM's own IDs)
    property_id: property._cm.channelPropertyId,
    channel_code: property._cm.channelCode,
    rate_key: property._cm.rateKey || roomType.id,
    room_type_id: roomType.id,

    // Stay details
    reservation: {
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      nights,
      adults: guests,
      children: 0,
    },

    // Guest (pii limited — never send password hash or JWT)
    guest: {
      first_name: customer.full_name?.split(' ')[0] || customer.username,
      last_name: customer.full_name?.split(' ').slice(1).join(' ') || '',
      email: customer.email,
      phone: customer.phone || null,
      nationality: customer.country || null,
      language: 'en',
    },

    // Pricing (CM validates net rate integrity)
    pricing: {
      currency: property.currency,
      net_rate_per_night: roomType.netRatePerNight,
      total_net: parseFloat((roomType.netRatePerNight * nights).toFixed(2)),
      total_sell: roomType.totalDisplayPrice,
      markup_applied: roomType.markupApplied,
    },

    // IMXX booking reference (their system echoes this back in webhook)
    partner_reference: imxxBookingRef,

    // Payment proof (CM verifies we have collected before confirming)
    payment: {
      method: 'stripe_payment_intent',
      stripe_pi_id: paymentIntentId,
      amount_collected: roomType.totalDisplayPrice,
      currency: property.currency,
    },

    // Special requests (optional)
    special_requests: {
      early_check_in: !!specialRequests.earlyCheckIn,
      late_check_out: !!specialRequests.lateCheckOut,
      notes: specialRequests.notes || '',
    },
  };
}

// ── 5. BOOKING REFERENCE GENERATOR ───────────────────────────────────────────

/**
 * Generate a collision-resistant, human-readable IMXX booking reference.
 * Format: IMXX-YYYYMMDD-{6 random uppercase chars}
 * Example: IMXX-20260611-A3KX9Q
 *
 * Prefixing with the date makes references sortable and debuggable by support.
 *
 * @returns {string}
 */
function generateBookingRef() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `IMXX-${today}-${rand}`;
}

// ── 6. MOCK CHANNEL MANAGER SIMULATOR ────────────────────────────────────────

/**
 * Simulate a Channel Manager API response for development / test environments.
 *
 * In production, this is replaced by a real HTTP call to Cloudbeds/AxisRooms.
 * The structure matches the AxisRooms V2 search response schema.
 *
 * @param {object} searchPayload - Output of buildSearchPayload()
 * @returns {object} Simulated CM response body
 */
function simulateCMSearchResponse(searchPayload) {
  const dest = searchPayload.search.destination;
  const nights = searchPayload.search.nights;
  const guests = searchPayload.search.guests.adults;
  const currency = searchPayload.search.currency_code;

  // Simulate slight network delay awareness (caller handles actual delay)
  const properties = [
    {
      property_id: 'cm-prop-001',
      property_name: `The ${dest} Nomad Boutique Hostel`,
      city: dest,
      country: 'Varies',
      country_code: 'XX',
      star_rating: 4,
      currency: currency,
      cancellation_policy: 'Free cancellation up to 48 hours before check-in',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
          caption: 'Common Lounge',
          is_hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
          caption: 'Dorm Room',
        },
        {
          url: 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=1200',
          caption: 'Rooftop Terrace',
        },
      ],
      amenities: [
        'Free Wi-Fi',
        'Shared Kitchen',
        '24/7 Reception',
        'Rooftop Terrace',
        'Luggage Storage',
        'Lockers',
      ],
      rating: { overall: 4.6, count: 312 },
      rating_score: 4.6,
      review_count: 312,
      room_types: [
        {
          id: 'rm-001-dorm-6',
          name: `${guests > 1 ? 'Premium' : 'Standard'} Dorm Bed (6-Bed)`,
          description:
            'Curated shared dorm with privacy curtains, personal reading light, and individual power sockets.',
          max_occupancy: 1,
          bed_type: 'Single bed in shared room',
          net_rate: 22.0 + nights * 0.5,
          is_available: true,
          cancellation_policy: 'Free cancellation 48h prior',
          meal_plan: 'Room Only',
          rooms_available: 8,
        },
        {
          id: 'rm-001-pvt-twin',
          name: 'Private Twin Room',
          description:
            'Cozy private room with two single beds, ensuite bathroom, and city-view window.',
          max_occupancy: 2,
          bed_type: 'Two single beds',
          net_rate: 54.0,
          is_available: true,
          cancellation_policy: 'Free cancellation 48h prior',
          meal_plan: 'Bed & Breakfast',
          rooms_available: 3,
        },
      ],
      policies: {
        check_in_time: '14:00',
        check_out_time: '11:00',
        minimum_age: 18,
      },
    },
    {
      property_id: 'cm-prop-002',
      property_name: `${dest} Skyline Hostel & Rooftop Bar`,
      city: dest,
      country: 'Varies',
      country_code: 'XX',
      star_rating: 4,
      currency: currency,
      cancellation_policy: 'Non-refundable',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
          caption: 'Rooftop Bar',
          is_hero: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
          caption: 'Suite',
        },
      ],
      amenities: [
        'Rooftop Bar',
        'Free Wi-Fi',
        'Pool Access',
        'Airport Shuttle',
        'Concierge',
        'Spa Access',
      ],
      rating: { overall: 4.8, count: 187 },
      rating_score: 4.8,
      review_count: 187,
      imxx_markup_multiplier: 1.15, // partner-negotiated 15% markup
      room_types: [
        {
          id: 'rm-002-lux-dorm',
          name: 'Luxury Pod Dorm',
          description:
            'Japanese-style sleeping pod with blackout blind, 32" in-pod screen, and USB-C charging.',
          max_occupancy: 1,
          bed_type: 'Premium pod',
          net_rate: 38.0,
          is_available: true,
          cancellation_policy: 'Non-refundable',
          meal_plan: 'Room Only',
          rooms_available: 14,
        },
        {
          id: 'rm-002-suite',
          name: 'Executive Suite',
          description:
            'Full private suite with king bed, rain shower, and panoramic skyline views.',
          max_occupancy: 2,
          bed_type: 'King bed',
          net_rate: 120.0,
          is_available: guests <= 2,
          cancellation_policy: 'Non-refundable',
          meal_plan: 'Bed & Breakfast',
          rooms_available: 2,
        },
      ],
      policies: {
        check_in_time: '15:00',
        check_out_time: '12:00',
        minimum_age: 21,
      },
    },
    {
      property_id: 'cm-prop-003',
      property_name: `${dest} Social Hostel & Co-Work`,
      city: dest,
      country: 'Varies',
      country_code: 'XX',
      star_rating: 3,
      currency: currency,
      cancellation_policy: 'Free cancellation up to 72 hours before check-in',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200',
          caption: 'Co-Working Space',
          is_hero: true,
        },
      ],
      amenities: [
        'Co-Working Space',
        'Free Wi-Fi 500Mbps',
        'Meeting Rooms',
        'Espresso Bar',
        'Events Program',
      ],
      rating: { overall: 4.4, count: 529 },
      review_count: 529,
      room_types: [
        {
          id: 'rm-003-mixed-dorm',
          name: 'Budget Mixed Dorm (10-Bed)',
          description: 'Friendly mixed dorm for budget travellers, clean and centrally located.',
          max_occupancy: 1,
          bed_type: 'Single bed in shared room',
          net_rate: 16.5,
          is_available: true,
          cancellation_policy: 'Free cancellation 72h prior',
          meal_plan: 'Room Only',
          rooms_available: 20,
        },
        {
          id: 'rm-003-female-dorm',
          name: 'Female-Only Dorm (4-Bed)',
          description: 'Secure female-only dorm with private bathroom and vanity mirror area.',
          max_occupancy: 1,
          bed_type: 'Single bed in female-only room',
          net_rate: 21.0,
          is_available: true,
          cancellation_policy: 'Free cancellation 72h prior',
          meal_plan: 'Room Only',
          rooms_available: 4,
        },
      ],
      policies: {
        check_in_time: '13:00',
        check_out_time: '10:00',
        minimum_age: 18,
      },
    },
  ];

  return {
    status: 'success',
    request_id: searchPayload.request_id,
    destination: dest,
    results: properties.length,
    currency: currency,
    properties,
  };
}

// ── 7. COMMISSION LOG BUILDER (for payout cycle) ──────────────────────────────

/**
 * Build a commission event record to be stored in hostel_payout_ledger.
 * Called immediately after a successful CM reservation is confirmed.
 *
 * Commission here = difference between the sell price we collected from the
 * user and the net rate we owe the channel manager.
 *
 * @param {object} params
 * @param {object} params.nativeProperty - mapPropertyToNative() result
 * @param {object} params.roomType       - chosen room type from nativeProperty.roomTypes
 * @param {number} params.nights
 * @param {string} params.imxxBookingRef
 * @param {string} params.cmConfirmationId - Reference from CM's confirmation response
 * @param {number} params.hostelOwnerId    - IMXX DB hostel_owners.id
 * @returns {object} ledger-ready commission record
 */
function buildCommissionRecord(params) {
  const { nativeProperty, roomType, nights, imxxBookingRef, cmConfirmationId, hostelOwnerId } =
    params;

  const totalSell = parseFloat((roomType.displayPricePerNight * nights).toFixed(2));
  const totalNet = parseFloat((roomType.netRatePerNight * nights).toFixed(2));
  const commission = parseFloat((totalSell - totalNet).toFixed(2));

  return {
    booking_ref: imxxBookingRef,
    cm_confirmation_id: cmConfirmationId,
    hostel_owner_id: hostelOwnerId,
    property_id: nativeProperty.externalId,
    property_name: nativeProperty.name,
    room_type_id: roomType.id,
    room_type_name: roomType.name,
    nights,
    net_rate_per_night: roomType.netRatePerNight,
    sell_price_per_night: roomType.displayPricePerNight,
    total_sell: totalSell,
    total_net_owed_to_cm: totalNet,
    imxx_gross_commission: commission,
    markup_multiplier: roomType.markupApplied,
    payout_cycle: 'monthly',
    commission_status: 'accruing', // → 'paid' at monthly cycle close
    recorded_at: new Date().toISOString(),
  };
}

// ── EXPORTS ───────────────────────────────────────────────────────────────────

module.exports = {
  buildSearchPayload,
  mapPropertyToNative,
  applyMarkup,
  buildBookingPayload,
  buildCommissionRecord,
  generateBookingRef,
  simulateCMSearchResponse,
  // Constants (exported for tests and route files)
  DEFAULT_MARKUP_MULTIPLIER,
  MINIMUM_MARKUP_MULTIPLIER,
  MAXIMUM_MARKUP_MULTIPLIER,
};
