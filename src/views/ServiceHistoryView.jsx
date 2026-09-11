import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  Wrench,
  Fuel,
  FileText,
  MapPin,
  CheckCircle2,
  Receipt,
  Search,
  ChevronDown,
  Filter,
  Car,
  Gauge
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { normalizeServiceRecord } from '../utils/serviceNormalizer';

export function ServiceHistoryView() {
  const { serviceHistory, vehicle } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Periodic Service', 'Tyres & Alignment', 'Insurance & Legal', 'Oil & Lube'];

  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || 'honda-city';

  // 1. Normalize and isolate records for currently active vehicle only
  const normalizedRecords = useMemo(() => {
    const rawList = Array.isArray(serviceHistory) ? serviceHistory : [];
    return rawList
      .map(item => normalizeServiceRecord(item, vehicle))
      .filter(Boolean)
      .filter(record => record.vehicleId === currentVehicleId);
  }, [serviceHistory, vehicle, currentVehicleId]);

  // 2. Filter normalized records
  const filteredHistory = useMemo(() => {
    const searchLower = (searchTerm || '').trim().toLowerCase();

    return normalizedRecords.filter(item => {
      const matchesSearch = !searchLower || 
        item.title.toLowerCase().includes(searchLower) ||
        item.garage.toLowerCase().includes(searchLower) ||
        item.vehicleName.toLowerCase().includes(searchLower) ||
        item.parts.some(p => p.toLowerCase().includes(searchLower));

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [normalizedRecords, searchTerm, selectedCategory]);

  // 3. Compute Lifetime Recorded Spend for completed/paid services of this vehicle
  const totalSpentHistory = useMemo(() => {
    return normalizedRecords
      .filter(item => item.status !== 'Scheduled' && item.status !== 'Upcoming')
      .reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  }, [normalizedRecords]);

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Service History & Invoices</h2>
          <p>
            Complete historical log of garage visits, scheduled appointments, and verified parts for {vehicle?.displayName || `${vehicle?.manufacturer || 'Honda'} ${vehicle?.model || 'City'}`}.
          </p>
        </div>

        <div className="history-total-spend-pill">
          <span>Lifetime Recorded Spend:</span>
          <strong>₹{totalSpentHistory.toLocaleString()}</strong>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="history-filters-bar">
        <div className="search-diagnostics-box" style={{ maxWidth: '380px' }}>
          <Search size={18} />
          <input 
            placeholder="Search parts, garages, or service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SERVICE TIMELINE */}
      <div className="service-timeline-container">
        {filteredHistory.map((item, index) => (
          <div key={item.id} className="timeline-item">
            <div className="timeline-marker-col">
              <div className="timeline-dot">
                <Wrench size={16} />
              </div>
              {index !== filteredHistory.length - 1 && <div className="timeline-line"></div>}
            </div>

            <div className="timeline-card">
              <div className="timeline-card-header">
                <div>
                  <span className="timeline-category-tag">{item.category}</span>
                  <h3 className="timeline-title">{item.title}</h3>
                  <div className="timeline-meta-row">
                    <div className="flex-center-gap">
                      <Calendar size={14} className="text-muted" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex-center-gap">
                      <MapPin size={14} className="text-blue" />
                      <span>{item.garage}</span>
                    </div>
                    <div className="flex-center-gap">
                      <Car size={14} className="text-muted" />
                      <span>{item.vehicleName}</span>
                    </div>
                    <div className="flex-center-gap">
                      <Gauge size={14} className="text-muted" />
                      <span>{item.odometerFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-cost-badge">
                  <strong>{item.displayCost}</strong>
                  {item.status === 'Scheduled' || item.status === 'Upcoming' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span 
                        style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          background: 'rgba(56, 168, 255, 0.15)', 
                          color: 'var(--accent-blue)', 
                          fontWeight: '700',
                          border: '1px solid rgba(56, 168, 255, 0.3)'
                        }}
                      >
                        Scheduled
                      </span>
                      <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '600' }}>
                        Payment: Not Paid
                      </span>
                    </div>
                  ) : item.status === 'In Progress' ? (
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: 'rgba(245, 158, 11, 0.15)', 
                        color: 'var(--accent-amber)', 
                        fontWeight: '700',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      In Progress
                    </span>
                  ) : (
                    <span className="badge-good">Verified Paid</span>
                  )}
                </div>
              </div>

              {/* PARTS REPLACED */}
              {item.parts.length > 0 && (
                <div className="timeline-parts-section">
                  <span className="parts-heading">Parts Installed / Work Carried Out:</span>
                  <div className="parts-tags-wrap">
                    {item.parts.map((part, pIdx) => (
                      <span key={pIdx} className="part-tag">
                        <CheckCircle2 size={12} className="text-emerald" />
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.notes && (
                <div className="timeline-notes-box">
                  <strong>Service Advisor Notes:</strong>
                  <p>{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="search-empty-state" style={{ padding: '40px', textAlign: 'center' }}>
            <History size={36} style={{ color: '#64748b', marginBottom: '10px' }} />
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>No service records match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
