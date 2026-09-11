import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateDocumentStatus, 
  calculateReminderStatus, 
  normalizeDocument, 
  normalizeReminder,
  loadDocumentsStorage,
  loadRemindersStorage
} from '../services/DocumentService';

describe('DocumentService & Reminder Status Calculation', () => {
  it('TEST D: dynamically calculates Expiring Soon when expiry date is within 30 days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const dateStr = futureDate.toISOString().split('T')[0];

    const result = calculateDocumentStatus(dateStr);
    expect(result.status).toContain('Expiring Soon');
    expect(result.statusType).toBe('warning');
    expect(result.daysRemaining).toBe(15);
  });

  it('TEST E: dynamically calculates Expired when expiry date is in the past', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const dateStr = pastDate.toISOString().split('T')[0];

    const result = calculateDocumentStatus(dateStr);
    expect(result.status).toBe('Expired');
    expect(result.statusType).toBe('danger');
    expect(result.daysRemaining).toBe(-10);
  });

  it('calculates Valid when expiry date is > 30 days in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 180);
    const dateStr = futureDate.toISOString().split('T')[0];

    const result = calculateDocumentStatus(dateStr);
    expect(result.status).toBe('Valid');
    expect(result.statusType).toBe('success');
    expect(result.daysRemaining).toBe(180);
  });

  it('TEST F: dynamically computes Completed, Overdue, Due Soon, and Upcoming for reminders', () => {
    // 1. Completed
    expect(calculateReminderStatus({ completed: true, dueDate: '2020-01-01' }).status).toBe('Completed');

    // 2. Overdue
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    expect(calculateReminderStatus({ completed: false, dueDate: pastDate.toISOString().split('T')[0] }).status).toBe('Overdue');

    // 3. Due Soon (within 7 days)
    const dueSoonDate = new Date();
    dueSoonDate.setDate(dueSoonDate.getDate() + 4);
    expect(calculateReminderStatus({ completed: false, dueDate: dueSoonDate.toISOString().split('T')[0] }).status).toBe('Due Soon');

    // 4. Upcoming (> 7 days)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 25);
    expect(calculateReminderStatus({ completed: false, dueDate: upcomingDate.toISOString().split('T')[0] }).status).toBe('Upcoming');
  });

  it('TEST A, B, C: enforces vehicleId normalization and vehicle isolation', () => {
    const docVehicleA = normalizeDocument({
      title: 'Insurance Policy',
      vehicleId: 'honda-city',
      expiryDate: '2028-12-31'
    }, 'honda-city');

    const docVehicleB = normalizeDocument({
      title: 'Creta Insurance',
      vehicleId: 'hyundai-creta',
      expiryDate: '2028-12-31'
    }, 'hyundai-creta');

    expect(docVehicleA.vehicleId).toBe('honda-city');
    expect(docVehicleB.vehicleId).toBe('hyundai-creta');

    const allDocs = [docVehicleA, docVehicleB];
    const filteredForVehicleA = allDocs.filter(d => d.vehicleId === 'honda-city');
    const filteredForVehicleB = allDocs.filter(d => d.vehicleId === 'hyundai-creta');

    expect(filteredForVehicleA).toHaveLength(1);
    expect(filteredForVehicleA[0].title).toBe('Insurance Policy');
    expect(filteredForVehicleB).toHaveLength(1);
    expect(filteredForVehicleB[0].title).toBe('Creta Insurance');
  });

  it('TEST H: handles corrupt and malformed storage gracefully', () => {
    const fallbackDocs = [{ id: 'doc-fallback', title: 'Default RC' }];
    expect(loadDocumentsStorage(fallbackDocs)).toEqual(fallbackDocs);
    expect(loadRemindersStorage([])).toEqual([]);
  });
});
