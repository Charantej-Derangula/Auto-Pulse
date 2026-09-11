/**
 * Auto Pulse — AI Vehicle Diagnosis Engine (Frontend Prototype)
 * 
 * Deterministic, rule-based diagnostic engine for vehicle symptom analysis.
 * Analyzes reported symptoms, selected vehicle system, and vehicle profile
 * (fuel type, age, odometer, health score) to produce detailed diagnostic assessments.
 * 
 * Architecture Note:
 * This module is architected with a clean async interface so that a cloud-based
 * LLM / real vehicle diagnosis API can be plugged in seamlessly in the future.
 */

export const VEHICLE_SYSTEMS = [
  'Engine',
  'Brakes',
  'Battery',
  'Transmission',
  'AC & Climate',
  'Electrical',
  'Suspension',
  'Tyres',
  'Other'
];

export const COMMON_SYMPTOMS = [
  'Difficulty Starting',
  'Strange Noise',
  'Vibration',
  'Warning Light',
  'Poor Braking',
  'Overheating',
  'Low Mileage',
  'AC Not Cooling',
  'Fluid Leakage'
];

export const SEVERITY_LEVELS = {
  LOW: {
    level: 'LOW',
    label: 'Low Severity',
    color: '#38a8ff',
    badgeClass: 'badge-good',
    bg: 'rgba(56, 168, 255, 0.12)',
    border: 'rgba(56, 168, 255, 0.35)'
  },
  MEDIUM: {
    level: 'MEDIUM',
    label: 'Medium Severity',
    color: '#f59e0b',
    badgeClass: 'badge-warning',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)'
  },
  HIGH: {
    level: 'HIGH',
    label: 'High Severity',
    color: '#f97316',
    badgeClass: 'badge-alert',
    bg: 'rgba(249, 115, 22, 0.14)',
    border: 'rgba(249, 115, 22, 0.4)'
  },
  CRITICAL: {
    level: 'CRITICAL',
    label: 'Critical Severity',
    color: '#ef4444',
    badgeClass: 'badge-danger',
    bg: 'rgba(239, 68, 68, 0.16)',
    border: 'rgba(239, 68, 68, 0.45)'
  }
};

/**
 * Deterministic diagnosis knowledge rules
 */
const DIAGNOSIS_RULES = [
  // 1. ENGINE & OVERHEATING / SMOKE (CRITICAL)
  {
    matches: (sys, text) => (sys === 'Engine' || sys === 'Other') && (text.includes('overheat') || text.includes('temperature') || text.includes('smoke') || text.includes('steam')),
    diagnosis: 'Possible Engine Cooling System Failure / Severe Overheating',
    severity: 'CRITICAL',
    confidence: '94%',
    possibleCauses: [
      'Low coolant level or critical radiator hose leak',
      'Faulty radiator cooling fan or stuck thermostat valve',
      'Water pump mechanical failure or broken drive belt',
      'Blown cylinder head gasket'
    ],
    recommendedAction: 'Pull over safely and turn off the engine immediately. Do not attempt to open the radiator cap while hot. Arrange roadside assistance / towing to an authorized service bay.',
    suggestedService: 'Engine Cooling System & Head Gasket Overhaul',
    immediateAttention: true,
    estimatedCost: '₹3,500 - ₹18,000',
    estimatedTime: '3 - 6 hours',
    dtcCode: 'P0217 (Engine Coolant Over-Temperature)'
  },
  // 2. BRAKES & POOR BRAKING (HIGH)
  {
    matches: (sys, text) => sys === 'Brakes' && (text.includes('poor braking') || text.includes('spongy') || text.includes('hard pedal') || text.includes('long distance') || text.includes('fluid leak') || text.includes('fail')),
    diagnosis: 'Possible Hydraulic Brake Line / Master Cylinder Degradation',
    severity: 'HIGH',
    confidence: '92%',
    possibleCauses: [
      'Severe brake pad / shoe wear beyond minimum safety threshold (<2mm)',
      'Air trapped in hydraulic brake lines or moisture contamination in DOT4 fluid',
      'Brake master cylinder or brake booster vacuum leak',
      'Leaking brake caliper piston seals'
    ],
    recommendedAction: 'Inspect brake fluid reservoir level and pad thickness immediately. Do not drive at high speeds or steep inclines. Have hydraulic lines bled and pads replaced.',
    suggestedService: 'Comprehensive Brake System & Pad Replacement',
    immediateAttention: true,
    estimatedCost: '₹2,200 - ₹7,500',
    estimatedTime: '2 - 3 hours',
    dtcCode: 'C0040 (Brake Pedal Switch / Hydraulic Circuit)'
  },
  // 3. BRAKES & NOISE / SQUEAL (MEDIUM)
  {
    matches: (sys, text) => sys === 'Brakes' && (text.includes('noise') || text.includes('squeal') || text.includes('grind') || text.includes('sound')),
    diagnosis: 'Possible Brake Pad Wear or Rotor Glazing',
    severity: 'MEDIUM',
    confidence: '89%',
    possibleCauses: [
      'Brake pad wear indicator touching the brake rotor',
      'Dust, grit or small stones trapped between pad and disc rotor',
      'Glazed brake pads from repeated hard braking',
      'Dry or sticking caliper slider pins'
    ],
    recommendedAction: 'Schedule a brake inspection. Clean caliper slider pins and replace brake pads if worn below 3mm.',
    suggestedService: 'Brake Inspection & Caliper Servicing',
    immediateAttention: false,
    estimatedCost: '₹1,500 - ₹4,200',
    estimatedTime: '1 - 2 hours',
    dtcCode: 'C1095 (ABS / Brake Hardware Alert)'
  },
  // 4. BATTERY & STARTING / CRANKING (MEDIUM)
  {
    matches: (sys, text) => (sys === 'Battery' || sys === 'Electrical') && (text.includes('start') || text.includes('crank') || text.includes('dead') || text.includes('jump') || text.includes('weak')),
    diagnosis: 'Possible Starter Battery Discharge or Alternator Charging Issue',
    severity: 'MEDIUM',
    confidence: '95%',
    possibleCauses: [
      '12V starter battery state of health degraded (internal resistance high / voltage <12.2V)',
      'Corroded or loose battery terminal clamps',
      'Alternator voltage regulator malfunction (charging voltage <13.8V)',
      'Parasitic battery draw from aftermarket accessories'
    ],
    recommendedAction: 'Perform 12V battery load test and inspect alternator charging voltage. Clean terminal corrosion with contact cleaner and tighten terminals.',
    suggestedService: '12V Battery Health Test & Charging System Inspection',
    immediateAttention: false,
    estimatedCost: '₹800 (Testing/Charging) - ₹5,500 (New Battery)',
    estimatedTime: '30 - 60 mins',
    dtcCode: 'P0562 (System Voltage Low)'
  },
  // 5. ENGINE & WARNING LIGHT / MISFIRE (HIGH)
  {
    matches: (sys, text) => (sys === 'Engine' || sys === 'Electrical') && (text.includes('warning light') || text.includes('check engine') || text.includes('mil') || text.includes('misfire')),
    diagnosis: 'Possible Engine Ignition / Fuel Delivery Misfire',
    severity: 'HIGH',
    confidence: '90%',
    possibleCauses: [
      'Faulty ignition coil or fouled spark plugs',
      'Oxygen (O2) sensor or Mass Airflow (MAF) sensor out of calibration',
      'Clogged fuel injector or low fuel rail pressure',
      'Catalytic converter efficiency threshold warning (P0420)'
    ],
    recommendedAction: 'Connect OBD-II CAN scanner to read Diagnostic Trouble Codes (DTCs). If check engine light is flashing, stop driving immediately.',
    suggestedService: 'OBD-II Computer Diagnostic Scan & Ignition Overhaul',
    immediateAttention: true,
    estimatedCost: '₹1,200 - ₹6,500',
    estimatedTime: '1 - 3 hours',
    dtcCode: 'P0300 (Random/Multiple Cylinder Misfire Detected)'
  },
  // 6. ENGINE & VIBRATION (MEDIUM)
  {
    matches: (sys, text) => sys === 'Engine' && (text.includes('vibration') || text.includes('shake') || text.includes('rough idle') || text.includes('shudder')),
    diagnosis: 'Possible Engine Mount Wear or Throttle Body Carbon Buildup',
    severity: 'MEDIUM',
    confidence: '88%',
    possibleCauses: [
      'Worn or cracked hydraulic engine / gearbox rubber mounts',
      'Carbon deposits on throttle body butterfly plate causing rough idle',
      'Dirty idle air control valve or minor spark plug gap variation',
      'Fuel rail pressure fluctuation'
    ],
    recommendedAction: 'Inspect condition of hydraulic engine mounts. Perform electronic throttle body cleaning and recalibration.',
    suggestedService: 'Engine Mounting Check & Throttle Body Cleaning',
    immediateAttention: false,
    estimatedCost: '₹1,800 - ₹5,500',
    estimatedTime: '1.5 - 3 hours',
    dtcCode: 'P0505 (Idle Air Control System)'
  },
  // 7. AC & NOT COOLING (MEDIUM)
  {
    matches: (sys, text) => (sys === 'AC & Climate') && (text.includes('not cooling') || text.includes('warm') || text.includes('cooling') || text.includes('smell') || text.includes('airflow')),
    diagnosis: 'Possible AC Refrigerant Depletion or Choked Cabin Air Filter',
    severity: 'MEDIUM',
    confidence: '91%',
    possibleCauses: [
      'Low AC refrigerant gas (R134a/R1234yf) due to O-ring micro-leaks',
      'Choked cabin pollen filter restricting blower airflow',
      'AC compressor magnetic clutch relay failure',
      'Dust clogging condenser cooling fins in front grille'
    ],
    recommendedAction: 'Replace cabin AC filter and perform nitrogen pressure leak test before refrigerant gas top-up.',
    suggestedService: 'AC Gas Recovery & Cabin Filter Renewal',
    immediateAttention: false,
    estimatedCost: '₹1,200 - ₹3,800',
    estimatedTime: '1 - 2 hours',
    dtcCode: 'B1002 (Climate Control Actuator / Sensor Circuit)'
  },
  // 8. TYRES & VIBRATION (MEDIUM)
  {
    matches: (sys, text) => (sys === 'Tyres' || sys === 'Suspension') && (text.includes('vibration') || text.includes('pulling') || text.includes('wobble') || text.includes('steering')),
    diagnosis: 'Possible Wheel Balancing or Steering Wheel Alignment Imbalance',
    severity: 'MEDIUM',
    confidence: '93%',
    possibleCauses: [
      'Missing or shifted wheel balancing counter-weights',
      'Uneven tyre tread wear or camber/toe angle misalignment',
      'Tyre sidewall bulge or bent alloy wheel rim from pothole impact',
      'Worn tie-rod ends or steering rack ball joints'
    ],
    recommendedAction: 'Perform 3D computerized wheel alignment and 4-wheel dynamic balancing.',
    suggestedService: '3D Laser Wheel Alignment & Dynamic Balancing',
    immediateAttention: false,
    estimatedCost: '₹600 - ₹1,800',
    estimatedTime: '45 - 60 mins',
    dtcCode: 'C1201 (Steering Angle / Wheel Speed Variance)'
  },
  // 9. TRANSMISSION & SHIFTING / SLIPPING (HIGH)
  {
    matches: (sys, text) => sys === 'Transmission' && (text.includes('shift') || text.includes('gear') || text.includes('slip') || text.includes('clutch') || text.includes('jerk')),
    diagnosis: 'Possible Transmission Fluid Degradation or Clutch Pack Wear',
    severity: 'HIGH',
    confidence: '89%',
    possibleCauses: [
      'Degraded transmission fluid (ATF / CVT fluid / MT gear oil)',
      'Worn clutch friction plate or dry release bearing (Manual)',
      'Transmission mechatronic control solenoid pressure irregularity (Automatic/DCT)',
      'Low fluid level causing torque converter slip'
    ],
    recommendedAction: 'Check transmission fluid level and quality. Inspect clutch free-play or scan TCU for transmission slip codes.',
    suggestedService: 'Transmission Fluid Flush & Clutch Assembly Inspection',
    immediateAttention: true,
    estimatedCost: '₹3,500 - ₹16,000',
    estimatedTime: '2.5 - 5 hours',
    dtcCode: 'P0700 (Transmission Control System Malfunction)'
  },
  // 10. SUSPENSION & NOISE / THUD (MEDIUM)
  {
    matches: (sys, text) => sys === 'Suspension' && (text.includes('noise') || text.includes('thud') || text.includes('clunk') || text.includes('bump') || text.includes('rough')),
    diagnosis: 'Possible Shock Absorber Leakage or Stabilizer Link Bushing Wear',
    severity: 'MEDIUM',
    confidence: '87%',
    possibleCauses: [
      'Blown hydraulic fluid seals on front/rear shock absorber struts',
      'Worn stabilizer anti-roll bar bushes or ball joints',
      'Lower control arm rubber bushing tears',
      'Cracked strut top mount bearing'
    ],
    recommendedAction: 'Hoist vehicle for underbody suspension inspection. Replace damaged stabilizer links or leaking strut assemblies.',
    suggestedService: 'Suspension Bushing & Strut Overhaul',
    immediateAttention: false,
    estimatedCost: '₹2,500 - ₹8,500',
    estimatedTime: '2 - 4 hours',
    dtcCode: 'C1300 (Chassis Dampening Circuit Alert)'
  },
  // 11. ELECTRICAL & LIGHTS / ACCESSORIES (LOW)
  {
    matches: (sys, text) => sys === 'Electrical' && (text.includes('light') || text.includes('fuse') || text.includes('horn') || text.includes('window') || text.includes('display')),
    diagnosis: 'Possible Blown Circuit Fuse or Body Control Relay Fault',
    severity: 'LOW',
    confidence: '90%',
    possibleCauses: [
      'Blown primary/secondary blade fuse in fuse box',
      'Loose electrical ground wiring connection',
      'Power window switch / motor contact resistance',
      'Infotainment / instrument cluster CAN bus handshake timeout'
    ],
    recommendedAction: 'Inspect fuse diagram in cabin/engine fuse box and test continuity of affected circuit.',
    suggestedService: 'Electrical Wiring & Fuse Continuity Diagnosis',
    immediateAttention: false,
    estimatedCost: '₹400 - ₹1,800',
    estimatedTime: '30 - 45 mins',
    dtcCode: 'B1318 (Battery Voltage Circuit High/Low)'
  },
  // 12. FLUID LEAKAGE (HIGH)
  {
    matches: (sys, text) => text.includes('fluid leakage') || text.includes('leak') || text.includes('oil drop') || text.includes('puddle'),
    diagnosis: 'Possible Powertrain Gasket / Hose Seal Fluid Leakage',
    severity: 'HIGH',
    confidence: '91%',
    possibleCauses: [
      'Engine oil sump drain washer or valve cover gasket seepage',
      'Coolant hose clamp deterioration or radiator core pinhole',
      'Brake line banjo fitting or master cylinder seal leak',
      'Power steering rack hydraulic fluid leak'
    ],
    recommendedAction: 'Identify fluid color (amber=engine oil, pink/green=coolant, clear/yellow=brake fluid). Check fluid levels and top up before driving to workshop.',
    suggestedService: 'Underbody Fluid Leak Detection & Gasket Seal Replacement',
    immediateAttention: true,
    estimatedCost: '₹1,500 - ₹6,500',
    estimatedTime: '1.5 - 3 hours',
    dtcCode: 'P0115 (Fluid Temp / Fluid Pressure Discrepancy)'
  }
];

/**
 * Perform deterministic diagnosis on the input parameters
 * @param {Object} params
 * @param {string} params.system Selected vehicle system
 * @param {string} params.symptoms Problem description and selected chips
 * @param {Object} params.vehicle Current active vehicle object
 * @returns {Promise<Object>} Diagnosis result
 */
export async function analyzeVehicleIssue({ system = 'Engine', symptoms = '', vehicle = null }) {
  // Simulate intelligent analysis delay (400ms - 800ms) for realistic UX
  await new Promise(resolve => setTimeout(resolve, 650));

  const cleanSystem = system || 'Engine';
  const cleanSymptoms = (symptoms || '').trim().toLowerCase();

  // Find matching rule
  let matchedRule = DIAGNOSIS_RULES.find(rule => rule.matches(cleanSystem, cleanSymptoms));

  // Fallback if no specific rule matched
  if (!matchedRule) {
    const isCriticalKeyword = cleanSymptoms.includes('smoke') || cleanSymptoms.includes('fire') || cleanSymptoms.includes('brake fail') || cleanSymptoms.includes('lost control');
    const isHighKeyword = cleanSymptoms.includes('noise') || cleanSymptoms.includes('leak') || cleanSymptoms.includes('engine') || cleanSymptoms.includes('gear');

    matchedRule = {
      diagnosis: `Possible ${cleanSystem} Subsystem Variance (Further Inspection Recommended)`,
      severity: isCriticalKeyword ? 'CRITICAL' : isHighKeyword ? 'HIGH' : 'MEDIUM',
      confidence: '82%',
      possibleCauses: [
        `Mechanical wear in ${cleanSystem.toLowerCase()} components`,
        `Sensor calibration drift or intermittent electronic signal in ${cleanSystem.toLowerCase()}`,
        'Environmental contamination (dust, debris, moisture)',
        'Periodic maintenance interval recommended for review'
      ],
      recommendedAction: `Have an authorized technician perform a diagnostic physical inspection on the vehicle's ${cleanSystem.toLowerCase()} system.`,
      suggestedService: `${cleanSystem} Comprehensive Inspection & Scan`,
      immediateAttention: isCriticalKeyword || isHighKeyword,
      estimatedCost: '₹1,000 - ₹5,000',
      estimatedTime: '1 - 2 hours',
      dtcCode: 'U0100 (Lost Communication With ECU / Unspecified Fault)'
    };
  }

  const severityMeta = SEVERITY_LEVELS[matchedRule.severity] || SEVERITY_LEVELS.MEDIUM;

  const result = {
    id: `diag-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    formattedDate: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    vehicleName: vehicle?.displayName || `${vehicle?.manufacturer || 'Honda'} ${vehicle?.model || 'City'}`,
    vehicleId: vehicle?.id || 'default-vehicle',
    system: cleanSystem,
    reportedSymptoms: symptoms,
    title: matchedRule.diagnosis,
    severity: matchedRule.severity,
    severityMeta,
    confidence: matchedRule.confidence,
    possibleCauses: matchedRule.possibleCauses,
    recommendedAction: matchedRule.recommendedAction,
    suggestedService: matchedRule.suggestedService,
    immediateAttention: matchedRule.immediateAttention,
    estimatedCost: matchedRule.estimatedCost,
    estimatedTime: matchedRule.estimatedTime,
    dtcCode: matchedRule.dtcCode
  };

  return result;
}

/**
 * Storage helpers for diagnosis history
 */
const HISTORY_STORAGE_KEY = 'autopulse_diagnosis_history';

export function getStoredDiagnosisHistory(vehicleId = null) {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    if (vehicleId) {
      return list.filter(item => item.vehicleId === vehicleId || (!item.vehicleId && vehicleId === 'honda-city'));
    }
    return list;
  } catch (err) {
    console.warn('[AI Diagnosis] Malformed diagnosis history in storage, resetting:', err);
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (_) {}
    return [];
  }
}

export function saveDiagnosisToHistory(diagnosisRecord) {
  try {
    if (!diagnosisRecord) return [];
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    const allStored = getStoredDiagnosisHistory();
    const updated = [diagnosisRecord, ...allStored.filter(item => item.id !== diagnosisRecord.id)].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[AI Diagnosis] Could not persist diagnosis history:', err);
    return [];
  }
}
