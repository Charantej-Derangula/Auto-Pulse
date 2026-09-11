import React from 'react';
import {
  LayoutDashboard,
  Car,
  Stethoscope,
  Wrench,
  Fuel,
  FileText,
  Bell,
  History,
  MapPin,
  Settings,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen, vehicle, setActiveTab, documents, reminders } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || null;
  const vehicleDocCount = Array.isArray(documents) && currentVehicleId
    ? documents.filter(d => d.vehicleId === currentVehicleId).length 
    : 0;
  const vehiclePendingRemindersCount = Array.isArray(reminders) && currentVehicleId
    ? reminders.filter(r => r.vehicleId === currentVehicleId && !r.completed).length
    : 0;

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, path: '/dashboard' },
    { id: 'My Vehicle', label: 'My Vehicle', icon: Car, badge: vehicle?.type, path: '/vehicle' },
    { id: 'Diagnose Issue', label: 'Diagnose Issue', icon: Stethoscope, badge: 'AI', path: '/diagnose' },
    { id: 'Service & Maintenance', label: 'Service & Maintenance', icon: Wrench, badge: null, path: '/maintenance' },
    { id: 'Fuel & Expenses', label: 'Fuel & Expenses', icon: Fuel, badge: null, path: '/fuel-expenses' },
    { id: 'Documents', label: 'Documents', icon: FileText, badge: vehicleDocCount > 0 ? `${vehicleDocCount}` : null, path: '/documents' },
    { id: 'Reminders', label: 'Reminders', icon: Bell, badge: vehiclePendingRemindersCount > 0 ? `${vehiclePendingRemindersCount}` : null, path: '/reminders' },
    { id: 'Service History', label: 'Service History', icon: History, badge: null, path: '/service-history' },
    { id: 'Find Garage', label: 'Find Garage', icon: MapPin, badge: 'Nearby', path: '/find-garage' },
    { id: 'Settings', label: 'Settings', icon: Settings, badge: null, path: '/settings' }
  ];

  const handleNavigation = (path, id) => {
    navigate(path);
    if (setActiveTab) setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="brand" onClick={() => handleNavigation('/dashboard', 'Dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Zap size={26} className="brand-pulse-svg" />
          </div>
          <div className="brand-titles">
            <h1>AUTO<span>PULSE</span></h1>
            <p>Automotive SaaS & Garage Intelligence</p>
          </div>
          {isSidebarOpen && (
            <button
              className="menu-btn close-sidebar-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(false);
              }}
              aria-label="Close Navigation"
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const currentPath = location.pathname;
            const isActive = currentPath === item.path || 
              (item.path === '/vehicle' && currentPath === '/my-vehicle') ||
              (item.path === '/diagnose' && currentPath === '/diagnose-issue') ||
              (item.path === '/maintenance' && currentPath === '/service-maintenance');
            return (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path, item.id)}
              >
                <div className="sidebar-item-content">
                  <Icon size={19} className="sidebar-icon" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`sidebar-pill ${isActive ? 'pill-active' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pro Active Vehicle Widget in Sidebar */}
        {vehicle ? (
          <div className="sidebar-vehicle-pill" onClick={() => handleNavigation('/vehicle', 'My Vehicle')}>
            <div className="vehicle-mini-status">
              <span className="pulse-dot"></span>
              <strong>{vehicle.displayName || `${vehicle.manufacturer} ${vehicle.model}`}</strong>
            </div>
            <span className="vehicle-mini-sub">{vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km • ` : ''}{vehicle.healthScore || 95}% Health</span>
          </div>
        ) : (
          <div className="sidebar-vehicle-pill" onClick={() => handleNavigation('/dashboard', 'Dashboard')} style={{ borderColor: '#91AE6E', background: 'rgba(145, 174, 110, 0.12)' }}>
            <div className="vehicle-mini-status">
              <span className="pulse-dot" style={{ background: '#91AE6E' }}></span>
              <strong style={{ color: '#1F2937' }}>+ Add Your Vehicle</strong>
            </div>
            <span className="vehicle-mini-sub">Setup garage profile</span>
          </div>
        )}

        {/* Footer Quote */}
        <div className="sidebar-quote">
          <p>"A well-maintained vehicle takes you further in life."</p>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </>
  );
}
