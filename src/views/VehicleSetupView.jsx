import React, { useState, useMemo, useRef } from 'react';
import {
  Car,
  ShieldCheck,
  Zap,
  Gauge,
  Fuel,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FileText,
  Search,
  History,
  Bell,
  MapPin,
  Check,
  ChevronDown,
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getVehicleImage, buildVehicleObject, NEUTRAL_VEHICLE_FALLBACK } from '../services/VehicleService';

export const PRESET_VEHICLES = [
  {
    id: 'honda-city',
    name: 'Honda City',
    manufacturer: 'Honda',
    model: 'City',
    modelYear: '2023',
    variant: '1.5 i-VTEC V',
    type: 'Petrol',
    fuelCapacity: 40,
    image: '/assets/vehicles/honda-city.jpg'
  },
  {
    id: 'hyundai-creta',
    name: 'Hyundai Creta',
    manufacturer: 'Hyundai',
    model: 'Creta',
    modelYear: '2024',
    variant: 'SX(O) Turbo',
    type: 'Diesel',
    fuelCapacity: 50,
    image: '/assets/vehicles/hyundai-creta.jpg'
  },
  {
    id: 'hyundai-venue',
    name: 'Hyundai Venue',
    manufacturer: 'Hyundai',
    model: 'Venue',
    modelYear: '2024',
    variant: 'SX(O) 1.0 Turbo DCT',
    type: 'Petrol',
    fuelCapacity: 45,
    image: '/assets/vehicles/hyundai-venue.jpg'
  },
  {
    id: 'tata-nexon',
    name: 'Tata Nexon',
    manufacturer: 'Tata',
    model: 'Nexon',
    modelYear: '2024',
    variant: 'Fearless+ DCA',
    type: 'Petrol',
    fuelCapacity: 44,
    image: '/assets/vehicles/tata-nexon.jpg'
  },
  {
    id: 'mahindra-xuv700',
    name: 'Mahindra XUV700',
    manufacturer: 'Mahindra',
    model: 'XUV700',
    modelYear: '2024',
    variant: 'AX7 Luxury Pack',
    type: 'Diesel',
    fuelCapacity: 60,
    image: '/assets/vehicles/mahindra-xuv700.png'
  },
  {
    id: 'toyota-fortuner',
    name: 'Toyota Fortuner',
    manufacturer: 'Toyota',
    model: 'Fortuner',
    modelYear: '2024',
    variant: '2.8 4x4 AT',
    type: 'Diesel',
    fuelCapacity: 80,
    image: '/assets/vehicles/toyota-fortuner.jpg'
  },
  {
    id: 'toyota-innova-hycross',
    name: 'Toyota Innova HyCross',
    manufacturer: 'Toyota',
    model: 'Innova HyCross',
    modelYear: '2024',
    variant: 'ZX(O) Hybrid',
    type: 'Strong Hybrid',
    fuelCapacity: 52,
    image: '/assets/vehicles/toyota-innova-hycross.jpg'
  },
  {
    id: 'tesla-model-3',
    name: 'Tesla Model 3',
    manufacturer: 'Tesla',
    model: 'Model 3',
    modelYear: '2024',
    variant: 'Long Range AWD',
    type: 'Electric (EV)',
    fuelCapacity: 82,
    image: '/assets/vehicles/tesla-model-3.jpg'
  },
  {
    id: 'tata-nexon-ev',
    name: 'Tata Nexon EV',
    manufacturer: 'Tata',
    model: 'Nexon EV',
    modelYear: '2024',
    variant: 'Empowered+ LR',
    type: 'Electric (EV)',
    fuelCapacity: 82,
    image: '/assets/vehicles/tata-nexon-ev.jpg'
  }
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric (EV)', 'Strong Hybrid', 'CNG'];
const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

const UNLOCK_FEATURES = [
  { icon: HeartPulse, label: 'Vehicle Health Monitoring' },
  { icon: Sparkles, label: 'AI Vehicle Diagnosis' },
  { icon: Wrench, label: 'Service & Maintenance Tracking' },
  { icon: Fuel, label: 'Fuel & Expense Tracking' },
  { icon: History, label: 'Service History' },
  { icon: Bell, label: 'Smart Service Reminders' },
  { icon: FileText, label: 'Vehicle Documents' },
  { icon: MapPin, label: 'Garage Discovery' }
];

export function VehicleSetupView({ onVehicleSaved }) {
  const navigate = useNavigate();
  const { setVehicle, setActiveTab } = useApp();

  const selectSectionRef = useRef(null);
  const detailsSectionRef = useRef(null);

  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    modelYear: '2024',
    variant: '',
    type: 'Petrol',
    regNumber: '',
    chassisNumber: '',
    engineNumber: '',
    odometer: '',
    fuelCapacity: 45
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  // Filter verified preset cards based on user search query
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_VEHICLES;
    const q = searchQuery.toLowerCase().trim();
    return PRESET_VEHICLES.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.manufacturer.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q) ||
      v.variant.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Real-time exact matching vehicle image preview
  const previewImage = useMemo(() => {
    if (!formData.manufacturer && !formData.model) {
      return NEUTRAL_VEHICLE_FALLBACK;
    }
    return getVehicleImage(formData.manufacturer, formData.model) || NEUTRAL_VEHICLE_FALLBACK;
  }, [formData.manufacturer, formData.model]);

  // Click handler when user picks a verified preset
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setFormData(prev => ({
      ...prev,
      manufacturer: preset.manufacturer,
      model: preset.model,
      modelYear: preset.modelYear || '2024',
      variant: preset.variant || '',
      type: preset.type || 'Petrol',
      fuelCapacity: preset.fuelCapacity || 45
      // Crucially, personal details (regNumber, odometer, chassisNumber, engineNumber) remain unpopulated
    }));
    setErrorMessage('');

    // Smoothly scroll down to Step 2 details on the same interface
    setTimeout(() => {
      detailsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleHeroAddClick = () => {
    selectSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.manufacturer.trim() || !formData.model.trim()) {
      setErrorMessage('Please select a vehicle model from Step 1 above.');
      selectSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!formData.regNumber.trim()) {
      setErrorMessage('Please enter your vehicle registration number.');
      return;
    }

    if (!formData.odometer || isNaN(Number(formData.odometer)) || Number(formData.odometer) < 0) {
      setErrorMessage('Please enter a valid current odometer reading (km).');
      return;
    }

    if (!formData.chassisNumber.trim()) {
      setErrorMessage('Please enter your vehicle chassis / VIN number.');
      return;
    }

    if (!formData.engineNumber.trim()) {
      setErrorMessage('Please enter your vehicle engine number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const cleanOdo = Number(formData.odometer);
      const cleanReg = formData.regNumber.trim().toUpperCase();
      const cleanVin = formData.chassisNumber.trim().toUpperCase();
      const cleanEng = formData.engineNumber.trim().toUpperCase();

      const newVehicleData = {
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        modelYear: formData.modelYear,
        variant: formData.variant.trim() || 'Standard',
        type: formData.type,
        regNumber: cleanReg,
        odometer: cleanOdo,
        chassisNumber: cleanVin,
        vin: cleanVin,
        engineNumber: cleanEng,
        fuelCapacity: Number(formData.fuelCapacity) || (formData.type.includes('EV') ? 82 : 45),
        fuelLevel: 80,
        healthScore: 94,
        healthStatus: 'Good Condition',
        displayName: `${formData.manufacturer.trim()} ${formData.model.trim()}`
      };

      const normalized = buildVehicleObject(newVehicleData);

      if (setVehicle) {
        await setVehicle(normalized);
      }
      try {
        localStorage.setItem('garage_vehicle', JSON.stringify(normalized));
      } catch (err) {}

      setSuccessToast(true);

      setTimeout(() => {
        if (onVehicleSaved) {
          onVehicleSaved(normalized);
        } else {
          navigate('/dashboard');
          if (setActiveTab) setActiveTab('Dashboard');
        }
      }, 550);
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      setErrorMessage('Could not save vehicle profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-page-wrapper">
      {/* ========================================================
          1. FIRST-TIME AUTO PULSE WELCOME HERO SCREEN
          ======================================================== */}
      <section className="onboarding-welcome-hero">
        <div className="onboarding-hero-content">
          <div className="onboarding-brand-pill">
            <span className="live-dot" style={{ background: 'var(--accent-blue)' }}></span>
            <span>AUTO PULSE • CONNECTED VEHICLE PLATFORM</span>
          </div>

          <h1 className="onboarding-hero-title">
            Your Vehicle. Smarter Care.
          </h1>

          <div className="onboarding-hero-intro">
            <h2>Welcome to AutoPulse 👋</h2>
            <p className="onboarding-hero-tagline">Let's get your vehicle connected.</p>
            <p className="onboarding-hero-desc">
              Set up your vehicle to unlock your personalized AutoPulse experience.
            </p>
          </div>

          {/* VALUE UNLOCK LIST */}
          <div className="onboarding-unlock-card">
            <span className="unlock-header-label">Add your vehicle to unlock:</span>
            <div className="unlock-grid">
              {UNLOCK_FEATURES.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div key={idx} className="unlock-item">
                    <div className="unlock-icon-wrap">
                      <Check size={14} className="unlock-check" />
                    </div>
                    <span>{feat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="onboarding-hero-action">
            <button 
              type="button" 
              className="primary-button add-vehicle-hero-btn" 
              onClick={handleHeroAddClick}
            >
              <span>Add My Vehicle</span>
              <ArrowRight size={18} />
            </button>
            <span className="onboarding-hero-micro">
              Takes less than 60 seconds • 100% verified OEM exact specs
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. STEP 1: CHOOSE YOUR VEHICLE
          ======================================================== */}
      <section ref={selectSectionRef} className="onboarding-step-section" id="choose-vehicle-step">
        <div className="step-section-header">
          <div className="step-tag-pill">
            <span>STEP 1</span>
          </div>
          <h2 className="step-title">Choose Your Vehicle</h2>
          <p className="step-subtitle">
            Search or select your vehicle model from our verified OEM library.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="onboarding-search-wrap">
          <Search size={18} className="search-icon-muted" />
          <input 
            type="text" 
            className="onboarding-search-input"
            placeholder="Search vehicle..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="search-clear-btn" 
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        {/* VEHICLE CARDS GRID */}
        <div className="preset-vehicles-grid">
          {filteredPresets.map((preset) => {
            const isSelected = selectedPresetId === preset.id || (formData.manufacturer === preset.manufacturer && formData.model === preset.model);
            const resolvedImg = getVehicleImage(preset.manufacturer, preset.model);

            return (
              <div 
                key={preset.id}
                className={`preset-vehicle-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectPreset(preset)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectPreset(preset);
                  }
                }}
              >
                {/* Vehicle Thumbnail Wrap */}
                <div className="preset-card-image-wrap">
                  <img 
                    src={resolvedImg} 
                    alt={preset.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = NEUTRAL_VEHICLE_FALLBACK;
                    }}
                  />
                  <span className="preset-fuel-badge">{preset.type}</span>
                  {isSelected && (
                    <div className="preset-selected-badge">
                      <CheckCircle2 size={14} />
                      <span>Selected</span>
                    </div>
                  )}
                </div>

                {/* Card Meta Content */}
                <div className="preset-card-body">
                  <div className="preset-make-row">
                    <span className="preset-make-label">{preset.manufacturer}</span>
                    <span className="preset-year-label">{preset.modelYear}</span>
                  </div>
                  <h3 className="preset-model-name">{preset.name}</h3>
                  <p className="preset-variant-text">{preset.variant}</p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPresets.length === 0 && (
          <div className="onboarding-empty-search">
            <Car size={36} className="text-muted" />
            <p>No vehicles found matching "{searchQuery}".</p>
            <button 
              type="button" 
              className="outline-button" 
              onClick={() => setSearchQuery('')}
              style={{ width: 'auto' }}
            >
              Reset Search
            </button>
          </div>
        )}
      </section>

      {/* ========================================================
          3. STEP 2: VEHICLE DETAILS & IDENTITY
          ======================================================== */}
      <section ref={detailsSectionRef} className="onboarding-step-section" id="vehicle-details-step">
        <div className="step-section-header">
          <div className="step-tag-pill">
            <span>STEP 2</span>
          </div>
          <h2 className="step-title">Vehicle Details</h2>
          <p className="step-subtitle">
            Confirm model specifications and enter your vehicle's identity details. Personal details are never auto-filled.
          </p>
        </div>

        {/* FEEDBACK BANNERS */}
        {successToast && (
          <div className="alert-banner-success flex-center-gap" style={{ marginBottom: '20px' }}>
            <CheckCircle2 size={18} />
            <span>Vehicle connected successfully! Opening your live dashboard...</span>
          </div>
        )}

        {errorMessage && (
          <div className="alert-banner-warning flex-center-gap" style={{ marginBottom: '20px', background: '#FDE8E8', borderColor: '#F8BEBE', color: '#C84B4B' }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-COLUMN DETAILS STUDIO & FORM */}
        <div className="onboarding-details-card">
          {/* LEFT: LIVE VEHICLE STUDIO PREVIEW */}
          <div className="details-preview-panel">
            <div className="details-preview-header">
              <span className="preview-tag-title">Active Selection Preview</span>
              <span className="live-dot" style={{ background: formData.manufacturer ? '#10b981' : 'var(--text-muted)' }}></span>
            </div>

            <div className="details-preview-img-box">
              <img 
                src={previewImage} 
                alt={formData.manufacturer ? `${formData.manufacturer} ${formData.model}` : 'Neutral Vehicle Preview'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = NEUTRAL_VEHICLE_FALLBACK;
                }}
              />
              <div className="details-preview-caption">
                <strong>{formData.manufacturer ? `${formData.manufacturer} ${formData.model}` : 'Select a vehicle from Step 1'}</strong>
                <span>{formData.type || 'Powertrain'}</span>
              </div>
            </div>

            <div className="details-spec-summary-list">
              <div className="spec-summary-item">
                <span className="spec-label">Selected Model:</span>
                <strong className="spec-val">
                  {formData.manufacturer ? `${formData.manufacturer} ${formData.model}` : 'No vehicle chosen'}
                </strong>
              </div>
              <div className="spec-summary-item">
                <span className="spec-label">Year & Powertrain:</span>
                <strong className="spec-val">
                  {formData.modelYear} • {formData.type}
                </strong>
              </div>
              <div className="spec-summary-item">
                <span className="spec-label">Trim / Variant:</span>
                <strong className="spec-val">
                  {formData.variant || 'Standard'}
                </strong>
              </div>
              <div className="spec-summary-item">
                <span className="spec-label">Registration Plate:</span>
                <strong className="spec-val" style={{ fontFamily: 'monospace' }}>
                  {formData.regNumber ? formData.regNumber.toUpperCase() : 'Pending Entry'}
                </strong>
              </div>
            </div>

            <div className="spec-studio-callout">
              <ShieldCheck size={16} className="text-accent" />
              <span>Verified OEM vehicle data architecture with dedicated vehicleId isolation.</span>
            </div>
          </div>

          {/* RIGHT: SPECIFICATIONS & REGISTRATION FORM */}
          <div className="details-form-panel">
            <form onSubmit={handleSubmit}>
              <div className="onboarding-form-grid">
                {/* VEHICLE NAME / MODEL */}
                <div className="form-group col-span-2">
                  <label className="onboarding-field-label">
                    Vehicle Name / Model *
                  </label>
                  <input 
                    type="text"
                    className="simple-input"
                    value={formData.manufacturer && formData.model ? `${formData.manufacturer} ${formData.model}` : ''}
                    placeholder="Choose a vehicle model from Step 1 above"
                    readOnly
                    required
                    style={{ background: 'var(--surface-secondary)', fontWeight: '600' }}
                  />
                </div>

                {/* MODEL YEAR */}
                <div className="form-group">
                  <label className="onboarding-field-label">
                    Model Year *
                  </label>
                  <select 
                    className="simple-input"
                    value={formData.modelYear}
                    onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                    required
                  >
                    {YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                {/* FUEL TYPE */}
                <div className="form-group">
                  <label className="onboarding-field-label">
                    Fuel Type *
                  </label>
                  <select 
                    className="simple-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    {FUEL_TYPES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* VARIANT */}
                <div className="form-group col-span-2">
                  <label className="onboarding-field-label">
                    Variant / Trim
                  </label>
                  <input 
                    type="text"
                    className="simple-input"
                    placeholder="e.g. SX(O) Turbo, 1.5 i-VTEC V"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  />
                </div>

                {/* REGISTRATION NUMBER */}
                <div className="form-group">
                  <label className="onboarding-field-label">
                    Registration Number *
                  </label>
                  <input 
                    type="text"
                    className="simple-input"
                    placeholder="Enter registration number"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                    required
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>

                {/* CURRENT ODOMETER */}
                <div className="form-group">
                  <label className="onboarding-field-label">
                    Current Odometer (km) *
                  </label>
                  <input 
                    type="number"
                    className="simple-input"
                    placeholder="Enter current odometer"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                {/* CHASSIS / VIN NUMBER */}
                <div className="form-group">
                  <label className="onboarding-field-label">
                    Chassis / VIN Number *
                  </label>
                  <input 
                    type="text"
                    className="simple-input"
                    placeholder="Enter chassis/VIN number"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                    required
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>

                {/* ENGINE NUMBER */}
                <div className="form-group">
                  <label className="onboarding-field-label">
                    Engine Number *
                  </label>
                  <input 
                    type="text"
                    className="simple-input"
                    placeholder="Enter engine number"
                    value={formData.engineNumber}
                    onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                    required
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="onboarding-actions-row">
                <button 
                  type="submit"
                  className="primary-button flex-center-gap save-vehicle-btn"
                  disabled={isSubmitting || !formData.manufacturer}
                  style={{
                    width: 'auto',
                    padding: '14px 32px',
                    fontWeight: '700',
                    fontSize: '15px'
                  }}
                >
                  {isSubmitting ? (
                    <span>Saving Vehicle Profile...</span>
                  ) : (
                    <>
                      <span>Save Vehicle & Continue</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  className="outline-button flex-center-gap"
                  onClick={() => {
                    setSelectedPresetId('');
                    setFormData({
                      manufacturer: '',
                      model: '',
                      modelYear: '2024',
                      variant: '',
                      type: 'Petrol',
                      regNumber: '',
                      chassisNumber: '',
                      engineNumber: '',
                      odometer: '',
                      fuelCapacity: 45
                    });
                    setErrorMessage('');
                  }}
                  style={{ width: 'auto', padding: '14px 20px' }}
                >
                  <RotateCcw size={15} />
                  <span>Reset Selection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
