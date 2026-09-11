/**
 * Auto Pulse — Vehicle Health & Subsystem Telemetry Service
 * 
 * Clean API and service abstraction for vehicle health telemetry.
 * Supports external connected car / OBD-II telemetry APIs (via env)
 * with robust automotive diagnostic fallback engine based on maintenance intervals,
 * odometer progression, and powertrain characteristics.
 */

import { calculateVehicleHealth } from './HealthIntelligenceService';

/**
 * Normalizes components into standard subsystem telemetry dictionary
 * matching the existing AutoPulse dashboard card structure.
 */
function normalizeSubsystems(components, defaultSubsystems = {}) {
  const result = { ...defaultSubsystems };

  components.forEach(comp => {
    const key = comp.id?.toLowerCase();
    const itemData = {
      id: comp.id,
      name: comp.name,
      health: comp.score,
      score: comp.score,
      status: comp.status || (comp.score >= 90 ? 'Optimal' : comp.score >= 75 ? 'Good' : comp.score >= 60 ? 'Attention Required' : 'Critical'),
      statusColor: comp.statusColor || (comp.score >= 90 ? '#2de28a' : comp.score >= 75 ? '#38a8ff' : comp.score >= 60 ? '#f59e0b' : '#ef4444'),
      priority: comp.priority || (comp.score < 60 ? 'High' : comp.score < 80 ? 'Medium' : 'Low'),
      icon: comp.icon,
      reason: comp.reason || 'Normal operational telemetry.',
      recommendedAction: comp.recommendedAction || 'Inspect at next service interval.',
      lastChecked: comp.lastChecked || 'Periodic CAN-Bus diagnostic scan',
      systemType: comp.systemType || comp.name
    };

    if (key.includes('engine') || key.includes('motor')) {
      result.engine = { ...result.engine, ...itemData, name: comp.name || 'Engine / Powertrain' };
    } else if (key.includes('battery')) {
      result.battery = { ...result.battery, ...itemData, name: comp.name || '12V Starter Battery' };
    } else if (key.includes('brake')) {
      result.brakes = { ...result.brakes, ...itemData, name: comp.name || 'Brake Pads & Rotors' };
    } else if (key.includes('tyre') || key.includes('tire')) {
      result.tyres = { ...result.tyres, ...itemData, name: comp.name || 'Tyre Tread Life' };
    } else if (key.includes('fluid')) {
      result.fluids = { ...result.fluids, ...itemData, name: comp.name || 'Fluids & Coolants' };
    } else if (key.includes('electric')) {
      result.electrical = { ...result.electrical, ...itemData, name: comp.name || 'Electrical & CAN-Bus' };
    }
  });

  return result;
}

/**
 * Retrieves vehicle health assessment from external connected telemetry API if available,
 * or safely computes data-driven automotive diagnostics from service records & telemetry parameters.
 * 
 * @param {Object} vehicle - current vehicle state
 * @param {Array} serviceHistory - maintenance records
 * @param {string} selectedDiagnosticId - active diagnostic code
 * @param {Array} diagnostics - symptom catalog
 * @returns {Promise<Object>} complete vehicle health data
 */
export async function getVehicleHealthAssessment(vehicle, serviceHistory = [], selectedDiagnosticId = null, diagnostics = []) {
  const env = (typeof import.meta !== 'undefined' && import.meta?.env) ? import.meta.env : {};
  const externalApiUrl = env.VITE_VEHICLE_TELEMETRY_API_URL;
  const externalApiKey = env.VITE_VEHICLE_TELEMETRY_API_KEY;

  // 1. If external vehicle telemetry API is configured
  if (externalApiUrl && vehicle?.vin) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${externalApiUrl}?vin=${encodeURIComponent(vehicle.vin)}`, {
        headers: {
          'Authorization': `Bearer ${externalApiKey}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const liveData = await res.json();
        if (liveData && typeof liveData.overallScore === 'number') {
          return {
            overallScore: Math.min(100, Math.max(0, liveData.overallScore)),
            overallStatus: liveData.overallStatus || (liveData.overallScore > 85 ? 'Optimal' : 'Good'),
            overallLabel: liveData.overallLabel || 'Live Telemetry Active',
            subsystems: liveData.subsystems || normalizeSubsystems(liveData.components || [], vehicle.subsystems),
            components: liveData.components || [],
            systemsEvaluated: liveData.systemsEvaluated || 6,
            needsAttentionCount: liveData.needsAttentionCount || 0,
            nextAction: liveData.nextAction || 'Continue routine driving cycle.',
            isExternalTelemetry: true,
            telemetrySource: 'Live Connected Vehicle CAN-Bus API'
          };
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.info('[VehicleHealthService] External telemetry API unavailable, utilizing rule-based automotive intelligence:', e.message);
    }
  }

  // 2. Safe automotive intelligence rule-based service engine
  const internalAssessment = calculateVehicleHealth(vehicle, serviceHistory, selectedDiagnosticId, diagnostics);
  const normalizedSubs = normalizeSubsystems(internalAssessment.components || [], vehicle?.subsystems);

  return {
    overallScore: internalAssessment.overallScore || 94,
    overallStatus: internalAssessment.overallStatus || 'Optimal',
    overallLabel: internalAssessment.overallLabel || 'Good Condition',
    subsystems: normalizedSubs,
    components: internalAssessment.components || [],
    systemsEvaluated: internalAssessment.systemsEvaluated || 6,
    needsAttentionCount: internalAssessment.needsAttentionCount || 0,
    nextAction: internalAssessment.nextAction || 'Standard periodic milestone inspection.',
    isExternalTelemetry: false,
    telemetrySource: 'Vehicle Health Intelligence Engine'
  };
}
