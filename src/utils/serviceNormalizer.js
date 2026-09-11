/**
 * Normalizes any service record (historical, newly booked, or corrupted)
 * into a guaranteed standard data shape for bulletproof rendering.
 */
export function normalizeServiceRecord(item, vehicle) {
  if (!item || typeof item !== 'object') return null;

  // Safe Odometer calculation
  let safeOdo = 0;
  if (typeof item.odometer === 'number' && !isNaN(item.odometer)) {
    safeOdo = item.odometer;
  } else if (typeof item.odometer === 'string') {
    const parsed = parseInt(item.odometer.replace(/[^0-9]/g, ''), 10);
    safeOdo = !isNaN(parsed) ? parsed : (Number(vehicle?.odometer) || 42680);
  } else {
    safeOdo = Number(vehicle?.odometer) || 42680;
  }

  // Safe Cost formatting
  let displayCost = '₹0';
  let numericCost = 0;
  if (typeof item.cost === 'string') {
    if (item.cost.includes('₹') || item.cost.includes('-') || item.cost.includes('–')) {
      displayCost = item.cost;
      const num = parseInt(item.cost.replace(/[^0-9]/g, ''), 10);
      numericCost = !isNaN(num) ? num : 0;
    } else {
      const num = parseFloat(item.cost);
      numericCost = !isNaN(num) ? num : 0;
      displayCost = `₹${numericCost.toLocaleString()}`;
    }
  } else if (typeof item.cost === 'number' && !isNaN(item.cost)) {
    numericCost = item.cost;
    displayCost = `₹${numericCost.toLocaleString()}`;
  }

  // Safe parts array
  let safeParts = [];
  if (Array.isArray(item.parts)) {
    safeParts = item.parts.map(p => String(p)).filter(Boolean);
  } else if (typeof item.parts === 'string' && item.parts.trim()) {
    safeParts = item.parts.split(',').map(p => p.trim()).filter(Boolean);
  }

  const defaultVehicleName = vehicle ? `${vehicle.manufacturer || ''} ${vehicle.model || ''}`.trim() || 'Honda City' : 'Honda City';
  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || 'honda-city';

  return {
    id: item.id || `srv-${Math.random().toString(36).substr(2, 9)}`,
    vehicleId: item.vehicleId || item.vehicle_id || (item.vehicleName && vehicle && item.vehicleName.toLowerCase().includes((vehicle.model || '').toLowerCase()) ? currentVehicleId : (item.id && item.id.startsWith('srv-') && !item.vehicleId ? 'honda-city' : currentVehicleId)),
    title: String(item.title || 'Scheduled Service Maintenance'),
    category: String(item.category || 'Periodic Service'),
    date: String(item.date || 'Recent'),
    garage: String(item.garage || 'Authorized Service Bay'),
    vehicleName: String(item.vehicleName || defaultVehicleName),
    odometer: safeOdo,
    odometerFormatted: `${safeOdo.toLocaleString()} km`,
    cost: numericCost,
    displayCost,
    status: String(item.status || 'Completed'),
    paymentStatus: String(item.paymentStatus || (item.status === 'Scheduled' || item.status === 'Upcoming' ? 'Not Paid' : 'Paid')),
    parts: safeParts,
    notes: item.notes ? String(item.notes) : ''
  };
}
