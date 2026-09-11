import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  Lock,
  LogOut,
  Save,
  Key
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function SettingsView() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useApp();

  const [formData, setFormData] = useState({
    name: user.name || 'Charantej',
    email: user.email || 'charantej@autopulse.io',
    phone: user.phone || '+91 98480 99221',
    role: user.role || 'Car Enthusiast',
    location: user.location || 'Hyderabad',
    units: user.units || 'Metric (km, L, °C)',
    notifications: user.notifications ?? true,
    bio: user.bio || 'Automotive enthusiast & daily driver.'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdData, setPwdData] = useState({ current: '', newPwd: '', confirm: '' });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwdData.newPwd !== pwdData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    setPwdModalOpen(false);
    setPwdData({ current: '', newPwd: '', confirm: '' });
    alert('Security credentials updated successfully.');
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Account Settings & Preferences</h2>
          <p>Manage your profile identity, sync notifications, regional units, and garage preferences.</p>
        </div>

        {savedSuccess && (
          <div className="badge-good flex-center-gap" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <CheckCircle2 size={16} />
            <span>Profile name updated in real-time across Dashboard & Header!</span>
          </div>
        )}
      </div>

      <div className="settings-grid-layout">
        {/* LEFT COLUMN: PROFILE FORM */}
        <div className="panel settings-main-panel">
          <div className="section-header">
            <div className="flex-center-gap">
              <User size={20} className="text-blue" />
              <h3>User Profile & Identity</h3>
            </div>
            <span className="text-muted">Directly syncs to Dashboard greeting</span>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="settings-avatar-row">
              <div className="avatar large">
                {formData.name.trim().charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="avatar-meta">
                <strong>{formData.name || 'User Name'}</strong>
                <span>{formData.role} • {formData.location}</span>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Profile Full Name</label>
                <input
                  className="simple-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="simple-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  className="simple-input"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Primary Location</label>
                <input
                  className="simple-input"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group col-span-2">
                <label>Role / Badge</label>
                <input
                  className="simple-input"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="form-group col-span-2">
                <label>Bio / Garage Status</label>
                <textarea
                  className="simple-input"
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button type="submit" className="primary-button flex-center-gap" style={{ width: 'auto', padding: '12px 28px' }}>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREFERENCES & SECURITY */}
        <div className="settings-side-col">
          {/* REGIONAL PREFERENCES */}
          <div className="panel">
            <div className="section-header">
              <div className="flex-center-gap">
                <Sliders size={18} className="text-emerald" />
                <h3>Preferences & Units</h3>
              </div>
            </div>

            <div className="settings-pref-list">
              <div className="pref-row">
                <div>
                  <strong>Measurement Units</strong>
                  <p>Telemetry distance, fuel, and pressure</p>
                </div>
                <select 
                  className="simple-input" 
                  style={{ width: 'auto', marginTop: 0 }}
                  value={formData.units}
                  onChange={e => setFormData({ ...formData, units: e.target.value })}
                >
                  <option>Metric (km, L, °C)</option>
                  <option>Imperial (mi, gal, °F)</option>
                </select>
              </div>

              <div className="pref-row">
                <div>
                  <strong>Service Alert Notifications</strong>
                  <p>Receive email & push notifications for renewals</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.notifications} 
                  onChange={e => setFormData({ ...formData, notifications: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#38a8ff' }}
                />
              </div>
            </div>
          </div>

          {/* SECURITY & AUTHENTICATION */}
          <div className="panel" style={{ marginTop: '20px' }}>
            <div className="section-header">
              <div className="flex-center-gap">
                <Shield size={18} className="text-amber" />
                <h3>Security & Account</h3>
              </div>
            </div>

            <div className="security-actions-col">
              <button 
                type="button" 
                className="outline-button flex-center-gap"
                onClick={() => setPwdModalOpen(true)}
              >
                <Key size={16} />
                <span>Change Password</span>
              </button>

              <button 
                type="button" 
                className="logout-action-btn flex-center-gap"
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
              >
                <LogOut size={16} />
                <span>Sign Out of Auto Pulse</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {pwdModalOpen && (
        <div className="search-modal-backdrop" onClick={() => setPwdModalOpen(false)}>
          <div className="search-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="flex-center-gap">
                <Lock size={20} className="text-amber" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Update Password</h3>
              </div>
              <button className="search-modal-close" onClick={() => setPwdModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ padding: '20px' }}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  className="simple-input" 
                  value={pwdData.current}
                  onChange={e => setPwdData({ ...pwdData, current: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>New Password</label>
                <input 
                  type="password" 
                  className="simple-input" 
                  value={pwdData.newPwd}
                  onChange={e => setPwdData({ ...pwdData, newPwd: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  className="simple-input" 
                  value={pwdData.confirm}
                  onChange={e => setPwdData({ ...pwdData, confirm: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary-button">
                  Update Password
                </button>
                <button type="button" className="outline-button" onClick={() => setPwdModalOpen(false)}>
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
