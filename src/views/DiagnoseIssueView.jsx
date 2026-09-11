import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  Clock,
  IndianRupee,
  ShieldAlert,
  CheckCircle2,
  Wrench,
  Search,
  Sparkles,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function DiagnoseIssueView() {
  const { 
    diagnostics, 
    selectedDiagnosticId, 
    setSelectedDiagnosticId, 
    setActiveTab,
    vehicle 
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');

  const currentDiag = diagnostics.find(d => d.id === selectedDiagnosticId) || diagnostics[0];

  const filteredDiagnostics = diagnostics.filter(d => 
    d.symptom.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="view-page-container">
      {/* HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Smart Vehicle Diagnostics & Fault Analysis</h2>
          <p>
            AI-assisted diagnostic engine analyzing CAN-Bus trouble codes and symptoms for {vehicle?.manufacturer} {vehicle?.model}.
          </p>
        </div>

        <div className="diagnostic-badge-top">
          <Sparkles size={16} className="text-cyan" />
          <span>OBD-II Engine Active</span>
        </div>
      </div>

      {/* SEARCH AND SYMPTOM SELECTOR */}
      <div className="diagnostics-selector-strip">
        <div className="search-diagnostics-box">
          <Search size={18} />
          <input
            placeholder="Search symptoms, error codes (e.g., P0420, squeal, vibration)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div className="symptom-tags-scroll">
          {filteredDiagnostics.map(diag => (
            <button
              key={diag.id}
              className={`symptom-select-pill ${diag.id === currentDiag.id ? 'active' : ''}`}
              onClick={() => setSelectedDiagnosticId(diag.id)}
            >
              <span className="severity-indicator-dot" style={{ backgroundColor: diag.severityColor }}></span>
              <span>{diag.symptom}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN DIAGNOSIS DETAIL LAYOUT */}
      <div className="diagnosis-grid-layout">
        {/* LEFT COLUMN: DETAILED DIAGNOSIS CARD */}
        <div className="diagnosis-main-card">
          <div className="diag-header">
            <div className="diag-title-area">
              <span className="diag-category-badge">{currentDiag.category}</span>
              <h3>{currentDiag.symptom}</h3>
            </div>
            <div 
              className="diag-severity-badge"
              style={{ 
                color: currentDiag.severityColor, 
                borderColor: currentDiag.severityColor,
                backgroundColor: `${currentDiag.severityColor}15`
              }}
            >
              <AlertTriangle size={16} />
              <span>{currentDiag.severity} Severity</span>
            </div>
          </div>

          {/* WARNING BANNER */}
          <div className="diag-warning-banner">
            <ShieldAlert size={20} className="text-amber" />
            <div>
              <strong>Safety Warning & Impact:</strong>
              <p>{currentDiag.warning}</p>
            </div>
          </div>

          {/* POSSIBLE CAUSES */}
          <div className="diag-section">
            <h4>Root Causes Identified (Ranked by Probability):</h4>
            <div className="causes-list">
              {currentDiag.causes.map((cause, idx) => (
                <div key={idx} className="cause-item">
                  <span className="cause-num">{idx + 1}</span>
                  <p>{cause}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RECOMMENDED ACTION */}
          <div className="diag-section">
            <h4>Recommended Expert Resolution:</h4>
            <div className="recommended-box">
              <CheckCircle2 size={20} className="text-emerald" />
              <p>{currentDiag.recommendedAction}</p>
            </div>
          </div>

          {/* CAN I STILL DRIVE SECTION */}
          <div className="diag-can-drive-card">
            <div className="can-drive-header">
              <HelpCircle size={18} className="text-blue" />
              <strong>Can I still drive with this issue?</strong>
            </div>
            <p>{currentDiag.canDrive}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: REPAIR ESTIMATION & ACTION */}
        <div className="diagnosis-sidebar-cards">
          {/* ESTIMATION METRICS */}
          <div className="panel repair-cost-card">
            <div className="section-header">
              <h3>Repair Cost & Time</h3>
            </div>

            <div className="cost-breakdown-row">
              <div className="cost-item">
                <span className="text-muted">Estimated Repair Cost</span>
                <strong className="cost-val">{currentDiag.estimatedCost}</strong>
                <small className="text-muted">Includes labour & standard OEM parts</small>
              </div>

              <div className="cost-item" style={{ marginTop: '16px' }}>
                <span className="text-muted">Estimated Workshop Time</span>
                <div className="time-val-row">
                  <Clock size={16} className="text-blue" />
                  <strong>{currentDiag.estimatedTime}</strong>
                </div>
              </div>
            </div>

            <div className="diag-actions-col">
              <button 
                className="primary-button flex-center-gap"
                onClick={() => setActiveTab('Find Garage')}
              >
                <Wrench size={16} />
                <span>Book Diagnosis at Garage</span>
              </button>

              <button 
                className="outline-button flex-center-gap"
                onClick={() => setActiveTab('Service & Maintenance')}
              >
                <span>Add to Service Checklist</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* OBD-II CODE TELEMETRY */}
          <div className="panel obd-telemetry-card">
            <div className="section-header">
              <h3>OBD-II CAN Telemetry</h3>
              <span className="badge-good">Linked</span>
            </div>
            <div className="obd-specs-list">
              <div className="obd-row">
                <span>DTC Status</span>
                <strong className="text-emerald">P0300 Active Scan</strong>
              </div>
              <div className="obd-row">
                <span>ECU Response</span>
                <strong>Normal 14.2V</strong>
              </div>
              <div className="obd-row">
                <span>Freeze Frame</span>
                <strong>Logged at 42,680 km</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
