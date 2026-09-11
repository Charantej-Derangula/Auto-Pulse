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

import { VehicleSetupView } from '../VehicleSetupView';
import { DEMO_VEHICLES } from '../../context/AppContext';

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
  let store = {};

  beforeEach(() => {
    store = {};
    globalThis.localStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; }
    };
    globalThis.sessionStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; }
    };
  });

  it('1. Renders Login component without crashing', () => {
    const html = renderView(Login);
    expect(html).toContain('Welcome Back');
    expect(html).toContain('Sign In to Garage Dashboard');
  });

  it('2. Renders VehicleSetupView when user has no saved vehicle', () => {
    const html = renderView(VehicleSetupView);
    expect(html).toContain('Add your vehicle');
    expect(html).toContain('Set up your vehicle to unlock your personalized AutoPulse experience.');
    expect(html).toContain('Save Vehicle');
  });

  it('3. Renders DashboardView with saved vehicle telemetry', () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('garage_vehicle', JSON.stringify(DEMO_VEHICLES[0]));
    }
    const html = renderView(DashboardView);
    expect(html).toContain('Good Morning');
    expect(html).toContain('Estimated Vehicle Health');
    expect(html).toContain('Next Recommended Service');
  });

  it('4. Renders DocumentsView component without crashing', () => {
    const html = renderView(DocumentsView);
    expect(html).toContain('Digital Document Vault');
  });

  it('5. Renders RemindersView component without crashing', () => {
    const html = renderView(RemindersView);
    expect(html).toContain('Vehicle Reminders &amp; Alerts');
  });

  it('6. Renders ServiceHistoryView component without crashing', () => {
    const html = renderView(ServiceHistoryView);
    expect(html).toContain('Service History &amp; Invoices');
  });

  it('7. Renders ServiceMaintenanceView component without crashing', () => {
    const html = renderView(ServiceMaintenanceView);
    expect(html).toContain('Service, Maintenance &amp; Expenses');
  });

  it('8. Renders FuelExpensesView component without crashing', () => {
    const html = renderView(FuelExpensesView);
    expect(html).toContain('Fuel &amp; Expense Analytics');
  });

  it('9. Renders FindGarageView component without crashing', () => {
    const html = renderView(FindGarageView);
    expect(html).toContain('Authorized Garages &amp; Service Centers');
  });

  it('10. Renders DiagnoseIssueView component without crashing', () => {
    const html = renderView(DiagnoseIssueView);
    expect(html).toContain('AI Vehicle Diagnosis');
  });

  it('11. Renders MyVehicleView component with saved vehicle without crashing', () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('garage_vehicle', JSON.stringify(DEMO_VEHICLES[0]));
    }
    const html = renderView(MyVehicleView);
    expect(html).toContain('My Vehicle Profile &amp; Telemetry');
  });

  it('12. Renders SettingsView component without crashing', () => {
    const html = renderView(SettingsView);
    expect(html).toContain('Account Settings &amp; Preferences');
  });
});
