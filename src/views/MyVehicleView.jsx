import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Edit3,
  ShieldCheck,
  Calendar,
  Gauge,
  Fuel,
  Battery,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Wrench,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp, DEMO_VEHICLES } from '../context/AppContext';
import { VehicleHealthModal } from '../components/VehicleHealthModal';
import { calculateDocumentStatus } from '../services/DocumentService';
import { getVehicleImage, NEUTRAL_VEHICLE_FALLBACK } from '../services/VehicleService';

export function MyVehicleView() {
  const navigate = useNavigate();
  const { vehicle, setVehicle, setActiveTab, isVehicleLoading, vehicleError, setVehicleError, vehicleHealth, documents } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(vehicle || DEMO_VEHICLES[0]);
  const [savedAlert, setSavedAlert] = useState(false);
  const [selectedHealthSub, setSelectedHealthSub] = useState(null);

  // Sync formData when vehicle changes externally
  React.useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    }
  }, [vehicle]);

  const handleSelectDemo = async (e) => {
    const selected = DEMO_VEHICLES.find(v => v.id === e.target.value || v.model === e.target.value);
    if (selected) {
      setFormData(selected);
      await setVehicle(selected);
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'odometer' || name === 'fuelCapacity' ? Number(value) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Preserve stable unique vehicleId during details editing while synchronizing exact make/model & image
    const updated = {
      ...formData,
      id: vehicle?.id || formData.id || `${formData.manufacturer?.toLowerCase()}-${formData.model?.toLowerCase()}`,
      displayName: `${formData.manufacturer?.trim() || ''} ${formData.model?.trim() || ''}`.trim()
    };
    await setVehicle(updated);
    setIsEditing(false);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>My Vehicle Profile & Telemetry</h2>
          <p>Complete specifications, registration compliance, and live CAN-Bus component status.</p>
        </div>

        <div className="flex-center-gap">
          <button 
            className="outline-button flex-center-gap"
            style={{ width: 'auto', padding: '10px 18px' }}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={16} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Vehicle Info'}</span>
          </button>
        </div>
      </div>

      {isVehicleLoading && (
        <div className="alert-banner-info flex-center-gap">
          <RefreshCw size={18} className="spin-icon" />
          <span>Finding matching vehicle image and telemetry for {formData.manufacturer} {formData.model}...</span>
        </div>
      )}

      {vehicleError && (
        <div className="alert-banner-warning flex-center-gap">
          <AlertCircle size={18} />
          <span>{vehicleError}</span>
        </div>
      )}

      {savedAlert && !isVehicleLoading && (
        <div className="alert-banner-success">
          <CheckCircle2 size={18} />
          <span>Vehicle profile & matching image successfully updated and synchronized across Auto Pulse.</span>
        </div>
      )}

      {/* EDIT MODAL / DRAWER FORM */}
      {isEditing && (
        <div className="panel vehicle-edit-panel">
          <div className="section-header">
            <h3>Update Vehicle Details</h3>
            <span className="text-muted">Or switch between instant preset models</span>
          </div>

          <div className="demo-selector-row">
            <label>Quick Select Demo Model:</label>
            <select className="simple-input" onChange={handleSelectDemo} value={vehicle?.id || ''}>
              <option value="" disabled>Choose a vehicle preset...</option>
              {DEMO_VEHICLES.map(v => (
                <option key={v.id} value={v.id}>
                  {v.manufacturer} {v.model} ({v.variant} • {v.type})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSave} className="form-grid">
            <div className="form-group">
              <label>Manufacturer</label>
              <input 
                name="manufacturer" 
                value={formData.manufacturer} 
                onChange={handleChange} 
                className="simple-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input 
                name="model" 
                value={formData.model} 
                onChange={handleChange} 
                className="simple-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Variant</label>
              <input 
                name="variant" 
                value={formData.variant} 
                onChange={handleChange} 
                className="simple-input" 
              />
            </div>
            <div className="form-group">
              <label>Manufacturing Year</label>
              <input 
                name="year" 
                type="number" 
                value={formData.year} 
                onChange={handleChange} 
                className="simple-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Powertrain / Fuel</label>
              <select name="type" value={formData.type} onChange={handleChange} className="simple-input">
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>EV</option>
              </select>
            </div>
            <div className="form-group">
              <label>Odometer (km)</label>
              <input 
                name="odometer" 
                type="number" 
                value={formData.odometer} 
                onChange={handleChange} 
                className="simple-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input 
                name="regNumber" 
                value={formData.regNumber || 'TS 09 FH 4821'} 
                onChange={handleChange} 
                className="simple-input" 
              />
            </div>
            <div className="form-group">
              <label>VIN / Chassis Number</label>
              <input 
                name="vin" 
                value={formData.vin || 'MAKGM668NP0192834'} 
                onChange={handleChange} 
                className="simple-input" 
              />
            </div>

            <div className="form-actions col-span-2">
              <button 
                type="submit" 
                className="primary-button" 
                style={{ width: 'auto', padding: '12px 28px' }}
                disabled={isVehicleLoading}
              >
                {isVehicleLoading ? 'Resolving Vehicle...' : 'Save & Synchronize Changes'}
              </button>
              <button 
                type="button" 
                className="outline-button" 
                style={{ width: 'auto', padding: '12px 28px' }}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOP VEHICLE HERO PROFILE */}
      <div className="vehicle-profile-hero">
        <div className="vehicle-profile-image-wrap">
          <img 
            src={getVehicleImage(vehicle) || vehicle?.image || vehicle?.imageUrl || NEUTRAL_VEHICLE_FALLBACK} 
            alt={`${vehicle?.manufacturer || 'Vehicle'} ${vehicle?.model || ''}`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = NEUTRAL_VEHICLE_FALLBACK;
            }}
          />
          <div className="hero-vehicle-badge">
            <span className="live-dot"></span>
            <span>Active Profile</span>
          </div>
        </div>

        <div className="vehicle-profile-details">
          <div className="v-header-title-row">
            <div>
              <span className="v-category-label">{vehicle?.year} • {vehicle?.type} Sedan / SUV</span>
              <h1 className="v-hero-title">{vehicle?.displayName || `${vehicle?.manufacturer} ${vehicle?.model}`}</h1>
              <p className="v-hero-variant">{vehicle?.variant}</p>
            </div>
            <div className="v-health-circle-badge">
              <strong>{vehicleHealth?.overallScore || vehicle?.healthScore || 94}%</strong>
              <small>Health Score</small>
            </div>
          </div>

          <div className="v-specs-ribbon">
            <div className="spec-pill">
              <Gauge size={16} />
              <div>
                <small>Odometer</small>
                <strong>{vehicle?.odometer?.toLocaleString()} km</strong>
              </div>
            </div>

            <div className="spec-pill">
              <Fuel size={16} />
              <div>
                <small>{vehicle?.type === 'EV' ? 'Battery Pack' : 'Fuel Tank'}</small>
                <strong>{vehicle?.fuelCapacity} {vehicle?.type === 'EV' ? 'kWh' : 'Liters'}</strong>
              </div>
            </div>

            <div className="spec-pill">
              <ShieldCheck size={16} />
              <div>
                <small>Registration</small>
                <strong>{vehicle?.regNumber || 'TS 09 FH 4821'}</strong>
              </div>
            </div>

            <div className="spec-pill">
              <Calendar size={16} />
              <div>
                <small>Next Service</small>
                <strong>{vehicle?.serviceDueKm?.toLocaleString()} km</strong>
              </div>
            </div>
          </div>

          <div className="v-action-row">
            <button 
              className="primary-button" 
              style={{ width: 'auto', padding: '10px 22px' }} 
              onClick={() => {
                navigate('/maintenance');
                if (setActiveTab) setActiveTab('Service & Maintenance');
              }}
            >
              <Wrench size={16} />
              <span>Schedule Inspection</span>
            </button>
            <button 
              className="outline-button" 
              style={{ width: 'auto', padding: '10px 22px' }} 
              onClick={() => {
                navigate('/documents');
                if (setActiveTab) setActiveTab('Documents');
              }}
            >
              <FileText size={16} />
              <span>View Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* THREE COLUMN DETAILS SECTION */}
      <div className="three-column" style={{ padding: 0, marginTop: '24px' }}>
        {/* SUBSYSTEM STATUS */}
        <div className="panel">
          <div className="section-header">
            <h3>Subsystem CAN-Bus Telemetry</h3>
            <span className="badge-good">Online</span>
          </div>

          <div className="subsystems-detail-list">
            {(vehicleHealth?.subsystems || vehicle?.subsystems) && Object.entries(vehicleHealth?.subsystems || vehicle.subsystems).map(([key, sub]) => {
              const score = sub.score ?? sub.health ?? 90;
              const statusColor = score >= 90 ? "#2de28a" : score >= 75 ? "#38a8ff" : score >= 60 ? "#f59e0b" : "#ef4444";
              return (
                <div 
                  key={key} 
                  className="subsystem-detail-row"
                  onClick={() => setSelectedHealthSub(sub)}
                  title={`Click to view ${sub.name} diagnostics & recommendations`}
                  style={{ 
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.015)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div className="sub-row-top">
                    <strong style={{ fontSize: "13px" }}>{sub.name}</strong>
                    <span className="sub-health-pct" style={{ color: statusColor, fontWeight: "700" }}>{score}%</span>
                  </div>
                  <div className="subsystem-bar" style={{ margin: "5px 0" }}>
                    <div 
                      className="subsystem-fill" 
                      style={{ 
                        width: `${score}%`, 
                        backgroundColor: statusColor
                      }}
                    ></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <small className="text-muted" style={{ fontSize: "11px" }}>{sub.status}</small>
                    <small style={{ fontSize: "10px", color: "var(--accent-blue)", opacity: 0.85 }}>View Details →</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REGISTRATION & COMPLIANCE */}
        <div className="panel">
          <div className="section-header">
            <h3>Compliance & Legal Validity</h3>
            <button className="text-link-btn" onClick={() => setActiveTab('Documents')}>Vault →</button>
          </div>

          <div className="compliance-cards-list">
            {(() => {
              const currentVId = vehicle?.id || vehicle?.vehicleId || 'honda-city';
              const vDocs = Array.isArray(documents)
                ? documents.filter(d => (d.vehicleId === currentVId || (!d.vehicleId && currentVId === 'honda-city')))
                : [];

              if (vDocs.length === 0) {
                return (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <small>No compliance certificates uploaded for this vehicle.</small>
                    <div style={{ marginTop: '8px' }}>
                      <button className="outline-button" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => setActiveTab('Documents')}>
                        + Add Document
                      </button>
                    </div>
                  </div>
                );
              }

              return vDocs.slice(0, 3).map(doc => {
                const statusInfo = calculateDocumentStatus(doc.expiryDate);
                const isDanger = statusInfo.statusType === 'danger';
                const isWarning = statusInfo.statusType === 'warning';
                return (
                  <div key={doc.id} className="compliance-row">
                    <div className={`compliance-icon-wrap ${isDanger ? 'red' : isWarning ? 'amber' : 'green'}`} style={isDanger ? { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' } : undefined}>
                      {isDanger ? <AlertCircle size={18} /> : isWarning ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div className="compliance-info">
                      <strong>{doc.title}</strong>
                      <span>Expires {doc.expiryDate} {statusInfo.daysRemaining !== null ? `(${statusInfo.daysRemaining < 0 ? 'Passed' : `${statusInfo.daysRemaining} days left`})` : ''}</span>
                    </div>
                    <span className={isDanger ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-good'} style={isDanger ? { background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' } : undefined}>
                      {isDanger ? 'Expired' : isWarning ? 'Due Soon' : 'Valid'}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* TECHNICAL SPECIFICATIONS */}
        <div className="panel">
          <div className="section-header">
            <h3>Technical Specifications</h3>
          </div>

          <div className="tech-specs-table">
            <div className="spec-table-row">
              <span>VIN / Chassis</span>
              <strong>{vehicle?.vin || 'MAKGM668NP0192834'}</strong>
            </div>
            <div className="spec-table-row">
              <span>Engine / Powertrain</span>
              <strong>{vehicle?.type === 'EV' ? 'Permanent Magnet AC Sync' : '1.5L i-VTEC DOHC 4-Cylinder'}</strong>
            </div>
            <div className="spec-table-row">
              <span>Transmission</span>
              <strong>{vehicle?.type === 'EV' ? 'Single Speed Direct' : '7-Speed CVT with Paddle Shift'}</strong>
            </div>
            <div className="spec-table-row">
              <span>Emission Norms</span>
              <strong>BS-VI Phase 2 (RDE Compliant)</strong>
            </div>
            <div className="spec-table-row">
              <span>Tyre Dimension</span>
              <strong>185/55 R16 83H Tubeless</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}