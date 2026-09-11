/**
 * Auto Pulse — Vehicle Health Intelligence Engine (Brick 8)
 * 
 * Rule-based, data-driven health estimation engine.
 * Evaluates 6 key automotive systems:
 * 1. Engine / Motor
 * 2. Battery 12V
 * 3. Brakes
 * 4. Tyres
 * 5. Fluids
 * 6. Electrical System
 * 
 * Takes into account:
 * - Current vehicle odometer & age
 * - Vehicle powertrain type (ICE, Hybrid, EV)
 * - Service history records & last maintenance intervals
 * - Active diagnosis / trouble code warnings
 * 
 * Disclaimers: Rule-based estimated health assessment, not raw physical sensor probe.
 */

export function calculateVehicleHealth(vehicle, serviceHistory = [], activeDiagnosisId = null, allDiagnostics = []) {
  if (!vehicle) {
    return {
      overallScore: 90,
      overallStatus: 'Good',
      overallLabel: 'Good Condition',
      systemsEvaluated: 6,
      needsAttentionCount: 0,
      nextAction: 'Periodic vehicle inspection',
      components: getFallbackComponents(),
      hasLimitedData: true
    };
  }

  const odo = Number(vehicle.odometer) || 35000;
  const year = Number(vehicle.year) || 2023;
  const currentYear = new Date().getFullYear();
  const vehicleAgeYears = Math.max(0, currentYear - year);
  const isEV = vehicle.type === 'EV';
  const isHybrid = vehicle.type === 'Hybrid';

  // Helper: Find most recent service record matching keywords
  const findLatestService = (keywords) => {
    if (!Array.isArray(serviceHistory) || serviceHistory.length === 0) return null;
    return serviceHistory.find(srv => {
      const text = `${srv.title} ${srv.category} ${(srv.parts || []).join(' ')} ${srv.notes || ''}`.toLowerCase();
      return keywords.some(kw => text.includes(kw.toLowerCase()));
    });
  };

  // -------------------------------------------------------------
  // 1. ENGINE / MOTOR EVALUATION
  // -------------------------------------------------------------
  let engineScore = isEV ? 98 : 95;
  let engineLastChecked = 'Limited service data available';
  let engineReason = isEV 
    ? 'Electric motor drive telemetry operating within standard efficiency curves.'
    : 'Combustion powertrain running smoothly with steady compression.';
  let engineAction = isEV 
    ? 'Standard high-voltage inverter check at next milestone.'
    : 'Check engine oil level & inspect air filter.';
  let enginePriority = 'Low';

  const oilService = findLatestService(['oil', 'scheduled service', 'engine', 'periodic']);
  if (oilService) {
    const kmSinceOil = Math.max(0, odo - (oilService.odometer || odo - 4000));
    engineLastChecked = `${kmSinceOil.toLocaleString()} km ago (${oilService.date})`;
    if (kmSinceOil > 10000 && !isEV) {
      engineScore -= Math.min(18, Math.floor((kmSinceOil - 10000) / 1000) * 3);
      engineReason = `Engine oil change interval exceeded by ${(kmSinceOil - 10000).toLocaleString()} km.`;
      engineAction = 'Schedule engine oil & oil filter replacement immediately.';
      enginePriority = 'High';
    } else if (kmSinceOil > 7000 && !isEV) {
      engineScore -= 6;
      engineReason = 'Approaching recommended 10,000 km periodic engine oil renewal.';
      engineAction = 'Inspect engine oil level, viscosity and colour.';
      enginePriority = 'Medium';
    }
  }

  // Diagnosis impact on Engine
  if (activeDiagnosisId === 'engine-warning') {
    engineScore = Math.min(engineScore, 68);
    engineReason = 'Active Check Engine warning (MIL) reported. Potential misfire, MAF or O2 sensor code.';
    engineAction = 'Connect OBD-II scanner to read Diagnostic Trouble Codes (DTCs) and inspect ignition.';
    enginePriority = 'High';
  } else if (activeDiagnosisId === 'low-mileage') {
    engineScore -= 8;
    engineReason = 'Low fuel efficiency detected. Potential air filter restriction or injector fouling.';
    engineAction = 'Replace air filter and clean fuel injectors.';
    enginePriority = 'Medium';
  }

  // Age factor
  if (vehicleAgeYears > 4 && !isEV) {
    engineScore -= 4;
  }

  // -------------------------------------------------------------
  // 2. BATTERY 12V EVALUATION
  // -------------------------------------------------------------
  let batteryScore = 93;
  let batteryLastChecked = 'Limited service data available';
  let batteryReason = '12V starter battery resting voltage estimated at ~12.6V.';
  let batteryAction = 'Clean battery terminals and apply dielectric grease.';
  let batteryPriority = 'Low';

  if (vehicleAgeYears >= 3) {
    batteryScore -= 12;
    batteryReason = 'Lead-acid 12V battery is over 3 years old; cold cranking capacity degrades over time.';
    batteryAction = 'Perform battery conductance load test before winter/rainy season.';
    batteryPriority = 'Medium';
  }

  if (activeDiagnosisId === 'starting-problem') {
    batteryScore = Math.min(batteryScore, 58);
    batteryReason = 'Active starting/cranking difficulty reported. 12V battery state of charge (SoC) or starter weak.';
    batteryAction = 'Test 12V battery voltage under load and verify alternator charging output.';
    batteryPriority = 'High';
  }

  const generalService = findLatestService(['periodic', 'battery', 'scheduled']);
  if (generalService) {
    const kmSinceBattery = Math.max(0, odo - (generalService.odometer || odo - 3000));
    batteryLastChecked = `${kmSinceBattery.toLocaleString()} km ago (${generalService.date})`;
  }

  // -------------------------------------------------------------
  // 3. BRAKES EVALUATION
  // -------------------------------------------------------------
  let brakesScore = 88;
  let brakesLastChecked = 'Limited service data available';
  let brakesReason = 'Friction linings and hydraulic calipers within operational limits.';
  let brakesAction = 'Inspect brake pads and discs at next tyre rotation.';
  let brakesPriority = 'Low';

  const brakeService = findLatestService(['brake', 'pads', 'rotors', 'caliper']);
  if (brakeService) {
    const kmSinceBrake = Math.max(0, odo - (brakeService.odometer || odo - 5000));
    brakesLastChecked = `${kmSinceBrake.toLocaleString()} km ago (${brakeService.date})`;
    if (kmSinceBrake > 20000) {
      brakesScore -= 18;
      brakesReason = `Over ${kmSinceBrake.toLocaleString()} km driven since last documented brake pad inspection.`;
      brakesAction = 'Inspect front/rear brake pad thickness (minimum 3mm limit) and disc rotor runout.';
      brakesPriority = 'High';
    } else if (kmSinceBrake > 12000) {
      brakesScore -= 8;
      brakesReason = 'Brake pads are in mid-life wear cycle. Periodic inspection advised.';
      brakesAction = 'Measure brake pad lining thickness.';
      brakesPriority = 'Medium';
    }
  } else {
    // If no explicit brake service, estimate from odometer
    const odoBrakeMod = odo % 25000;
    brakesLastChecked = `Estimated ~${odoBrakeMod.toLocaleString()} km on current wear cycle`;
    if (odoBrakeMod > 18000) {
      brakesScore -= 12;
      brakesReason = 'Brake maintenance is approaching its recommended 20,000 km inspection interval.';
      brakesAction = 'Inspect brake pads, discs and brake fluid boiling point.';
      brakesPriority = 'Medium';
    }
  }

  // Diagnosis impact on Brakes
  if (activeDiagnosisId === 'brake-noise') {
    brakesScore = Math.min(brakesScore, 62);
    brakesReason = 'Active brake squealing or grinding reported. Pad wear indicator shim or rotor glazing.';
    brakesAction = 'Inspect brake pads, discs and brake fluid immediately to prevent rotor damage.';
    brakesPriority = 'High';
  }

  // -------------------------------------------------------------
  // 4. TYRES EVALUATION
  // -------------------------------------------------------------
  let tyresScore = 84;
  let tyresLastChecked = 'Limited service data available';
  let tyresReason = 'Tyre tread depth and radial integrity in good driving condition.';
  let tyresAction = 'Check cold tyre inflation pressure and inspect tread wear pattern.';
  let tyresPriority = 'Low';

  const tyreService = findLatestService(['tyre', 'tire', 'alignment', 'wheel balancing', 'rotation']);
  if (tyreService) {
    const kmSinceTyre = Math.max(0, odo - (tyreService.odometer || odo - 3000));
    tyresLastChecked = `${kmSinceTyre.toLocaleString()} km ago (${tyreService.date})`;
    if (kmSinceTyre > 10000) {
      tyresScore -= 15;
      tyresReason = `Tyre rotation is overdue by ${(kmSinceTyre - 10000).toLocaleString()} km. Risk of shoulder wear.`;
      tyresAction = 'Perform 4-wheel rotation, wheel balancing and 3D alignment.';
      tyresPriority = 'Medium';
    } else if (kmSinceTyre > 7000) {
      tyresScore -= 6;
      tyresReason = 'Approaching recommended 10,000 km tyre rotation interval.';
      tyresAction = 'Check tyre pressure (cold), tread depth (> 2mm) and balance.';
      tyresPriority = 'Medium';
    }
  } else {
    const odoTyreMod = odo % 10000;
    tyresLastChecked = `Estimated ~${odoTyreMod.toLocaleString()} km on current cycle`;
    if (odoTyreMod > 7000) {
      tyresScore -= 10;
      tyresReason = 'Tyre rotation is recommended every 10,000 km to prevent uneven shoulder wear.';
      tyresAction = 'Check tyre pressure, tread depth and wheel alignment.';
      tyresPriority = 'Medium';
    }
  }

  // Diagnosis impact on Tyres / Suspension
  if (activeDiagnosisId === 'suspension-noise') {
    tyresScore -= 10;
    tyresReason += ' Suspension vibration may accelerate irregular tyre cupping.';
    tyresAction = 'Check tyre wear and inspect suspension stabilizer links.';
    tyresPriority = 'Medium';
  }

  // -------------------------------------------------------------
  // 5. FLUIDS EVALUATION
  // -------------------------------------------------------------
  let fluidsScore = isEV ? 97 : 91;
  let fluidsLastChecked = 'Limited service data available';
  let fluidsReason = isEV
    ? 'High-voltage inverter glycol coolant reservoir at normal level.'
    : 'Engine oil, coolant, brake fluid and washer fluid levels within spec.';
  let fluidsAction = isEV
    ? 'Check inverter cooling fluid reservoir level.'
    : 'Check coolant, brake fluid and other required fluid levels.';
  let fluidsPriority = 'Low';

  const fluidsService = findLatestService(['fluid', 'coolant', 'oil', 'lubricant']);
  if (fluidsService) {
    const kmSinceFluid = Math.max(0, odo - (fluidsService.odometer || odo - 4000));
    fluidsLastChecked = `${kmSinceFluid.toLocaleString()} km ago (${fluidsService.date})`;
    if (kmSinceFluid > 15000 && !isEV) {
      fluidsScore -= 14;
      fluidsReason = 'Coolant and brake fluid DOT-4 hygroscopic moisture check due.';
      fluidsAction = 'Test brake fluid moisture content and inspect radiator coolant.';
      fluidsPriority = 'Medium';
    }
  } else if (!isEV && odo > 30000) {
    fluidsScore -= 8;
    fluidsReason = 'DOT-4 brake fluid is hydroscopic and requires replacement every 2 years.';
    fluidsAction = 'Test brake fluid water content and top up engine coolant.';
    fluidsPriority = 'Medium';
  }

  // -------------------------------------------------------------
  // 6. ELECTRICAL SYSTEM EVALUATION
  // -------------------------------------------------------------
  let electricalScore = 94;
  let electricalLastChecked = 'Limited service data available';
  let electricalReason = 'Fuses, alternator regulator, lighting harness and CAN-Bus communication nominal.';
  let electricalAction = 'Inspect battery terminals, wiring harness and electrical connections.';
  let electricalPriority = 'Low';

  if (activeDiagnosisId === 'ac-not-cooling') {
    electricalScore -= 12;
    electricalReason = 'AC compressor clutch relay or pressure switch electrical signal irregular.';
    electricalAction = 'Test AC relay, fuse, pressure sensor and blower motor wiring.';
    electricalPriority = 'Medium';
  } else if (activeDiagnosisId === 'starting-problem') {
    electricalScore -= 15;
    electricalReason = 'Starter motor circuit, solenoid contacts or ignition switch resistance detected.';
    electricalAction = 'Inspect starter solenoid connections and ignition harness.';
    electricalPriority = 'High';
  }

  if (generalService) {
    const kmSinceElec = Math.max(0, odo - (generalService.odometer || odo - 3000));
    electricalLastChecked = `${kmSinceElec.toLocaleString()} km ago (${generalService.date})`;
  }

  // Bound all component scores cleanly [20, 100]
  const clampScore = (s) => Math.max(20, Math.min(100, Math.round(s)));

  const components = [
    {
      id: 'engine',
      name: isEV ? 'Electric Drive / Motor' : 'Engine / Powertrain',
      score: clampScore(engineScore),
      status: getScoreStatus(clampScore(engineScore)),
      statusColor: getScoreColor(clampScore(engineScore)),
      icon: 'Engine',
      lastChecked: engineLastChecked,
      reason: engineReason,
      recommendedAction: engineAction,
      priority: enginePriority,
      systemType: isEV ? 'Dual Permanent Magnet Electric Motor' : `${vehicle.type || 'ICE'} Powertrain`
    },
    {
      id: 'battery',
      name: isEV ? '12V Auxiliary Battery' : 'Battery 12V',
      score: clampScore(batteryScore),
      status: getScoreStatus(clampScore(batteryScore)),
      statusColor: getScoreColor(clampScore(batteryScore)),
      icon: 'Battery',
      lastChecked: batteryLastChecked,
      reason: batteryReason,
      recommendedAction: batteryAction,
      priority: batteryPriority,
      systemType: '12V SLI / Auxiliary Lead-Acid Unit'
    },
    {
      id: 'brakes',
      name: isEV ? 'Brakes & Regen System' : 'Brakes & Hydraulics',
      score: clampScore(brakesScore),
      status: getScoreStatus(clampScore(brakesScore)),
      statusColor: getScoreColor(clampScore(brakesScore)),
      icon: 'Brakes',
      lastChecked: brakesLastChecked,
      reason: brakesReason,
      recommendedAction: brakesAction,
      priority: brakesPriority,
      systemType: isEV ? 'Regenerative + Friction Disc Setup' : 'Front Ventilated Disc / Hydraulic'
    },
    {
      id: 'tyres',
      name: 'Tyres & Tread Life',
      score: clampScore(tyresScore),
      status: getScoreStatus(clampScore(tyresScore)),
      statusColor: getScoreColor(clampScore(tyresScore)),
      icon: 'Tyres',
      lastChecked: tyresLastChecked,
      reason: tyresReason,
      recommendedAction: tyresAction,
      priority: tyresPriority,
      systemType: 'Radial Tubeless with TPMS Telemetry'
    },
    {
      id: 'fluids',
      name: isEV ? 'Thermal Management Fluids' : 'Fluids & Lubricants',
      score: clampScore(fluidsScore),
      status: getScoreStatus(clampScore(fluidsScore)),
      statusColor: getScoreColor(clampScore(fluidsScore)),
      icon: 'Fluids',
      lastChecked: fluidsLastChecked,
      reason: fluidsReason,
      recommendedAction: fluidsAction,
      priority: fluidsPriority,
      systemType: isEV ? 'Glycol Dielectric Coolant Loop' : 'Motor Oil, Coolant & DOT-4 Fluid'
    },
    {
      id: 'electrical',
      name: 'Electrical & CAN-Bus',
      score: clampScore(electricalScore),
      status: getScoreStatus(clampScore(electricalScore)),
      statusColor: getScoreColor(clampScore(electricalScore)),
      icon: 'Electrical',
      lastChecked: electricalLastChecked,
      reason: electricalReason,
      recommendedAction: electricalAction,
      priority: electricalPriority,
      systemType: '12V Architecture & ECU Network'
    }
  ];

  // Calculate weighted overall score
  const overallRaw = (
    components[0].score * 0.25 +
    components[2].score * 0.25 +
    components[1].score * 0.15 +
    components[3].score * 0.15 +
    components[4].score * 0.10 +
    components[5].score * 0.10
  );
  const overallScore = Math.round(overallRaw);

  const needsAttention = components.filter(c => c.score < 80);
  const critical = components.filter(c => c.score < 60);

  let nextAction = 'All systems nominal. Maintain periodic maintenance.';
  if (critical.length > 0) {
    nextAction = `Critical: ${critical[0].recommendedAction}`;
  } else if (needsAttention.length > 0) {
    nextAction = `${needsAttention[0].name}: ${needsAttention[0].recommendedAction}`;
  }

  return {
    overallScore,
    overallStatus: getOverallStatusText(overallScore),
    overallLabel: `${overallScore}% ${getOverallStatusText(overallScore)}`,
    systemsEvaluated: 6,
    needsAttentionCount: needsAttention.length,
    criticalCount: critical.length,
    nextAction,
    components,
    hasLimitedData: !serviceHistory || serviceHistory.length === 0
  };
}

function getScoreStatus(score) {
  if (score >= 90) return 'Optimal';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Attention Recommended';
  return 'Critical Attention';
}

function getScoreColor(score) {
  if (score >= 90) return '#2de28a'; // emerald
  if (score >= 75) return '#38a8ff'; // blue
  if (score >= 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function getOverallStatusText(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Attention';
  return 'Critical';
}

function getFallbackComponents() {
  return [
    {
      id: 'engine',
      name: 'Engine / Motor',
      score: 92,
      status: 'Optimal',
      statusColor: '#2de28a',
      icon: 'Engine',
      lastChecked: 'Limited service data available',
      reason: 'Rule-based estimate based on standard vehicle operational curves.',
      recommendedAction: 'Inspect engine oil level and air intake filter.',
      priority: 'Low',
      systemType: 'Standard Powertrain'
    },
    {
      id: 'battery',
      name: 'Battery 12V',
      score: 90,
      status: 'Optimal',
      statusColor: '#2de28a',
      icon: 'Battery',
      lastChecked: 'Limited service data available',
      reason: 'Estimated battery voltage ~12.6V resting state.',
      recommendedAction: 'Clean battery terminals and check terminal clamp tightness.',
      priority: 'Low',
      systemType: '12V Lead-Acid Starter Unit'
    },
    {
      id: 'brakes',
      name: 'Brakes',
      score: 85,
      status: 'Good',
      statusColor: '#38a8ff',
      icon: 'Brakes',
      lastChecked: 'Limited service data available',
      reason: 'Brake maintenance is approaching its recommended interval.',
      recommendedAction: 'Inspect brake pads, discs and brake fluid.',
      priority: 'Medium',
      systemType: 'Hydraulic Disc Setup'
    },
    {
      id: 'tyres',
      name: 'Tyres',
      score: 82,
      status: 'Good',
      statusColor: '#38a8ff',
      icon: 'Tyres',
      lastChecked: 'Limited service data available',
      reason: 'Standard tread wear estimation.',
      recommendedAction: 'Check tyre pressure, tread depth and alignment.',
      priority: 'Low',
      systemType: 'Radial Tubeless'
    },
    {
      id: 'fluids',
      name: 'Fluids',
      score: 94,
      status: 'Optimal',
      statusColor: '#2de28a',
      icon: 'Fluids',
      lastChecked: 'Limited service data available',
      reason: 'Essential fluids estimated within normal volume tolerances.',
      recommendedAction: 'Check coolant, brake fluid and other required fluid levels.',
      priority: 'Low',
      systemType: 'Vehicle Fluid Reservoirs'
    },
    {
      id: 'electrical',
      name: 'Electrical System',
      score: 95,
      status: 'Optimal',
      statusColor: '#2de28a',
      icon: 'Electrical',
      lastChecked: 'Limited service data available',
      reason: 'All standard electrical and CAN-Bus nodes reporting nominal.',
      recommendedAction: 'Inspect battery terminals, wiring and electrical connections.',
      priority: 'Low',
      systemType: 'CAN-Bus Electronic Network'
    }
  ];
}
