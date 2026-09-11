import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, DEMO_VEHICLES } from '../../context/AppContext';
import { DashboardView } from '../DashboardView';
import { MyVehicleView } from '../MyVehicleView';
import { VehicleSetupView } from '../VehicleSetupView';
import { buildVehicleObject, getVehicleImage, VERIFIED_VEHICLE_IMAGES } from '../../services/VehicleService';

describe('AutoPulse Final Acceptance Test Scenarios (1-6)', () => {
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

  it('TEST 1 — NEW USER: Clear localStorage, /dashboard displays onboarding, NO Honda City, NO Venue, NO Fortuner', () => {
    store['autopulse_auth'] = 'true';
    delete store['garage_vehicle'];
    delete store['autopulse_vehicle'];

    const html = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    // Expected: Show beautiful AutoPulse vehicle onboarding/introduction
    expect(html).toContain('Your Vehicle. Smarter Care.');
    expect(html).toContain('Welcome to AutoPulse');
    expect(html).toContain("Let&#x27;s get your vehicle connected");
    expect(html).toContain('Add My Vehicle');
    expect(html).toContain('Choose Your Vehicle');
    expect(html).toContain('Save Vehicle &amp; Continue');

    // Expected: Must NOT render active vehicle dashboard
    expect(html).not.toContain('Live Vehicle Telemetry Active');
    expect(html).not.toContain('Total Odometer');
    expect(html).not.toContain('Estimated Vehicle Health');
  });

  it('TEST 2 — SELECT VEHICLE: User selects Toyota Fortuner, enters details, saves, /dashboard renders Toyota Fortuner', () => {
    // User saves Toyota Fortuner with user-entered details (no fake auto-fill)
    const fortunerData = {
      manufacturer: 'Toyota',
      model: 'Fortuner',
      modelYear: '2024',
      variant: '2.8 4x4 AT',
      type: 'Diesel',
      regNumber: 'TS 07 TR 4444',
      odometer: 28900,
      chassisNumber: 'MBJFT882KP0019281',
      engineNumber: '1GD-FTV-882910',
      fuelCapacity: 80
    };

    const fortuner = buildVehicleObject(fortunerData);
    expect(fortuner.displayName).toBe('Toyota Fortuner');
    expect(fortuner.image).toBe(VERIFIED_VEHICLE_IMAGES['toyota_fortuner']);
    expect(fortuner.regNumber).toBe('TS 07 TR 4444');
    expect(fortuner.odometer).toBe(28900);

    store['autopulse_auth'] = 'true';
    store['garage_vehicle'] = JSON.stringify(fortuner);

    const html = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    // Dashboard must say Toyota Fortuner and display its verified image
    expect(html).toContain('Toyota Fortuner');
    expect(html).toContain('2.8 4x4 AT');
    expect(html).toContain('Diesel');
    expect(html).toContain('TS 07 TR 4444');
    expect(html).toContain('28,900 km');
    expect(html).toContain(VERIFIED_VEHICLE_IMAGES['toyota_fortuner']);
    expect(html).not.toContain('Honda City');
  });

  it('TEST 3 — REFRESH: Refreshing /dashboard keeps Toyota Fortuner', () => {
    const fortuner = buildVehicleObject({
      manufacturer: 'Toyota',
      model: 'Fortuner',
      modelYear: '2024',
      variant: '2.8 4x4 AT',
      type: 'Diesel',
      regNumber: 'TS 07 TR 4444',
      odometer: 28900
    });

    store['autopulse_auth'] = 'true';
    store['garage_vehicle'] = JSON.stringify(fortuner);

    // Simulate page refresh 1
    const html1 = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );
    expect(html1).toContain('Toyota Fortuner');
    expect(html1).toContain(VERIFIED_VEHICLE_IMAGES['toyota_fortuner']);

    // Simulate page refresh 2
    const html2 = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );
    expect(html2).toContain('Toyota Fortuner');
    expect(html2).toContain(VERIFIED_VEHICLE_IMAGES['toyota_fortuner']);
  });

  it('TEST 4 — CHANGE VEHICLE: Changing to Hyundai Creta updates Dashboard immediately; NOT Fortuner, NOT Honda City', () => {
    const creta = buildVehicleObject({
      manufacturer: 'Hyundai',
      model: 'Creta',
      modelYear: '2024',
      variant: 'SX(O) Turbo',
      type: 'Diesel',
      regNumber: 'TS 08 EA 9901',
      odometer: 14000
    });

    store['autopulse_auth'] = 'true';
    store['garage_vehicle'] = JSON.stringify(creta);

    const html = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    // Dashboard now shows Hyundai Creta
    expect(html).toContain('Hyundai Creta');
    expect(html).toContain(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);
    expect(html).toContain('TS 08 EA 9901');
    expect(html).toContain('14,000 km');

    // Must NOT show old Toyota Fortuner or default Honda City
    expect(html).not.toContain('Toyota Fortuner');
    expect(html).not.toContain('Honda City');
  });

  it('TEST 5 — NO VEHICLE: Clearing saved vehicle returns to onboarding page', () => {
    // Start with saved vehicle
    store['autopulse_auth'] = 'true';
    store['garage_vehicle'] = JSON.stringify(buildVehicleObject({ manufacturer: 'Hyundai', model: 'Creta' }));

    // User clears garage vehicle
    delete store['garage_vehicle'];
    delete store['autopulse_vehicle'];

    const html = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    // Onboarding appears
    expect(html).toContain('Your Vehicle. Smarter Care.');
    expect(html).toContain('Welcome to AutoPulse');
    expect(html).not.toContain('Live Vehicle Telemetry Active');
    expect(html).not.toContain('Total Odometer');
    expect(html).not.toContain('Next Recommended Service');
  });

  it('TEST 6 — ERROR CHECK: Zero hook errors when toggling between null vehicle and saved vehicles', () => {
    store['autopulse_auth'] = 'true';

    // 1. Render null vehicle
    delete store['garage_vehicle'];
    expect(() => {
      renderToString(
        <AppProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();

    // 2. Render Fortuner
    store['garage_vehicle'] = JSON.stringify(buildVehicleObject({ manufacturer: 'Toyota', model: 'Fortuner' }));
    expect(() => {
      renderToString(
        <AppProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();

    // 3. Render Tesla Model 3
    store['garage_vehicle'] = JSON.stringify(buildVehicleObject({ manufacturer: 'Tesla', model: 'Model 3' }));
    expect(() => {
      renderToString(
        <AppProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();

    // 4. Clear back to null
    delete store['garage_vehicle'];
    expect(() => {
      renderToString(
        <AppProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();
  });

  it('TEST 7 — FORM INPUTS: Vehicle setup inputs start empty with correct placeholders, no auto-filled values', () => {
    store['autopulse_auth'] = 'true';
    delete store['garage_vehicle'];

    const html = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/vehicle-setup']}>
          <VehicleSetupView />
        </MemoryRouter>
      </AppProvider>
    );

    // Placeholders must be present
    expect(html).toContain('placeholder="Enter registration number"');
    expect(html).toContain('placeholder="Enter current odometer"');
    expect(html).toContain('placeholder="Enter chassis/VIN number"');
    expect(html).toContain('placeholder="Enter engine number"');

    // Inputs must NOT contain pre-filled values
    expect(html).not.toContain('value="TS 09 FH 4821"');
    expect(html).not.toContain('value="TS 07 TR 4444"');
    expect(html).not.toContain('value="28900"');
    expect(html).not.toContain('value="MBJFT882KP0019281"');
    expect(html).not.toContain('value="1GD-FTV-882910"');
  });

  it('TEST 8 — DASHBOARD INTEGRITY: Recent Activity, Subsystem Health, and Maintenance Pro Tip appear exactly once', () => {
    const creta = buildVehicleObject({
      manufacturer: 'Hyundai',
      model: 'Creta',
      modelYear: '2024',
      variant: 'SX(O) Turbo',
      type: 'Diesel',
      regNumber: 'TS 08 EA 9901',
      odometer: 14000
    });

    store['autopulse_auth'] = 'true';
    store['garage_vehicle'] = JSON.stringify(creta);

    const html = renderToString(
      <AppProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    // Count occurrences of key section headings
    const recentActivityCount = (html.match(/<h3>Recent Activity<\/h3>/g) || []).length;
    const subsystemHealthCount = (html.match(/<h3>Subsystem Health<\/h3>/g) || []).length;
    const maintenanceProTipCount = (html.match(/<h3>Maintenance Pro Tip<\/h3>/g) || []).length;

    expect(recentActivityCount).toBe(1);
    expect(subsystemHealthCount).toBe(1);
    expect(maintenanceProTipCount).toBe(1);
  });

  it('TEST 9 — BUTTON DESIGN SYSTEM: CSS includes warm ivory #F4EFE3, deep charcoal #1F2937, beige border #D8D0C2, and exact green #91AE6E', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const cssPath = path.resolve(__dirname, '../../App.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Verify Warm Ivory, deep charcoal text, beige border, and #91AE6E brand green
    expect(cssContent).toContain('#F4EFE3');
    expect(cssContent).toContain('#1F2937');
    expect(cssContent).toContain('#D8D0C2');
    expect(cssContent).toContain('#91AE6E');

    // Verify button classes styled with ivory/sage theme
    expect(cssContent).toContain('.primary-button');
    expect(cssContent).toContain('.outline-button');
    expect(cssContent).toContain('.diagnose-submit-btn');
    expect(cssContent).toContain('.login-submit-btn');
    expect(cssContent).toContain('.add-vehicle-hero-btn');
    expect(cssContent).toContain('.save-vehicle-btn');
  });
});
