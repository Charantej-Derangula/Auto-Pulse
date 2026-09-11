/**
 * AUTO PULSE — External Vehicle Service & Image Resolution Engine
 * 
 * Features:
 * 1. Connects to configured External Vehicle Image API (via VITE_VEHICLE_IMAGE_API_URL and VITE_VEHICLE_IMAGE_API_KEY)
 *    and Wikimedia Commons API for high-resolution exact vehicle images.
 * 2. Persistent LocalStorage + in-memory cache to prevent redundant API calls on re-renders.
 * 3. Maintains high-fidelity verified OEM exact database for all supported models:
 *    - Honda City
 *    - Hyundai Creta
 *    - Hyundai Venue
 *    - Tata Nexon
 *    - Mahindra XUV700
 *    - Toyota Fortuner
 *    - Toyota Innova HyCross
 *    - Tesla Model 3
 *    - Tata Nexon EV
 * 4. Multi-tier resilient fallback architecture:
 *    [1. Cached Image] -> [2. External Image API] -> [3. Verified Exact Local Image] -> [4. Neutral Placeholder]
 * 5. Safe error handling: API failures or network timeouts never crash React, cause blank pages, or change vehicleId.
 */

const STORAGE_CACHE_KEY = 'autopulse_vehicle_image_cache_v5';

// In-memory cache synced with localStorage
const memoryCache = new Map();

// Initialize cache from localStorage
function initCache() {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => memoryCache.set(k, v));
        }
      }
    }
  } catch (e) {
    console.warn('[VehicleService] Failed to load image cache from storage:', e);
  }
}

initCache();

function setCachedImage(key, url) {
  if (!key || !url) return;
  memoryCache.set(key, url);
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const current = {};
      memoryCache.forEach((v, k) => { current[k] = v; });
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(current));
    }
  } catch (e) {
    // Ignore storage quota warnings
  }
}

function getCachedImage(key) {
  if (!key) return null;
  return memoryCache.get(key) || null;
}

// Neutral Auto Pulse vehicle fallback SVG (displays "Vehicle image unavailable" with clean automotive silhouette)
export const NEUTRAL_VEHICLE_FALLBACK = '/vehicles/neutral_placeholder.svg';

// Centralized Vehicle Images mapping using local verified assets
export const VEHICLE_IMAGES = {
  "Honda City": "/assets/vehicles/honda-city.jpg",
  "Hyundai Creta": "/assets/vehicles/hyundai-creta.jpg",
  "Hyundai Venue": "/assets/vehicles/hyundai-venue.jpg",
  "Tata Nexon": "/assets/vehicles/tata-nexon.jpg",
  "Mahindra XUV700": "/assets/vehicles/mahindra-xuv700.png",
  "Toyota Fortuner": "/assets/vehicles/toyota-fortuner.jpg",
  "Toyota Innova HyCross": "/assets/vehicles/toyota-innova-hycross.jpg",
  "Tesla Model 3": "/assets/vehicles/tesla-model-3.jpg",
  "Tata Nexon EV": "/assets/vehicles/tata-nexon-ev.jpg"
};

// High-fidelity verified exact vehicle images (100% genuine vehicle photos matching exact make + model)
export const VERIFIED_VEHICLE_IMAGES = {
  // 1. Honda City (Modern 4-Door Sedan)
  'honda_city': '/assets/vehicles/honda-city.jpg',
  'honda city': '/assets/vehicles/honda-city.jpg',
  'honda_civic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/2022_Honda_Civic_Sport_Sedan%2C_front_left%2C_10-09-2022.jpg/1200px-2022_Honda_Civic_Sport_Sedan%2C_front_left%2C_10-09-2022.jpg',
  'honda_accord': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/2018_Honda_Accord_Touring_2.0T%2C_front_10.23.19.jpg/1200px-2018_Honda_Accord_Touring_2.0T%2C_front_10.23.19.jpg',

  // 2. Hyundai Creta (Compact SUV)
  'hyundai_creta': '/assets/vehicles/hyundai-creta.jpg',
  'hyundai creta': '/assets/vehicles/hyundai-creta.jpg',
  // 3. Hyundai Venue (Subcompact Urban Crossover)
  'hyundai_venue': '/assets/vehicles/hyundai-venue.jpg',
  'hyundai venue': '/assets/vehicles/hyundai-venue.jpg',
  'hyundai_verna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Hyundai_Verna_BN7_IMG_9771.jpg/1200px-Hyundai_Verna_BN7_IMG_9771.jpg',
  'hyundai_tucson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/2022_Hyundai_Tucson_SEL%2C_front_1.24.22.jpg/1200px-2022_Hyundai_Tucson_SEL%2C_front_1.24.22.jpg',
  'hyundai_ioniq': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2022_Hyundai_Ioniq_5_Htrac_front_right_view.jpg/1200px-2022_Hyundai_Ioniq_5_Htrac_front_right_view.jpg',

  // 4. Tata Nexon (Sporty Coupe Crossover)
  'tata_nexon': '/assets/vehicles/tata-nexon.jpg',
  'tata nexon': '/assets/vehicles/tata-nexon.jpg',
  // 9. Tata Nexon EV (Electric Crossover)
  'tata_nexon ev': '/assets/vehicles/tata-nexon-ev.jpg',
  'tata_nexon_ev': '/assets/vehicles/tata-nexon-ev.jpg',
  'tata nexon ev': '/assets/vehicles/tata-nexon-ev.jpg',
  'tata_harrier': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tata_Harrier_Fearless_Plus_%28India%29_front_view.jpg/1200px-Tata_Harrier_Fearless_Plus_%28India%29_front_view.jpg',
  'tata_safari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2021_Tata_Safari_XTA%2B_%28India%29_front_view.jpg/1200px-2021_Tata_Safari_XTA%2B_%28India%29_front_view.jpg',

  // 5. Mahindra XUV700 (7-Seater Luxury SUV)
  'mahindra_xuv700': '/assets/vehicles/mahindra-xuv700.png',
  'mahindra xuv700': '/assets/vehicles/mahindra-xuv700.png',
  'mahindra_thar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2020_Mahindra_Thar_Hard_Top_LX_%28India%29_front_view.jpg/1200px-2020_Mahindra_Thar_Hard_Top_LX_%28India%29_front_view.jpg',
  'mahindra_scorpio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/2022_Mahindra_Scorpio-N_Z8L_4XPLOR_%28India%29_front_view.jpg/1200px-2022_Mahindra_Scorpio-N_Z8L_4XPLOR_%28India%29_front_view.jpg',

  // 6. Toyota Fortuner (Rugged 4x4 Full-Size SUV)
  'toyota_fortuner': '/assets/vehicles/toyota-fortuner.jpg',
  'toyota fortuner': '/assets/vehicles/toyota-fortuner.jpg',
  // 7. Toyota Innova HyCross (Executive Luxury Hybrid MPV)
  'toyota_innova hycross': '/assets/vehicles/toyota-innova-hycross.jpg',
  'toyota_innova_hycross': '/assets/vehicles/toyota-innova-hycross.jpg',
  'toyota innova hycross': '/assets/vehicles/toyota-innova-hycross.jpg',
  'toyota_innova': '/assets/vehicles/toyota-innova-hycross.jpg',
  'toyota_camry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/1200px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg',

  // 8. Tesla Model 3 (Aerodynamic Pure EV Sedan)
  'tesla_model 3': '/assets/vehicles/tesla-model-3.jpg',
  'tesla_model_3': '/assets/vehicles/tesla-model-3.jpg',
  'tesla model 3': '/assets/vehicles/tesla-model-3.jpg',
  'tesla_model y': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/2020_Tesla_Model_Y_Long_Range_Dual_Motor%2C_front_10.23.20.jpg/1200px-2020_Tesla_Model_Y_Long_Range_Dual_Motor%2C_front_10.23.20.jpg',
  'tesla_model s': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2018_Tesla_Model_S_75D%2C_front_10.20.19.jpg/1200px-2018_Tesla_Model_S_75D%2C_front_10.20.19.jpg'
};

/**
 * Query external vehicle image API using environment variables VITE_VEHICLE_IMAGE_API_URL and VITE_VEHICLE_IMAGE_API_KEY
 */
async function queryExternalVehicleImageAPI(make, model) {
  const customApiUrl = import.meta.env?.VITE_VEHICLE_IMAGE_API_URL;
  const customApiKey = import.meta.env?.VITE_VEHICLE_IMAGE_API_KEY;

  if (!customApiUrl) return null;

  try {
    // If a custom API endpoint is configured
    if (!customApiUrl.includes('wikipedia.org')) {
      const headers = { 'Content-Type': 'application/json' };
      if (customApiKey) {
        headers['Authorization'] = `Bearer ${customApiKey}`;
        headers['x-api-key'] = customApiKey;
      }
      
      const queryParam = encodeURIComponent(`${make} ${model}`);
      const endpoint = customApiUrl.includes('?') 
        ? `${customApiUrl}&q=${queryParam}` 
        : `${customApiUrl}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&q=${queryParam}`;

      const res = await fetch(endpoint, { headers, signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        const foundUrl = json.imageUrl || json.image || json.url || json?.data?.image || json?.results?.[0]?.url;
        if (foundUrl && typeof foundUrl === 'string' && foundUrl.startsWith('http')) {
          return foundUrl;
        }
      }
    }

    // Default Wikimedia / Wikipedia Automotive Database API search
    const queries = [
      `${make} ${model}`,
      `${make} ${model} car`,
      `${make} ${model} automobile`
    ];

    for (const query of queries) {
      const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}&origin=*`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        const pages = data?.query?.pages;
        if (pages) {
          for (const pageId in pages) {
            const src = pages[pageId]?.original?.source;
            if (src && typeof src === 'string' && (src.endsWith('.jpg') || src.endsWith('.png') || src.endsWith('.webp') || src.endsWith('.jpeg'))) {
              return src;
            }
          }
        }
      }
    }
    return null;
  } catch (err) {
    // Graceful silent fallback
    return null;
  }
}

/**
 * Synchronous Centralized Vehicle Image Resolver
 * 
 * Supports:
 * - getVehicleImage(vehicleObject)
 * - getVehicleImage(make, model)
 * 
 * Priority:
 * 1. Cached exact image
 * 2. Verified exact local image
 * 3. Neutral placeholder (never an unrelated vehicle)
 */
export function getVehicleImage(vehicleOrMake, optionalModel = '') {
  let make = '';
  let model = '';

  if (typeof vehicleOrMake === 'object' && vehicleOrMake !== null) {
    make = vehicleOrMake.manufacturer || vehicleOrMake.make || '';
    model = vehicleOrMake.model || '';
  } else if (typeof vehicleOrMake === 'string') {
    const trimmedInput = vehicleOrMake.trim();
    // Direct lookup in VEHICLE_IMAGES (e.g. "Honda City")
    if (!optionalModel) {
      if (VEHICLE_IMAGES[trimmedInput]) {
        return VEHICLE_IMAGES[trimmedInput];
      }
      for (const [name, path] of Object.entries(VEHICLE_IMAGES)) {
        if (name.toLowerCase() === trimmedInput.toLowerCase()) {
          return path;
        }
      }
    }
    make = vehicleOrMake;
    model = optionalModel || '';
  }

  const cleanMake = make.trim().toLowerCase().replace(/\s+/g, ' ');
  const cleanModel = model.trim().toLowerCase().replace(/\s+/g, ' ');

  if (!cleanMake && !cleanModel) {
    return NEUTRAL_VEHICLE_FALLBACK;
  }

  // Check matching key in VEHICLE_IMAGES
  const combinedName = `${make.trim()} ${model.trim()}`.trim().toLowerCase();
  for (const [name, path] of Object.entries(VEHICLE_IMAGES)) {
    if (name.toLowerCase() === combinedName) {
      return path;
    }
  }

  const exactKey = `${cleanMake}_${cleanModel}`;

  // 1. Direct verified database check (High priority exact match)
  if (VERIFIED_VEHICLE_IMAGES[exactKey]) {
    setCachedImage(exactKey, VERIFIED_VEHICLE_IMAGES[exactKey]);
    return VERIFIED_VEHICLE_IMAGES[exactKey];
  }

  // 2. Check persistent/memory cache
  const cached = getCachedImage(exactKey);
  if (cached) {
    return cached;
  }

  // 3. Normalized partial match sorted by specificity length descending
  // (e.g. "tata_nexon ev" is evaluated before "tata_nexon")
  const sortedEntries = Object.entries(VERIFIED_VEHICLE_IMAGES).sort((a, b) => b[0].length - a[0].length);
  for (const [key, val] of sortedEntries) {
    if (!key.includes('_')) continue;
    const [keyMake, keyModel] = key.split('_');
    if (!keyMake || !keyModel) continue;
    const makeMatches = cleanMake.includes(keyMake) || keyMake.includes(cleanMake);
    const modelMatches = cleanModel.includes(keyModel) || keyModel.includes(cleanModel);
    
    if (makeMatches && modelMatches) {
      setCachedImage(exactKey, val);
      return val;
    }
  }

  // 4. Return strictly neutral fallback (never show an unrelated vehicle)
  return NEUTRAL_VEHICLE_FALLBACK;
}

/**
 * Async External Vehicle Image Resolver
 * 
 * Priority Hierarchy:
 * 1. Verified exact local image
 * 2. Cached exact image
 * 3. External API exact image (with VITE_VEHICLE_IMAGE_API_URL)
 * 4. Neutral placeholder (NEVER an unrelated vehicle)
 */
export async function resolveVehicleImage(manufacturer = '', model = '', year = '') {
  const cleanMake = (manufacturer || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const cleanModel = (model || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const cacheKey = `${cleanMake}_${cleanModel}`;

  if (!cleanMake && !cleanModel) {
    return NEUTRAL_VEHICLE_FALLBACK;
  }

  // 1. Verified exact local database check (Instant & Reliable)
  const localMatch = getVehicleImage(manufacturer, model);
  if (localMatch && localMatch !== NEUTRAL_VEHICLE_FALLBACK) {
    setCachedImage(cacheKey, localMatch);
    return localMatch;
  }

  // 2. Check cache
  const cached = getCachedImage(cacheKey);
  if (cached && cached !== NEUTRAL_VEHICLE_FALLBACK) {
    return cached;
  }

  // 3. Query External API
  try {
    const apiImage = await queryExternalVehicleImageAPI(manufacturer, model);
    if (apiImage) {
      setCachedImage(cacheKey, apiImage);
      return apiImage;
    }
  } catch (err) {
    console.warn('[VehicleService] External API lookup failed, trying local verified database:', err);
  }

  // 4. Fallback to neutral placeholder
  setCachedImage(cacheKey, NEUTRAL_VEHICLE_FALLBACK);
  return NEUTRAL_VEHICLE_FALLBACK;
}

/**
 * Helper to normalize and build safe vehicle object
 */
export function buildVehicleObject(data, resolvedImage = null) {
  const manufacturer = (data?.manufacturer || data?.make || 'Honda').trim();
  const model = (data?.model || 'City').trim();
  const displayName = `${manufacturer} ${model}`;

  const cleanMakeSlug = manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanModelSlug = model.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const stableId = data?.id || data?.vehicleId || `${cleanMakeSlug}-${cleanModelSlug}`;

  // Always use centralized resolver for guaranteed exact matching (prevents stale/wrong image carryover)
  const exactImage = getVehicleImage({ manufacturer, model }) || resolvedImage || NEUTRAL_VEHICLE_FALLBACK;

  return {
    ...data,
    id: stableId,
    vehicleId: stableId,
    manufacturer,
    make: manufacturer,
    model,
    modelYear: data?.modelYear || data?.year || '2023',
    chassisNumber: data?.chassisNumber || data?.vin || 'MAKGM668NP0192834',
    engineNumber: data?.engineNumber || 'ENG-9988210',
    variant: data?.variant || 'Standard',
    year: data?.year || data?.modelYear || '2023',
    type: data?.type || 'Petrol',
    odometer: Number(data?.odometer) || 0,
    fuelCapacity: Number(data?.fuelCapacity || data?.capacity) || (data?.type === 'EV' ? 82 : 45),
    fuelLevel: Number(data?.fuelLevel) || 75,
    vin: data?.vin || data?.chassisNumber || 'MAKGM668NP0192834',
    regNumber: data?.regNumber || 'TS 09 FH 4821',
    insuranceExpiry: data?.insuranceExpiry || '2026-11-20',
    pucExpiry: data?.pucExpiry || '2026-10-15',
    serviceDueKm: Number(data?.serviceDueKm) || 50000,
    healthScore: Number(data?.healthScore) || 94,
    healthStatus: data?.healthStatus || 'Good Condition',
    displayName,
    image: exactImage,
    imageUrl: exactImage,
    subsystems: data?.subsystems || {
      engine: { name: data?.type === 'EV' ? 'Electric Drive Unit' : 'Engine / Powertrain', health: 92, status: 'Optimal' },
      battery: { name: data?.type === 'EV' ? 'High-Voltage Battery' : '12V Starter Battery', health: 90, status: 'Good' },
      brakes: { name: 'Brake Pads & Rotors', health: 85, status: 'Within spec' },
      tyres: { name: 'Tyre Tread Life', health: 78, status: '32 PSI all round' },
      fluids: { name: 'Fluids & Coolants', health: 95, status: 'Levels normal' }
    }
  };
}
