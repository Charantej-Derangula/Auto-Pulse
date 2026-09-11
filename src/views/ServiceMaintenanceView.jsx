import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  Gauge,
  CheckCircle2,
  Clock,
  Droplet,
  ShieldCheck,
  Plus,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ServiceMaintenanceView() {
  const { vehicle, setActiveTab } = useApp();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState('50,000 km Major General Service');

  const componentChecks = [
    { name: 'Engine Oil & Filter', status: 'Due in 7,320 km', health: 85, type: 'Synthetic 0W-20', ok: true },
    { name: 'Brake Fluid (DOT 4)', status: 'Moisture < 1.5% (Good)', health: 90, type: 'Boiling point 260°C', ok: true },
    { name: 'Engine Coolant', status: 'Level Optimal (-25°C freeze protection)', health: 95, type: 'Long Life Coolant', ok: true },
    { name: 'Spark Plugs (Iridium)', status: 'Replace at 50k km interval', health: 78, type: 'NGK Laser Iridium', ok: true },
    { name: 'Cabin & Engine Air Filter', status: 'Cleaned last service', health: 88, type: 'HEPA Pollen Filter', ok: true },
    { name: 'Transmission Fluid (CVTF)', status: 'Inspect level & color', health: 92, type: 'Honda HCF-2 Spec', ok: true }
  ];

  const maintenanceSchedule = [
    {
      mileage: '50,000 km',
      title: 'Major Scheduled Service',
      due: 'Dec 2026 (Upcoming)',
      items: ['Engine Oil & OEM Filter replacement', 'Spark plug set renewal', 'Brake pad caliper service', 'Throttle body decarbonization', 'Full suspension torque check'],
      estCost: '₹6,500 - ₹8,500',
      isNext: true
    },
    {
      mileage: '60,000 km',
      title: 'Brake Fluid & Coolant Flush',
      due: 'Jun 2027',
      items: ['Complete brake hydraulic flush', 'Coolant drainage & fresh refill', 'Fuel filter replacement', 'AC evaporator sanitization'],
      estCost: '₹4,800 - ₹6,200',
      isNext: false
    },
    {
      mileage: '70,000 km',
      title: 'Transmission & Drive Belt Overhaul',
      due: 'Jan 2028',
      items: ['CVT transmission oil drain & fill', 'Accessory serpentine belt change', 'Battery CCA deep load test'],
      estCost: '₹8,900 - ₹11,500',
      isNext: false
    }
  ];

  const handleBookService = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab('Find Garage');
    }, 1500);
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Service & Maintenance Planner</h2>
          <p>
            Manufacturer recommended service schedules, component checks, and fluid level analytics for {vehicle?.manufacturer} {vehicle?.model}.
          </p>
        </div>

        <button 
          className="primary-button flex-center-gap"
          style={{ width: 'auto', padding: '10px 22px' }}
          onClick={handleBookService}
        >
          <Wrench size={16} />
          <span>Book Next Service</span>
        </button>
      </div>

      {bookingSuccess && (
        <div className="alert-banner-success">
          <CheckCircle2 size={18} />
          <span>Redirecting to authorized workshop bay booking for {selectedServiceType}...</span>
        </div>
      )}

      {/* TOP SUMMARY CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Next Service Milestone</span>
            <div className="kpi-icon-wrap blue"><Wrench size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">{vehicle?.serviceDueKm ? vehicle.serviceDueKm.toLocaleString() : '50,000'}</strong>
            <span className="kpi-unit">km</span>
          </div>
          <div className="kpi-footer text-blue">
            <span>Target: December 2026</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Remaining Distance</span>
            <div className="kpi-icon-wrap green"><Gauge size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">{vehicle ? (vehicle.serviceDueKm - vehicle.odometer).toLocaleString() : '7,320'}</strong>
            <span className="kpi-unit">km left</span>
          </div>
          <div className="kpi-footer text-emerald">
            <span>Interval 85% elapsed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Estimated Service Cost</span>
            <div className="kpi-icon-wrap amber"><Droplet size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">₹7,200</strong>
            <span className="kpi-unit">OEM Est.</span>
          </div>
          <div className="kpi-footer text-amber">
            <span>Includes fluids & genuine spares</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN: COMPONENT CHECKS & UPCOMING SCHEDULE */}
      <div className="two-column-equal" style={{ marginTop: '24px' }}>
        {/* COMPONENT CHECKS */}
        <div className="panel">
          <div className="section-header">
            <h3>Component & Fluid Health Monitor</h3>
            <span className="badge-good">All Verified</span>
          </div>

          <div className="component-checks-list">
            {componentChecks.map((comp, idx) => (
              <div key={idx} className="comp-check-item">
                <div className="comp-check-header">
                  <div>
                    <strong>{comp.name}</strong>
                    <span className="comp-sub">{comp.type}</span>
                  </div>
                  <span className="comp-pct">{comp.health}%</span>
                </div>

                <div className="subsystem-bar">
                  <div 
                    className="subsystem-fill" 
                    style={{ 
                      width: `${comp.health}%`,
                      backgroundColor: comp.health > 80 ? '#2de28a' : '#f59e0b'
                    }}
                  ></div>
                </div>

                <div className="comp-status-row">
                  <span className="text-muted">{comp.status}</span>
                  <CheckCircle2 size={15} className="text-emerald" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SCHEDULED MAINTENANCE TIMELINE */}
        <div className="panel">
          <div className="section-header">
            <h3>Scheduled Maintenance Roadmap</h3>
            <span className="text-muted">OEM Manufacturer Spec</span>
          </div>

          <div className="maintenance-roadmap-list">
            {maintenanceSchedule.map((sched, idx) => (
              <div key={idx} className={`roadmap-card ${sched.isNext ? 'next-milestone' : ''}`}>
                <div className="roadmap-header">
                  <div>
                    <span className="roadmap-milestone-tag">{sched.mileage}</span>
                    <strong className="roadmap-title">{sched.title}</strong>
                  </div>
                  <div className="roadmap-cost-badge">
                    <strong>{sched.estCost}</strong>
                    <small>{sched.due}</small>
                  </div>
                </div>

                <ul className="roadmap-items-list">
                  {sched.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <CheckCircle2 size={14} className="text-blue" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {sched.isNext && (
                  <button 
                    className="primary-button" 
                    style={{ width: '100%', marginTop: '14px', padding: '10px' }}
                    onClick={handleBookService}
                  >
                    Select & Book This Milestone Service
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
