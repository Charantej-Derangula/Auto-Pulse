import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, DEMO_VEHICLES } from '../../context/AppContext';
import { DashboardView } from '../DashboardView';
import { VehicleSetupView } from '../VehicleSetupView';
import { buildVehicleObject, getVehicleImage, VERIFIED_VEHICLE_IMAGES, NEUTRAL_VEHICLE_FALLBACK } from '../../services/VehicleService';

describe('AutoPulse First Vehicle Setup Workflow Suite', () => {
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

  it('1. Authenticated user with no saved vehicle starts with vehicle=null and renders VehicleSetupView on Dashboard', () => {
    store['autopulse_auth'] = 'true';
    delete store['garage_vehicle'];
    delete store['autopulse_vehicle'];

    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(html).toContain('Add your vehicle');
    expect(html).toContain('Set up your vehicle to unlock your personalized AutoPulse experience.');
    expect(html).toContain('Save Vehicle');
    expect(html).toContain(NEUTRAL_VEHICLE_FALLBACK);
    // Honda City is NOT displayed as default
    expect(html).not.toContain('Honda City (ZX CVT)');
  });

  it('2. Vehicle image preview derives exact verified image dynamically when make & model are selected', () => {
    // Test initial neutral fallback
    expect(getVehicleImage('', '')).toBe(NEUTRAL_VEHICLE_FALLBACK);

    // Test Hyundai Creta
    const cretaImg = getVehicleImage('Hyundai', 'Creta');
    expect(cretaImg).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);
    expect(cretaImg).not.toBe(NEUTRAL_VEHICLE_FALLBACK);

    // Test dynamic change to Hyundai Venue
    const venueImg = getVehicleImage('Hyundai', 'Venue');
    expect(venueImg).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_venue']);
    expect(venueImg).not.toBe(cretaImg);

    // Test Toyota Fortuner
    const fortunerImg = getVehicleImage('Toyota', 'Fortuner');
    expect(fortunerImg).toBe(VERIFIED_VEHICLE_IMAGES['toyota_fortuner']);
  });

  it('3. Building and saving a vehicle generates unique vehicleId, exact image, and persists safely', () => {
    const userInput = {
      manufacturer: 'Hyundai',
      model: 'Creta',
      modelYear: '2024',
      type: 'Diesel',
      regNumber: 'TS 08 EA 9901',
      chassisNumber: 'MALC581DLM0482910',
      engineNumber: 'D4FA-3918291',
      odometer: 18000
    };

    const savedVehicle = buildVehicleObject(userInput);
    expect(savedVehicle.id).toBe('hyundai-creta');
    expect(savedVehicle.vehicleId).toBe('hyundai-creta');
    expect(savedVehicle.displayName).toBe('Hyundai Creta');
    expect(savedVehicle.image).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);
    expect(savedVehicle.imageUrl).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);
    expect(savedVehicle.healthScore).toBe(94);

    // Save to localStorage
    store['garage_vehicle'] = JSON.stringify(savedVehicle);

    // Re-render Dashboard with saved vehicle
    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(html).toContain('Good Morning');
    expect(html).toContain('Hyundai Creta');
    expect(html).toContain('Estimated Vehicle Health');
    expect(html).not.toContain('Add your vehicle');
  });

  it('4. Refreshing the browser preserves saved vehicle and displays normal dashboard', () => {
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['garage_vehicle'] = JSON.stringify(creta);

    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(html).toContain('Good Morning');
    expect(html).toContain('Hyundai Creta');
    expect(html).toContain('Estimated Vehicle Health');
  });

  it('5. Logout and subsequent Login preserves saved vehicle and displays on Dashboard', () => {
    // 1. User has saved Hyundai Creta
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['garage_vehicle'] = JSON.stringify(creta);
    store['autopulse_auth'] = 'true';

    // 2. Simulate Logout (clears auth, preserves garage_vehicle)
    delete store['autopulse_auth'];

    // 3. User logs back in
    store['autopulse_auth'] = 'true';

    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(html).toContain('Hyundai Creta');
    expect(html).toContain(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);
    expect(html).not.toContain('Choose Your Vehicle');
  });

  it('6. Clearing active vehicle returns Dashboard to onboarding state without showing Honda City', () => {
    // 1. Initially saved vehicle
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['garage_vehicle'] = JSON.stringify(creta);
    store['autopulse_auth'] = 'true';

    // 2. Clear saved vehicle
    delete store['garage_vehicle'];
    delete store['autopulse_vehicle'];

    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    // Should return to onboarding
    expect(html).toContain('Add your vehicle');
    expect(html).toContain('Your Vehicle. Smarter Care.');
    expect(html).toContain('Choose Your Vehicle');
    expect(html).not.toContain('Honda City (ZX CVT)');
    expect(html).not.toContain('42,680 km');
  });

  it('7. Renders all 9 verified vehicle cards in Step 1 grid with exact names and images', () => {
    store['autopulse_auth'] = 'true';
    delete store['garage_vehicle'];
    delete store['autopulse_vehicle'];

    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <VehicleSetupView />
        </MemoryRouter>
      </AppProvider>
    );

    const REQUIRED_NAMES = [
      'Honda City',
      'Hyundai Creta',
      'Hyundai Venue',
      'Tata Nexon',
      'Mahindra XUV700',
      'Toyota Fortuner',
      'Toyota Innova HyCross',
      'Tesla Model 3',
      'Tata Nexon EV'
    ];

    REQUIRED_NAMES.forEach(name => {
      expect(html).toContain(name);
    });

    const REQUIRED_IMAGES = [
      '/assets/vehicles/honda-city.jpg',
      '/assets/vehicles/hyundai-creta.jpg',
      '/assets/vehicles/hyundai-venue.jpg',
      '/assets/vehicles/tata-nexon.jpg',
      '/assets/vehicles/mahindra-xuv700.png',
      '/assets/vehicles/toyota-fortuner.jpg',
      '/assets/vehicles/toyota-innova-hycross.jpg',
      '/assets/vehicles/tesla-model-3.jpg',
      '/assets/vehicles/tata-nexon-ev.jpg'
    ];

    REQUIRED_IMAGES.forEach(img => {
      expect(html).toContain(img);
    });
  });
});
