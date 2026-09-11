/**
 * Auto Pulse — External Weather Service
 * 
 * Fetches real-time weather telemetry from Open-Meteo Weather API (or custom OpenWeatherMap API via env).
 * Includes caching, loading, error recovery, and safe fallbacks.
 */

const FALLBACK_WEATHER = {
  temp: 28,
  condition: 'Sunny',
  city: 'Hyderabad',
  humidity: 58,
  windSpeed: '12 km/h',
  isFallback: true,
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const WEATHER_CACHE_KEY = 'autopulse_cached_weather';
const WEATHER_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache

/**
 * Maps WMO Weather Interpretation Codes (used by Open-Meteo) to AutoPulse condition categories.
 */
function mapWmoCodeToCondition(wmoCode) {
  // 0: Clear sky -> Sunny
  if (wmoCode === 0 || wmoCode === 1) return 'Sunny';
  // 2, 3, 45, 48: Partly cloudy, overcast, fog -> Cloudy
  if (wmoCode === 2 || wmoCode === 3 || wmoCode === 45 || wmoCode === 48) return 'Cloudy';
  // 51-67, 80-82, 95-99: Drizzle, Rain, Showers, Thunderstorms -> Rainy
  if (wmoCode >= 51 && wmoCode <= 99) return 'Rainy';
  // Default to Sunny
  return 'Sunny';
}

/**
 * Fetch current weather for given coordinates and city name.
 * 
 * @param {Object} location - { latitude, longitude, city }
 * @param {boolean} forceRefresh - bypass cache
 * @returns {Promise<Object>} weather object
 */
export async function fetchCurrentWeather(location = {}, forceRefresh = false) {
  const lat = location.latitude || 17.4325;
  const lon = location.longitude || 78.4071;
  const city = location.city || 'Hyderabad';

  // 1. Check local session cache
  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const isSameCity = parsed.city?.toLowerCase() === city.toLowerCase();
        if (isSameCity && Date.now() - parsed.timestamp < WEATHER_CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('[WeatherService] Cache read error:', e);
    }
  }

  // 2. Custom API key check from environment variables
  const env = (typeof import.meta !== 'undefined' && import.meta?.env) ? import.meta.env : {};
  const apiKey = env.VITE_WEATHER_API_KEY;
  const customApiUrl = env.VITE_WEATHER_API_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    let result = null;

    if (apiKey && customApiUrl) {
      // Configured via environment variable (e.g. OpenWeatherMap)
      const url = `${customApiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        const mainCondition = data.weather?.[0]?.main || 'Clear';
        let condition = 'Sunny';
        if (mainCondition.toLowerCase().includes('rain') || mainCondition.toLowerCase().includes('drizzle')) {
          condition = 'Rainy';
        } else if (mainCondition.toLowerCase().includes('cloud') || mainCondition.toLowerCase().includes('mist')) {
          condition = 'Cloudy';
        }

        result = {
          temp: Math.round(data.main?.temp ?? 28),
          condition,
          city: data.name || city,
          humidity: data.main?.humidity ?? 55,
          windSpeed: `${Math.round((data.wind?.speed ?? 3.5) * 3.6)} km/h`,
          isFallback: false,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    }

    if (!result) {
      // Primary standard provider: Open-Meteo Weather API (Free, high accuracy, no API key required)
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const res = await fetch(openMeteoUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Open-Meteo returned status ${res.status}`);
      }

      const data = await res.json();
      const current = data.current;
      const condition = mapWmoCodeToCondition(current.weather_code);

      result = {
        temp: Math.round(current.temperature_2m),
        condition,
        city,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: `${Math.round(current.wind_speed_10m)} km/h`,
        isFallback: false,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    // Save to cache
    try {
      sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        city,
        data: result
      }));
    } catch (e) {}

    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[WeatherService] Live weather fetch failed, using fallback:', err.message);
    return {
      ...FALLBACK_WEATHER,
      city: city || FALLBACK_WEATHER.city
    };
  }
}

export { FALLBACK_WEATHER };
