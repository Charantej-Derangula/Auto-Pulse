import React, { useState } from 'react';
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
  Car
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ServiceHistoryView() {
  const { serviceHistory, vehicle } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Periodic Service', 'Tyres & Alignment', 'Insurance & Legal', 'Oil & Lube'];

  const filteredHistory = serviceHistory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.garage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.parts.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalSpentHistory = serviceHistory.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Service History & Invoices</h2>
          <p>Complete historical log of garage visits, part replacements, and service costs for {vehicle?.manufacturer} {vehicle?.model}.</p>
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
                      <span>{item.odometer.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-cost-badge">
                  <strong>₹{item.cost.toLocaleString()}</strong>
                  <span className="badge-good">Verified Paid</span>
                </div>
              </div>

              {/* PARTS REPLACED */}
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
          <div className="search-empty-state" style={{ padding: '40px' }}>
            <History size={36} />
            <p>No service records match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
