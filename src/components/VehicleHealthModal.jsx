import React from 'react';
import { 
  X, 
  HeartPulse, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export function VehicleHealthModal({ item, overallHealth, onClose, onNavigateService }) {
  if (!item) return null;

  const score = item.score ?? item.health ?? 90;
  const isOptimal = score >= 90;
  const isGood = score >= 75 && score < 90;
  const isWarning = score >= 60 && score < 75;
  const isCritical = score < 60;

  const badgeClass = isOptimal ? 'badge-good' : isGood ? 'badge-good' : isWarning ? 'badge-warning' : 'badge-attention';
  const statusColor = isOptimal ? '#2de28a' : isGood ? '#38a8ff' : isWarning ? '#f59e0b' : '#ef4444';

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div 
        className="search-modal-panel health-detail-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        {/* MODAL HEADER */}
        <div className="search-modal-header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: `${statusColor}18`, 
                border: `1px solid ${statusColor}40`,
                display: 'grid', 
                placeItems: 'center',
                color: statusColor
              }}
            >
              <HeartPulse size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>{item.name}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {item.systemType || 'Vehicle Subsystem Telemetry'}
              </span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="search-esc-badge" 
            style={{ cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* SCORE & STATUS ROW */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Health Rating
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <strong style={{ fontSize: '26px', fontWeight: '800', color: statusColor }}>
                  {score}%
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={badgeClass} style={{ fontSize: '12px', padding: '4px 10px' }}>
                {item.status || (isOptimal ? 'Optimal' : isGood ? 'Good' : isWarning ? 'Attention Required' : 'Critical')}
              </span>
              <small style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Priority: {item.priority || 'Normal'}
              </small>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div>
            <div className="subsystem-bar" style={{ height: '7px', marginBottom: '6px' }}>
              <div 
                className="subsystem-fill" 
                style={{ 
                  width: `${score}%`, 
                  backgroundColor: statusColor,
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
              <span>20% Critical</span>
              <span>60% Warning</span>
              <span>85% Optimal</span>
            </div>
          </div>

          {/* TELEMETRY ANALYSIS */}
          <div style={{ 
            padding: '14px', 
            background: isCritical ? 'rgba(239, 68, 68, 0.08)' : isWarning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 168, 255, 0.06)',
            border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.25)' : isWarning ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 168, 255, 0.2)'}`,
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: statusColor }}>
              {isCritical ? <ShieldAlert size={16} /> : isWarning ? <AlertCircle size={16} /> : <Info size={16} />}
              <strong style={{ fontSize: '13px' }}>Diagnostic Intelligence</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {item.reason || 'Telemetry readings and maintenance intervals indicate this system is operating within calibrated parameters.'}
            </p>
          </div>

          {/* RECOMMENDED ACTION */}
          <div style={{ 
            padding: '14px', 
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--accent-blue)' }}>
              <Wrench size={15} />
              <strong style={{ fontSize: '13px' }}>Recommended Maintenance Action</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {item.recommendedAction || 'Continue routine driving cycle and inspect at standard service interval.'}
            </p>
          </div>

          {/* TELEMETRY RECAP */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
            <Clock size={13} />
            <span>Inspection cadence: {item.lastChecked || 'Recent vehicle diagnostic cycle'}</span>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ 
          padding: '14px 20px', 
          borderTop: '1px solid var(--card-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            CAN-Bus Telemetry v2.5
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="outline-button" 
              style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
              onClick={onClose}
            >
              Dismiss
            </button>
            <button 
              type="button" 
              className="primary-button flex-center-gap" 
              style={{ width: 'auto', padding: '8px 18px', fontSize: '13px' }}
              onClick={() => {
                onClose();
                if (onNavigateService) onNavigateService();
              }}
            >
              <span>Schedule Check</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
