/**
 * =============================================================================
 * IMXX NOMAD — Live Property Search Router
 * routes/properties.js
 *
 * Mounts at: GET /api/properties/search
 *
 * Responsibility:
 *   Receive a search query from the IMXX frontend, forward it to the Channel
 *   Manager (CM) API, apply IMXX markup, map the response to our native data
 *   structure, and return a clean, cacheable JSON response to the client.
 *
 * Architecture notes:
 *   - Uses the dependency-injection init() pattern (same as vendors.js).
 *   - The actual HTTP call to the CM is isolated in callChannelManagerSearch().
 *     In development mode, it falls back to the built-in mock simulator.
 *   - Results are cached in memory for CM_CACHE_TTL_MS to avoid hammering the
 *     CM API with identical queries (important for paid-per-call APIs like
 *     Cloudbeds Pro and SiteMinder).
 *   - ALL validation happens here before the CM is contacted — never trust
 *     client input to reach the CM directly.
 * =============================================================================
 */

'use strict';

const express = require('express');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const router = express.Router();

const {
  buildSearchPayload,
  mapPropertyToNative,
  simulateCMSearchResponse,
} = require('../controllers/channelManager');

// ── Dependency injection (filled by init()) ───────────────────────────────────
let authenticateToken, dbRun, dbGet, dbAll;

function init(deps) {
  authenticateToken = deps.authenticateToken;
  dbRun = deps.dbRun;
  dbGet = deps.dbGet;
  dbAll = deps.dbAll;
}

const requireAuth = (req, res, next) => {
  if (authenticateToken) return authenticateToken(req, res, next);
  next(new Error('authenticateToken not initialized'));
};

// ── In-Memory Search Cache ─────────────────────────────────────────────────────
// Key: SHA-256 of the search parameters string
// Value: { data: [...], cachedAt: timestamp }
const searchCache = new Map();
const CM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params) {
  const normalized = JSON.stringify({
    destination: (params.destination || '').toLowerCase().trim(),
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    guests: parseInt(params.guests, 10) || 1,
    propertyType: params.propertyType || 'all',
    currency: (params.currency || 'USD').toUpperCase(),
  });
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

function getCached(key) {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CM_CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return entry;
}

function setCache(key, data) {
  // Evict oldest entries if cache grows too large (memory guard)
  if (searchCache.size >= 100) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
  searchCache.set(key, { data, cachedAt: Date.now() });
}

// ── Channel Manager HTTP Client ───────────────────────────────────────────────

/**
 * Make an HTTP POST request to the Channel Manager search endpoint.
 *
 * In PRODUCTION:
 *   - Set CM_API_BASE_URL in .env to the real CM endpoint
 *   - Set CM_API_KEY and CM_API_SECRET for auth
 *   - The CM_MOCK_MODE env var must be absent or 'false'
 *
 * In DEVELOPMENT / when CM_MOCK_MODE=true:
 *   - Returns simulateCMSearchResponse() output immediately (no network call)
 *   - Adds a simulated 120-400ms latency to mimic real API behaviour
 *
 * @param {object} searchPayload - Output of buildSearchPayload()
 * @returns {Promise<object>} Raw CM API response body
 */
async function callChannelManagerSearch(searchPayload) {
  const useMock = process.env.CM_MOCK_MODE !== 'false'; // default: mock mode ON

  if (useMock) {
    // Simulated latency (realistic dev experience)
    const latency = 120 + Math.random() * 280;
    await new Promise((r) => setTimeout(r, latency));
    console.log(
      `[CM] Mock search for "${searchPayload.search.destination}" (${latency.toFixed(0)}ms simulated)`
    );
    return simulateCMSearchResponse(searchPayload);
  }

  // ── Production HTTP call ─────────────────────────────────────────────────
  const CM_BASE_URL = process.env.CM_API_BASE_URL;
  const CM_API_KEY = process.env.CM_API_KEY;
  const CM_SECRET = process.env.CM_API_SECRET;

  if (!CM_BASE_URL || !CM_API_KEY) {
    throw new Error(
      '[CM] CM_API_BASE_URL and CM_API_KEY must be set in .env when CM_MOCK_MODE=false'
    );
  }

  // HMAC signature for request authentication (AxisRooms/Cloudbeds pattern)
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', CM_SECRET || '')
    .update(timestamp + JSON.stringify(searchPayload))
    .digest('hex');

  const body = JSON.stringify(searchPayload);
  const url = new URL('/api/v2/search', CM_BASE_URL);
  const lib = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'X-API-Key': CM_API_KEY,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
          'X-Channel': 'IMXX_NOMAD',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
        },
        timeout: 12000, // 12s timeout — CM APIs can be slow
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode >= 400) {
              reject(new Error(`[CM] API error ${res.statusCode}: ${parsed.message || raw}`));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(`[CM] Invalid JSON response: ${raw.slice(0, 200)}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('[CM] Search request timed out after 12 seconds'));
    });

    req.on('error', (err) => reject(new Error(`[CM] Network error: ${err.message}`)));
    req.write(body);
    req.end();
  });
}

// ── ROUTE: GET /api/properties/search ────────────────────────────────────────
//
// Query Parameters:
//   destination   string  required  e.g. "Bali"
//   checkInDate   string  required  e.g. "2026-07-15" (YYYY-MM-DD)
//   checkOutDate  string  required  e.g. "2026-07-18"
//   guests        number  optional  default: 1
//   currency      string  optional  default: "USD"
//   propertyType  string  optional  "hostel"|"hotel"|"guesthouse"|"all"
//   noCache       boolean optional  "true" forces bypass of 5-min cache
//   sortBy        string  optional  "price_asc"|"price_desc"|"rating_desc"
//   maxPrice      number  optional  max displayPricePerNight filter
//
// Response 200:
//   {
//     properties: [...],    // Array of mapped native property objects
//     total: number,        // Total matching results from CM
//     searchContext: {...},  // Echoed search parameters
//     servedFromCache: bool, // Whether this came from in-memory cache
//     responseTimeMs: number
//   }
// ─────────────────────────────────────────────────────────────────────────────

router.get('/search', async (req, res, next) => {
  const startTime = Date.now();

  // ── 1. Extract & Validate Query Parameters ────────────────────────────────
  const {
    destination,
    checkInDate,
    checkOutDate,
    guests = '1',
    currency = 'USD',
    propertyType = 'all',
    noCache = 'false',
    sortBy = 'rating_desc',
    maxPrice,
    minRating,
  } = req.query;

  // Required fields
  if (!destination || destination.trim().length < 2) {
    return res.status(400).json({ error: 'destination is required (minimum 2 characters).' });
  }

  if (!checkInDate || !checkOutDate) {
    return res
      .status(400)
      .json({ error: 'Both checkInDate and checkOutDate are required (YYYY-MM-DD).' });
  }

  // ── 2. Check In-Memory Cache ──────────────────────────────────────────────
  const cacheKey = getCacheKey(req.query);
  const forcedNoCache = noCache === 'true';

  if (!forcedNoCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`[Properties] Cache HIT for key ${cacheKey} (${destination})`);
      return res.json({
        ...cached.data,
        servedFromCache: true,
        cacheAgeMs: Date.now() - cached.cachedAt,
        responseTimeMs: Date.now() - startTime,
      });
    }
  }

  // ── 3. Build CM Search Payload ────────────────────────────────────────────
  let searchPayload;
  try {
    searchPayload = buildSearchPayload({
      destination: destination.trim(),
      checkInDate: checkInDate.trim(),
      checkOutDate: checkOutDate.trim(),
      guests: parseInt(guests, 10) || 1,
      currency: currency.toUpperCase(),
      propertyType,
      maxResults: 50,
    });
  } catch (validationErr) {
    return res.status(400).json({ error: validationErr.message });
  }

  // ── 4. Call Channel Manager ───────────────────────────────────────────────
  let cmResponse;
  try {
    cmResponse = await callChannelManagerSearch(searchPayload);
  } catch (cmErr) {
    console.error('[Properties] Channel Manager call failed:', cmErr.message);
    // Return a degraded response rather than crashing — UX can show "no results"
    return res.status(503).json({
      error: 'Inventory service temporarily unavailable. Please try again shortly.',
      code: 'CM_UNAVAILABLE',
      retryIn: 30,
    });
  }

  // ── 5. Map Raw CM Data → Native Properties ────────────────────────────────
  const nights = Math.round(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );
  const guestCount = parseInt(guests, 10) || 1;

  const rawProperties = Array.isArray(cmResponse.properties) ? cmResponse.properties : [];

  let mappedProperties = rawProperties
    .map((raw) => {
      try {
        return mapPropertyToNative(raw, {
          nights,
          guests: guestCount,
          checkInDate: checkInDate.trim(),
          checkOutDate: checkOutDate.trim(),
        });
      } catch (mapErr) {
        // Skip malformed entries instead of crashing the entire search
        console.warn('[Properties] Failed to map property:', raw?.property_id, mapErr.message);
        return null;
      }
    })
    .filter((p) => p !== null && p.isAvailable); // only available results

  // ── 6. Client-Side Filters (applied server-side for security) ────────────
  if (maxPrice) {
    const maxPriceNum = parseFloat(maxPrice);
    if (!isNaN(maxPriceNum)) {
      mappedProperties = mappedProperties.filter(
        (p) => p.pricePerNight !== null && p.pricePerNight <= maxPriceNum
      );
    }
  }

  if (minRating) {
    const minRatingNum = parseFloat(minRating);
    if (!isNaN(minRatingNum)) {
      mappedProperties = mappedProperties.filter((p) => p.rating >= minRatingNum);
    }
  }

  // ── 7. Sort Results ───────────────────────────────────────────────────────
  switch (sortBy) {
    case 'price_asc':
      mappedProperties.sort(
        (a, b) => (a.pricePerNight || Infinity) - (b.pricePerNight || Infinity)
      );
      break;
    case 'price_desc':
      mappedProperties.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
      break;
    case 'rating_desc':
    default:
      mappedProperties.sort((a, b) => b.rating - a.rating);
  }

  // ── 8. Build & Cache Final Response ──────────────────────────────────────
  const responsePayload = {
    properties: mappedProperties,
    total: mappedProperties.length,
    searchContext: {
      destination: destination.trim(),
      checkInDate: checkInDate.trim(),
      checkOutDate: checkOutDate.trim(),
      nights,
      guests: guestCount,
      currency: currency.toUpperCase(),
      sortBy,
    },
    source: process.env.CM_MOCK_MODE !== 'false' ? 'mock_cm' : 'live_cm',
    servedFromCache: false,
    responseTimeMs: Date.now() - startTime,
  };

  setCache(cacheKey, responsePayload);

  console.log(
    `[Properties] Search: "${destination}" | ${nights}n | ${guestCount}g | ` +
      `${mappedProperties.length} results | ${Date.now() - startTime}ms`
  );

  return res.json(responsePayload);
});

// ── ROUTE: GET /api/properties/:id ────────────────────────────────────────────
// Fetch full detail for a single property (used when user clicks a card).
// In a real CM, this would be a separate single-property GET request.
// For now, it reconstructs from a mock fetch.
// ─────────────────────────────────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.startsWith('gds-')) {
    return res.status(400).json({ error: 'Invalid property ID. Expected format: gds-{cm-id}' });
  }

  // In production: make a GET /api/v2/properties/:cmId call to the CM.
  // For now: extract from mock by searching a broad mock response.
  try {
    const mockSearch = simulateCMSearchResponse(
      buildSearchPayload({
        destination: 'any',
        checkInDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        checkOutDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        guests: 1,
      })
    );

    const raw = mockSearch.properties.find((p) => `gds-${p.property_id}` === id);

    if (!raw) {
      return res.status(404).json({ error: 'Property not found or no longer available.' });
    }

    const mapped = mapPropertyToNative(raw, { nights: 1, guests: 1 });
    return res.json(mapped);
  } catch (err) {
    next(err);
  }
});

// ── ROUTE: DELETE /api/properties/cache ──────────────────────────────────────
// Admin endpoint to manually invalidate the search cache.
// ─────────────────────────────────────────────────────────────────────────────

router.delete('/cache', requireAuth, (req, res) => {
  const count = searchCache.size;
  searchCache.clear();
  console.log(`[Properties] Cache manually cleared: ${count} entries removed.`);
  return res.json({ message: `Search cache cleared. ${count} entries removed.` });
});

module.exports = { router, init };
