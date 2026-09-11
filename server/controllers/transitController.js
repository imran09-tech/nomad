const crypto = require('crypto');

// Simple in-memory cache for development
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Mock Data Layer
const mockTransitData = [
  // Trains
  {
    id: 'tr1',
    type: 'Train',
    operatorName: 'Eurostar',
    routeIdentifier: '9024',
    departureTime: '08:00',
    arrivalTime: '10:20',
    durationString: '2h 20m',
    pricingTier: 450,
  },
  {
    id: 'tr2',
    type: 'Train',
    operatorName: 'Venice Simplon',
    routeIdentifier: 'VS-1',
    departureTime: '08:00',
    arrivalTime: '20:00',
    durationString: '12h 00m',
    pricingTier: 3500,
  },
  {
    id: 'tr3',
    type: 'Train',
    operatorName: 'Shinkansen',
    routeIdentifier: 'NZomi-12',
    departureTime: '09:00',
    arrivalTime: '11:15',
    durationString: '2h 15m',
    pricingTier: 250,
  },
  {
    id: 'tr4',
    type: 'Train',
    operatorName: 'Blue Train',
    routeIdentifier: 'BT-ZA',
    departureTime: '15:00',
    arrivalTime: '22:00',
    durationString: '31h 00m',
    pricingTier: 2100,
  },

  // Buses
  {
    id: 'bu1',
    type: 'Bus',
    operatorName: 'Mahagama Bus Service',
    routeIdentifier: 'M-BG-01',
    departureTime: '08:00',
    arrivalTime: '09:45',
    durationString: '1h 45m',
    pricingTier: 2,
  },
  {
    id: 'bu2',
    type: 'Bus',
    operatorName: 'Mahagama Bus Service',
    routeIdentifier: 'M-GD-02',
    departureTime: '09:00',
    arrivalTime: '10:00',
    durationString: '1h 00m',
    pricingTier: 1,
  },
  {
    id: 'bu3',
    type: 'Bus',
    operatorName: 'Mahagama Bus Service',
    routeIdentifier: 'M-RN-03',
    departureTime: '20:00',
    arrivalTime: '04:30',
    durationString: '8h 30m',
    pricingTier: 15,
  },
  {
    id: 'bu4',
    type: 'Bus',
    operatorName: 'Luxury Coach',
    routeIdentifier: 'LC-NY-DC',
    departureTime: '08:00',
    arrivalTime: '12:30',
    durationString: '4h 30m',
    pricingTier: 120,
  },
];

/**
 * Clean up expired cache items
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Generate ISO Standard Timestamps for the mock based on departureDate
 */
function attachLiveTimestamps(data, requestedDate) {
  const baseDate = requestedDate ? new Date(requestedDate) : new Date();

  return data.map((item) => {
    // Parse mock HH:mm
    const [depH, depM] = item.departureTime.split(':');
    const [arrH, arrM] = item.arrivalTime.split(':');

    const depDate = new Date(baseDate);
    depDate.setHours(parseInt(depH, 10), parseInt(depM, 10), 0, 0);

    const arrDate = new Date(baseDate);
    arrDate.setHours(parseInt(arrH, 10), parseInt(arrM, 10), 0, 0);

    // If arrival is before departure (overnight), add a day
    if (
      arrDate < depDate ||
      (item.durationString.includes('h') && parseInt(item.durationString) > 20)
    ) {
      arrDate.setDate(arrDate.getDate() + 1);
    }

    return {
      ...item,
      departureTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
    };
  });
}

/**
 * @route   GET /api/v1/transit/search
 * @desc    Fetch real-time ground transit tracks (Trains/Buses)
 * @access  Private
 */
exports.searchTransit = async (req, res, next) => {
  try {
    const { originCity, destinationCity, departureDate } = req.query;

    // Create a unique cache key based on query params
    const cacheKey = crypto
      .createHash('sha256')
      .update(JSON.stringify({ originCity, destinationCity, departureDate }))
      .digest('hex');

    cleanupCache();

    if (cache.has(cacheKey)) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cache.get(cacheKey).data,
      });
    }

    // --- Mock Layer Integration ---
    // In production: swap this with Navitia/Rome2rio axios call
    // const response = await axios.get(`https://api.navitia.io/v1/coverage/fr-idf/journeys...`);
    // let processedData = mapNavitiaResponse(response.data);

    let processedData = attachLiveTimestamps(mockTransitData, departureDate);

    // Simple mock filtering based on user input
    if (originCity && originCity !== 'any') {
      const lowerOrigin = originCity.toLowerCase();
      // In a real API, the provider handles origin/dest. Here we just return all or filter if we added origin/dest to mock data.
      // For now, we will return the mock data to populate the wizard correctly.
    }

    // Cache the processed data
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: processedData,
    });

    return res.status(200).json({
      success: true,
      cached: false,
      data: processedData,
    });
  } catch (error) {
    console.error('Transit API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transit data',
      error: error.message,
    });
  }
};

/**
 * Utility for paymentController to securely fetch the real price
 */
exports.getTransitPriceServerSide = (transitId) => {
  // In production: Query live pricing DB or API.
  const transit = mockTransitData.find((t) => t.id === transitId);
  return transit ? transit.pricingTier : 0;
};
