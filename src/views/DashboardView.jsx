import React, { useState, useMemo } from 'react';
import {
  Car,
  Gauge,
  HeartPulse,
  Wrench,
  Fuel,
  CalendarDays,
  ChevronRight,
  Stethoscope,
  FileText,
  MapPin,
  Upload,
  Lightbulb,
  ArrowUpRight,
  TrendingUp,
  Battery,
  ShieldCheck,
  Zap,
  Droplet,
  Disc,
  Cpu,
  Info,
  Sparkles,
  AlertCircle,
  X,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { VehicleHealthModal } from '../components/VehicleHealthModal';
import { calculateDocumentStatus, calculateReminderStatus } from '../services/DocumentService';
import { getVehicleImage, NEUTRAL_VEHICLE_FALLBACK } from '../services/VehicleService';

export function DashboardView() {
  const navigate = useNavigate();
  const { 
    user, 
    vehicle, 
    setActiveTab, 
    setSelectedDiagnosticId, 
    serviceHistory, 
    fuelLogs,
    vehicleHealth,
    userLocation,
    garages,
    documents,
    reminders
  } = useApp();

  const [selectedHealthComp, setSelectedHealthComp] = useState(null);
  const [diagInput, setDiagInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isAnalyzingEstimate, setIsAnalyzingEstimate] = useState(false);
  const [estimateResult, setEstimateResult] = useState(null);

  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || 'honda-city';

  // Live Vehicle Document & Reminder Alerts calculation
  const complianceAlerts = useMemo(() => {
    const alerts = [];
    const vDocs = Array.isArray(documents)
      ? documents.filter(d => (d.vehicleId === currentVehicleId || (!d.vehicleId && currentVehicleId === 'honda-city')))
      : [];
    const vRems = Array.isArray(reminders)
      ? reminders.filter(r => (r.vehicleId === currentVehicleId || (!r.vehicleId && currentVehicleId === 'honda-city')))
      : [];

    vDocs.forEach(doc => {
      const statusInfo = calculateDocumentStatus(doc.expiryDate);
      if (statusInfo.statusType === 'danger') {
        alerts.push({
          type: 'danger',
          title: `${doc.title} Expired`,
          desc: `Expiry date (${doc.expiryDate}) has passed. Renew immediately to maintain legal compliance.`,
          tab: 'Documents',
          path: '/documents'
        });
      } else if (statusInfo.statusType === 'warning') {
        alerts.push({
          type: 'warning',
          title: `${doc.title} Expiring Soon`,
          desc: `Expires on ${doc.expiryDate} (${statusInfo.daysRemaining} days remaining).`,
          tab: 'Documents',
          path: '/documents'
        });
      }
    });

    const overdueRems = vRems.filter(r => !r.completed && calculateReminderStatus(r).status === 'Overdue');
    if (overdueRems.length > 0) {
      alerts.push({
        type: 'danger',
        title: `${overdueRems.length} Overdue Reminder${overdueRems.length > 1 ? 's' : ''}`,
        desc: `${overdueRems[0].title} is past due date. Mark complete or reschedule.`,
        tab: 'Reminders',
        path: '/reminders'
      });
    }

    const dueSoonRems = vRems.filter(r => !r.completed && calculateReminderStatus(r).status === 'Due Soon');
    if (dueSoonRems.length > 0) {
      alerts.push({
        type: 'warning',
        title: `${dueSoonRems.length} Reminder${dueSoonRems.length > 1 ? 's' : ''} Due Soon`,
        desc: `${dueSoonRems[0].title} scheduled on ${dueSoonRems[0].dueDate}.`,
        tab: 'Reminders',
        path: '/reminders'
      });
    }

    return alerts;
  }, [documents, reminders, currentVehicleId]);

  const handleQuickDiagnose = (symptomKey) => {
    if (symptomKey) {
      setSelectedDiagnosticId(symptomKey);
    }
    navigate('/diagnose');
    if (setActiveTab) setActiveTab('Diagnose Issue');
  };

  const handleDiagnoseSubmit = (e) => {
    e.preventDefault();
    if (diagInput.trim()) {
      navigate('/diagnose');
      if (setActiveTab) setActiveTab('Diagnose Issue');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setEstimateResult(null);
    }
  };

  const handleAnalyzeEstimate = () => {
    if (!uploadedFileName) return;
    setIsAnalyzingEstimate(true);
    setTimeout(() => {
      setIsAnalyzingEstimate(false);
      setEstimateResult({
        fairnessScore: 'Fair & Competitive',
        potentialSavings: '₹1,450',
        verdict: 'Quote prices match OEM rates. Labour charge is slightly elevated by 8%.'
      });
    }, 1200);
  };

  // Monthly fuel calculation
  const totalMonthlySpend = fuelLogs.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="dashboard-container">
      {/* 1. GREETING & CONTEXT HEADER */}
      <section className="dashboard-intro">
        <div className="intro-left">
          <div className="greeting-pill">
            <span className="live-dot"></span>
            <span>Live Vehicle Telemetry Active</span>
          </div>
          <h2>Good Morning, {user.name}</h2>
          <p>
            {vehicle 
              ? `${vehicle.manufacturer} ${vehicle.model} (${vehicle.variant}) is operating at ${vehicle.healthScore}% health efficiency.` 
              : 'Add your vehicle to unlock predictive maintenance and diagnostic telemetry.'}
          </p>
        </div>
        <div className="intro-quote-card">
          <div className="quote-icon">"</div>
          <p>Not just a machine, but a trusted partner in every journey.</p>
        </div>
      </section>

      {/* COMPLIANCE & REMINDER ALERTS BANNER */}
      {complianceAlerts.length > 0 && (
        <section className="dashboard-alerts-strip" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {complianceAlerts.map((alert, idx) => (
            <div 
              key={idx}
              className={alert.type === 'danger' ? 'alert-banner-warning' : 'alert-banner-info'}
              style={{
                background: alert.type === 'danger' ? '#FDE8E8' : '#FDF3E8',
                borderColor: alert.type === 'danger' ? '#F8BEBE' : '#F6D6B4',
                color: alert.type === 'danger' ? '#C84B4B' : 'var(--accent-amber)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div className="flex-center-gap">
                {alert.type === 'danger' ? <AlertCircle size={18} style={{ color: '#C84B4B', flexShrink: 0 }} /> : <AlertCircle size={18} style={{ color: '#D9822B', flexShrink: 0 }} />}
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)' }}>{alert.title}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alert.desc}</span>
                </div>
              </div>

              <button
                className="outline-button"
                style={{
                  fontSize: '12px',
                  padding: '6px 14px',
                  width: 'auto'
                }}
                onClick={() => {
                  navigate(alert.path);
                  if (setActiveTab) setActiveTab(alert.tab);
                }}
              >
                View {alert.tab} →
              </button>
            </div>
          ))}
        </section>
      )}

      {/* 2. KPI METRICS CARDS */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Odometer</span>
            <div className="kpi-icon-wrap blue">
              <Gauge size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">{vehicle ? vehicle.odometer.toLocaleString() : '0'}</strong>
            <span className="kpi-unit">km</span>
          </div>
          <div className="kpi-footer text-emerald">
            <TrendingUp size={14} />
            <span>+420 km logged this week</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Vehicle Health Score</span>
            <div className={`kpi-icon-wrap ${vehicleHealth?.overallScore >= 90 ? 'green' : vehicleHealth?.overallScore >= 75 ? 'blue' : 'amber'}`}>
              <HeartPulse size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">{vehicleHealth ? vehicleHealth.overallScore : (vehicle?.healthScore || 94)}%</strong>
            <span className={vehicleHealth?.overallScore >= 90 ? 'kpi-badge-good' : vehicleHealth?.overallScore >= 75 ? 'badge-good' : 'badge-attention'}>
              {vehicleHealth?.overallStatus || 'Optimal'}
            </span>
          </div>
          <div className="kpi-progress">
            <div 
              className="kpi-progress-fill" 
              style={{ 
                width: `${vehicleHealth?.overallScore || vehicle?.healthScore || 94}%`,
                backgroundColor: vehicleHealth?.overallScore >= 90 ? '#2de28a' : vehicleHealth?.overallScore >= 75 ? '#38a8ff' : '#f59e0b'
              }}
            ></div>
          </div>
          <div className="kpi-footer">
            <span>{vehicleHealth?.systemsEvaluated || 6} Systems evaluated • {vehicleHealth?.needsAttentionCount === 0 ? 'All optimal' : `${vehicleHealth?.needsAttentionCount} need attention`}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Next Service Due</span>
            <div className="kpi-icon-wrap purple">
              <Wrench size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">
              {vehicle ? (vehicle.serviceDueKm - vehicle.odometer).toLocaleString() : '7,320'}
            </strong>
            <span className="kpi-unit">km left</span>
          </div>
          <div className="kpi-footer text-blue">
            <CalendarDays size={14} />
            <span>Est. Date: Dec 2026</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Monthly Running Spend</span>
            <div className="kpi-icon-wrap amber">
              <Fuel size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">₹{totalMonthlySpend.toLocaleString()}</strong>
            <span className="kpi-unit">INR</span>
          </div>
          <div className="kpi-footer text-amber">
            <span>Avg efficiency: 15.1 km/L</span>
          </div>
        </div>
      </section>

      {/* 3. HERO GRID: VEHICLE OVERVIEW & NEXT SERVICE */}
      <section className="hero-grid">
        {/* VEHICLE CARD */}
        <div className="vehicle-card">
          <div className="vehicle-info">
            <div className="vehicle-title">
              <div className="vehicle-logo">
                {vehicle?.manufacturer ? vehicle.manufacturer.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <h3>{vehicle?.displayName || `${vehicle?.manufacturer} ${vehicle?.model}`}</h3>
                <p>
                  {vehicle?.variant} &nbsp;•&nbsp; {vehicle?.year} &nbsp;•&nbsp; {vehicle?.type} &nbsp;•&nbsp; {vehicle?.regNumber}
                </p>
              </div>
            </div>

            <div className="vehicle-stats-row">
              <div className="v-stat-box">
                <span className="v-stat-sub">Distance Driven</span>
                <strong>{vehicle?.odometer?.toLocaleString()} km</strong>
              </div>
              <div className="v-stat-box">
                <span className="v-stat-sub">Fuel / Energy Tank</span>
                <strong>{vehicle?.fuelLevel || 68}% ({vehicle?.type === 'EV' ? `${vehicle?.fuelCapacity} kWh` : `${vehicle?.fuelCapacity} L`})</strong>
              </div>
              <div className="v-stat-box">
                <span className="v-stat-sub">System Status</span>
                <div className="condition-badge">
                  <span className="status-dot"></span>
                  <span>{vehicle?.healthStatus || 'Good Condition'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="car-backdrop-visual">
            <img
              src={getVehicleImage(vehicle) || vehicle?.image || vehicle?.imageUrl || NEUTRAL_VEHICLE_FALLBACK}
              alt={`${vehicle?.manufacturer || 'Vehicle'} ${vehicle?.model || ''}`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = NEUTRAL_VEHICLE_FALLBACK;
              }}
            />
          </div>

          <div className="vehicle-bottom-bar">
            <p className="vehicle-quote-caption">
              "Regular maintenance delivers lasting performance and higher resale value."
            </p>
            <button 
              className="view-details-btn"
              onClick={() => {
                navigate('/vehicle');
                if (setActiveTab) setActiveTab('My Vehicle');
              }}
            >
              <span>View Full Vehicle Telemetry</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* NEXT RECOMMENDED SERVICE CARD */}
        <div className="service-card">
          <div className="service-heading">
            <div className="round-icon blue">
              <Wrench size={22} />
            </div>
            <div>
              <h3>Next Recommended Service</h3>
              <span className="service-sub">Periodic Milestone Check</span>
            </div>
          </div>

          <div className="service-main-content">
            <h2>50,000 km Major Service</h2>
            <p className="service-target-km">
              Scheduled at {vehicle?.serviceDueKm ? vehicle.serviceDueKm.toLocaleString() : '50,000'} km
            </p>

            <div className="service-progress-wrap">
              <div className="progress-text-row">
                <strong>
                  {vehicle ? (vehicle.serviceDueKm - vehicle.odometer).toLocaleString() : '7,320'} km
                </strong>
                <span>remaining (85% interval completed)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="due-date-pill">
              <CalendarDays size={18} />
              <div>
                <span>Estimated Target Window</span>
                <strong>December 2026</strong>
              </div>
            </div>

            <div className="service-checklist-preview">
              <span>Includes: Synthetic Oil • Air Filter • Spark Plugs • Brake Inspection</span>
            </div>

            <button 
              className="primary-button service-action-btn"
              onClick={() => {
                navigate('/maintenance');
                if (setActiveTab) setActiveTab('Service & Maintenance');
              }}
            >
              Book Service at Nearest Bay
            </button>
          </div>
        </div>
      </section>

      {/* 4. QUICK ACTIONS STRIP */}
      <section className="quick-actions-bar">
        <div className="quick-actions-header">
          <h4>Quick Telemetry Actions</h4>
          <span>Instant shortcuts to essential garage tools</span>
        </div>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => { navigate('/diagnose'); if (setActiveTab) setActiveTab('Diagnose Issue'); }}>
            <div className="qa-icon-wrap text-blue">
              <Stethoscope size={20} />
            </div>
            <div className="qa-text">
              <strong>Diagnose Fault</strong>
              <span>Check warning symptoms</span>
            </div>
          </button>

          <button className="quick-action-btn" onClick={() => { navigate('/fuel-expenses'); if (setActiveTab) setActiveTab('Fuel & Expenses'); }}>
            <div className="qa-icon-wrap text-amber">
              <Plus size={20} />
            </div>
            <div className="qa-text">
              <strong>Add Fuel Log</strong>
              <span>Record tank refill</span>
            </div>
          </button>

          <button className="quick-action-btn" onClick={() => { navigate('/find-garage'); if (setActiveTab) setActiveTab('Find Garage'); }}>
            <div className="qa-icon-wrap text-emerald">
              <MapPin size={20} />
            </div>
            <div className="qa-text">
              <strong>Find Workshop</strong>
              <span>Explore 4 nearby garages</span>
            </div>
          </button>

          <button className="quick-action-btn" onClick={() => { navigate('/documents'); if (setActiveTab) setActiveTab('Documents'); }}>
            <div className="qa-icon-wrap text-purple">
              <Upload size={20} />
            </div>
            <div className="qa-text">
              <strong>Upload Document</strong>
              <span>Add RC, PUC, or Insurance</span>
            </div>
          </button>

          <button className="quick-action-btn" onClick={() => { navigate('/service-history'); if (setActiveTab) setActiveTab('Service History'); }}>
            <div className="qa-icon-wrap text-cyan">
              <FileText size={20} />
            </div>
            <div className="qa-text">
              <strong>Service History</strong>
              <span>Review past invoices</span>
            </div>
          </button>
        </div>
      </section>

      {/* 5. INTERACTIVE ACTION TRIO (DIAGNOSE, ESTIMATE, FIND GARAGE) */}
      <section className="three-column">
        {/* DIAGNOSE ISSUE PANEL */}
        <div className="panel diagnose-panel">
          <div className="panel-title">
            <div className="round-icon blue">
              <Stethoscope size={22} />
            </div>
            <div>
              <h3>What's the issue?</h3>
              <p>Tell us what's happening with your vehicle.</p>
            </div>
          </div>

          <form onSubmit={handleDiagnoseSubmit} className="diagnose-input-wrap">
            <input 
              placeholder="e.g. brake squeal, engine light, AC warm..." 
              value={diagInput}
              onChange={(e) => setDiagInput(e.target.value)}
              className="diagnose-text-input"
            />
            <button type="submit" className="diagnose-submit-btn">
              Get Diagnosis
            </button>
          </form>

          <div className="popular-symptoms">
            <span className="popular-label">Common Symptoms:</span>
            <div className="popular-chips">
              <button type="button" onClick={() => handleQuickDiagnose('brake-noise')}>Brake noise</button>
              <button type="button" onClick={() => handleQuickDiagnose('engine-warning')}>Engine light</button>
              <button type="button" onClick={() => handleQuickDiagnose('low-mileage')}>Low mileage</button>
              <button type="button" onClick={() => handleQuickDiagnose('ac-not-cooling')}>AC not cooling</button>
              <button type="button" onClick={() => handleQuickDiagnose('starting-problem')}>Starting problem</button>
            </div>
          </div>
        </div>

        {/* SERVICE ESTIMATE CHECK */}
        <div className="panel estimate-panel">
          <div className="panel-title">
            <div className="round-icon purple">
              <FileText size={22} />
            </div>
            <div>
              <h3>Service Estimate Check</h3>
              <p>Already have a garage quote? Upload it to analyze fair pricing.</p>
            </div>
          </div>

          <label className="upload-box">
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <Upload size={28} className="upload-icon" />
            <strong>{uploadedFileName || 'Upload Garage Estimate'}</strong>
            <span>PDF, JPG or PNG invoice scan</span>
          </label>

          {estimateResult && (
            <div className="estimate-result-badge">
              <div className="flex-center-gap text-emerald">
                <CheckCircle2 size={16} />
                <strong>{estimateResult.fairnessScore}</strong>
              </div>
              <p>{estimateResult.verdict}</p>
            </div>
          )}

          <button 
            className="outline-button analyze-btn" 
            onClick={handleAnalyzeEstimate}
            disabled={!uploadedFileName || isAnalyzingEstimate}
          >
            {isAnalyzingEstimate ? 'AI Engine Analyzing Rates...' : 'Analyze Estimate'}
          </button>
        </div>

        {/* FIND A GARAGE PREVIEW */}
        <div className="panel garage-panel">
          <div className="panel-title">
            <div className="round-icon emerald">
              <MapPin size={22} />
            </div>
            <div>
              <h3>Find a Garage</h3>
              <p>Discover {garages?.length || 4} certified garages near {userLocation?.city || 'Hyderabad'}.</p>
            </div>
          </div>

          <div className="garage-quick-form">
            <input 
              className="simple-input" 
              value={userLocation?.formattedLocation || `${userLocation?.city || 'Hyderabad'}`} 
              readOnly 
            />
            <select className="simple-input" defaultValue="Periodic Maintenance">
              <option>Periodic Maintenance</option>
              <option>Braking & Tyres</option>
              <option>AC & Electricals</option>
              <option>Engine Diagnostics</option>
            </select>
            <button className="outline-button" onClick={() => { navigate('/find-garage'); if (setActiveTab) setActiveTab('Find Garage'); }}>
              Explore {garages?.length || 4} Nearby Garages
            </button>
          </div>
        </div>
      </section>

      {/* 6. LOWER THREE COLUMN: RECENT ACTIVITY, SUBSYSTEM HEALTH & MAINTENANCE TIP */}
      <section className="three-column lower">
        {/* RECENT ACTIVITY */}
        <div className="panel activity-panel">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button className="text-link-btn" onClick={() => { navigate('/service-history'); if (setActiveTab) setActiveTab('Service History'); }}>
              View All →
            </button>
          </div>
          <div className="activity-list">
            {serviceHistory.slice(0, 4).map((act) => (
              <div key={act.id} className="activity-row">
                <div className="activity-icon-wrap">
                  {act.category.includes('Oil') ? <Fuel size={16} /> : <Wrench size={16} />}
                </div>
                <div className="activity-meta">
                  <strong>{act.title}</strong>
                  <span>{act.date} • {act.garage}</span>
                </div>
                <strong className="activity-amount">₹{act.cost.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* SUBSYSTEM HEALTH MONITOR */}
        <div className="panel health-panel">
          <div className="section-header">
            <div className="health-title">
              <HeartPulse size={20} className="text-emerald" />
              <h3>Subsystem Health</h3>
            </div>
            <span className={vehicleHealth?.overallScore >= 85 ? 'badge-good' : 'badge-attention'}>
              {vehicleHealth ? `${vehicleHealth.overallScore}% ${vehicleHealth.overallStatus || 'Optimal'}` : '94% Optimal'}
            </span>
          </div>
          <p className="health-subtitle">
            {vehicleHealth?.isExternalTelemetry 
              ? 'Live CAN-Bus Sensor Telemetry' 
              : 'CAN-Bus Diagnostic & Milestone Telemetry'}
          </p>

          <div className="subsystems-grid">
            {(vehicleHealth?.subsystems || vehicle?.subsystems) ? (
              Object.entries(vehicleHealth?.subsystems || vehicle.subsystems).map(([key, item]) => {
                const score = item.score ?? item.health ?? 90;
                const statusColor = score >= 90 ? '#2de28a' : score >= 75 ? '#38a8ff' : score >= 60 ? '#f59e0b' : '#ef4444';
                return (
                  <div 
                    key={key} 
                    className="subsystem-card interactive-health-card"
                    onClick={() => setSelectedHealthComp(item)}
                    title={`Click to view ${item.name} diagnostics & recommendations`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <div className="subsystem-top">
                      <strong>{item.name}</strong>
                      <span className="subsystem-val" style={{ color: statusColor, fontWeight: '700' }}>
                        {score}%
                      </span>
                    </div>
                    <div className="subsystem-bar">
                      <div 
                        className="subsystem-fill" 
                        style={{ 
                          width: `${score}%`,
                          backgroundColor: statusColor
                        }}
                      ></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <small className="subsystem-stat-label">{item.status}</small>
                      <small style={{ fontSize: '10px', color: 'var(--accent-blue)', opacity: 0.85 }}>Details →</small>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Vehicle telemetry unavailable</p>
            )}
          </div>
        </div>

        {/* MAINTENANCE PRO TIP */}
        <div className="panel tip-panel">
          <div className="section-header">
            <div className="health-title">
              <Lightbulb size={20} className="text-amber" />
              <h3>Maintenance Pro Tip</h3>
            </div>
            <span className="tip-tag">Weekly Insight</span>
          </div>

          <div className="tip-card-body">
            <div className="tip-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=900&q=80" 
                alt="Tyre Maintenance Advice" 
              />
              <div className="tip-overlay-text">
                <strong>Check Cold Tyre Pressure</strong>
                <span>Underinflation by just 5 PSI drops mileage by up to 10%.</span>
              </div>
            </div>
            <p className="tip-desc-text">
              Inspect tyre tread depth with the 2mm coin test and always measure pressure when tyres are cold in the morning.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE HEALTH DETAIL MODAL */}
      {selectedHealthComp && (
        <VehicleHealthModal
          item={selectedHealthComp}
          overallHealth={vehicleHealth}
          onClose={() => setSelectedHealthComp(null)}
          onNavigateService={() => {
            navigate('/maintenance');
            if (setActiveTab) setActiveTab('Service & Maintenance');
          }}
        />
      )}
    </div>
  );
}
