import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  resolveVehicleImage, 
  getVehicleImage,
  buildVehicleObject, 
  VERIFIED_VEHICLE_IMAGES,
  NEUTRAL_VEHICLE_FALLBACK
} from '../services/VehicleService';
import { calculateVehicleHealth } from '../services/HealthIntelligenceService';
import { getUserLocation } from '../services/LocationService';
import { fetchCurrentWeather } from '../services/WeatherService';
import { fetchNearbyGarages } from '../services/GarageService';
import { getVehicleHealthAssessment } from '../services/VehicleHealthService';
import { 
  normalizeDocument, 
  normalizeReminder, 
  loadDocumentsStorage, 
  loadRemindersStorage,
  calculateDocumentStatus,
  calculateReminderStatus
} from '../services/DocumentService';

const AppContext = createContext();

export { DEMO_VEHICLES } from '../services/VehicleService';

export const INITIAL_DIAGNOSTICS = [
  {
    id: 'brake-noise',
    symptom: 'Brake noise (Squealing or Grinding)',
    category: 'Braking System',
    severity: 'Medium',
    severityColor: '#f59e0b',
    causes: [
      'Worn brake pads approaching indicator shim',
      'Dust or debris trapped in caliper bracket',
      'Rotor glazing or uneven pad deposits',
      'Moisture rust formation after overnight parking'
    ],
    recommendedAction: 'Inspect pad thickness immediately. Replace brake pads if below 3mm. Clean and lubricate caliper slider pins.',
    estimatedCost: '₹1,800 - ₹3,500',
    estimatedTime: '1 - 2 hours',
    canDrive: 'Yes, but avoid high speeds or steep downhill braking. Inspect within 100 km.',
    warning: 'Grinding noise indicates bare metal-on-metal contact. Continuous driving will ruin rotors and double the repair cost.'
  },
  {
    id: 'engine-warning',
    symptom: 'Engine warning light (Check Engine / MIL)',
    category: 'Powertrain & Emission',
    severity: 'High',
    severityColor: '#ef4444',
    causes: [
      'Faulty Oxygen (O2) or Mass Airflow (MAF) Sensor',
      'Loose or damaged fuel filler cap',
      'Ignition coil misfire or fouled spark plugs',
      'Catalytic converter efficiency below threshold (P0420)'
    ],
    recommendedAction: 'Connect OBD-II scanner to read Diagnostic Trouble Codes (DTCs). Verify sensor live data stream.',
    estimatedCost: '₹900 (Scan) - ₹6,500 (Sensor/Coil)',
    estimatedTime: '45 mins - 3 hours',
    canDrive: 'If light is steady: drive gently to nearest service center. If FLASHING: STOP immediately to prevent engine ruin.',
    warning: 'A flashing check engine light indicates an active misfire dumping raw fuel into catalytic converter.'
  },
  {
    id: 'low-mileage',
    symptom: 'Low fuel efficiency / High consumption',
    category: 'Fuel Delivery & Intake',
    severity: 'Low',
    severityColor: '#38a8ff',
    causes: [
      'Underinflated tyres increasing rolling resistance',
      'Clogged engine air filter choking intake airflow',
      'Dirty fuel injectors or aged spark plugs',
      'Dragging brake caliper or poor quality fuel'
    ],
    recommendedAction: 'Check tyre pressure to recommended 32-35 PSI, replace air filter, and run a bottle of fuel injector cleaner.',
    estimatedCost: '₹500 - ₹2,200',
    estimatedTime: '30 mins',
    canDrive: 'Safe to drive. Resolving this will restore 10-18% of your vehicle range.',
    warning: 'Prolonged neglected fuel delivery may cause carbon buildup on intake valves.'
  },
  {
    id: 'ac-not-cooling',
    symptom: 'AC not cooling / Warm air from vents',
    category: 'Climate Control',
    severity: 'Medium',
    severityColor: '#f59e0b',
    causes: [
      'Low refrigerant (R134a/R1234yf) charge due to micro-leak',
      'Choked cabin AC filter blocking air circulation',
      'Compressor clutch relay failure or magnetic clutch wear',
      'Condenser coil blocked with road dirt or bugs'
    ],
    recommendedAction: 'Clean cabin filter, pressure test AC system with UV dye, and top up refrigerant oil & gas.',
    estimatedCost: '₹1,500 - ₹4,200',
    estimatedTime: '1 - 2.5 hours',
    canDrive: 'Safe to drive, but cabin comfort and defogging will be compromised.',
    warning: 'Running AC dry with zero refrigerant will cause compressor seizure.'
  },
  {
    id: 'starting-problem',
    symptom: 'Starting problem / Slow cranking',
    category: 'Electrical & Ignition',
    severity: 'High',
    severityColor: '#ef4444',
    causes: [
      'Weak 12V battery with degraded cold cranking amps (CCA)',
      'Corroded battery terminals or loose ground strap',
      'Starter motor solenoid sticking or worn carbon brushes',
      'Faulty fuel pump relay not priming system'
    ],
    recommendedAction: 'Perform battery load test. Clean terminals with wire brush and apply dielectric grease.',
    estimatedCost: '₹350 - ₹5,500 (New Battery)',
    estimatedTime: '45 mins',
    canDrive: 'Do not turn off engine in unsafe locations if jump started. Replace weak battery promptly.',
    warning: 'Repeated prolonged cranking can burn the starter motor windings.'
  },
  {
    id: 'suspension-noise',
    symptom: 'Suspension clunk over bumps or steering vibration',
    category: 'Chassis & Steering',
    severity: 'Medium',
    severityColor: '#f59e0b',
    causes: [
      'Worn stabilizer / sway bar link rods or bushings',
      'Leaking hydraulic strut / shock absorber damper',
      'Ball joint play or cracked lower control arm bushing',
      'Unbalanced wheels or bent rim lip'
    ],
    recommendedAction: 'Inspect suspension bushings on hydraulic lift. Replace stabilizer links in pairs.',
    estimatedCost: '₹1,400 - ₹4,800',
    estimatedTime: '1.5 - 3 hours',
    canDrive: 'Yes for local short trips, but avoid potholes and aggressive cornering.',
    warning: 'Severely worn ball joints can detach at speed causing loss of vehicle control.'
  }
];

export const INITIAL_GARAGES = [
  {
    id: 'g1',
    name: 'Apex AutoCraft & Performance',
    location: 'Jubilee Hills, Road No. 36, Hyderabad',
    distance: '1.8 km',
    rating: 4.9,
    reviewsCount: 342,
    services: ['Periodic Maintenance', 'Diagnostic Scan', 'AC Overhaul', 'Engine Tuning', 'Detailing'],
    priceTier: '₹₹₹',
    avgCost: '₹2,500 - ₹12,000',
    phone: '+91 98480 12345',
    verified: true,
    timing: '8:30 AM - 8:00 PM (Open Today)',
    features: ['OEM Spares Only', 'Digital Health Report', 'Free Pick & Drop', 'Lounge with WiFi']
  },
  {
    id: 'g2',
    name: 'SpeedyLube Express Car Care',
    location: 'Hitec City, Madhapur, Hyderabad',
    distance: '3.4 km',
    rating: 4.8,
    reviewsCount: 512,
    services: ['Quick Oil Service', 'Brake Inspection', 'Tyre Rotation', 'Wheel Alignment', 'PUC Check'],
    priceTier: '₹₹',
    avgCost: '₹1,200 - ₹5,500',
    phone: '+91 99887 65432',
    verified: true,
    timing: '8:00 AM - 9:30 PM (Express Bays Ready)',
    features: ['45-min Quick Service', 'Automated Wheel Balancer', 'Contactless Pay']
  },
  {
    id: 'g3',
    name: 'Bosch Car Service — Cyber Center',
    location: 'Gachibowli Financial District, Hyderabad',
    distance: '4.9 km',
    rating: 4.7,
    reviewsCount: 289,
    services: ['ECU Diagnostics', 'Braking Systems', 'Electrical & Battery', 'HV/EV Inspection', 'Suspension'],
    priceTier: '₹₹₹',
    avgCost: '₹3,000 - ₹15,000',
    phone: '+91 91234 56789',
    verified: true,
    timing: '9:00 AM - 7:30 PM (Appointments Preferred)',
    features: ['Bosch Master Techs', 'EV Certified Bays', 'Warranty Protected Spares']
  },
  {
    id: 'g4',
    name: 'Precision Tyres & 3D Laser Alignment',
    location: 'Kondapur Main Road, Hyderabad',
    distance: '2.6 km',
    rating: 4.9,
    reviewsCount: 680,
    services: ['3D Laser Alignment', 'Nitrogen Inflation', 'Tyre Balancing', 'TPMS Calibration'],
    priceTier: '₹',
    avgCost: '₹400 - ₹1,800',
    phone: '+91 94401 98765',
    verified: true,
    timing: '8:00 AM - 10:00 PM (Walk-ins Welcome)',
    features: ['Hunter HawkEye Elite Tech', 'Nitrogen Top-up Free', 'Tyre Warranty Claims']
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-rc',
    documentId: 'doc-rc',
    vehicleId: 'honda-city',
    title: 'Registration Certificate (RC)',
    subtitle: 'Ministry of Road Transport & Highways',
    docNumber: 'TS09FH4821',
    category: 'Registration',
    documentType: 'Registration Certificate (RC)',
    status: 'Valid',
    statusType: 'success',
    issueDate: '2023-03-15',
    expiryDate: '2038-03-14',
    fileSize: '2.4 MB',
    fileType: 'PDF',
    notes: 'Permanent Registration with RTA Hyderabad'
  },
  {
    id: 'doc-insurance',
    documentId: 'doc-insurance',
    vehicleId: 'honda-city',
    title: 'Comprehensive Motor Insurance',
    subtitle: 'HDFC ERGO General Insurance Policy',
    docNumber: 'POL-2025-998812',
    category: 'Insurance',
    documentType: 'Insurance',
    status: 'Valid',
    statusType: 'success',
    issueDate: '2025-11-21',
    expiryDate: '2026-11-20',
    fileSize: '4.1 MB',
    fileType: 'PDF',
    notes: 'Zero-depreciation + Engine protection add-on'
  },
  {
    id: 'doc-puc',
    documentId: 'doc-puc',
    vehicleId: 'honda-city',
    title: 'Pollution Under Control (PUC)',
    subtitle: 'Bharat Stage VI Emission Standard',
    docNumber: 'PUC-TS-09-88192',
    category: 'Compliance',
    documentType: 'Pollution Certificate (PUC)',
    status: 'Expiring Soon',
    statusType: 'warning',
    issueDate: '2026-04-16',
    expiryDate: '2026-10-15',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    notes: 'Emission levels within BS6 threshold'
  },
  {
    id: 'doc-dl',
    documentId: 'doc-dl',
    vehicleId: 'honda-city',
    title: "Driver's License (DL)",
    subtitle: 'Light Motor Vehicle (LMV) + MCWG',
    docNumber: 'DL-0920180049102',
    category: 'Personal ID',
    documentType: "Driver's License (DL)",
    status: 'Valid',
    statusType: 'success',
    issueDate: '2018-01-10',
    expiryDate: '2038-01-09',
    fileSize: '1.8 MB',
    fileType: 'PDF',
    notes: 'Transport Authority Smart Card'
  },
  {
    id: 'doc-rsa',
    documentId: 'doc-rsa',
    vehicleId: 'honda-city',
    title: '24/7 Roadside Assistance Card',
    subtitle: 'Towing, Flat Tyre, Battery Jumpstart',
    docNumber: 'RSA-AP-99042',
    category: 'Emergency',
    documentType: 'Roadside Assistance (RSA)',
    status: 'Valid',
    statusType: 'success',
    issueDate: '2026-01-01',
    expiryDate: '2026-12-31',
    fileSize: '850 KB',
    fileType: 'PDF',
    notes: 'Nationwide 24x7 roadside emergency coverage'
  }
];

export const INITIAL_REMINDERS = [
  {
    id: 'rem-1',
    reminderId: 'rem-1',
    vehicleId: 'honda-city',
    title: 'PUC Renewal Inspection',
    dueDate: '2026-10-15',
    category: 'PUC renewal',
    priority: 'High',
    vehicle: 'Honda City (TS 09 FH 4821)',
    completed: false,
    notes: 'Visit authorized emission test center before October 15.'
  },
  {
    id: 'rem-2',
    reminderId: 'rem-2',
    vehicleId: 'honda-city',
    title: '50,000 km Major General Service',
    dueDate: '2026-12-10',
    category: 'Vehicle service',
    priority: 'High',
    vehicle: 'Honda City (TS 09 FH 4821)',
    completed: false,
    notes: 'Engine oil (0W-20), oil filter, spark plugs, brake inspection.'
  },
  {
    id: 'rem-3',
    reminderId: 'rem-3',
    vehicleId: 'honda-city',
    title: 'Tyre Rotation & Wheel Balancing',
    dueDate: '2026-09-25',
    category: 'Maintenance',
    priority: 'Medium',
    vehicle: 'Honda City (TS 09 FH 4821)',
    completed: false,
    notes: 'Recommended every 10,000 km to prevent uneven outer shoulder wear.'
  },
  {
    id: 'rem-4',
    reminderId: 'rem-4',
    vehicleId: 'honda-city',
    title: 'Renew Comprehensive Insurance',
    dueDate: '2026-11-20',
    category: 'Insurance renewal',
    priority: 'High',
    vehicle: 'Honda City (TS 09 FH 4821)',
    completed: false,
    notes: 'Compare NCB renewal discount with zero-depreciation add-on.'
  },
  {
    id: 'rem-5',
    reminderId: 'rem-5',
    vehicleId: 'honda-city',
    title: 'Top up Windshield Washer Fluid',
    dueDate: '2026-09-12',
    category: 'DIY Care',
    priority: 'Normal',
    vehicle: 'Honda City (TS 09 FH 4821)',
    completed: true,
    notes: 'Filled 2.5L concentrated bug remover fluid.'
  }
];

export const INITIAL_FUEL_LOGS = [
  {
    id: 'fuel-1',
    vehicleId: 'honda-city',
    date: '2026-09-04',
    station: 'Shell V-Power — Jubilee Hills',
    litres: 34.2,
    cost: 3850,
    pricePerLitre: 112.5,
    odometer: 42680,
    tripDistance: 512,
    efficiency: 14.97, // km/L
    fullTank: true
  },
  {
    id: 'fuel-2',
    vehicleId: 'honda-city',
    date: '2026-08-22',
    station: 'Indian Oil XP95 — Gachibowli',
    litres: 32.8,
    cost: 3600,
    pricePerLitre: 109.8,
    odometer: 42168,
    tripDistance: 498,
    efficiency: 15.18,
    fullTank: true
  },
  {
    id: 'fuel-3',
    vehicleId: 'honda-city',
    date: '2026-08-08',
    station: 'HP Auto Care — Hitec City',
    litres: 35.0,
    cost: 3780,
    pricePerLitre: 108.0,
    odometer: 41670,
    tripDistance: 535,
    efficiency: 15.28,
    fullTank: true
  },
  {
    id: 'fuel-4',
    vehicleId: 'honda-city',
    date: '2026-07-24',
    station: 'Bharat Petroleum Speed — Madhapur',
    litres: 33.5,
    cost: 3650,
    pricePerLitre: 108.9,
    odometer: 41135,
    tripDistance: 485,
    efficiency: 14.48,
    fullTank: true
  }
];

export const INITIAL_SERVICE_HISTORY = [
  {
    id: 'srv-1',
    vehicleId: 'honda-city',
    vehicleName: 'Honda City',
    title: '40,000 km Scheduled Service & Synthetic Oil',
    date: 'Aug 10, 2025',
    garage: 'Honda Pride City Service Center',
    cost: 8400,
    odometer: 40120,
    category: 'Periodic Service',
    status: 'Completed',
    parts: ['Engine Oil 0W-20 Fully Synthetic (3.6L)', 'OEM Oil Filter', 'Drain Plug Gasket', 'Cabin AC Pollen Filter', 'Brake Caliper Greasing'],
    notes: 'Multi-point inspection cleared. Brake pads at 70% life remaining.'
  },
  {
    id: 'srv-2',
    vehicleId: 'honda-city',
    vehicleName: 'Honda City',
    title: 'Tyre Rotation & 3D Wheel Alignment',
    date: 'Jul 22, 2025',
    garage: 'Precision Tyres & 3D Laser Alignment',
    cost: 1200,
    odometer: 39500,
    category: 'Tyres & Alignment',
    status: 'Completed',
    parts: ['Wheel Balancing Weights (60g)', 'Nitrogen Gas Top-up 32 PSI'],
    notes: 'Camber and toe adjusted to factory specification. Smooth high-speed tracking.'
  },
  {
    id: 'srv-3',
    vehicleId: 'honda-city',
    vehicleName: 'Honda City',
    title: 'Annual Comprehensive Insurance Renewal',
    date: 'Jun 15, 2025',
    garage: 'HDFC ERGO Direct Portal',
    cost: 12300,
    odometer: 38200,
    category: 'Insurance & Legal',
    status: 'Completed',
    parts: ['Zero Depreciation Cover', 'Engine & Gearbox Protector', 'Consumables Add-on', '24x7 RSA'],
    notes: 'No-Claim Bonus (NCB) of 35% applied.'
  },
  {
    id: 'srv-4',
    vehicleId: 'honda-city',
    vehicleName: 'Honda City',
    title: 'Intermediate Engine Oil & Filter Change',
    date: 'Feb 18, 2025',
    garage: 'Apex AutoCraft & Performance',
    cost: 2500,
    odometer: 33400,
    category: 'Oil & Lube',
    status: 'Completed',
    parts: ['Castrol Magnatec Professional 0W-20', 'Oil Filter Element'],
    notes: 'Pre-road trip preventative maintenance.'
  }
];

export function AppProvider({ children }) {
  // Authentication State (defaults to false for first visit, persisted safely with corruption recovery)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      let localAuth = null;
      let sessionAuth = null;
      try {
        if (typeof localStorage !== 'undefined') localAuth = localStorage.getItem('autopulse_auth');
      } catch (_) {}
      try {
        if (typeof sessionStorage !== 'undefined') sessionAuth = sessionStorage.getItem('autopulse_auth');
      } catch (_) {}

      const val = localAuth !== null ? localAuth : sessionAuth;
      if (!val) return false;
      const parsed = JSON.parse(val);
      return parsed === true;
    } catch (e) {
      console.warn('[AppContext] Malformed auth storage, resetting to unauthenticated:', e);
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem('autopulse_auth');
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('autopulse_auth');
      } catch (_) {}
      return false;
    }
  });

  // User Profile State
  const [user, setUser] = useState(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedUser = localStorage.getItem('autopulse_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      }
    } catch (e) {
      console.warn('[AppContext] Malformed user profile in storage:', e);
    }
    return {
      name: 'Charantej',
      email: 'charantej@autopulse.io',
      phone: '+91 98480 99221',
      role: 'Car Enthusiast',
      location: 'Hyderabad',
      avatar: 'C',
      units: 'Metric (km, L, °C)',
      notifications: true,
      bio: 'Automotive enthusiast & daily driver. Keeping performance in peak shape.'
    };
  });

  // Active Tab / Navigation State
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active Vehicle State
  const [vehicle, setVehicle] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedVehicle = localStorage.getItem('garage_vehicle') || localStorage.getItem('autopulse_vehicle');
        if (savedVehicle) {
          const parsed = JSON.parse(savedVehicle);
          if (parsed && typeof parsed === 'object') {
            return buildVehicleObject(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('[AppContext] Malformed vehicle in storage:', e);
    }
    return null;
  });

  const [isVehicleLoading, setIsVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);

  // Safely updates vehicle with external API image resolution & fallback hierarchy
  const updateVehicleSafely = async (vehicleData) => {
    if (!vehicleData) {
      setVehicle(null);
      localStorage.removeItem('garage_vehicle');
      localStorage.removeItem('autopulse_vehicle');
      return;
    }

    setIsVehicleLoading(true);
    setVehicleError(null);

    try {
      // 1. Resolve matching vehicle image from API/cache
      const resolvedImage = await resolveVehicleImage(
        vehicleData.manufacturer,
        vehicleData.model,
        vehicleData.year
      );

      // 2. Build full vehicle object with synchronized identity and image
      const normalizedVehicle = buildVehicleObject(vehicleData, resolvedImage);
      setVehicle(normalizedVehicle);
      localStorage.setItem('garage_vehicle', JSON.stringify(normalizedVehicle));
      localStorage.setItem('autopulse_vehicle', JSON.stringify(normalizedVehicle));
    } catch (err) {
      console.warn('Vehicle image resolution warning:', err);
      // Non-blocking fallback
      setVehicleError('Vehicle image service is temporarily unavailable. Your vehicle information is still saved.');
      const fallbackVehicle = buildVehicleObject(vehicleData);
      setVehicle(fallbackVehicle);
      localStorage.setItem('garage_vehicle', JSON.stringify(fallbackVehicle));
      localStorage.setItem('autopulse_vehicle', JSON.stringify(fallbackVehicle));
    } finally {
      setIsVehicleLoading(false);
    }
  };

  // Collections State
  const [diagnostics, setDiagnostics] = useState(INITIAL_DIAGNOSTICS);
  const [selectedDiagnosticId, setSelectedDiagnosticId] = useState('brake-noise');
  const [garages, setGarages] = useState(INITIAL_GARAGES);
  const [documents, setDocuments] = useState(() => loadDocumentsStorage(INITIAL_DOCUMENTS));
  const [reminders, setReminders] = useState(() => loadRemindersStorage(INITIAL_REMINDERS));
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);
  
  // Persistent Service History State
  const [serviceHistory, setServiceHistory] = useState(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('autopulse_service_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('[AppContext] Malformed service history in storage:', e);
    }
    return INITIAL_SERVICE_HISTORY;
  });

  // Persistent Maintenance Checklist Items
  const [maintenanceItems, setMaintenanceItems] = useState(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('autopulse_maintenance_items');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('[AppContext] Malformed maintenance items in storage:', e);
    }
    return [
      {
        id: 'maint-1',
        title: 'Engine Oil & Filter Renewal',
        category: 'Engine Oil',
        dueOdometer: 50000,
        dueDate: '2026-12-10',
        notes: '0W-20 Fully Synthetic Oil with OEM filter element',
        completed: false,
        vehicleId: 'honda-city'
      },
      {
        id: 'maint-2',
        title: '3D Wheel Alignment & Tyre Rotation',
        category: 'Tyre Rotation',
        dueOdometer: 45000,
        dueDate: '2026-09-25',
        notes: 'Rotate all 4 wheels and balance front axle',
        completed: false,
        vehicleId: 'honda-city'
      },
      {
        id: 'maint-3',
        title: 'Brake Caliper & Pad Inspection',
        category: 'Brake Inspection',
        dueOdometer: 45000,
        dueDate: '2026-10-05',
        notes: 'Measure brake pad lining thickness (>3mm threshold)',
        completed: false,
        vehicleId: 'honda-city'
      },
      {
        id: 'maint-4',
        title: '12V Starter Battery Health Check',
        category: 'Battery Check',
        dueOdometer: 48000,
        dueDate: '2026-11-15',
        notes: 'Conductance load test and terminal corrosion clean',
        completed: false,
        vehicleId: 'honda-city'
      },
      {
        id: 'maint-5',
        title: 'Cabin HEPA Pollen & Engine Air Filter',
        category: 'Air Filter',
        dueOdometer: 50000,
        dueDate: '2026-12-10',
        notes: 'Clean/replace cabin air filter for optimal AC efficiency',
        completed: false,
        vehicleId: 'honda-city'
      }
    ];
  });

  // Persistent General Expenses State
  const [expenses, setExpenses] = useState(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('autopulse_expenses');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('[AppContext] Malformed expenses in storage:', e);
    }
    return [
      {
        id: 'exp-1',
        category: 'Service',
        amount: 8400,
        date: '2025-08-10',
        description: '40,000 km Scheduled Service & Synthetic Oil',
        vehicleId: 'honda-city',
        vehicleName: 'Honda City'
      },
      {
        id: 'exp-2',
        category: 'Parts',
        amount: 1200,
        date: '2025-07-22',
        description: 'Wheel balancing counter-weights & nitrogen top-up',
        vehicleId: 'honda-city',
        vehicleName: 'Honda City'
      },
      {
        id: 'exp-3',
        category: 'Insurance',
        amount: 12300,
        date: '2025-06-15',
        description: 'Annual Comprehensive Zero-Dep Insurance Renewal',
        vehicleId: 'honda-city',
        vehicleName: 'Honda City'
      },
      {
        id: 'exp-4',
        category: 'Fuel',
        amount: 3950,
        date: '2026-08-22',
        description: 'Shell V-Power Petrol Full Tank (36.0 L)',
        vehicleId: 'honda-city',
        vehicleName: 'Honda City'
      },
      {
        id: 'exp-5',
        category: 'Repairs',
        amount: 2500,
        date: '2025-02-18',
        description: 'Intermediate oil change and wiper blade replacement',
        vehicleId: 'honda-city',
        vehicleName: 'Honda City'
      }
    ];
  });

  // Persist collections to localStorage safely
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('autopulse_service_history', JSON.stringify(serviceHistory));
      }
    } catch (e) {}
  }, [serviceHistory]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('autopulse_maintenance_items', JSON.stringify(maintenanceItems));
      }
    } catch (e) {}
  }, [maintenanceItems]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('autopulse_expenses', JSON.stringify(expenses));
      }
    } catch (e) {}
  }, [expenses]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('autopulse_documents', JSON.stringify(documents));
      }
    } catch (e) {}
  }, [documents]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('autopulse_reminders', JSON.stringify(reminders));
      }
    } catch (e) {}
  }, [reminders]);

  // User Location State (External Geolocation & Reverse Geocoding)
  const [userLocation, setUserLocation] = useState({
    latitude: 17.4325,
    longitude: 78.4071,
    city: 'Hyderabad',
    area: 'Jubilee Hills',
    formattedLocation: 'Jubilee Hills, Hyderabad',
    isFallback: true
  });
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Weather State (External Live Weather API with Cache & Fallback)
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'Sunny',
    city: 'Hyderabad',
    humidity: 58,
    windSpeed: '12 km/h',
    isFallback: true
  });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Garages State (External Places Discovery with Distance Calculation)
  const [isGaragesLoading, setIsGaragesLoading] = useState(false);
  const [garagesError, setGaragesError] = useState(null);

  // Vehicle Health State (External Telemetry Service Abstraction & Fallback Engine)
  const [vehicleHealth, setVehicleHealth] = useState(() => {
    if (!vehicle) return null;
    const initialAssessment = calculateVehicleHealth(vehicle, INITIAL_SERVICE_HISTORY, 'brake-noise', INITIAL_DIAGNOSTICS);
    return {
      overallScore: initialAssessment.overallScore || 94,
      overallStatus: initialAssessment.overallStatus || 'Optimal',
      overallLabel: initialAssessment.overallLabel || 'Good Condition',
      subsystems: vehicle?.subsystems || {},
      components: initialAssessment.components || [],
      systemsEvaluated: initialAssessment.systemsEvaluated || 6,
      needsAttentionCount: initialAssessment.needsAttentionCount || 0,
      nextAction: initialAssessment.nextAction || 'Standard periodic milestone inspection.',
      isExternalTelemetry: false,
      telemetrySource: 'Vehicle Health Intelligence Engine'
    };
  });
  const [isVehicleHealthLoading, setIsVehicleHealthLoading] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'PUC Certificate Expiring Soon', desc: 'Your PUC test is due in 34 days.', time: '2 hours ago', read: false },
    { id: 'notif-2', title: 'Tyre Pressure Alert', desc: 'Front Right tyre recommended at 32 PSI.', time: 'Yesterday', read: false },
    { id: 'notif-3', title: 'Monthly Fuel Summary Ready', desc: 'You drove 1,480 km with 15.0 km/L avg efficiency.', time: '3 days ago', read: true }
  ]);

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync to localStorage (preserves both garage_vehicle and autopulse_vehicle)
  // Persistent auth state synced in login/logout handlers
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.removeItem('autopulse_auth');
        sessionStorage.removeItem('autopulse_auth');
      } catch (e) {}
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('autopulse_user', JSON.stringify(user));
      }
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        if (vehicle) {
          localStorage.setItem('garage_vehicle', JSON.stringify(vehicle));
          localStorage.setItem('autopulse_vehicle', JSON.stringify(vehicle));
        } else {
          localStorage.removeItem('garage_vehicle');
          localStorage.removeItem('autopulse_vehicle');
        }
      }
    } catch (_) {}
  }, [vehicle]);

  // 1. Detect user location once on mount (Non-blocking, cached, safe fallback)
  useEffect(() => {
    let isMounted = true;
    setIsLocationLoading(true);
    getUserLocation()
      .then((loc) => {
        if (isMounted && loc) {
          setUserLocation(loc);
        }
      })
      .catch((err) => {
        console.warn('[AppContext] Geolocation init error:', err);
        if (isMounted) setLocationError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLocationLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Refresh Weather from External API
  const refreshWeather = useCallback(async (forceRefresh = false) => {
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchCurrentWeather(userLocation, forceRefresh);
      if (data) {
        setWeather(data);
      }
    } catch (err) {
      console.warn('[AppContext] Weather fetch error:', err);
      setWeatherError('Weather service temporarily using cached data.');
    } finally {
      setIsWeatherLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    refreshWeather();
  }, [refreshWeather]);

  // 3. Refresh Garages from External Places API or Calibrated Nearby Centers
  const refreshGarages = useCallback(async (serviceFilter = 'All') => {
    setIsGaragesLoading(true);
    setGaragesError(null);
    try {
      const res = await fetchNearbyGarages(userLocation, serviceFilter);
      if (res && res.garages) {
        setGarages(res.garages);
        if (res.error) setGaragesError(res.error);
      }
    } catch (err) {
      console.warn('[AppContext] Garage discovery error:', err);
      setGaragesError('Could not fetch external garages. Showing verified partners.');
    } finally {
      setIsGaragesLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    refreshGarages();
  }, [refreshGarages]);

  // 4. Evaluate Vehicle Health Telemetry via VehicleHealthService
  useEffect(() => {
    let isMounted = true;
    if (!vehicle) {
      setVehicleHealth(null);
      setIsVehicleHealthLoading(false);
      return;
    }

    setIsVehicleHealthLoading(true);
    const currentVId = vehicle?.id || vehicle?.vehicleId || null;
    const vehicleServices = Array.isArray(serviceHistory) && currentVId
      ? serviceHistory.filter(s => s.vehicleId === currentVId || s.vehicleId === vehicle?.model?.toLowerCase())
      : [];

    getVehicleHealthAssessment(vehicle, vehicleServices, selectedDiagnosticId, diagnostics)
      .then((assessment) => {
        if (isMounted && assessment) {
          setVehicleHealth(assessment);
        }
      })
      .catch((err) => {
        console.warn('[AppContext] Vehicle health assessment error:', err);
      })
      .finally(() => {
        if (isMounted) setIsVehicleHealthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [vehicle, serviceHistory, selectedDiagnosticId, diagnostics]);

  // User methods
  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      if (updates.name) {
        updated.avatar = updates.name.trim().charAt(0).toUpperCase() || 'U';
      }
      return updated;
    });
  };

  const login = (userData, remember = true) => {
    setIsAuthenticated(true);
    try {
      if (remember) {
        localStorage.setItem('autopulse_auth', JSON.stringify(true));
        sessionStorage.removeItem('autopulse_auth');
      } else {
        sessionStorage.setItem('autopulse_auth', JSON.stringify(true));
        localStorage.removeItem('autopulse_auth');
      }
    } catch (e) {
      console.warn('[AppContext] Storage error during login:', e);
    }
    if (userData?.name) {
      updateUser(userData);
    }
    setActiveTab('Dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('autopulse_auth');
      sessionStorage.removeItem('autopulse_auth');
    } catch (e) {}
    setActiveTab('Dashboard');
  };

  // Reminder methods
  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => {
      if (r.id === id || r.reminderId === id) {
        const nextCompleted = !r.completed;
        return {
          ...r,
          completed: nextCompleted,
          completedDate: nextCompleted ? new Date().toISOString().split('T')[0] : null
        };
      }
      return r;
    }));
  };

  const addReminder = (newRem) => {
    const currentVId = vehicle?.id || vehicle?.vehicleId || null;
    const normalized = normalizeReminder({
      ...newRem,
      vehicleId: newRem.vehicleId || currentVId,
      vehicle: newRem.vehicle || (vehicle ? `${vehicle.manufacturer} ${vehicle.model} (${vehicle.regNumber || ''})` : 'Vehicle')
    }, currentVId);
    setReminders(prev => [normalized, ...prev]);
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id && r.reminderId !== id));
  };

  // Document methods
  const addDocument = (doc) => {
    const currentVId = vehicle?.id || vehicle?.vehicleId || null;
    const normalized = normalizeDocument({
      ...doc,
      vehicleId: doc.vehicleId || currentVId
    }, currentVId);
    setDocuments(prev => [normalized, ...prev]);
  };

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id && d.documentId !== id));
  };

  // Fuel log methods
  const addFuelLog = (newLog) => {
    setFuelLogs(prev => [newLog, ...prev]);
  };

  // Service history methods
  const addServiceRecord = (record) => {
    setServiceHistory(prev => [record, ...prev]);
  };

  // Maintenance item methods
  const addMaintenanceItem = (item) => {
    setMaintenanceItems(prev => [item, ...prev]);
  };

  const toggleMaintenanceItem = (id) => {
    setMaintenanceItems(prev => prev.map(m => {
      if (m.id === id) {
        const nextCompleted = !m.completed;
        return {
          ...m,
          completed: nextCompleted,
          completedDate: nextCompleted ? new Date().toISOString().split('T')[0] : null
        };
      }
      return m;
    }));
  };

  const deleteMaintenanceItem = (id) => {
    setMaintenanceItems(prev => prev.filter(m => m.id !== id));
  };

  // Expense methods
  const addExpense = (expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Navigate helper
  const navigateTo = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    user,
    updateUser,
    activeTab,
    setActiveTab: navigateTo,
    isSidebarOpen,
    setIsSidebarOpen,
    vehicle,
    setVehicle: updateVehicleSafely,
    isVehicleLoading,
    vehicleError,
    setVehicleError,
    vehicleHealth,
    isVehicleHealthLoading,
    diagnostics,
    selectedDiagnosticId,
    setSelectedDiagnosticId,
    // Garages State & Discovery Service
    garages,
    setGarages,
    isGaragesLoading,
    garagesError,
    refreshGarages,
    documents,
    addDocument,
    deleteDocument,
    reminders,
    toggleReminder,
    addReminder,
    deleteReminder,
    fuelLogs,
    addFuelLog,
    serviceHistory,
    addServiceRecord,
    // Maintenance & Expenses State
    maintenanceItems,
    addMaintenanceItem,
    toggleMaintenanceItem,
    deleteMaintenanceItem,
    expenses,
    addExpense,
    deleteExpense,
    // Location & Weather Services
    userLocation,
    setUserLocation,
    isLocationLoading,
    locationError,
    weather,
    setWeather,
    isWeatherLoading,
    weatherError,
    refreshWeather,
    notifications,
    setNotifications,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
