import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Wrench,
  HelpCircle,
  RotateCcw,
  Car,
  Activity,
  Gauge,
  Fuel,
  Calendar,
  ChevronRight,
  ShieldCheck,
  History,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  VEHICLE_SYSTEMS,
  COMMON_SYMPTOMS,
  analyzeVehicleIssue,
  getStoredDiagnosisHistory,
  saveDiagnosisToHistory
} from '../services/DiagnosisService';

export function DiagnoseIssueView() {
  const navigate = useNavigate();
  const { 
    vehicle, 
    vehicleHealth, 
    setActiveTab,
    addMaintenanceItem
  } = useApp();

  // Form input state
  const [selectedSystem, setSelectedSystem] = useState('Engine');
  const [symptomText, setSymptomText] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);
  const [validationError, setValidationError] = useState('');

  // Analysis process state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);

  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || 'honda-city';

  // History state for current vehicle
  const [history, setHistory] = useState(() => getStoredDiagnosisHistory(currentVehicleId));

  // Load vehicle-isolated diagnosis history whenever active vehicle changes
  useEffect(() => {
    const stored = getStoredDiagnosisHistory(currentVehicleId);
    setHistory(stored);
    if (stored.length > 0) {
      setCurrentDiagnosis(stored[0]);
    } else {
      setCurrentDiagnosis(null);
    }
  }, [currentVehicleId]);

  // Chip toggle handler
  const handleToggleChip = (chip) => {
    setValidationError('');
    setSelectedChips(prev => {
      if (prev.includes(chip)) {
        return prev.filter(c => c !== chip);
      } else {
        return [...prev, chip];
      }
    });
  };

  // Submit analysis
  const handleAnalyze = async (e) => {
    e?.preventDefault();
    setValidationError('');

    const combinedSymptoms = [
      symptomText.trim(),
      ...selectedChips
    ].filter(Boolean).join('. ');

    if (!combinedSymptoms.trim()) {
      setValidationError('Please describe what you are experiencing or select at least one symptom.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Analyzing reported vehicle symptoms...');

    try {
      setTimeout(() => setAnalysisStep('Checking vehicle systems & health telemetry...'), 250);
      setTimeout(() => setAnalysisStep('Generating AI diagnostic assessment...'), 500);

      const result = await analyzeVehicleIssue({
        system: selectedSystem,
        symptoms: combinedSymptoms,
        vehicle
      });

      setCurrentDiagnosis(result);
      saveDiagnosisToHistory(result);
      const vehicleHistory = getStoredDiagnosisHistory(currentVehicleId);
      setHistory(vehicleHistory);
    } catch (err) {
      console.error('[DiagnoseIssueView] Analysis error:', err);
      setValidationError('Analysis temporarily encountered an issue. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Start new diagnosis
  const handleNewDiagnosis = () => {
    setSymptomText('');
    setSelectedChips([]);
    setValidationError('');
    setCurrentDiagnosis(null);
  };

  // Select item from history
  const handleSelectHistoryItem = (item) => {
    setCurrentDiagnosis(item);
    setSelectedSystem(item.system || 'Engine');
    setValidationError('');
  };

  return (
    <div className="view-page-container">
      {/* 1. PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>AI Vehicle Diagnosis</h2>
          <p>
            AutoPulse analyzes reported symptoms, vehicle telemetry, and mechanical subsystem data to identify potential issues and recommend expert resolutions.
          </p>
        </div>

        <div className="diagnostic-badge-top">
          <Sparkles size={16} className="text-cyan" />
          <span>AI Diagnostic Engine Active</span>
        </div>
      </div>

      {/* 2. CURRENT VEHICLE PROFILE CARD */}
      <div className="panel" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(56, 168, 255, 0.12)',
              border: '1px solid rgba(56, 168, 255, 0.25)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--accent-blue)',
              flexShrink: 0
            }}>
              <Car size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>
                  {vehicle?.displayName || `${vehicle?.manufacturer || 'Honda'} ${vehicle?.model || 'City'}`}
                </h3>
                {vehicle?.variant && (
                  <span className="badge-good" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {vehicle.variant}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '3px 0 0' }}>
                Active diagnosis profile for {vehicle?.regNumber || 'TS 09 FH 4821'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <Calendar size={15} className="text-muted" />
              <span className="text-muted">Year:</span>
              <strong>{vehicle?.year || '2023'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <Fuel size={15} className="text-emerald" />
              <span className="text-muted">Fuel:</span>
              <strong>{vehicle?.type || 'Petrol'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <Gauge size={15} className="text-blue" />
              <span className="text-muted">Odometer:</span>
              <strong>{(vehicle?.odometer || 42680).toLocaleString()} km</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <Activity size={15} className="text-cyan" />
              <span className="text-muted">Health:</span>
              <strong style={{ color: 'var(--accent-emerald)' }}>{vehicleHealth?.overallScore || vehicle?.healthScore || 94}/100</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INPUT FORM & DIAGNOSIS RESULTS GRID */}
      <div className="diagnosis-grid-layout">
        {/* LEFT COLUMN: FORM & DIAGNOSIS CARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ISSUE INPUT FORM */}
          <div className="panel" style={{ padding: '20px' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} className="text-blue" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Describe Vehicle Symptom</h3>
              </div>
              {currentDiagnosis && (
                <button 
                  type="button" 
                  onClick={handleNewDiagnosis}
                  className="outline-button"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={13} />
                  <span>New Diagnosis</span>
                </button>
              )}
            </div>

            <form onSubmit={handleAnalyze}>
              {/* SYSTEM SELECTOR */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                  Vehicle Subsystem
                </label>
                <select 
                  className="simple-input"
                  value={selectedSystem}
                  onChange={(e) => {
                    setSelectedSystem(e.target.value);
                    setValidationError('');
                  }}
                  disabled={isAnalyzing}
                >
                  {VEHICLE_SYSTEMS.map(sys => (
                    <option key={sys} value={sys}>{sys}</option>
                  ))}
                </select>
              </div>

              {/* COMMON SYMPTOM CHIPS */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Quick Symptom Select (Optional)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {COMMON_SYMPTOMS.map(chip => {
                    const isSelected = selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleChip(chip)}
                        disabled={isAnalyzing}
                        style={{
                          background: isSelected ? 'rgba(56, 168, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--card-border)',
                          color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontWeight: isSelected ? '600' : '400'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SYMPTOM TEXT AREA */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                  Problem Description
                </label>
                <textarea
                  className="simple-input"
                  rows={3}
                  value={symptomText}
                  onChange={(e) => {
                    setSymptomText(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="Describe what you're experiencing... e.g. engine vibration, difficulty starting, unusual brake noise"
                  disabled={isAnalyzing}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* VALIDATION ERROR */}
              {validationError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#f87171'
                }}>
                  <AlertCircle size={16} />
                  <span>{validationError}</span>
                </div>
              )}

              {/* ACTION BUTTON */}
              <button
                type="submit"
                className="primary-button"
                disabled={isAnalyzing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontWeight: '700'
                }}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles size={16} className="spin-animation" />
                    <span>{analysisStep || 'Analyzing Issue...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Analyze Issue</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* DIAGNOSIS RESULT CARD */}
          {currentDiagnosis && !isAnalyzing && (
            <div className="diagnosis-main-card">
              <div className="diag-header">
                <div className="diag-title-area">
                  <span className="diag-category-badge">{currentDiagnosis.system} System</span>
                  <h3>{currentDiagnosis.title}</h3>
                </div>
                <div 
                  className="diag-severity-badge"
                  style={{ 
                    color: currentDiagnosis.severityMeta?.color || '#f59e0b', 
                    borderColor: currentDiagnosis.severityMeta?.color || '#f59e0b',
                    backgroundColor: currentDiagnosis.severityMeta?.bg || 'rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{currentDiagnosis.severity} SEVERITY</span>
                </div>
              </div>

              {/* SAFETY NOTICE BANNER FOR HIGH / CRITICAL */}
              {(currentDiagnosis.severity === 'HIGH' || currentDiagnosis.severity === 'CRITICAL') && (
                <div className="diag-warning-banner" style={{
                  background: currentDiagnosis.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(249, 115, 22, 0.12)',
                  borderColor: currentDiagnosis.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(249, 115, 22, 0.35)'
                }}>
                  <ShieldAlert size={20} style={{ color: currentDiagnosis.severity === 'CRITICAL' ? '#ef4444' : '#f97316', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: currentDiagnosis.severity === 'CRITICAL' ? '#ef4444' : '#f97316' }}>
                      Safety Notice & Immediate Precaution:
                    </strong>
                    <p>
                      Avoid continued driving if the vehicle is showing severe braking, overheating, smoke, or other dangerous symptoms. Seek professional assistance immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* POSSIBLE CAUSES */}
              <div className="diag-section">
                <h4>Possible Causes Identified:</h4>
                <div className="causes-list">
                  {currentDiagnosis.possibleCauses?.map((cause, idx) => (
                    <div key={idx} className="cause-item">
                      <span className="cause-num">{idx + 1}</span>
                      <p>{cause}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED ACTION */}
              <div className="diag-section">
                <h4>Recommended Action:</h4>
                <div className="recommended-box">
                  <CheckCircle2 size={20} className="text-emerald" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '600' }}>{currentDiagnosis.recommendedAction}</p>
                    {currentDiagnosis.suggestedService && (
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--accent-blue)' }}>
                        Suggested Service: <strong>{currentDiagnosis.suggestedService}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* REPORTED SYMPTOMS SUMMARY & CONFIDENCE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--card-border)', fontSize: '12px', color: 'var(--text-dim)' }}>
                <span>Reported: "{currentDiagnosis.reportedSymptoms}"</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span>Confidence: <strong style={{ color: 'var(--text-main)' }}>{currentDiagnosis.confidence}</strong></span>
                  <span>Diagnostic Code: <strong style={{ color: 'var(--accent-blue)' }}>{currentDiagnosis.dtcCode}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REPAIR ESTIMATION & RECENT HISTORY */}
        <div className="diagnosis-sidebar-cards">
          {/* ESTIMATION & GARAGE ACTIONS CARD */}
          {currentDiagnosis && (
            <div className="panel repair-cost-card">
              <div className="section-header">
                <h3>Resolution & Booking</h3>
                <span className="badge-good">Estimated</span>
              </div>

              <div className="cost-breakdown-row">
                <div className="cost-item">
                  <span className="text-muted">Estimated Repair Cost</span>
                  <strong className="cost-val">{currentDiagnosis.estimatedCost || '₹1,500 - ₹5,000'}</strong>
                  <small className="text-muted">Parts & verified workshop labor</small>
                </div>

                <div className="cost-item" style={{ marginTop: '14px' }}>
                  <span className="text-muted">Estimated Workshop Time</span>
                  <div className="time-val-row">
                    <Clock size={16} className="text-blue" />
                    <strong>{currentDiagnosis.estimatedTime || '1 - 2 hours'}</strong>
                  </div>
                </div>
              </div>

              <div className="diag-actions-col">
                <button 
                  className="primary-button flex-center-gap"
                  onClick={() => {
                    navigate('/find-garage');
                    if (setActiveTab) setActiveTab('Find Garage');
                  }}
                >
                  <Wrench size={16} />
                  <span>Book Diagnosis at Garage</span>
                </button>

                <button 
                  className="outline-button flex-center-gap"
                  onClick={() => {
                    if (currentDiagnosis) {
                      addMaintenanceItem({
                        id: 'maint-diag-' + Date.now(),
                        title: `Inspect: ${currentDiagnosis.primaryIssue || currentDiagnosis.reportedSymptoms || 'Diagnostic Issue'}`,
                        category: currentDiagnosis.system || 'Diagnostics',
                        dueOdometer: Number(vehicle?.odometer || 42680) + 500,
                        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                        notes: `${currentDiagnosis.recommendedAction || ''} (Code: ${currentDiagnosis.dtcCode || 'N/A'})`,
                        completed: false,
                        completedDate: null,
                        vehicleId: currentVehicleId
                      });
                    }
                    navigate('/maintenance');
                    if (setActiveTab) setActiveTab('Service & Maintenance');
                  }}
                >
                  <span>Add to Service Checklist</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* RECENT DIAGNOSES HISTORY */}
          <div className="panel" style={{ padding: '18px' }}>
            <div className="section-header" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} className="text-blue" />
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Recent Diagnoses</h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {history.length} {history.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            {history.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                No recent diagnoses logged yet. Analyze an issue to build your vehicle health log.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistoryItem(item)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: currentDiagnosis?.id === item.id ? 'rgba(56, 168, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: currentDiagnosis?.id === item.id ? '1px solid var(--accent-blue)' : '1px solid var(--card-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                        {item.system} Issue
                      </strong>
                      <span 
                        style={{ 
                          fontSize: '10px', 
                          fontWeight: '700', 
                          color: item.severityMeta?.color || '#f59e0b',
                          background: item.severityMeta?.bg || 'rgba(245, 158, 11, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.reportedSymptoms}
                    </p>
                    <small style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {item.formattedDate || 'Recently'}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
