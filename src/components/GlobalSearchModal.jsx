import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Car, 
  Stethoscope, 
  Wrench, 
  Fuel, 
  FileText, 
  Bell, 
  History, 
  MapPin, 
  Settings, 
  LayoutDashboard,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function GlobalSearchModal() {
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearchOpen, 
    setIsSearchOpen, 
    setActiveTab, 
    setSelectedDiagnosticId,
    vehicle,
    garages,
    documents,
    reminders
  } = useApp();

  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // Search items list
  const allItems = [
    { title: 'Dashboard Overview', category: 'Pages', tab: 'Dashboard', icon: LayoutDashboard, desc: 'Real-time vehicle telemetry, KPIs, and subsystem health' },
    { title: 'My Vehicle Profile', category: 'Pages', tab: 'My Vehicle', icon: Car, desc: `Specs, VIN, and registration details for ${vehicle?.manufacturer} ${vehicle?.model}` },
    { title: 'Diagnose Issue', category: 'Pages', tab: 'Diagnose Issue', icon: Stethoscope, desc: 'Interactive symptom checker, error codes, and cost estimations' },
    { title: 'Service & Maintenance Planner', category: 'Pages', tab: 'Service & Maintenance', icon: Wrench, desc: 'Scheduled service intervals, fluids, and inspection booking' },
    { title: 'Fuel & Expense Tracker', category: 'Pages', tab: 'Fuel & Expenses', icon: Fuel, desc: 'Log fuel refills, view cost trends, and efficiency analytics' },
    { title: 'Digital Document Vault', category: 'Pages', tab: 'Documents', icon: FileText, desc: 'RC, Insurance, PUC, and driving license compliance' },
    { title: 'Maintenance Reminders', category: 'Pages', tab: 'Reminders', icon: Bell, desc: 'Upcoming deadlines, renewals, and customizable alerts' },
    { title: 'Service History Log', category: 'Pages', tab: 'Service History', icon: History, desc: 'Past workshop visits, parts replaced, and invoice history' },
    { title: 'Find Nearby Garages', category: 'Pages', tab: 'Find Garage', icon: MapPin, desc: 'Explore rated service centers, specialist bays, and book visits' },
    { title: 'Account & Settings', category: 'Pages', tab: 'Settings', icon: Settings, desc: 'Update profile name, email, regional units, and preferences' },

    // Diagnostic symptoms
    { title: 'Brake Noise (Squeal or Grinding)', category: 'Diagnostics', tab: 'Diagnose Issue', diagId: 'brake-noise', icon: Stethoscope, desc: 'Pad wear, caliper pin lubrication, rotor resurfacing' },
    { title: 'Engine Warning Light (Check Engine)', category: 'Diagnostics', tab: 'Diagnose Issue', diagId: 'engine-warning', icon: Stethoscope, desc: 'O2 sensor, MAF sensor, misfire, catalytic converter' },
    { title: 'Low Fuel Efficiency / High Consumption', category: 'Diagnostics', tab: 'Diagnose Issue', diagId: 'low-mileage', icon: Stethoscope, desc: 'Tyre pressure, air filter, fuel injector cleaning' },
    { title: 'AC Not Cooling / Warm Air', category: 'Diagnostics', tab: 'Diagnose Issue', diagId: 'ac-not-cooling', icon: Stethoscope, desc: 'Refrigerant micro-leak, cabin filter, compressor clutch' },
    { title: 'Starting Problem / Slow Cranking', category: 'Diagnostics', tab: 'Diagnose Issue', diagId: 'starting-problem', icon: Stethoscope, desc: '12V battery test, terminal corrosion, starter motor' },
    { title: 'Suspension Clunk / Steering Vibration', category: 'Diagnostics', tab: 'Diagnose Issue', diagId: 'suspension-noise', icon: Stethoscope, desc: 'Link rods, strut leak, control arm bushing, wheel balance' },

    // Documents (Current Vehicle)
    ...(Array.isArray(documents) ? documents : [])
      .filter(d => (d.vehicleId === (vehicle?.id || vehicle?.vehicleId || 'honda-city') || (!d.vehicleId && (vehicle?.id || vehicle?.vehicleId || 'honda-city') === 'honda-city')))
      .map(d => ({
        title: `${d.title} (${d.docNumber})`,
        category: 'Documents',
        tab: 'Documents',
        icon: FileText,
        desc: `Category: ${d.category || d.documentType} • Expiry: ${d.expiryDate}`
      })),

    // Reminders (Current Vehicle)
    ...(Array.isArray(reminders) ? reminders : [])
      .filter(r => (r.vehicleId === (vehicle?.id || vehicle?.vehicleId || 'honda-city') || (!r.vehicleId && (vehicle?.id || vehicle?.vehicleId || 'honda-city') === 'honda-city')))
      .map(r => ({
        title: `${r.title} (${r.category})`,
        category: 'Reminders',
        tab: 'Reminders',
        icon: Bell,
        desc: `Due: ${r.dueDate} • Priority: ${r.priority} • Status: ${r.completed ? 'Completed' : 'Active'}`
      })),

    // Garages
    ...garages.map(g => ({
      title: `${g.name} (${g.distance})`,
      category: 'Garages',
      tab: 'Find Garage',
      icon: MapPin,
      desc: `${g.location} • Rating: ${g.rating}★`
    }))
  ];

  const results = q 
    ? allItems.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    : allItems.slice(0, 8); // Top quick suggestions

  const handleSelect = (item) => {
    if (item.diagId) {
      setSelectedDiagnosticId(item.diagId);
    }
    setActiveTab(item.tab);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="search-modal-backdrop" onClick={() => setIsSearchOpen(false)}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <Search size={22} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search services, garages, diagnostics, or tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-modal-input"
          />
          <button className="search-modal-close" onClick={() => setIsSearchOpen(false)}>
            ESC
          </button>
        </div>

        <div className="search-modal-content">
          <div className="search-results-meta">
            {q ? (
              <span>Found {results.length} results for "{searchQuery}"</span>
            ) : (
              <span className="flex-center-gap"><Sparkles size={14} /> Quick Suggested Actions & Features</span>
            )}
          </div>

          <div className="search-results-list">
            {results.length > 0 ? (
              results.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="search-result-row"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="search-result-icon">
                      <ItemIcon size={18} />
                    </div>
                    <div className="search-result-details">
                      <div className="search-result-title-row">
                        <strong className="search-result-title">{item.title}</strong>
                        <span className="search-result-badge">{item.category}</span>
                      </div>
                      <p className="search-result-desc">{item.desc}</p>
                    </div>
                    <ArrowRight size={16} className="search-result-arrow" />
                  </div>
                );
              })
            ) : (
              <div className="search-empty-state">
                <Search size={36} />
                <p>No results found matching "<strong>{searchQuery}</strong>"</p>
                <span>Try searching for "Brakes", "Insurance", "Oil Change", or "Shell"</span>
              </div>
            )}
          </div>
        </div>

        <div className="search-modal-footer">
          <span>Navigate to page with 1-click</span>
          <span>Auto Pulse Search v2.4</span>
        </div>
      </div>
    </div>
  );
}
