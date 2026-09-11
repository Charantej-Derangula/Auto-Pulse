import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, DEMO_VEHICLES } from '../../context/AppContext';
import { ServiceHistoryView } from '../ServiceHistoryView';
import { DocumentsView } from '../DocumentsView';
import { RemindersView } from '../RemindersView';
import { DiagnoseIssueView } from '../DiagnoseIssueView';

describe('AutoPulse Vehicle Data Isolation & Integrity Suite', () => {
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

  it('1. Service History displays records isolated to currently selected vehicle', () => {
    // 1. Set Honda City as active vehicle
    const honda = DEMO_VEHICLES.find(v => v.id === 'honda-city');
    store['garage_vehicle'] = JSON.stringify(honda);

    const hondaHtml = renderToString(
      <AppProvider>
        <MemoryRouter>
          <ServiceHistoryView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(hondaHtml).toContain('Honda City');
    expect(hondaHtml).toContain('40,000 km Scheduled Service');

    // 2. Switch active vehicle to Hyundai Creta
    const creta = DEMO_VEHICLES.find(v => v.id === 'hyundai-creta');
    store['garage_vehicle'] = JSON.stringify(creta);

    const cretaHtml = renderToString(
      <AppProvider>
        <MemoryRouter>
          <ServiceHistoryView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(cretaHtml).toContain('Hyundai Creta');
    // Honda's specific service record title must NOT appear for Creta
    expect(cretaHtml).not.toContain('40,000 km Scheduled Service &amp; Synthetic Oil');
  });

  it('2. Documents Vault isolates documents to selected vehicle', () => {
    // 1. Honda City
    const honda = DEMO_VEHICLES.find(v => v.id === 'honda-city');
    store['garage_vehicle'] = JSON.stringify(honda);

    const hondaDocsHtml = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DocumentsView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(hondaDocsHtml).toContain('Comprehensive Motor Insurance');
    expect(hondaDocsHtml).toContain('Pollution Under Control (PUC)');

    // 2. Hyundai Venue
    const venue = DEMO_VEHICLES.find(v => v.id === 'hyundai-venue');
    store['garage_vehicle'] = JSON.stringify(venue);

    const venueDocsHtml = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DocumentsView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(venueDocsHtml).toContain('No documents found');
  });

  it('3. Reminders list isolates alerts to selected vehicle', () => {
    // 1. Honda City
    const honda = DEMO_VEHICLES.find(v => v.id === 'honda-city');
    store['garage_vehicle'] = JSON.stringify(honda);

    const hondaRemHtml = renderToString(
      <AppProvider>
        <MemoryRouter>
          <RemindersView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(hondaRemHtml).toContain('PUC Renewal Inspection');

    // 2. Tesla Model 3
    const tesla = DEMO_VEHICLES.find(v => v.id === 'tesla-m3');
    store['garage_vehicle'] = JSON.stringify(tesla);

    const teslaRemHtml = renderToString(
      <AppProvider>
        <MemoryRouter>
          <RemindersView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(teslaRemHtml).toContain('No reminders found for this filter');
  });

  it('4. Diagnosis view displays active vehicle profile and isolated telemetry', () => {
    const nexonEV = DEMO_VEHICLES.find(v => v.id === 'tata-nexon-ev');
    store['garage_vehicle'] = JSON.stringify(nexonEV);

    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <DiagnoseIssueView />
        </MemoryRouter>
      </AppProvider>
    );

    expect(html).toContain('Tata Nexon EV');
    expect(html).toContain('Empowered+ LR');
    expect(html).toContain('AI Diagnostic Engine Active');
  });
});
