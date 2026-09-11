/**
 * Auto Pulse — Location & Geolocation Service
 * 
 * Manages browser geolocation, reverse geocoding, and location caching.
 * Provides safe fallback to configured default location if permission is denied or API fails.
 */

const DEFAULT_LOCATION = {
  latitude: 17.4325,
  longitude: 78.4071,
  city: 'Hyderabad',
  area: 'Jubilee Hills',
  formattedLocation: 'Jubilee Hills, Hyderabad',
  isFallback: true
};

const CACHE_KEY = 'autopulse_cached_location';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

/**
 * Get user location using browser Geolocation with reverse geocoding.
 * Gracefully falls back to DEFAULT_LOCATION if denied, timed out, or unavailable.
 */
export async function getUserLocation(forceRefresh = false) {
  // 1. Check session cache if not forced refresh
  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('[LocationService] Cache read error:', e);
    }
  }

  // 2. Check Geolocation API availability
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return DEFAULT_LOCATION;
  }

  return new Promise((resolve) => {
    const options = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 1000 * 60 * 15 // 15 mins
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode to get human-readable city/area
          const geocoded = await reverseGeocode(latitude, longitude);
          const locationData = {
            latitude,
            longitude,
            city: geocoded.city || 'Current Location',
            area: geocoded.area || geocoded.city || '',
            formattedLocation: geocoded.formatted || `${geocoded.city || 'Nearby'}`,
            isFallback: false
          };

          // Cache result
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              data: locationData
            }));
          } catch (err) {
            // quota or private browsing
          }

          resolve(locationData);
        } catch (geocodeErr) {
          console.warn('[LocationService] Reverse geocode failed, using coordinates:', geocodeErr);
          resolve({
            latitude,
            longitude,
            city: 'My Location',
            area: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            formattedLocation: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            isFallback: false
          });
        }
      },
      (error) => {
        // User denied, timed out, or position unavailable
        console.info('[LocationService] Geolocation unavailable or denied, using fallback:', error.message);
        resolve(DEFAULT_LOCATION);
      },
      options
    );
  });
}

/**
 * Reverse geocode latitude and longitude to readable city/locality.
 * Uses BigDataCloud client-side reverse geocoding (free, no auth key required, CORS supported).
 */
export async function reverseGeocode(latitude, longitude) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Reverse geocode responded with status ${res.status}`);
    }

    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision || 'Hyderabad';
    const area = data.locality || data.city || '';
    const formatted = area && city && area !== city ? `${area}, ${city}` : city;

    return { city, area, formatted };
  } catch (err) {
    clearTimeout(timeoutId);
    // Secondary fallback: Nominatim OpenStreetMap
    try {
      const osmController = new AbortController();
      const osmTimeout = setTimeout(() => osmController.abort(), 3500);
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`;
      const osmRes = await fetch(osmUrl, {
        headers: { 'Accept': 'application/json' },
        signal: osmController.signal
      });
      clearTimeout(osmTimeout);

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const city = osmData.address?.city || osmData.address?.town || osmData.address?.state_district || 'Detected Area';
        const suburb = osmData.address?.suburb || osmData.address?.neighbourhood || '';
        return {
          city,
          area: suburb,
          formatted: suburb ? `${suburb}, ${city}` : city
        };
      }
    } catch (e) {
      // ignore
    }

    return { city: DEFAULT_LOCATION.city, area: DEFAULT_LOCATION.area, formatted: DEFAULT_LOCATION.formattedLocation };
  }
}

export { DEFAULT_LOCATION };
