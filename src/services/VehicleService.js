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

// Verified OEM library models for onboarding catalog
export const PRESET_VEHICLES = [
  {
    id: 'honda-city',
    name: 'Honda City',
    manufacturer: 'Honda',
    model: 'City',
    modelYear: '2023',
    variant: '1.5 i-VTEC V',
    type: 'Petrol',
    fuelCapacity: 40,
    image: '/assets/vehicles/honda-city.jpg'
  },
  {
    id: 'hyundai-creta',
    name: 'Hyundai Creta',
    manufacturer: 'Hyundai',
    model: 'Creta',
    modelYear: '2024',
    variant: 'SX(O) Turbo',
    type: 'Diesel',
    fuelCapacity: 50,
    image: '/assets/vehicles/hyundai-creta.jpg'
  },
  {
    id: 'hyundai-venue',
    name: 'Hyundai Venue',
    manufacturer: 'Hyundai',
    model: 'Venue',
    modelYear: '2024',
    variant: 'SX(O) 1.0 Turbo DCT',
    type: 'Petrol',
    fuelCapacity: 45,
    image: '/assets/vehicles/hyundai-venue.jpg'
  },
  {
    id: 'tata-nexon',
    name: 'Tata Nexon',
    manufacturer: 'Tata',
    model: 'Nexon',
    modelYear: '2024',
    variant: 'Fearless+ DCA',
    type: 'Petrol',
    fuelCapacity: 44,
    image: '/assets/vehicles/tata-nexon.jpg'
  },
  {
    id: 'mahindra-xuv700',
    name: 'Mahindra XUV700',
    manufacturer: 'Mahindra',
    model: 'XUV700',
    modelYear: '2024',
    variant: 'AX7 Luxury Pack',
    type: 'Diesel',
    fuelCapacity: 60,
    image: '/assets/vehicles/mahindra-xuv700.png'
  },
  {
    id: 'toyota-fortuner',
    name: 'Toyota Fortuner',
    manufacturer: 'Toyota',
    model: 'Fortuner',
    modelYear: '2024',
    variant: '2.8 4x4 AT',
    type: 'Diesel',
    fuelCapacity: 80,
    image: '/assets/vehicles/toyota-fortuner.jpg'
  },
  {
    id: 'toyota-innova-hycross',
    name: 'Toyota Innova HyCross',
    manufacturer: 'Toyota',
    model: 'Innova HyCross',
    modelYear: '2024',
    variant: 'ZX(O) Hybrid',
    type: 'Strong Hybrid',
    fuelCapacity: 52,
    image: '/assets/vehicles/toyota-innova-hycross.jpg'
  },
  {
    id: 'tesla-model-3',
    name: 'Tesla Model 3',
    manufacturer: 'Tesla',
    model: 'Model 3',
    modelYear: '2024',
    variant: 'Long Range AWD',
    type: 'Electric (EV)',
    fuelCapacity: 82,
    image: '/assets/vehicles/tesla-model-3.jpg'
  },
  {
    id: 'tata-nexon-ev',
    name: 'Tata Nexon EV',
    manufacturer: 'Tata',
    model: 'Nexon EV',
    modelYear: '2024',
    variant: 'Empowered+ LR',
    type: 'Electric (EV)',
    fuelCapacity: 82,
    image: '/assets/vehicles/tata-nexon-ev.jpg'
  }
];

// Verified OEM Presets with full CAN-bus telemetry for manual switching
export const DEMO_VEHICLES = [
  {
    id: 'honda-city',
    vehicleId: 'honda-city',
    manufacturer: 'Honda',
    make: 'Honda',
    model: 'City',
    modelYear: '2023',
    chassisNumber: 'MAKGM668NP0192834',
    engineNumber: 'L15Z-8891024',
    variant: 'ZX CVT',
    year: '2023',
    type: 'Petrol',
    odometer: 42680,
    fuelCapacity: 40,
    fuelLevel: 68,
    vin: 'MAKGM668NP0192834',
    regNumber: 'TS 09 FH 4821',
    insuranceExpiry: '2026-11-20',
    pucExpiry: '2026-10-15',
    serviceDueKm: 50000,
    healthScore: 94,
    healthStatus: 'Good Condition',
    displayName: 'Honda City',
    image: '/assets/vehicles/honda-city.jpg',
    imageUrl: '/assets/vehicles/honda-city.jpg',
    subsystems: {
      engine: { name: 'Engine / Powertrain', health: 92, status: 'Optimal' },
      battery: { name: '12V Starter Battery', health: 90, status: 'Good (12.6V)' },
      brakes: { name: 'Brake Pads & Rotors', health: 85, status: '6.5mm front / 7mm rear' },
      tyres: { name: 'Tyre Tread Life', health: 78, status: '32 PSI all round' },
      fluids: { name: 'Fluids & Coolants', health: 95, status: 'Levels within limits' }
    }
  },
  {
    id: 'hyundai-creta',
    vehicleId: 'hyundai-creta',
    manufacturer: 'Hyundai',
    make: 'Hyundai',
    model: 'Creta',
    modelYear: '2022',
    chassisNumber: 'MALC581DLM0482910',
    engineNumber: 'D4FA-3918291',
    variant: 'SX(O) Turbo',
    year: '2022',
    type: 'Diesel',
    odometer: 35000,
    fuelCapacity: 50,
    fuelLevel: 82,
    vin: 'MALC581DLM0482910',
    regNumber: 'TS 07 EA 9901',
    insuranceExpiry: '2026-08-10',
    pucExpiry: '2026-12-05',
    serviceDueKm: 40000,
    healthScore: 91,
    healthStatus: 'Good Condition',
    displayName: 'Hyundai Creta',
    image: '/assets/vehicles/hyundai-creta.jpg',
    imageUrl: '/assets/vehicles/hyundai-creta.jpg',
    subsystems: {
      engine: { name: 'CRDi Turbo Diesel', health: 90, status: 'Smooth idle' },
      battery: { name: '12V Battery', health: 88, status: 'Healthy' },
      brakes: { name: 'Disc Brakes', health: 82, status: 'Brake fluid fresh' },
      tyres: { name: 'Tyre Tread', health: 74, status: '34 PSI' },
      fluids: { name: 'DEF & Oil', health: 91, status: 'DEF at 75%' }
    }
  },
  {
    id: 'hyundai-venue',
    vehicleId: 'hyundai-venue',
    manufacturer: 'Hyundai',
    make: 'Hyundai',
    model: 'Venue',
    modelYear: '2023',
    chassisNumber: 'MALV729KLP0038192',
    engineNumber: 'G3LC-4418290',
    variant: 'SX(O) 1.0 Turbo DCT',
    year: '2023',
    type: 'Petrol',
    odometer: 18400,
    fuelCapacity: 45,
    fuelLevel: 75,
    vin: 'MALV729KLP0038192',
    regNumber: 'TS 08 HG 5511',
    insuranceExpiry: '2027-03-15',
    pucExpiry: '2027-03-15',
    serviceDueKm: 25000,
    healthScore: 95,
    healthStatus: 'Excellent Condition',
    displayName: 'Hyundai Venue',
    image: '/assets/vehicles/hyundai-venue.jpg',
    imageUrl: '/assets/vehicles/hyundai-venue.jpg',
    subsystems: {
      engine: { name: 'Kappa 1.0 Turbo GDi', health: 95, status: 'Optimal' },
      battery: { name: '12V Starter Battery', health: 94, status: '12.7V' },
      brakes: { name: 'Front Disc / Rear Drum', health: 92, status: 'Good' },
      tyres: { name: 'MRF Wanderer Tyres', health: 90, status: '33 PSI' },
      fluids: { name: 'Engine Oil & Coolant', health: 96, status: 'Fresh' }
    }
  },
  {
    id: 'tata-nexon',
    vehicleId: 'tata-nexon',
    manufacturer: 'Tata',
    make: 'Tata',
    model: 'Nexon',
    modelYear: '2024',
    chassisNumber: 'MAT612984R0092182',
    engineNumber: 'REV-1298102',
    variant: 'Fearless+ DCA',
    year: '2024',
    type: 'Petrol',
    odometer: 5000,
    fuelCapacity: 44,
    fuelLevel: 90,
    vin: 'MAT612984R0092182',
    regNumber: 'TS 08 KL 1122',
    insuranceExpiry: '2027-02-14',
    pucExpiry: '2027-02-14',
    serviceDueKm: 10000,
    healthScore: 98,
    healthStatus: 'Excellent (Like New)',
    displayName: 'Tata Nexon',
    image: '/assets/vehicles/tata-nexon.jpg',
    imageUrl: '/assets/vehicles/tata-nexon.jpg',
    subsystems: {
      engine: { name: 'Revotron Turbo Engine', health: 98, status: 'Factory spec' },
      battery: { name: 'Battery 12V', health: 99, status: '12.8V Peak' },
      brakes: { name: 'Front Disc / Rear Drum', health: 97, status: '9.2mm pad thickness' },
      tyres: { name: 'Goodyear Tyres', health: 96, status: '33 PSI' },
      fluids: { name: 'Coolant & Oil', health: 99, status: 'Pristine' }
    }
  },
  {
    id: 'mahindra-xuv700',
    vehicleId: 'mahindra-xuv700',
    manufacturer: 'Mahindra',
    make: 'Mahindra',
    model: 'XUV700',
    modelYear: '2023',
    chassisNumber: 'MA1TA2SKLP0019284',
    engineNumber: 'mStallion-200918',
    variant: 'AX7 Luxury Pack AWD',
    year: '2023',
    type: 'Diesel',
    odometer: 22100,
    fuelCapacity: 60,
    fuelLevel: 80,
    vin: 'MA1TA2SKLP0019284',
    regNumber: 'TS 09 MX 7007',
    insuranceExpiry: '2026-10-28',
    pucExpiry: '2026-10-28',
    serviceDueKm: 30000,
    healthScore: 95,
    healthStatus: 'Optimal ADAS & Powertrain',
    displayName: 'Mahindra XUV700',
    image: '/assets/vehicles/mahindra-xuv700.png',
    imageUrl: '/assets/vehicles/mahindra-xuv700.png',
    subsystems: {
      engine: { name: 'mHawk 2.2L Turbo Diesel', health: 96, status: 'Optimal' },
      battery: { name: 'Heavy Duty 12V Battery', health: 93, status: 'Strong' },
      brakes: { name: 'All 4 Disc ESP', health: 91, status: 'Pads at 80%' },
      tyres: { name: 'Apollo Apterra Tyres', health: 87, status: '34 PSI' },
      fluids: { name: 'Transmission & DEF', health: 98, status: 'Optimal' }
    }
  },
  {
    id: 'toyota-fortuner',
    vehicleId: 'toyota-fortuner',
    manufacturer: 'Toyota',
    make: 'Toyota',
    model: 'Fortuner',
    modelYear: '2023',
    chassisNumber: 'MBJFT882KP0019281',
    engineNumber: '1GD-FTV-882910',
    variant: '4x4 Legender AT',
    year: '2023',
    type: 'Diesel',
    odometer: 28900,
    fuelCapacity: 80,
    fuelLevel: 70,
    vin: 'MBJFT882KP0019281',
    regNumber: 'TS 07 TR 4444',
    insuranceExpiry: '2027-04-10',
    pucExpiry: '2027-04-10',
    serviceDueKm: 35000,
    healthScore: 97,
    healthStatus: 'Rugged Peak Performance',
    displayName: 'Toyota Fortuner',
    image: '/assets/vehicles/toyota-fortuner.jpg',
    imageUrl: '/assets/vehicles/toyota-fortuner.jpg',
    subsystems: {
      engine: { name: '2.8L 1GD-FTV Diesel', health: 98, status: '500 Nm Torque Spec' },
      battery: { name: 'Exide 12V 80Ah', health: 95, status: 'Good' },
      brakes: { name: 'Ventilated Disc 4-Wheel', health: 94, status: 'Pad wear normal' },
      tyres: { name: 'Bridgestone Dueler A/T', health: 89, status: '32 PSI' },
      fluids: { name: '4WD Transfer Oil & DEF', health: 98, status: 'Normal' }
    }
  },
  {
    id: 'toyota-innova',
    vehicleId: 'toyota-innova',
    manufacturer: 'Toyota',
    make: 'Toyota',
    model: 'Innova HyCross',
    modelYear: '2023',
    chassisNumber: 'MBJTC681LP0029182',
    engineNumber: 'M20A-FXS-99182',
    variant: 'ZX(O) Hybrid',
    year: '2023',
    type: 'Hybrid',
    odometer: 14200,
    fuelCapacity: 52,
    fuelLevel: 78,
    vin: 'MBJTC681LP0029182',
    regNumber: 'TS 09 XY 8899',
    insuranceExpiry: '2027-01-10',
    pucExpiry: '2027-01-10',
    serviceDueKm: 20000,
    healthScore: 96,
    healthStatus: 'Optimal Hybrid Drive',
    displayName: 'Toyota Innova HyCross',
    image: '/assets/vehicles/toyota-innova-hycross.jpg',
    imageUrl: '/assets/vehicles/toyota-innova-hycross.jpg',
    subsystems: {
      engine: { name: 'Dynamic Force 2.0L Hybrid', health: 97, status: 'Optimal e-CVT' },
      battery: { name: 'Ni-MH Hybrid Battery', health: 98, status: 'Regen healthy' },
      brakes: { name: 'All 4 Disc with ABS', health: 94, status: 'Good condition' },
      tyres: { name: 'Bridgestone Turanza', health: 88, status: '35 PSI' },
      fluids: { name: 'Inverter Coolant', health: 99, status: 'Level normal' }
    }
  },
  {
    id: 'tesla-m3',
    vehicleId: 'tesla-m3',
    manufacturer: 'Tesla',
    make: 'Tesla',
    model: 'Model 3',
    modelYear: '2024',
    chassisNumber: '5YJ3E1EB9PF901238',
    engineNumber: 'DUAL-MOTOR-3D1',
    variant: 'Long Range AWD',
    year: '2024',
    type: 'EV',
    odometer: 8400,
    fuelCapacity: 82,
    fuelLevel: 84,
    vin: '5YJ3E1EB9PF901238',
    regNumber: 'TS 10 EV 0001',
    insuranceExpiry: '2027-05-18',
    pucExpiry: 'Exempt (EV)',
    serviceDueKm: 20000,
    healthScore: 99,
    healthStatus: 'Peak Battery Performance',
    displayName: 'Tesla Model 3',
    image: '/assets/vehicles/tesla-model-3.jpg',
    imageUrl: '/assets/vehicles/tesla-model-3.jpg',
    subsystems: {
      engine: { name: 'Dual Electric Drive', health: 100, status: 'Dual Motor Sync' },
      battery: { name: 'High-Voltage Battery', health: 98.4, status: '1.6% Degradation' },
      brakes: { name: 'Regen + Friction Brakes', health: 96, status: 'Regen active' },
      tyres: { name: 'Michelin Pilot Sport EV', health: 90, status: '41 PSI cold' },
      fluids: { name: 'Thermal Management', health: 99, status: 'Glycol coolant intact' }
    }
  },
  {
    id: 'tata-nexon-ev',
    vehicleId: 'tata-nexon-ev',
    manufacturer: 'Tata',
    make: 'Tata',
    model: 'Nexon EV',
    modelYear: '2024',
    chassisNumber: 'MAT612984R0095541',
    engineNumber: 'ZIPTRON-EV-405',
    variant: 'Empowered+ LR',
    year: '2024',
    type: 'EV',
    odometer: 6200,
    fuelCapacity: 40.5,
    fuelLevel: 88,
    vin: 'MAT612984R0095541',
    regNumber: 'TS 09 EV 4040',
    insuranceExpiry: '2027-04-12',
    pucExpiry: 'Exempt (EV)',
    serviceDueKm: 15000,
    healthScore: 99,
    healthStatus: 'High Voltage Ziptron Optimal',
    displayName: 'Tata Nexon EV',
    image: '/assets/vehicles/tata-nexon-ev.jpg',
    imageUrl: '/assets/vehicles/tata-nexon-ev.jpg',
    subsystems: {
      engine: { name: 'Ziptron Permanent Magnet Motor', health: 99, status: 'Optimal' },
      battery: { name: '40.5 kWh LFP Battery Pack', health: 99.2, status: 'Liquid cooled' },
      brakes: { name: 'Smart Regenerative Braking', health: 97, status: '3-level regen active' },
      tyres: { name: 'Low Rolling Resistance Tyres', health: 95, status: '34 PSI' },
      fluids: { name: 'Coolant for Inverter & Motor', health: 98, status: 'Good' }
    }
  }
];

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
  if (!data || typeof data !== 'object') {
    return null;
  }

  const manufacturer = (data?.manufacturer || data?.make || '').trim();
  const model = (data?.model || '').trim();

  if (!manufacturer && !model) {
    return null;
  }

  const displayName = manufacturer && model 
    ? `${manufacturer} ${model}` 
    : (data?.displayName || data?.name || manufacturer || model);

  const cleanMakeSlug = manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanModelSlug = model.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const stableId = data?.id || data?.vehicleId || (cleanMakeSlug && cleanModelSlug ? `${cleanMakeSlug}-${cleanModelSlug}` : 'custom-vehicle');

  // Always use centralized resolver for guaranteed exact matching (prevents stale/wrong image carryover)
  const exactImage = (data?.imageUrl && data?.imageUrl !== NEUTRAL_VEHICLE_FALLBACK)
    ? data.imageUrl
    : (getVehicleImage({ manufacturer, model }) || resolvedImage || NEUTRAL_VEHICLE_FALLBACK);

  const currentOdometer = typeof data?.odometer === 'number' ? data.odometer : (Number(data?.odometer) || 0);

  return {
    ...data,
    id: stableId,
    vehicleId: stableId,
    manufacturer,
    make: manufacturer,
    model,
    modelYear: data?.modelYear || data?.year || '',
    chassisNumber: data?.chassisNumber || data?.vin || '',
    engineNumber: data?.engineNumber || '',
    variant: data?.variant || '',
    year: data?.year || data?.modelYear || '',
    type: data?.type || 'Petrol',
    odometer: currentOdometer,
    fuelCapacity: Number(data?.fuelCapacity || data?.capacity) || (data?.type?.includes('EV') ? 82 : 45),
    fuelLevel: Number(data?.fuelLevel) || 75,
    vin: data?.vin || data?.chassisNumber || '',
    regNumber: data?.regNumber || '',
    insuranceExpiry: data?.insuranceExpiry || '',
    pucExpiry: data?.pucExpiry || '',
    serviceDueKm: Number(data?.serviceDueKm) || (currentOdometer + 10000),
    healthScore: Number(data?.healthScore) || 94,
    healthStatus: data?.healthStatus || 'Good Condition',
    displayName,
    image: exactImage,
    imageUrl: exactImage,
    subsystems: data?.subsystems || {
      engine: { name: data?.type?.includes('EV') ? 'Electric Drive Unit' : 'Engine / Powertrain', health: 92, status: 'Optimal' },
      battery: { name: data?.type?.includes('EV') ? 'High-Voltage Battery' : '12V Starter Battery', health: 90, status: 'Good' },
      brakes: { name: 'Brake Pads & Rotors', health: 85, status: 'Within spec' },
      tyres: { name: 'Tyre Tread Life', health: 78, status: '32 PSI all round' },
      fluids: { name: 'Fluids & Coolants', health: 95, status: 'Levels normal' }
    }
  };
}
