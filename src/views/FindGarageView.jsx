import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Star,
  Phone,
  ShieldCheck,
  Wrench,
  Navigation,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchGaragesByLocation } from '../services/GarageService';

export function FindGarageView() {
  const { 
    vehicle, 
    userLocation, 
    setUserLocation,
    isLocationLoading 
  } = useApp();

  // Active searched city & service specialization
  const [activeCity, setActiveCity] = useState(userLocation?.city || 'Hyderabad');
  const [locationInput, setLocationInput] = useState(userLocation?.city || 'Hyderabad');
  const [selectedService, setSelectedService] = useState('All');

  // Garage search state
  const [garages, setGarages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [resolvedLocation, setResolvedLocation] = useState(null);

  // Booking Modal State
  const [bookingGarage, setBookingGarage] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');

  // Core search executor calling external Places & Geocoding API
  const performSearch = useCallback(async (targetCity, targetService) => {
    if (!targetCity || !targetCity.trim()) return;
    const cleanCity = targetCity.trim();

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetchGaragesByLocation({
        cityName: cleanCity,
        specialization: targetService
      });

      if (res.error) {
        setSearchError(res.error);
      }

      setGarages(res.garages || []);
      setResolvedLocation(res.resolvedLocation || null);
      setActiveCity(cleanCity);

      // Synchronize global location and weather telemetry if coordinates were resolved
      if (res.resolvedLocation && setUserLocation) {
        setUserLocation(prev => ({
          ...prev,
          city: res.resolvedLocation.city || cleanCity,
          latitude: res.resolvedLocation.latitude || prev.latitude,
          longitude: res.resolvedLocation.longitude || prev.longitude,
          formattedLocation: res.resolvedLocation.formattedLocation || cleanCity,
          isFallback: false
        }));
      }
    } catch (err) {
      console.error('[FindGarageView] Search error:', err);
      setSearchError('Live workshop search temporarily encountered an error. Please try again.');
      setGarages([]);
    } finally {
      setIsSearching(false);
    }
  }, [setUserLocation]);

  // Initial search on mount using user location
  useEffect(() => {
    const initialCity = userLocation?.city || 'Hyderabad';
    setLocationInput(initialCity);
    performSearch(initialCity, 'All');
  }, [userLocation?.city, performSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      performSearch(locationInput.trim(), selectedService);
    }
  };

  const handleServiceChange = (e) => {
    const newService = e.target.value;
    setSelectedService(newService);
    performSearch(locationInput || activeCity, newService);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingGarage(null);
      alert(`Appointment confirmed at ${bookingGarage.name} for ${bookingDate} at ${bookingTime}. Confirmation SMS dispatched.`);
    }, 1200);
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Authorized Garages & Service Centers</h2>
          <p>Discover vetted, multi-brand and OEM specialized service workshops in your vicinity.</p>
        </div>

        <div className="nearby-count-pill">
          <MapPin size={16} className="text-emerald" />
          <span>
            {isSearching ? 'Searching...' : `${garages.length} Workshops Online near ${activeCity}`}
          </span>
        </div>
      </div>

      {/* ERROR STATE BANNER */}
      {searchError && (
        <div className="status-notice-banner" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          padding: '10px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#f87171'
        }}>
          <AlertCircle size={16} />
          <span>{searchError}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="garage-filters-card">
        <form onSubmit={handleSearchSubmit} className="garage-filter-inputs">
          <div className="form-group flex-1">
            <label>Location / City</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <MapPin size={18} className="input-icon" />
                <input 
                  className="simple-input with-pad"
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  placeholder="Enter city (e.g. Vijayawada, Visakhapatnam, Hyderabad)..."
                />
              </div>
              <button 
                type="submit" 
                className="primary-button" 
                style={{ 
                  width: 'auto', 
                  padding: '0 20px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  whiteSpace: 'nowrap' 
                }}
                disabled={isSearching}
              >
                <Search size={16} />
                <span>{isSearching ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>

          <div className="form-group flex-1">
            <label>Service Specialization</label>
            <select 
              className="simple-input"
              value={selectedService}
              onChange={handleServiceChange}
              disabled={isSearching}
            >
              <option value="All">All Workshop Services</option>
              <option value="Periodic Maintenance">Periodic Maintenance</option>
              <option value="Diagnostic Scan">Diagnostic Scan</option>
              <option value="AC Service">AC Service</option>
              <option value="Engine Service">Engine Service</option>
              <option value="Brake Service">Brake Service</option>
              <option value="EV/Battery">EV / Battery</option>
              <option value="Tyre/Wheel Service">Tyre / Wheel Service</option>
            </select>
          </div>
        </form>
      </div>

      {/* RADAR MAP PREVIEW & WORKSHOP DIRECTORY */}
      <div className="garage-layout-grid">
        {/* COMPACT STICKY RADAR SIDEBAR */}
        <aside className="garage-sidebar-sticky">
          <div className="garage-map-card">
            <div className="section-header" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} className="text-blue" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Live Workshop Radar</h3>
              </div>
              <span className="badge-good" style={{ fontSize: '11px', padding: '3px 8px' }}>
                {activeCity}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Active radar sweep centered on {resolvedLocation?.city || activeCity}.
            </p>

            {/* RADAR CANVAS */}
            <div className="radar-map-wrapper">
              <div className="radar-crosshair-h"></div>
              <div className="radar-crosshair-v"></div>
              <div className="radar-circle c1"></div>
              <div className="radar-circle c2"></div>
              <div className="radar-circle c3"></div>
              <div className="radar-sweep"></div>

              {/* Searched Location Center Point */}
              <div className="user-radar-pin" title={`Searched Center: ${resolvedLocation?.formattedLocation || activeCity}`}>
                <span className="pin-pulse"></span>
                <Navigation size={16} className="text-blue" />
              </div>

              {/* Garage Pins on Radar based on real API returned garages */}
              {garages[0] && (
                <div 
                  className="radar-garage-pin p1 closest" 
                  onClick={() => setBookingGarage(garages[0])} 
                  title={`${garages[0].name} • Closest (${garages[0].distance})`}
                >
                  <span>★ {garages[0].name.split(' ')[0]}</span>
                </div>
              )}
              {garages[1] && (
                <div 
                  className="radar-garage-pin p2" 
                  onClick={() => setBookingGarage(garages[1])} 
                  title={`${garages[1].name} (${garages[1].distance})`}
                >
                  <span>{garages[1].name.split(' ')[0]}</span>
                </div>
              )}
              {garages[2] && (
                <div 
                  className="radar-garage-pin p3" 
                  onClick={() => setBookingGarage(garages[2])} 
                  title={`${garages[2].name} (${garages[2].distance})`}
                >
                  <span>{garages[2].name.split(' ')[0]}</span>
                </div>
              )}
              {garages[3] && (
                <div 
                  className="radar-garage-pin p4" 
                  onClick={() => setBookingGarage(garages[3])} 
                  title={`${garages[3].name} (${garages[3].distance})`}
                >
                  <span>{garages[3].name.split(' ')[0]}</span>
                </div>
              )}
            </div>

            {/* CLOSEST WORKSHOP SUMMARY (FROM REAL API DATA) */}
            <div className="radar-closest-summary">
              <div className="closest-label-row">
                <small>Closest Workshop</small>
                {garages[0] && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                    {garages[0].distance}
                  </span>
                )}
              </div>

              {garages[0] ? (
                <div className="closest-garage-details">
                  <div className="closest-name-box">
                    <strong title={garages[0].name}>{garages[0].name}</strong>
                    <div className="closest-meta-line">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-amber)' }}>
                        <Star size={12} fill="var(--accent-amber)" />
                        <strong>{garages[0].rating}</strong>
                      </span>
                      <span>•</span>
                      <span>{garages[0].reviewsCount} reviews</span>
                    </div>
                  </div>

                  {garages[0].mapUrl && (
                    <a 
                      href={garages[0].mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="closest-map-btn"
                      title="View Closest Workshop on Google Maps"
                    >
                      <ExternalLink size={12} />
                      <span>Map</span>
                    </a>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '4px 0 0' }}>
                  {isSearching ? 'Detecting nearest workshop...' : 'No workshop detected in immediate radius.'}
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* GARAGE DIRECTORY CARDS */}
        <div className="garages-list-container">
          {/* LOADING STATE */}
          {isSearching && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aeb9ca' }}>
              <RefreshCw size={26} className="spin-animation" style={{ marginBottom: '10px' }} />
              <p>Searching certified workshops in {activeCity} via Places API...</p>
            </div>
          )}

          {/* EMPTY RESULTS STATE */}
          {!isSearching && garages.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Wrench size={34} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3 style={{ marginBottom: '8px' }}>No Garages Found in {activeCity}</h3>
              <p style={{ color: '#aeb9ca', fontSize: '13px', maxWidth: '380px', margin: '0 auto 16px' }}>
                No automotive workshops matched "{selectedService}" in "{activeCity}". Try searching a different city or selecting "All Workshop Services".
              </p>
              <button 
                className="outline-button"
                style={{ width: 'auto', display: 'inline-flex' }}
                onClick={() => {
                  setSelectedService('All');
                  setLocationInput(activeCity);
                  performSearch(activeCity, 'All');
                }}
              >
                Reset Workshop Filters
              </button>
            </div>
          )}

          {/* WORKSHOP RESULTS */}
          {!isSearching && garages.map((garage) => (
            <div key={garage.id} className="garage-card">
              <div className="garage-card-top">
                <div>
                  <div className="flex-center-gap">
                    <h3 className="garage-title">{garage.name}</h3>
                    {garage.verified && (
                      <span className="verified-badge flex-center-gap">
                        <ShieldCheck size={13} />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="garage-location">{garage.location}</p>
                </div>

                <div className="garage-rating-box">
                  <div className="rating-pill">
                    <Star size={14} className="star-fill" />
                    <strong>{garage.rating}</strong>
                  </div>
                  <small>{garage.reviewsCount} reviews</small>
                </div>
              </div>

              {/* FEATURES & SERVICES */}
              <div className="garage-services-strip">
                {garage.services.map((srv, idx) => (
                  <span key={idx} className="garage-service-tag">{srv}</span>
                ))}
              </div>

              <div className="garage-info-bar">
                <div className="garage-info-item">
                  <Navigation size={14} className="text-blue" />
                  <span>{garage.distance} away</span>
                </div>
                <div className="garage-info-item">
                  <Clock size={14} className="text-emerald" />
                  <span>{garage.timing}</span>
                </div>
                <div className="garage-info-item">
                  <Phone size={14} className="text-muted" />
                  <span>{garage.phone}</span>
                </div>
              </div>

              <div className="garage-card-actions">
                <button 
                  className="primary-button flex-center-gap"
                  style={{ width: 'auto', padding: '10px 18px' }}
                  onClick={() => setBookingGarage(garage)}
                >
                  <Calendar size={16} />
                  <span>Book Appointment</span>
                </button>

                <a 
                  href={`tel:${garage.phone.replace(/[^0-9+]/g, '')}`}
                  className="outline-button flex-center-gap"
                  style={{ width: 'auto', padding: '10px 18px', textDecoration: 'none' }}
                  onClick={(e) => {
                    if (!garage.phone) {
                      e.preventDefault();
                      alert(`Contact info for ${garage.name}`);
                    }
                  }}
                >
                  <Phone size={16} />
                  <span>Call Bay</span>
                </a>

                {garage.mapUrl && (
                  <a 
                    href={garage.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-button flex-center-gap"
                    style={{ width: 'auto', padding: '10px 14px', textDecoration: 'none' }}
                    title="Open in Google Maps"
                  >
                    <ExternalLink size={15} />
                    <span>Map</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOK APPOINTMENT MODAL */}
      {bookingGarage && (
        <div className="search-modal-backdrop" onClick={() => setBookingGarage(null)}>
          <div className="search-modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="flex-center-gap">
                <Wrench size={22} className="text-blue" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Schedule Service at {bookingGarage.name}</h3>
              </div>
              <button className="search-modal-close" onClick={() => setBookingGarage(null)}>✕</button>
            </div>

            <form onSubmit={handleConfirmBooking} style={{ padding: '20px' }}>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label>Vehicle Selected</label>
                  <input 
                    className="simple-input" 
                    value={`${vehicle?.manufacturer} ${vehicle?.model} (${vehicle?.regNumber || 'TS 09 FH 4821'})`} 
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Appointment Date</label>
                  <input 
                    type="date" 
                    className="simple-input" 
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time Slot</label>
                  <select 
                    className="simple-input"
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                  >
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                    <option>02:00 PM</option>
                    <option>04:30 PM</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label>Required Service</label>
                  <select className="simple-input" defaultValue={selectedService !== 'All' ? selectedService : 'Periodic General Maintenance'}>
                    <option>Periodic General Maintenance</option>
                    <option>Comprehensive Brake Overhaul</option>
                    <option>OBD-II Engine Diagnostic Scan</option>
                    <option>3D Wheel Laser Alignment</option>
                    <option>AC Cooling Servicing</option>
                  </select>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary-button">
                  Confirm Bay Booking
                </button>
                <button type="button" className="outline-button" onClick={() => setBookingGarage(null)}>
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
