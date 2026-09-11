import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, DEMO_VEHICLES } from '../../context/AppContext';
import { MyVehicleView } from '../MyVehicleView';
import { DashboardView } from '../DashboardView';
import { getVehicleImage, VERIFIED_VEHICLE_IMAGES } from '../../services/VehicleService';

describe('Vehicle Preset & Image Synchronization Regression Suite', () => {
  let store = {};
  beforeEach(() => {
    store = {};
    globalThis.localStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; }
    };
  });

  const REQUIRED_MODELS = [
    { id: 'honda-city', name: 'Honda City', key: 'honda_city' },
    { id: 'hyundai-creta', name: 'Hyundai Creta', key: 'hyundai_creta' },
    { id: 'hyundai-venue', name: 'Hyundai Venue', key: 'hyundai_venue' },
    { id: 'tata-nexon', name: 'Tata Nexon', key: 'tata_nexon' },
    { id: 'mahindra-xuv700', name: 'Mahindra XUV700', key: 'mahindra_xuv700' },
    { id: 'toyota-fortuner', name: 'Toyota Fortuner', key: 'toyota_fortuner' },
    { id: 'toyota-innova', name: 'Toyota Innova HyCross', key: 'toyota_innova hycross' },
    { id: 'tesla-m3', name: 'Tesla Model 3', key: 'tesla_model 3' },
    { id: 'tata-nexon-ev', name: 'Tata Nexon EV', key: 'tata_nexon ev' }
  ];

  it('renders exact distinct image for all 9 preset vehicles in MyVehicleView', () => {
    REQUIRED_MODELS.forEach(v => {
      const demoObj = DEMO_VEHICLES.find(d => d.id === v.id);
      expect(demoObj).toBeDefined();

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('garage_vehicle', JSON.stringify(demoObj));
      }

      const html = renderToString(
        <AppProvider>
          <MemoryRouter>
            <MyVehicleView />
          </MemoryRouter>
        </AppProvider>
      );

      const expectedUrl = VERIFIED_VEHICLE_IMAGES[v.key];
      const htmlEncodedUrl = expectedUrl.replace(/&/g, '&amp;');
      expect(html).toContain(htmlEncodedUrl);
      expect(html).toContain(demoObj.manufacturer);
      expect(html).toContain(demoObj.model);
    });
  });

  it('renders exact distinct image for all 9 preset vehicles in DashboardView', () => {
    REQUIRED_MODELS.forEach(v => {
      const demoObj = DEMO_VEHICLES.find(d => d.id === v.id);
      expect(demoObj).toBeDefined();

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('garage_vehicle', JSON.stringify(demoObj));
      }

      const html = renderToString(
        <AppProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );

      const expectedUrl = VERIFIED_VEHICLE_IMAGES[v.key];
      const htmlEncodedUrl = expectedUrl.replace(/&/g, '&amp;');
      expect(html).toContain(htmlEncodedUrl);
      expect(html).toContain(demoObj.manufacturer);
      expect(html).toContain(demoObj.model);
    });
  });

  it('verifies all 9 vehicle image URLs are completely unique with no duplicate images', () => {
    const urls = REQUIRED_MODELS.map(v => VERIFIED_VEHICLE_IMAGES[v.key]);
    const unique = new Set(urls);
    expect(unique.size).toBe(9);
  });

  it('verifies dynamic vehicle editing replaces the old image and name with the new model', () => {
    // 1. Initial State: Hyundai Creta
    const creta = DEMO_VEHICLES.find(d => d.id === 'hyundai-creta');
    localStorage.setItem('garage_vehicle', JSON.stringify(creta));

    let html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    const cretaUrlEncoded = VERIFIED_VEHICLE_IMAGES['hyundai_creta'].replace(/&/g, '&amp;');
    expect(html).toContain(cretaUrlEncoded);
    expect(html).toContain('Hyundai Creta');

    // 2. Dynamic Edit to Toyota Fortuner
    const fortuner = DEMO_VEHICLES.find(d => d.id === 'toyota-fortuner');
    localStorage.setItem('garage_vehicle', JSON.stringify(fortuner));

    html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DashboardView />
        </MemoryRouter>
      </AppProvider>
    );

    const fortunerUrlEncoded = VERIFIED_VEHICLE_IMAGES['toyota_fortuner'].replace(/&/g, '&amp;');
    expect(html).toContain(fortunerUrlEncoded);
    expect(html).toContain('Toyota Fortuner');
    expect(html).not.toContain(cretaUrlEncoded);
  });

  it('verifies seamless sequential switching across Creta -> City -> Nexon -> XUV700 -> Fortuner', () => {
    const sequence = [
      { id: 'hyundai-creta', name: 'Hyundai Creta', key: 'hyundai_creta', path: '/assets/vehicles/hyundai-creta.jpg' },
      { id: 'honda-city', name: 'Honda City', key: 'honda_city', path: '/assets/vehicles/honda-city.jpg' },
      { id: 'tata-nexon', name: 'Tata Nexon', key: 'tata_nexon', path: '/assets/vehicles/tata-nexon.jpg' },
      { id: 'mahindra-xuv700', name: 'Mahindra XUV700', key: 'mahindra_xuv700', path: '/assets/vehicles/mahindra-xuv700.png' },
      { id: 'toyota-fortuner', name: 'Toyota Fortuner', key: 'toyota_fortuner', path: '/assets/vehicles/toyota-fortuner.jpg' }
    ];

    let previousPath = null;

    sequence.forEach(step => {
      const demo = DEMO_VEHICLES.find(d => d.id === step.id);
      expect(demo).toBeDefined();
      localStorage.setItem('garage_vehicle', JSON.stringify(demo));

      const html = renderToString(
        <AppProvider>
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        </AppProvider>
      );

      // Verify exact name and local image path
      expect(html).toContain(step.name);
      expect(html).toContain(step.path);

      // Verify no "Vehicle image unavailable" text appears
      expect(html).not.toContain('Vehicle image unavailable');

      // Verify previous image is not retained
      if (previousPath) {
        expect(html).not.toContain(previousPath);
      }
      previousPath = step.path;
    });
  });
});
