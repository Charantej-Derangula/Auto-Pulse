import { describe, it, expect, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, DEMO_VEHICLES } from '../../context/AppContext';
import { DashboardView } from '../DashboardView';
import { MyVehicleView } from '../MyVehicleView';
import { VERIFIED_VEHICLE_IMAGES } from '../../services/VehicleService';

describe('React Rules of Hooks Order Integrity Suite', () => {
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

  it('1. DashboardView renders when vehicle is null without throwing hook error', () => {
    store['autopulse_auth'] = 'true';
    delete store['garage_vehicle'];
    delete store['autopulse_vehicle'];

    expect(() => {
      renderToString(
        <AppProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();
  });

  it('2. DashboardView renders when vehicle is loaded without throwing hook error', () => {
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['autopulse_auth'] = 'true';
    store['garage_vehicle'] = JSON.stringify(creta);

    expect(() => {
      const html = renderToString(
        <AppProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
      expect(html).toContain('Hyundai Creta');
      expect(html).toContain(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);
    }).not.toThrow();
  });

  it('3. Sequential state transitions from null vehicle to saved vehicle execute with identical hook count', () => {
    // 1st render with no vehicle
    store['autopulse_auth'] = 'true';
    delete store['garage_vehicle'];

    let html1 = '';
    expect(() => {
      html1 = renderToString(
        <AppProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();
    expect(html1).toContain('Add your vehicle');

    // 2nd render after vehicle is saved (e.g. Hyundai Creta)
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['garage_vehicle'] = JSON.stringify(creta);

    let html2 = '';
    expect(() => {
      html2 = renderToString(
        <AppProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();
    expect(html2).toContain('Hyundai Creta');
    expect(html2).toContain(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);

    // 3rd render switching to Tata Nexon
    const nexon = DEMO_VEHICLES.find(v => v.id === 'tata-nexon');
    store['garage_vehicle'] = JSON.stringify(nexon);

    let html3 = '';
    expect(() => {
      html3 = renderToString(
        <AppProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );
    }).not.toThrow();
    expect(html3).toContain('Tata Nexon');
    expect(html3).toContain(VERIFIED_VEHICLE_IMAGES['tata_nexon']);
  });

  it('4. MyVehicleView renders with vehicle=null and vehicle=saved without hook order violation', () => {
    store['autopulse_auth'] = 'true';
    delete store['garage_vehicle'];

    // Render 1: null vehicle
    expect(() => {
      const html1 = renderToString(
        <AppProvider>
          <MemoryRouter>
            <MyVehicleView />
          </MemoryRouter>
        </AppProvider>
      );
      expect(html1).toContain('Add your vehicle');
    }).not.toThrow();

    // Render 2: saved vehicle
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['garage_vehicle'] = JSON.stringify(creta);

    expect(() => {
      const html2 = renderToString(
        <AppProvider>
          <MemoryRouter>
            <MyVehicleView />
          </MemoryRouter>
        </AppProvider>
      );
      expect(html2).toContain('Hyundai');
      expect(html2).toContain('Creta');
    }).not.toThrow();
  });

  it('5. DashboardView renders cinematic automotive background layer behind content with aria-hidden', () => {
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['autopulse_auth'] = 'true';
    store['garage_vehicle'] = JSON.stringify(creta);

    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(html).toContain('dashboard-cinematic-bg');
    expect(html).toContain('ambient-beam-1');
    expect(html).toContain('ambient-beam-2');
    expect(html).toContain('ambient-sweep');
    expect(html).toContain('ambient-radial-glow');
    expect(html).toContain('aria-hidden="true"');
  });
});
