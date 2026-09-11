import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';
import { DashboardView } from '../DashboardView';
import { DocumentsView } from '../DocumentsView';
import { RemindersView } from '../RemindersView';
import { ServiceHistoryView } from '../ServiceHistoryView';
import { ServiceMaintenanceView } from '../ServiceMaintenanceView';
import { FuelExpensesView } from '../FuelExpensesView';
import { FindGarageView } from '../FindGarageView';
import { DiagnoseIssueView } from '../DiagnoseIssueView';
import { MyVehicleView } from '../MyVehicleView';
import { SettingsView } from '../SettingsView';
import { Login } from '../../components/Login';

// Helper to render view wrapped in Context and Router
function renderView(Component) {
  return renderToString(
    <AppProvider>
      <MemoryRouter>
        <Component />
      </MemoryRouter>
    </AppProvider>
  );
}

describe('AutoPulse View Rendering & Regression Integrity Test', () => {
  beforeEach(() => {
    // Reset simulated storage if present
    try {
      if (typeof localStorage !== 'undefined') localStorage.clear();
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    } catch (_) {}
  });

  it('1. Renders Login component without crashing', () => {
    const html = renderView(Login);
    expect(html).toContain('Welcome Back');
    expect(html).toContain('Sign In to Garage Dashboard');
  });

  it('2. Renders DashboardView component without crashing', () => {
    const html = renderView(DashboardView);
    expect(html).toContain('Good Morning');
    expect(html).toContain('Vehicle Health Score');
    expect(html).toContain('Next Recommended Service');
  });

  it('3. Renders DocumentsView component without crashing', () => {
    const html = renderView(DocumentsView);
    expect(html).toContain('Digital Document Vault');
  });

  it('4. Renders RemindersView component without crashing', () => {
    const html = renderView(RemindersView);
    expect(html).toContain('Vehicle Reminders &amp; Alerts');
  });

  it('5. Renders ServiceHistoryView component without crashing', () => {
    const html = renderView(ServiceHistoryView);
    expect(html).toContain('Service History &amp; Invoices');
  });

  it('6. Renders ServiceMaintenanceView component without crashing', () => {
    const html = renderView(ServiceMaintenanceView);
    expect(html).toContain('Service, Maintenance &amp; Expenses');
  });

  it('7. Renders FuelExpensesView component without crashing', () => {
    const html = renderView(FuelExpensesView);
    expect(html).toContain('Fuel &amp; Expense Analytics');
  });

  it('8. Renders FindGarageView component without crashing', () => {
    const html = renderView(FindGarageView);
    expect(html).toContain('Authorized Garages &amp; Service Centers');
  });

  it('9. Renders DiagnoseIssueView component without crashing', () => {
    const html = renderView(DiagnoseIssueView);
    expect(html).toContain('AI Vehicle Diagnosis');
  });

  it('10. Renders MyVehicleView component without crashing', () => {
    const html = renderView(MyVehicleView);
    expect(html).toContain('My Vehicle Profile &amp; Telemetry');
  });

  it('11. Renders SettingsView component without crashing', () => {
    const html = renderView(SettingsView);
    expect(html).toContain('Account Settings &amp; Preferences');
  });
});
