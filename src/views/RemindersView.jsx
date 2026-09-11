import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Clock,
  Car,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function RemindersView() {
  const { reminders, toggleReminder, addReminder, deleteReminder, vehicle } = useApp();
  const [filter, setFilter] = useState('all'); // all, upcoming, completed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    category: 'Maintenance',
    priority: 'High',
    notes: ''
  });

  const filteredReminders = reminders.filter(r => {
    if (filter === 'upcoming') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addReminder({
      title: formData.title,
      dueDate: formData.dueDate,
      category: formData.category,
      priority: formData.priority,
      vehicle: `${vehicle?.manufacturer} ${vehicle?.model} (${vehicle?.regNumber || 'TS 09 FH 4821'})`,
      notes: formData.notes
    });
    setIsModalOpen(false);
    setFormData({
      title: '',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      category: 'Maintenance',
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
          <p>Never miss critical maintenance milestones, insurance renewals, or PUC inspections.</p>
        </div>

        <button 
          className="primary-button flex-center-gap"
          style={{ width: 'auto', padding: '10px 22px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add New Reminder</span>
        </button>
      </div>

      {/* FILTER BUTTONS */}
      <div className="reminders-filter-row">
        <div className="filter-pill-group">
          <button 
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reminders ({reminders.length})
          </button>
          <button 
            className={`filter-pill ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Pending / Active ({reminders.filter(r => !r.completed).length})
          </button>
          <button 
            className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({reminders.filter(r => r.completed).length})
          </button>
        </div>
      </div>

      {/* REMINDERS LIST */}
      <div className="reminders-cards-list">
        {filteredReminders.map((rem) => (
          <div key={rem.id} className={`reminder-card ${rem.completed ? 'completed' : ''}`}>
            <div className="rem-checkbox-col">
              <button 
                className={`rem-check-btn ${rem.completed ? 'checked' : ''}`}
                onClick={() => toggleReminder(rem.id)}
                title={rem.completed ? "Mark pending" : "Mark completed"}
              >
                {rem.completed && <CheckCircle2 size={20} />}
              </button>
            </div>

            <div className="rem-content-col">
              <div className="rem-header-row">
                <strong className={`rem-title ${rem.completed ? 'strike' : ''}`}>{rem.title}</strong>
                <div className="flex-center-gap">
                  <span className={`priority-tag ${rem.priority.toLowerCase()}`}>
                    {rem.priority} Priority
                  </span>
                  <span className="rem-cat-tag">{rem.category}</span>
                </div>
              </div>

              <div className="rem-meta-row">
                <div className="flex-center-gap text-muted">
                  <Calendar size={14} />
                  <span>Target Due: <strong>{rem.dueDate}</strong></span>
                </div>
                <div className="flex-center-gap text-muted">
                  <Car size={14} />
                  <span>{rem.vehicle}</span>
                </div>
              </div>

              {rem.notes && (
                <p className="rem-notes-text">{rem.notes}</p>
              )}
            </div>

            <div className="rem-actions-col">
              <button 
                className="rem-delete-btn"
                onClick={() => deleteReminder(rem.id)}
                title="Delete Reminder"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredReminders.length === 0 && (
          <div className="search-empty-state" style={{ marginTop: '20px' }}>
            <Bell size={36} />
            <p>No reminders found in this filter.</p>
          </div>
        )}
      </div>

      {/* ADD REMINDER MODAL */}
      {isModalOpen && (
        <div className="search-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="search-modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="flex-center-gap">
                <Bell size={20} className="text-blue" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Create Service Reminder</h3>
              </div>
              <button className="search-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label>Reminder Title</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Engine Oil Flush & Filter"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
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
                    <option>High</option>
                    <option>Medium</option>
                    <option>Normal</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label>Category</label>
                  <select 
                    className="simple-input"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Maintenance</option>
                    <option>Compliance</option>
                    <option>Insurance</option>
                    <option>DIY Care</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label>Special Instructions / Notes</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Inspect brake pads and top up washer fluid"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary-button">
                  Save Reminder
                </button>
                <button type="button" className="outline-button" onClick={() => setIsModalOpen(false)}>
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
