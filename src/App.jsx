import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp, AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Views
import { DashboardView } from './views/DashboardView';
import { MyVehicleView } from './views/MyVehicleView';
import { DiagnoseIssueView } from './views/DiagnoseIssueView';
import { ServiceMaintenanceView } from './views/ServiceMaintenanceView';
import { FuelExpensesView } from './views/FuelExpensesView';
import { DocumentsView } from './views/DocumentsView';
import { RemindersView } from './views/RemindersView';
import { ServiceHistoryView } from './views/ServiceHistoryView';
import { FindGarageView } from './views/FindGarageView';
import { SettingsView } from './views/SettingsView';
import { VehicleSetupView } from './views/VehicleSetupView';
import { NotFoundView } from './views/NotFoundView';

import './App.css';

import { ErrorBoundary } from './components/ErrorBoundary';

function MainAppContent() {
  const { isAuthenticated } = useApp();

  // If not authenticated, render Login view (Protected Route Lock)
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
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="main">
        {/* GLOBAL HEADER */}
        <Header />

        {/* ACTIVE VIEW WITH SMOOTH TRANSITIONS */}
        <div className="view-content-wrapper">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/vehicle-setup" element={<VehicleSetupView />} />
            <Route path="/setup-vehicle" element={<VehicleSetupView />} />
            <Route path="/vehicle" element={<MyVehicleView />} />
            <Route path="/my-vehicle" element={<MyVehicleView />} />
            <Route path="/diagnose" element={<DiagnoseIssueView />} />
            <Route path="/diagnose-issue" element={<DiagnoseIssueView />} />
            <Route path="/maintenance" element={<ServiceMaintenanceView />} />
            <Route path="/service-maintenance" element={<ServiceMaintenanceView />} />
            <Route path="/fuel-expenses" element={<FuelExpensesView />} />
            <Route path="/documents" element={<DocumentsView />} />
            <Route path="/reminders" element={<RemindersView />} />
            <Route path="/service-history" element={<ServiceHistoryView />} />
            <Route path="/find-garage" element={<FindGarageView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </div>
      </main>

      {/* GLOBAL SEARCH DIALOG OVERLAY */}
      <GlobalSearchModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <MainAppContent />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}