import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { WeatherWidget } from './WeatherWidget';

export function Header() {
  const navigate = useNavigate();
  const { 
    user, 
    setIsSidebarOpen, 
    setActiveTab, 
    logout, 
    notifications, 
    setNotifications,
    setIsSearchOpen 
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="topbar">
      {/* LEFT: Mobile Menu Toggle & Global Search */}
      <div className="topbar-left">
        <button 
          className="menu-btn" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={24} />
        </button>

        <div className="search-trigger" onClick={() => setIsSearchOpen(true)}>
          <Search size={18} className="search-icon" />
          <span className="search-placeholder">
            Search services, garages, diagnostics, or tips...
          </span>
          <kbd className="search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* RIGHT: Weather, Notifications & Profile */}
      <div className="topbar-right">
        {/* Dynamic Animated Weather */}
        <WeatherWidget />

        {/* Notifications Popover */}
        <div className="notif-wrapper" ref={notifRef}>
          <button 
            className={`notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {isNotifDropdownOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={handleMarkAllNotifsRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-dropdown-body">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notif-item ${!notif.read ? 'unread' : ''}`}>
                    <div className="notif-item-header">
                      <strong>{notif.title}</strong>
                      <span>{notif.time}</span>
                    </div>
                    <p>{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="profile-wrapper" ref={profileRef}>
          <div 
            className="profile-trigger" 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <div className="avatar">
              {user.avatar || user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-text">
              <strong className="profile-name">{user.name}</strong>
              <small className="profile-role">{user.role}</small>
            </div>
            <ChevronDown size={16} className={`dropdown-caret ${isProfileDropdownOpen ? 'open' : ''}`} />
          </div>

          {isProfileDropdownOpen && (
            <div className="profile-dropdown">
              <div 
                className="profile-dropdown-user-info"
                onClick={() => {
                  navigate('/settings');
                  if (setActiveTab) setActiveTab('Settings');
                  setIsProfileDropdownOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="avatar large">
                  {user.avatar || user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button 
                className="dropdown-item" 
                onClick={() => {
                  navigate('/vehicle');
                  if (setActiveTab) setActiveTab('My Vehicle');
                  setIsProfileDropdownOpen(false);
                }}
              >
                <User size={16} />
                <span>My Profile & Vehicle</span>
              </button>

              <button 
                className="dropdown-item" 
                onClick={() => {
                  navigate('/settings');
                  if (setActiveTab) setActiveTab('Settings');
                  setIsProfileDropdownOpen(false);
                }}
              >
                <Settings size={16} />
                <span>Settings & Preferences</span>
              </button>

              <div className="dropdown-divider"></div>

              <button 
                className="dropdown-item logout-item" 
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  logout();
                  navigate('/login', { replace: true });
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
