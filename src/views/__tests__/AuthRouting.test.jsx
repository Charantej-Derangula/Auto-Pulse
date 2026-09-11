import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Login } from '../../components/Login';
import { GlobalSearchModal } from '../../components/GlobalSearchModal';
import { DashboardView } from '../DashboardView';
import { MyVehicleView } from '../MyVehicleView';
import { ServiceHistoryView } from '../ServiceHistoryView';

function renderApp(initialPath = '/') {
  return renderToString(
    <AppProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppContent />
      </MemoryRouter>
    </AppProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />
        <div className="view-content-wrapper">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/vehicle" element={<MyVehicleView />} />
            <Route path="/service-history" element={<ServiceHistoryView />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </div>
      </main>
      <GlobalSearchModal />
    </div>
  );
}

describe('AutoPulse Authentication & Route Protection Suite', () => {
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

  it('1. First visit / logged-out user visiting /login renders Login component', () => {
    // storage is empty
    const html = renderApp('/login');
    expect(html).toContain('Welcome Back');
    expect(html).toContain('Sign In to Garage Dashboard');
    expect(html).not.toContain('Vehicle Health Score');
  });

  it('2. Logged-out user directly visiting /dashboard redirects away from Dashboard', () => {
    const html = renderApp('/dashboard');
    // Does not render any protected Dashboard content
    expect(html).not.toContain('Vehicle Health Score');
    expect(html).not.toContain('Good Morning');
  });

  it('3. Logged-out user directly visiting /service-history redirects away from Service History', () => {
    const html = renderApp('/service-history');
    expect(html).not.toContain('Service History &amp; Invoices');
    expect(html).not.toContain('Periodic Service');
  });

  it('4. Login form inputs start completely empty with disabled autocomplete', () => {
    const html = renderToString(
      <AppProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AppProvider>
    );

    expect(html).toContain('placeholder="Enter your name"');
    expect(html).toContain('placeholder="name@autopulse.io"');
    expect(html).toContain('placeholder="••••••••"');
    // Ensure hardcoded credentials are not populated in value attributes
    expect(html).not.toContain('value="charantej@autopulse.io"');
    expect(html).not.toContain('value="autopulse2026"');
    expect(html).toMatch(/autocomplete="off"/i);
    expect(html).toMatch(/autocomplete="new-password"/i);
  });

  it('5. Authenticated user with autopulse_auth=true renders Dashboard and protected views', () => {
    store['autopulse_auth'] = 'true';
    const html = renderApp('/dashboard');
    expect(html).toContain('Good Morning');
    expect(html).toContain('Vehicle Health Score');
    expect(html).not.toContain('Welcome Back');
  });

  it('6. Malformed or corrupted auth storage safely defaults to unauthenticated', () => {
    store['autopulse_auth'] = 'CORRUPTED_JSON_VALUE';
    const html = renderApp('/login');
    expect(html).toContain('Welcome Back');
    expect(html).toContain('Sign In to Garage Dashboard');
  });

  it('7. False auth value safely renders Login page', () => {
    store['autopulse_auth'] = 'false';
    const html = renderApp('/login');
    expect(html).toContain('Welcome Back');
    expect(html).toContain('Sign In to Garage Dashboard');
  });
});
