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
});
