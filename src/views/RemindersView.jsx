import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Clock,
  Car,
  Filter,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  REMINDER_CATEGORIES, 
  REMINDER_PRIORITIES, 
  calculateReminderStatus, 
  normalizeReminder 
} from '../services/DocumentService';

export function RemindersView() {
  const { reminders, toggleReminder, addReminder, deleteReminder, vehicle } = useApp();
  const [filter, setFilter] = useState('all'); // all, upcoming, due-soon, overdue, completed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || 'honda-city';

  const [formData, setFormData] = useState({
    title: '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    category: 'Vehicle service',
    priority: 'High',
    notes: ''
  });

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Filter reminders by current vehicle and normalize status
  const vehicleReminders = useMemo(() => {
    const rawList = Array.isArray(reminders) ? reminders : [];
    return rawList
      .map(rem => normalizeReminder(rem, currentVehicleId))
      .filter(Boolean)
      .filter(rem => rem.vehicleId === currentVehicleId);
  }, [reminders, currentVehicleId]);

  // 2. Metrics summary
  const reminderStats = useMemo(() => {
    let upcomingCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;
    let completedCount = 0;

    vehicleReminders.forEach(r => {
      const statusInfo = calculateReminderStatus(r);
      if (r.completed || statusInfo.status === 'Completed') completedCount++;
      else if (statusInfo.status === 'Overdue') overdueCount++;
      else if (statusInfo.status === 'Due Soon') dueSoonCount++;
      else upcomingCount++;
    });

    return {
      total: vehicleReminders.length,
      upcomingCount,
      dueSoonCount,
      overdueCount,
      completedCount
    };
  }, [vehicleReminders]);

  // 3. Filtered reminders
  const filteredReminders = useMemo(() => {
    return vehicleReminders.filter(rem => {
      const statusInfo = calculateReminderStatus(rem);
      if (filter === 'upcoming') return !rem.completed && statusInfo.status === 'Upcoming';
      if (filter === 'due-soon') return !rem.completed && statusInfo.status === 'Due Soon';
      if (filter === 'overdue') return !rem.completed && statusInfo.status === 'Overdue';
      if (filter === 'completed') return rem.completed;
      return true;
    });
  }, [vehicleReminders, filter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reminderTitle = formData.title.trim() || formData.category;

    addReminder({
      title: reminderTitle,
      dueDate: formData.dueDate,
      category: formData.category,
      priority: formData.priority,
      vehicleId: currentVehicleId,
      vehicle: vehicle ? `${vehicle.manufacturer || 'Vehicle'} ${vehicle.model || ''}${vehicle.regNumber ? ` (${vehicle.regNumber})` : ''}`.trim() : 'Active Vehicle',
      notes: formData.notes.trim()
    });

    setIsModalOpen(false);
    setSuccessToast(`Reminder "${reminderTitle}" created for ${vehicle?.displayName || vehicle?.model || 'vehicle'}!`);
    setTimeout(() => setSuccessToast(null), 4000);

    setFormData({
      title: '',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      category: 'Vehicle service',
      priority: 'High',
      notes: ''
    });
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Vehicle Reminders & Alerts</h2>
          <p>
            Track milestone inspections, PUC renewals, and policy expirations for{' '}
            <strong style={{ color: '#91AE6E' }}>
              {vehicle?.displayName || `${vehicle?.manufacturer} ${vehicle?.model}`}
            </strong>.
          </p>
        </div>

        <button 
          className="primary-button flex-center-gap"
          style={{ width: 'auto', padding: '10px 22px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="alert-banner-success flex-center-gap" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Upcoming Scheduled</span>
            <div className="kpi-icon-wrap blue" style={{ width: '32px', height: '32px' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value">{reminderStats.upcomingCount}</strong>
            <span className="kpi-unit">on track</span>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Due Soon (≤ 7 Days)</span>
            <div className="kpi-icon-wrap amber" style={{ width: '32px', height: '32px' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{reminderStats.dueSoonCount}</strong>
            <span className="kpi-unit">action needed</span>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Overdue</span>
            <div className="kpi-icon-wrap" style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value" style={{ color: reminderStats.overdueCount > 0 ? '#fca5a5' : 'var(--text-muted)' }}>
              {reminderStats.overdueCount}
            </strong>
            <span className="kpi-unit">urgent</span>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Completed</span>
            <div className="kpi-icon-wrap green" style={{ width: '32px', height: '32px' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>{reminderStats.completedCount}</strong>
            <span className="kpi-unit">done</span>
          </div>
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="reminders-filter-row">
        <div className="filter-pill-group">
          <button 
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reminders ({reminderStats.total})
          </button>
          <button 
            className={`filter-pill ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({reminderStats.upcomingCount})
          </button>
          <button 
            className={`filter-pill ${filter === 'due-soon' ? 'active' : ''}`}
            onClick={() => setFilter('due-soon')}
          >
            Due Soon ({reminderStats.dueSoonCount})
          </button>
          <button 
            className={`filter-pill ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue ({reminderStats.overdueCount})
          </button>
          <button 
            className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({reminderStats.completedCount})
          </button>
        </div>
      </div>

      {/* REMINDERS LIST */}
      <div className="reminders-cards-list">
        {filteredReminders.map((rem) => {
          const statusInfo = calculateReminderStatus(rem);
          return (
            <div key={rem.id} className={`reminder-card ${rem.completed ? 'completed' : ''}`}>
              <div className="rem-checkbox-col">
                <button 
                  className={`rem-check-btn ${rem.completed ? 'checked' : ''}`}
                  onClick={() => toggleReminder(rem.id)}
                  title={rem.completed ? "Mark as pending" : "Mark as completed"}
                >
                  {rem.completed && <CheckCircle2 size={20} />}
                </button>
              </div>

              <div className="rem-content-col">
                <div className="rem-header-row">
                  <strong className={`rem-title ${rem.completed ? 'strike' : ''}`}>{rem.title}</strong>
                  <div className="flex-center-gap">
                    {/* Status badge */}
                    <span 
                      className={`doc-status-badge ${statusInfo.statusType}`}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      {statusInfo.status === 'Overdue' && <AlertTriangle size={12} />}
                      {statusInfo.status === 'Due Soon' && <Clock size={12} />}
                      {statusInfo.status === 'Completed' && <CheckCircle2 size={12} />}
                      <span>{statusInfo.status}</span>
                    </span>

                    <span className={`priority-tag ${rem.priority?.toLowerCase() || 'high'}`}>
                      {rem.priority} Priority
                    </span>
                    <span className="rem-cat-tag">{rem.category}</span>
                  </div>
                </div>

                <div className="rem-meta-row">
                  <div className="flex-center-gap text-muted">
                    <Calendar size={14} />
                    <span>
                      Target Due: <strong style={{ color: statusInfo.status === 'Overdue' ? '#fca5a5' : statusInfo.status === 'Due Soon' ? 'var(--accent-amber)' : 'inherit' }}>
                        {rem.dueDate}
                      </strong>
                    </span>
                  </div>
                  <div className="flex-center-gap text-muted">
                    <Car size={14} />
                    <span>{vehicle?.displayName || `${vehicle?.manufacturer} ${vehicle?.model}`}</span>
                  </div>
                </div>

                {rem.notes && (
                  <p className="rem-notes-text">{rem.notes}</p>
                )}
              </div>

              <div className="rem-actions-col">
                <button 
                  className="rem-delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete reminder "${rem.title}"?`)) {
                      deleteReminder(rem.id);
                    }
                  }}
                  title="Delete Reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredReminders.length === 0 && (
          <div className="search-empty-state" style={{ marginTop: '20px', padding: '40px 20px' }}>
            <Bell size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 10px' }} />
            <p>No reminders found for this filter.</p>
            <button 
              className="outline-button" 
              style={{ width: 'auto', margin: '14px auto 0' }}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={15} />
              <span>Create Reminder</span>
            </button>
          </div>
        )}
      </div>

      {/* ADD REMINDER MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-center-gap">
                <Bell size={20} className="text-blue" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Create Service Reminder</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ paddingTop: '16px' }}>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label>Reminder Category *</label>
                  <select 
                    className="simple-input"
                    value={formData.category}
                    onChange={e => setFormData({ 
                      ...formData, 
                      category: e.target.value,
                      title: formData.title === '' || REMINDER_CATEGORIES.includes(formData.title) ? e.target.value : formData.title
                    })}
                  >
                    {REMINDER_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label>Reminder Title *</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Engine Oil Flush & Filter or Insurance Renewal"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Target Due Date *</label>
                  <input 
                    type="date" 
                    className="simple-input" 
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    className="simple-input"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {REMINDER_PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label>Special Instructions / Notes</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Compare quotes with NCB discount before paying"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions col-span-2" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button type="submit" className="primary-button" style={{ width: 'auto', padding: '12px 24px' }}>
                  Save Reminder
                </button>
                <button 
                  type="button" 
                  className="outline-button" 
                  style={{ width: 'auto', padding: '12px 24px' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
