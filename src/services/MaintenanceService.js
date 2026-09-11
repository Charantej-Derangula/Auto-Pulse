/**
 * Auto Pulse — Maintenance & Expense Service
 * 
 * Provides centralized data models, calculations, persistence, and dynamic status
 * computation for vehicle maintenance records, scheduled checklist items, and general expenses.
 */

export const EXPENSE_CATEGORIES = [
  'Service',
  'Fuel',
  'Parts',
  'Repairs',
  'Insurance',
  'Other'
];

export const MAINTENANCE_CATEGORIES = [
  'Engine Oil',
  'Oil Filter',
  'Air Filter',
  'Brake Inspection',
  'Tyre Rotation',
  'Battery Check',
  'General Service',
  'Other'
];

const STORAGE_KEYS = {
  SERVICE_RECORDS: 'autopulse_service_records',
  MAINTENANCE_ITEMS: 'autopulse_maintenance_items',
  EXPENSES: 'autopulse_expenses'
};

/**
 * Standard default maintenance checklist template per vehicle
 */
export const DEFAULT_MAINTENANCE_ITEMS = [
  {
    id: 'maint-1',
    title: 'Engine Oil & Filter Renewal',
    category: 'Engine Oil',
    dueOdometer: 50000,
    dueDate: '2026-12-10',
    notes: '0W-20 Fully Synthetic Oil with OEM filter element',
    completed: false,
    completedDate: null
  },
  {
    id: 'maint-2',
    title: '3D Wheel Alignment & Tyre Rotation',
    category: 'Tyre Rotation',
    dueOdometer: 45000,
    dueDate: '2026-09-25',
    notes: 'Rotate all 4 wheels and balance front axle',
    completed: false,
    completedDate: null
  },
  {
    id: 'maint-3',
    title: 'Brake Caliper & Pad Inspection',
    category: 'Brake Inspection',
    dueOdometer: 45000,
    dueDate: '2026-10-05',
    notes: 'Measure brake pad lining thickness (>3mm threshold)',
    completed: false,
    completedDate: null
  },
  {
    id: 'maint-4',
    title: '12V Starter Battery Health Check',
    category: 'Battery Check',
    dueOdometer: 48000,
    dueDate: '2026-11-15',
    notes: 'Conductance load test and terminal corrosion clean',
    completed: false,
    completedDate: null
  },
  {
    id: 'maint-5',
    title: 'Cabin HEPA Pollen & Engine Air Filter',
    category: 'Air Filter',
    dueOdometer: 50000,
    dueDate: '2026-12-10',
    notes: 'Clean/replace cabin air filter for optimal AC efficiency',
    completed: false,
    completedDate: null
  }
];

export const DEFAULT_GENERAL_EXPENSES = [
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

/**
 * Dynamically computes status of a maintenance item given current vehicle odometer & date
 * @param {Object} item Maintenance item
 * @param {number} currentOdometer Current vehicle odometer
 * @returns {'Completed' | 'Overdue' | 'Due Soon' | 'Upcoming'}
 */
export function calculateMaintenanceStatus(item, currentOdometer = 0) {
  if (item.completed) return 'Completed';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isDateOverdue = false;
  let isDateDueSoon = false;

  if (item.dueDate) {
    const dueDate = new Date(item.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      isDateOverdue = true;
    } else if (diffDays <= 30) {
      isDateDueSoon = true;
    }
  }

  let isOdoOverdue = false;
  let isOdoDueSoon = false;

  if (item.dueOdometer && currentOdometer > 0) {
    const kmDiff = item.dueOdometer - currentOdometer;
    if (kmDiff < 0) {
      isOdoOverdue = true;
    } else if (kmDiff <= 1500) {
      isOdoDueSoon = true;
    }
  }

  if (isDateOverdue || isOdoOverdue) {
    return 'Overdue';
  }
  if (isDateDueSoon || isOdoDueSoon) {
    return 'Due Soon';
  }
  return 'Upcoming';
}

/**
 * Storage accessor helpers with graceful error and corruption recovery
 */
export function loadStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.warn(`[MaintenanceService] Corrupted storage for ${key}, using safe default:`, e);
    try {
      localStorage.removeItem(key);
    } catch (_) {}
    return fallback;
  }
}

export function saveStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[MaintenanceService] Failed to persist data for ${key}:`, e);
  }
}

export function getMaintenanceStorage() {
  return {
    maintenanceItems: loadStoredData(STORAGE_KEYS.MAINTENANCE_ITEMS, DEFAULT_MAINTENANCE_ITEMS),
    expenses: loadStoredData(STORAGE_KEYS.EXPENSES, DEFAULT_GENERAL_EXPENSES)
  };
}

export function persistMaintenanceItems(items) {
  saveStoredData(STORAGE_KEYS.MAINTENANCE_ITEMS, items);
}

export function persistExpenses(expenses) {
  saveStoredData(STORAGE_KEYS.EXPENSES, expenses);
}
