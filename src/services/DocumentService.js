/**
 * Auto Pulse — Compliance Documents & Reminders Service
 * 
 * Provides centralized data models, status calculations, persistence,
 * and dynamic calculation for Digital Documents and Reminders tied to vehicleId.
 */

export const DOCUMENT_TYPES = [
  'Registration Certificate (RC)',
  'Insurance',
  'Pollution Certificate (PUC)',
  "Driver's License (DL)",
  'Roadside Assistance (RSA)',
  'Fitness Certificate',
  'Commercial Permit',
  'Other'
];

export const DOCUMENT_CATEGORIES = [
  'Registration',
  'Insurance',
  'Compliance',
  'Personal ID',
  'Emergency',
  'Warranty',
  'Other'
];

export const REMINDER_CATEGORIES = [
  'Insurance renewal',
  'PUC renewal',
  'Vehicle service',
  'Maintenance',
  'Document expiry',
  'DIY Care',
  'Compliance',
  'Custom reminder'
];

export const REMINDER_PRIORITIES = ['High', 'Medium', 'Normal'];

export const STORAGE_KEYS = {
  DOCUMENTS: 'autopulse_documents',
  REMINDERS: 'autopulse_reminders'
};

/**
 * Dynamically calculates document status based on expiry date:
 * - Expiry date passed (< 0 days): 'Expired'
 * - Expiry within 30 days (0 to 30 days): 'Expiring Soon'
 * - Expiry > 30 days: 'Valid'
 *
 * @param {string|Date} expiryDate 
 * @returns {{ status: 'Valid' | 'Expiring Soon' | 'Expired', statusType: 'success' | 'warning' | 'danger', daysRemaining: number | null }}
 */
export function calculateDocumentStatus(expiryDate) {
  if (!expiryDate || expiryDate === 'N/A' || expiryDate === 'Exempt (EV)') {
    return { status: 'Valid', statusType: 'success', daysRemaining: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  if (isNaN(exp.getTime())) {
    return { status: 'Valid', statusType: 'success', daysRemaining: null };
  }
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'Expired',
      statusType: 'danger',
      daysRemaining: diffDays
    };
  }

  if (diffDays <= 30) {
    return {
      status: `Expiring Soon (${diffDays} ${diffDays === 1 ? 'day' : 'days'})`,
      statusType: 'warning',
      daysRemaining: diffDays
    };
  }

  return {
    status: 'Valid',
    statusType: 'success',
    daysRemaining: diffDays
  };
}

/**
 * Dynamically calculates reminder status based on completion and due date:
 * - If completed: 'Completed'
 * - If due date passed (< 0 days): 'Overdue'
 * - If due date within 7 days (0 to 7 days): 'Due Soon'
 * - If due date > 7 days: 'Upcoming'
 *
 * @param {Object} reminder
 * @returns {{ status: 'Upcoming' | 'Due Soon' | 'Overdue' | 'Completed', statusType: 'success' | 'warning' | 'danger' | 'info', daysRemaining: number | null }}
 */
export function calculateReminderStatus(reminder) {
  if (reminder?.completed) {
    return { status: 'Completed', statusType: 'success', daysRemaining: null };
  }

  if (!reminder?.dueDate) {
    return { status: 'Upcoming', statusType: 'info', daysRemaining: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(reminder.dueDate);
  if (isNaN(due.getTime())) {
    return { status: 'Upcoming', statusType: 'info', daysRemaining: null };
  }
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'Overdue',
      statusType: 'danger',
      daysRemaining: diffDays
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'Due Soon',
      statusType: 'warning',
      daysRemaining: diffDays
    };
  }

  return {
    status: 'Upcoming',
    statusType: 'info',
    daysRemaining: diffDays
  };
}

/**
 * Normalizes document record safely with vehicleId fallback and dynamic status
 */
export function normalizeDocument(doc, defaultVehicleId = 'honda-city') {
  if (!doc) return null;
  const statusInfo = calculateDocumentStatus(doc.expiryDate);

  return {
    id: doc.id || doc.documentId || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    documentId: doc.documentId || doc.id || `doc-${Date.now()}`,
    vehicleId: doc.vehicleId || defaultVehicleId,
    title: doc.title || doc.name || doc.documentType || 'Vehicle Document',
    subtitle: doc.subtitle || doc.issuingAuthority || 'Digital Document Vault',
    docNumber: doc.docNumber || doc.documentNumber || 'N/A',
    category: doc.category || doc.documentType || 'Registration',
    documentType: doc.documentType || doc.category || doc.title || 'Other',
    issueDate: doc.issueDate || new Date().toISOString().split('T')[0],
    expiryDate: doc.expiryDate || '2028-12-31',
    status: statusInfo.status,
    statusType: statusInfo.statusType,
    daysRemaining: statusInfo.daysRemaining,
    fileSize: doc.fileSize || '1.5 MB',
    fileType: doc.fileType || 'PDF',
    notes: doc.notes || ''
  };
}

/**
 * Normalizes reminder record safely with vehicleId fallback and dynamic status
 */
export function normalizeReminder(rem, defaultVehicleId = 'honda-city') {
  if (!rem) return null;
  const statusInfo = calculateReminderStatus(rem);

  return {
    id: rem.id || rem.reminderId || `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    reminderId: rem.reminderId || rem.id || `rem-${Date.now()}`,
    vehicleId: rem.vehicleId || defaultVehicleId,
    title: rem.title || 'Service Reminder',
    dueDate: rem.dueDate || new Date().toISOString().split('T')[0],
    category: rem.category || 'Maintenance',
    priority: rem.priority || 'High',
    completed: !!rem.completed,
    completedDate: rem.completedDate || null,
    status: statusInfo.status,
    statusType: statusInfo.statusType,
    daysRemaining: statusInfo.daysRemaining,
    vehicle: rem.vehicle || 'Selected Vehicle',
    notes: rem.notes || ''
  };
}

/**
 * Safe local storage loader with corruption recovery
 */
export function loadDocumentsStorage(fallback = []) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.warn('[DocumentService] Corrupted storage for documents, using safe fallback:', e);
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    } catch (_) {}
    return fallback;
  }
}

export function loadRemindersStorage(fallback = []) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.warn('[DocumentService] Corrupted storage for reminders, using safe fallback:', e);
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    } catch (_) {}
    return fallback;
  }
}
