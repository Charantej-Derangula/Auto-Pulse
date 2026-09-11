import React, { useState, useMemo, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  Gauge,
  CheckCircle2,
  Clock,
  Droplet,
  ShieldCheck,
  Plus,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Sparkles,
  DollarSign,
  Layers,
  History,
  AlertTriangle,
  Receipt,
  Car,
  Trash2,
  Check,
  Filter,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  EXPENSE_CATEGORIES,
  MAINTENANCE_CATEGORIES,
  calculateMaintenanceStatus
} from '../services/MaintenanceService';
import { normalizeServiceRecord } from '../utils/serviceNormalizer';

export function ServiceMaintenanceView() {
  const { 
    vehicle, 
    setActiveTab, 
    vehicleHealth,
    serviceHistory,
    addServiceRecord,
    maintenanceItems,
    addMaintenanceItem,
    toggleMaintenanceItem,
    deleteMaintenanceItem,
    expenses,
    addExpense,
    deleteExpense
  } = useApp();

  // Active view tab
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'checklist' | 'history' | 'expenses'

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsBookModalOpen(false);
        setIsServiceModalOpen(false);
        setIsMaintModalOpen(false);
        setIsExpenseModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Booking Modal Form State
  const [bookingForm, setBookingForm] = useState({
    title: '50,000 km Major Scheduled Service',
    category: 'Periodic Service',
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    garage: 'Apex AutoCraft & Performance — Jubilee Hills',
    quotedCost: '7200',
    odometer: vehicle ? String(vehicle.serviceDueKm || 50000) : '50000',
    parts: 'Engine Oil (Synthetic 0W-20), OEM Oil Filter, Spark Plugs, Brake Fluid Inspection',
    notes: 'Standard 50,000 km major maintenance milestone check'
  });
  const [bookingFormError, setBookingFormError] = useState('');

  // Add Service Form State
  const [serviceForm, setServiceForm] = useState({
    title: '50,000 km Scheduled Major Service',
    category: 'Periodic Service',
    date: new Date().toISOString().split('T')[0],
    odometer: vehicle ? String(vehicle.odometer) : '42680',
    garage: 'Apex AutoCraft & Performance',
    description: 'General oil change, multi-point safety inspection and brake adjustment',
    parts: 'Engine Oil 0W-20, OEM Oil Filter, Washer Plug',
    labourCost: '1800',
    partsCost: '3400'
  });
  const [serviceFormError, setServiceFormError] = useState('');

  // Add Maintenance Item Form State
  const [maintForm, setMaintForm] = useState({
    title: '',
    category: 'Engine Oil',
    dueOdometer: vehicle ? String(vehicle.odometer + 5000) : '50000',
    dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    notes: ''
  });
  const [maintFormError, setMaintFormError] = useState('');

  // Add Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: 'Service',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [expenseFormError, setExpenseFormError] = useState('');

  // Feedback banner
  const [successBanner, setSuccessBanner] = useState('');

  const showBanner = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // Calculations for current vehicle
  const currentOdo = Number(vehicle?.odometer) || 42680;
  const currentVehicleId = vehicle?.id || 'honda-city';

  // 1. Defensively normalize and isolate service history for current vehicle
  const normalizedHistory = useMemo(() => {
    const raw = Array.isArray(serviceHistory) ? serviceHistory : [];
    return raw
      .map(item => normalizeServiceRecord(item, vehicle))
      .filter(Boolean)
      .filter(record => record.vehicleId === currentVehicleId);
  }, [serviceHistory, vehicle, currentVehicleId]);

  // Last service record for this vehicle
  const lastService = normalizedHistory.length > 0 ? normalizedHistory[0] : null;

  // Next service due calculation
  const nextServiceKm = vehicle?.serviceDueKm || (lastService ? (lastService.odometer || currentOdo) + 10000 : 50000);
  const kmUntilNextService = Math.max(0, nextServiceKm - currentOdo);

  // 2. Maintenance checklist items isolated for current vehicle
  const vehicleMaintenanceItems = useMemo(() => {
    const raw = Array.isArray(maintenanceItems) ? maintenanceItems : [];
    return raw.filter(item => (item.vehicleId === currentVehicleId || !item.vehicleId));
  }, [maintenanceItems, currentVehicleId]);

  const evaluatedMaintenance = useMemo(() => {
    return vehicleMaintenanceItems.map(item => ({
      ...item,
      status: calculateMaintenanceStatus(item, currentOdo)
    }));
  }, [vehicleMaintenanceItems, currentOdo]);

  const upcomingCount = evaluatedMaintenance.filter(i => i.status === 'Upcoming' || i.status === 'Due Soon').length;
  const overdueCount = evaluatedMaintenance.filter(i => i.status === 'Overdue').length;

  // 3. Expenses calculations isolated for current vehicle
  const vehicleExpenses = useMemo(() => {
    const raw = Array.isArray(expenses) ? expenses : [];
    return raw.filter(e => (e.vehicleId === currentVehicleId || !e.vehicleId));
  }, [expenses, currentVehicleId]);

  const totalMaintenanceSpend = useMemo(() => {
    return vehicleExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [vehicleExpenses]);

  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyExpenses = useMemo(() => {
    return vehicleExpenses
      .filter(e => (e.date || '').startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [vehicleExpenses, currentMonthStr]);

  // Expense breakdown by category for current vehicle
  const expenseByCategory = useMemo(() => {
    return EXPENSE_CATEGORIES.reduce((acc, cat) => {
      const total = vehicleExpenses
        .filter(e => (e.category || '').toLowerCase() === cat.toLowerCase())
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      acc[cat] = total;
      return acc;
    }, {});
  }, [vehicleExpenses]);

  // Check if 50,000 km or other milestones are already scheduled in serviceHistory for the current vehicle
  const scheduled50kRecord = normalizedHistory.find(s => 
    s.vehicleId === currentVehicleId &&
    (s.status === 'Scheduled' || s.status === 'Upcoming') &&
    (s.title.includes('50,000') || s.title.toLowerCase().includes('major milestone') || s.odometer === 50000)
  );

  const scheduled60kRecord = normalizedHistory.find(s => 
    s.vehicleId === currentVehicleId &&
    (s.status === 'Scheduled' || s.status === 'Upcoming') &&
    (s.title.includes('60,000') || s.odometer === 60000)
  );

  // Direct 1-click Milestone Booking Handler (with instant persistence & duplicate prevention)
  const handleBookMilestoneDirectly = (milestoneKm = 50000) => {
    const vehicleDisplayName = vehicle?.displayName || (vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : 'Honda City');
    
    if (milestoneKm === 50000) {
      if (scheduled50kRecord) {
        showBanner(`✓ 50,000 km Major Milestone Service is already scheduled (${scheduled50kRecord.date || 'December 2026'}).`);
        setActiveSubTab('history');
        return;
      }

      const newBooking = {
        id: `srv-50k-${currentVehicleId}`,
        title: '50,000 km Major Milestone Service',
        category: 'Periodic Service',
        date: 'December 2026',
        garage: 'Authorized Service Center — Honda Pride',
        odometer: 50000,
        cost: '₹6,500 – ₹8,500',
        status: 'Scheduled',
        paymentStatus: 'Not Paid',
        bookingStatus: 'Confirmed',
        parts: [
          'Engine oil & OEM filter replacement',
          'Spark plug set renewal & throttle cleaning',
          '4-wheel brake pad & caliper servicing'
        ],
        notes: 'Manufacturer scheduled 50,000 km major maintenance milestone.',
        vehicleId: currentVehicleId,
        vehicleName: vehicleDisplayName
      };

      addServiceRecord(newBooking);
      showBanner(`✓ Service booked successfully! 50,000 km Major Milestone Service added to Service History.`);
      setActiveSubTab('history');
    } else if (milestoneKm === 60000) {
      if (scheduled60kRecord) {
        showBanner(`✓ 60,000 km Service is already scheduled (${scheduled60kRecord.date || 'June 2027'}).`);
        setActiveSubTab('history');
        return;
      }

      const newBooking = {
        id: `srv-60k-${currentVehicleId}`,
        title: '60,000 km Brake Fluid & Coolant Flush',
        category: 'Periodic Service',
        date: 'June 2027',
        garage: 'Authorized Service Center',
        odometer: 60000,
        cost: '₹4,800 – ₹6,200',
        status: 'Scheduled',
        paymentStatus: 'Not Paid',
        bookingStatus: 'Confirmed',
        parts: [
          'Hydraulic brake fluid complete flush (DOT 4)',
          'Engine coolant drain & fresh fill'
        ],
        notes: 'Hydraulic brake fluid and thermal cooling system overhaul.',
        vehicleId: currentVehicleId,
        vehicleName: vehicleDisplayName
      };

      addServiceRecord(newBooking);
      showBanner(`✓ Service booked successfully! 60,000 km milestone service added to Service History.`);
      setActiveSubTab('history');
    }
  };

  // Handle Book Service Appointment Confirmation Modal Form
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingFormError('');

    if (!bookingForm.title.trim()) {
      setBookingFormError('Please provide a service title.');
      return;
    }
    if (!bookingForm.garage.trim()) {
      setBookingFormError('Please select or enter an authorized garage.');
      return;
    }

    const costNum = Number(bookingForm.quotedCost) || 7200;
    const partsList = bookingForm.parts
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const bookingRecord = {
      id: 'srv-booking-' + Date.now(),
      title: bookingForm.title.trim(),
      category: bookingForm.category || 'Periodic Service',
      date: bookingForm.scheduledDate,
      timeSlot: bookingForm.timeSlot,
      garage: bookingForm.garage.trim(),
      odometer: Number(bookingForm.odometer) || nextServiceKm,
      cost: costNum,
      status: 'Scheduled',
      paymentStatus: 'Not Paid',
      bookingStatus: 'Confirmed',
      parts: partsList.length > 0 ? partsList : ['Scheduled Milestone Maintenance'],
      notes: `${bookingForm.notes || 'Service Appointment'}. Confirmed slot: ${bookingForm.timeSlot}.`,
      vehicleId: currentVehicleId,
      vehicleName: vehicle?.displayName || 'Honda City'
    };

    // Save to persistent service history
    addServiceRecord(bookingRecord);
    setIsBookModalOpen(false);
    showBanner(`✓ Service booked successfully! Your "${bookingRecord.title}" appointment is confirmed and logged in Service History.`);

    // Automatically navigate to Service History tab
    setActiveSubTab('history');
  };

  // Open Book Service Modal with prefilled milestone
  const handleOpenBookingModal = (milestoneTitle = '50,000 km Major Scheduled Service', costEst = '7200') => {
    setBookingForm({
      title: milestoneTitle,
      category: 'Periodic Service',
      scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      timeSlot: '10:00 AM',
      garage: 'Apex AutoCraft & Performance — Jubilee Hills',
      quotedCost: costEst.replace(/[^0-9]/g, '') || '7200',
      odometer: String(nextServiceKm),
      parts: 'Engine Oil (Synthetic 0W-20), OEM Oil Filter, Spark Plugs, Brake Fluid Inspection',
      notes: 'Scheduled periodic maintenance milestone'
    });
    setBookingFormError('');
    setIsBookModalOpen(true);
  };

  // Handle Add Completed Service Record
  const handleAddServiceSubmit = (e) => {
    e.preventDefault();
    setServiceFormError('');

    if (!serviceForm.title.trim()) {
      setServiceFormError('Please enter a service title.');
      return;
    }
    if (!serviceForm.garage.trim()) {
      setServiceFormError('Please enter the servicing garage name.');
      return;
    }
    const labour = Number(serviceForm.labourCost) || 0;
    const parts = Number(serviceForm.partsCost) || 0;
    const total = labour + parts;

    if (total <= 0) {
      setServiceFormError('Please provide a valid labour or parts cost.');
      return;
    }

    const partsList = serviceForm.parts
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const newRecord = {
      id: 'srv-' + Date.now(),
      title: serviceForm.title.trim(),
      category: serviceForm.category,
      date: serviceForm.date,
      garage: serviceForm.garage.trim(),
      odometer: Number(serviceForm.odometer) || currentOdo,
      cost: total,
      labourCost: labour,
      partsCost: parts,
      status: 'Completed',
      parts: partsList.length > 0 ? partsList : ['General periodic maintenance service'],
      notes: serviceForm.description.trim(),
      vehicleId: currentVehicleId,
      vehicleName: vehicle?.displayName || 'Honda City'
    };

    addServiceRecord(newRecord);
    setIsServiceModalOpen(false);
    showBanner(`Service record "${newRecord.title}" saved successfully.`);

    // Reset form
    setServiceForm({
      title: '',
      category: 'Periodic Service',
      date: new Date().toISOString().split('T')[0],
      odometer: String(currentOdo),
      garage: '',
      description: '',
      parts: '',
      labourCost: '0',
      partsCost: '0'
    });
  };

  // Handle Add Maintenance Item
  const handleAddMaintSubmit = (e) => {
    e.preventDefault();
    setMaintFormError('');

    if (!maintForm.title.trim()) {
      setMaintFormError('Please specify the maintenance checklist title.');
      return;
    }

    const newItem = {
      id: 'maint-' + Date.now(),
      title: maintForm.title.trim(),
      category: maintForm.category,
      dueOdometer: Number(maintForm.dueOdometer) || (currentOdo + 5000),
      dueDate: maintForm.dueDate,
      notes: maintForm.notes.trim(),
      completed: false,
      completedDate: null,
      vehicleId: currentVehicleId
    };

    addMaintenanceItem(newItem);
    setIsMaintModalOpen(false);
    showBanner(`Maintenance item "${newItem.title}" added to checklist.`);

    setMaintForm({
      title: '',
      category: 'Engine Oil',
      dueOdometer: String(currentOdo + 5000),
      dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      notes: ''
    });
  };

  // Handle Add Expense
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    setExpenseFormError('');

    const amt = Number(expenseForm.amount);
    if (!amt || amt <= 0) {
      setExpenseFormError('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!expenseForm.description.trim()) {
      setExpenseFormError('Please enter a description for this expense.');
      return;
    }

    const newExp = {
      id: 'exp-' + Date.now(),
      category: expenseForm.category,
      amount: amt,
      date: expenseForm.date,
      description: expenseForm.description.trim(),
      vehicleId: currentVehicleId,
      vehicleName: vehicle?.displayName || 'Honda City'
    };

    addExpense(newExp);
    setIsExpenseModalOpen(false);
    showBanner(`Expense of ₹${amt.toLocaleString()} recorded.`);

    setExpenseForm({
      category: 'Service',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  return (
    <div className="view-page-container">
      {/* 1. PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Service, Maintenance & Expenses</h2>
          <p>
            Track scheduled maintenance milestones, book verified service appointments, log garage invoices, and monitor total ownership costs for {vehicle?.displayName || `${vehicle?.manufacturer} ${vehicle?.model}`}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="primary-button flex-center-gap"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => handleOpenBookingModal('50,000 km Major Scheduled Service', '7200')}
          >
            <Wrench size={16} />
            <span>Book Next Service</span>
          </button>

          <button 
            className="outline-button flex-center-gap"
            style={{ width: 'auto', padding: '10px 16px' }}
            onClick={() => setIsServiceModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Service Log</span>
          </button>

          <button 
            className="outline-button flex-center-gap"
            style={{ width: 'auto', padding: '10px 16px' }}
            onClick={() => setIsExpenseModalOpen(true)}
          >
            <DollarSign size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION BANNER */}
      {successBanner && (
        <div className="alert-banner-success" style={{ marginBottom: '18px' }}>
          <CheckCircle2 size={18} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. TOP MAINTENANCE DASHBOARD KPIS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Next Service Milestone</span>
            <div className="kpi-icon-wrap blue"><Wrench size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">{nextServiceKm.toLocaleString()}</strong>
            <span className="kpi-unit">km</span>
          </div>
          <div className="kpi-footer text-blue">
            <span>{kmUntilNextService > 0 ? `${kmUntilNextService.toLocaleString()} km remaining` : 'Milestone reached'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Last Recorded Service</span>
            <div className="kpi-icon-wrap green"><FileCheck size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value" style={{ fontSize: '18px' }}>
              {lastService ? lastService.date : 'No records yet'}
            </strong>
          </div>
          <div className="kpi-footer text-emerald">
            <span>{lastService ? `${(lastService.odometer || currentOdo).toLocaleString()} km • ₹${(lastService.cost || 0).toLocaleString()}` : 'Add service record to log'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Maintenance Checklist</span>
            <div className={`kpi-icon-wrap ${overdueCount > 0 ? 'amber' : 'green'}`}><Layers size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">{upcomingCount}</strong>
            <span className="kpi-unit">active items</span>
          </div>
          <div className={`kpi-footer ${overdueCount > 0 ? 'text-amber' : 'text-emerald'}`}>
            <span>{overdueCount > 0 ? `⚠ ${overdueCount} Overdue Item(s)` : '✓ All schedules on track'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Maintenance Spend</span>
            <div className="kpi-icon-wrap amber"><DollarSign size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">₹{totalMaintenanceSpend.toLocaleString()}</strong>
            <span className="kpi-unit">Total</span>
          </div>
          <div className="kpi-footer text-amber">
            <span>₹{monthlyExpenses.toLocaleString()} spent this month</span>
          </div>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="filter-pill-group" style={{ margin: '24px 0 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          className={`filter-pill ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          Overview & Roadmaps
        </button>
        <button 
          className={`filter-pill ${activeSubTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('checklist')}
        >
          Maintenance Checklist ({evaluatedMaintenance.length})
        </button>
        <button 
          className={`filter-pill ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          Service Records & Bookings ({normalizedHistory.length})
        </button>
        <button 
          className={`filter-pill ${activeSubTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('expenses')}
        >
          Expense Breakdown (₹{totalMaintenanceSpend.toLocaleString()})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & COMPONENT HEALTH */}
      {activeSubTab === 'overview' && (
        <div className="two-column-equal">
          {/* COMPONENT HEALTH TELEMETRY */}
          <div className="panel">
            <div className="section-header">
              <h3>Subsystem Component Health</h3>
              <span className="badge-good">Telemetry Monitored</span>
            </div>

            <div className="component-checks-list">
              {(vehicleHealth?.components && vehicleHealth.components.length > 0 ? vehicleHealth.components : [
                { name: 'Engine Oil & Lubrication', score: 85, status: 'Optimal (Synthetic 0W-20)' },
                { name: 'Brake Pads & Hydraulics', score: 88, status: 'Good pad thickness (>5mm)' },
                { name: '12V Battery Charging', score: 92, status: 'Resting 12.6V' },
                { name: 'Tyre Tread & Alignment', score: 80, status: '32 PSI all round' },
                { name: 'Engine Coolant & Thermostat', score: 95, status: 'Level optimal' }
              ]).map((comp, idx) => {
                const score = comp.score ?? 90;
                const color = score >= 90 ? '#2de28a' : score >= 75 ? '#38a8ff' : score >= 60 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={idx} className="comp-check-item">
                    <div className="comp-check-header">
                      <div>
                        <strong>{comp.name}</strong>
                        <span className="comp-sub">{comp.status}</span>
                      </div>
                      <span className="comp-pct" style={{ color }}>{score}%</span>
                    </div>
                    <div className="subsystem-bar">
                      <div className="subsystem-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPCOMING ROADMAP MILESTONES */}
          <div className="panel">
            <div className="section-header">
              <h3>Scheduled Service Roadmaps</h3>
              <button 
                className="outline-button"
                style={{ width: 'auto', padding: '4px 12px', fontSize: '12px' }}
                onClick={() => setActiveTab('Find Garage')}
              >
                Find Service Bay
              </button>
            </div>

            <div className="maintenance-roadmap-list">
              <div className="roadmap-card next-milestone">
                <div className="roadmap-header">
                  <div>
                    <span className="roadmap-milestone-tag">50,000 km</span>
                    <strong className="roadmap-title">Major Milestone Service</strong>
                  </div>
                  <div className="roadmap-cost-badge">
                    <strong>₹6,500 – ₹8,500</strong>
                    <small>Target: Dec 2026</small>
                  </div>
                </div>
                <ul className="roadmap-items-list">
                  <li><CheckCircle2 size={14} className="text-blue" /><span>Engine oil & OEM filter replacement</span></li>
                  <li><CheckCircle2 size={14} className="text-blue" /><span>Spark plug set renewal & throttle cleaning</span></li>
                  <li><CheckCircle2 size={14} className="text-blue" /><span>4-wheel brake pad & caliper servicing</span></li>
                </ul>

                {scheduled50kRecord ? (
                  <div 
                    style={{ 
                      marginTop: '14px', 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      background: 'rgba(56, 168, 255, 0.12)', 
                      border: '1px solid rgba(56, 168, 255, 0.3)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} className="text-blue" />
                      <strong style={{ fontSize: '13px', color: 'var(--accent-blue)' }}>
                        ✓ 50,000 km Service Booked
                      </strong>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      {scheduled50kRecord.date || 'December 2026'}
                    </span>
                  </div>
                ) : (
                  <button 
                    className="primary-button" 
                    style={{ width: '100%', marginTop: '14px', padding: '10px' }}
                    onClick={() => handleBookMilestoneDirectly(50000)}
                  >
                    Book 50,000 km Milestone Service
                  </button>
                )}
              </div>

              <div className="roadmap-card" style={{ marginTop: '12px' }}>
                <div className="roadmap-header">
                  <div>
                    <span className="roadmap-milestone-tag">60,000 km</span>
                    <strong className="roadmap-title">Brake Fluid & Coolant Flush</strong>
                  </div>
                  <div className="roadmap-cost-badge">
                    <strong>₹4,800 – ₹6,200</strong>
                    <small>Jun 2027</small>
                  </div>
                </div>
                <ul className="roadmap-items-list">
                  <li><CheckCircle2 size={14} className="text-blue" /><span>Hydraulic brake fluid complete flush (DOT 4)</span></li>
                  <li><CheckCircle2 size={14} className="text-blue" /><span>Engine coolant drain & fresh fill</span></li>
                </ul>

                {scheduled60kRecord ? (
                  <div 
                    style={{ 
                      marginTop: '14px', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      background: 'rgba(56, 168, 255, 0.12)', 
                      border: '1px solid rgba(56, 168, 255, 0.3)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} className="text-blue" />
                      <strong style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>
                        ✓ 60,000 km Service Booked
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {scheduled60kRecord.date || 'June 2027'}
                    </span>
                  </div>
                ) : (
                  <button 
                    className="outline-button" 
                    style={{ width: '100%', marginTop: '14px', padding: '9px' }}
                    onClick={() => handleBookMilestoneDirectly(60000)}
                  >
                    Schedule 60,000 km Milestone
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MAINTENANCE CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="panel" style={{ padding: '20px' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Maintenance Reminders & Action Items</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '4px 0 0' }}>
                Dynamically computed based on current odometer ({(currentOdo).toLocaleString()} km) and calendar targets.
              </p>
            </div>

            <button 
              className="primary-button flex-center-gap"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setIsMaintModalOpen(true)}
            >
              <Plus size={15} />
              <span>Add Checklist Item</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {evaluatedMaintenance.map(item => {
              const statusColor = item.status === 'Overdue' ? '#ef4444' : item.status === 'Due Soon' ? '#f59e0b' : item.status === 'Completed' ? '#2de28a' : '#38a8ff';
              const statusBg = item.status === 'Overdue' ? 'rgba(239, 68, 68, 0.12)' : item.status === 'Due Soon' ? 'rgba(245, 158, 11, 0.12)' : item.status === 'Completed' ? 'rgba(45, 226, 138, 0.12)' : 'rgba(56, 168, 255, 0.12)';

              return (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: item.completed ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--card-border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      type="button"
                      onClick={() => toggleMaintenanceItem(item.id)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: item.completed ? '1px solid var(--accent-emerald)' : '1px solid var(--card-border)',
                        background: item.completed ? 'var(--accent-emerald)' : 'transparent',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Toggle completion status"
                    >
                      {item.completed && <Check size={16} />}
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px', textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-dim)' : 'var(--text-main)' }}>
                          {item.title}
                        </strong>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: statusBg, color: statusColor, fontWeight: '700' }}>
                          {item.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                        {item.notes || `Category: ${item.category}`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                        Target: {item.dueOdometer ? `${item.dueOdometer.toLocaleString()} km` : 'Milestone'}
                      </div>
                      <div style={{ color: 'var(--text-dim)' }}>
                        Due by: {item.dueDate || 'Standard interval'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteMaintenanceItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
                      title="Delete maintenance item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE HISTORY & INVOICES */}
      {activeSubTab === 'history' && (
        <div className="panel" style={{ padding: '20px' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Service Records & Invoices</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '4px 0 0' }}>
                Complete historical log of scheduled appointments, verified workshop visits, and part replacements.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="primary-button flex-center-gap"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                onClick={() => handleOpenBookingModal('50,000 km Major Scheduled Service', '7200')}
              >
                <Wrench size={15} />
                <span>Book Service</span>
              </button>

              <button 
                className="outline-button flex-center-gap"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                onClick={() => setIsServiceModalOpen(true)}
              >
                <Plus size={15} />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          <div className="service-timeline-container">
            {normalizedHistory.map((item, index) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-marker-col">
                  <div className="timeline-dot"><Wrench size={16} /></div>
                  {index !== normalizedHistory.length - 1 && <div className="timeline-line"></div>}
                </div>

                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <div>
                      <span className="timeline-category-tag">{item.category}</span>
                      <h3 className="timeline-title">{item.title}</h3>
                      <div className="timeline-meta-row">
                        <div className="flex-center-gap"><Calendar size={14} className="text-muted" /><span>{item.date}</span></div>
                        <div className="flex-center-gap"><MapPin size={14} className="text-blue" /><span>{item.garage}</span></div>
                        <div className="flex-center-gap"><Gauge size={14} className="text-muted" /><span>{item.odometerFormatted}</span></div>
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

                  {item.parts && item.parts.length > 0 && (
                    <div className="timeline-parts-section">
                      <span className="parts-heading">Parts & Consumables:</span>
                      <div className="parts-tags-wrap">
                        {item.parts.map((p, pIdx) => (
                          <span key={pIdx} className="part-tag">
                            <CheckCircle2 size={12} className="text-emerald" />
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <div className="timeline-notes-box">
                      <strong>Service Summary / Notes:</strong>
                      <p>{item.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {normalizedHistory.length === 0 && (
              <div className="search-empty-state" style={{ padding: '40px', textAlign: 'center' }}>
                <History size={36} style={{ color: '#64748b', marginBottom: '10px' }} />
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No service records logged yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES & CATEGORY BREAKDOWN */}
      {activeSubTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* CATEGORY BREAKDOWN CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            {EXPENSE_CATEGORIES.map(cat => {
              const catSpend = expenseByCategory[cat] || 0;
              return (
                <div key={cat} className="panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat} Expenses</span>
                  <strong style={{ display: 'block', fontSize: '20px', color: 'var(--text-main)', marginTop: '4px' }}>
                    ₹{catSpend.toLocaleString()}
                  </strong>
                  <small style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {vehicleExpenses.filter(e => (e.category || '').toLowerCase() === cat.toLowerCase()).length} recorded
                  </small>
                </div>
              );
            })}
          </div>

          {/* RECENT EXPENSES TABLE */}
          <div className="panel" style={{ padding: '20px' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Recent Expense Transactions</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '4px 0 0' }}>
                  Complete running cost log across fuel, periodic maintenance, parts, and insurance for {vehicle?.displayName || 'Honda City'}.
                </p>
              </div>

              <button 
                className="primary-button flex-center-gap"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                onClick={() => setIsExpenseModalOpen(true)}
              >
                <Plus size={15} />
                <span>Add Expense</span>
              </button>
            </div>

            <div className="table-responsive-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Vehicle</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleExpenses.map(exp => (
                    <tr key={exp.id}>
                      <td><strong>{exp.date}</strong></td>
                      <td>
                        <span className="badge-good" style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {exp.category}
                        </span>
                      </td>
                      <td>{exp.description}</td>
                      <td><small className="text-muted">{exp.vehicleName || vehicle?.displayName || 'Honda City'}</small></td>
                      <td><strong className="text-emerald">₹{Number(exp.amount).toLocaleString()}</strong></td>
                      <td>
                        <button
                          type="button"
                          onClick={() => deleteExpense(exp.id)}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                          title="Delete expense entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {vehicleExpenses.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                        No expenses logged for this vehicle yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BOOK SERVICE APPOINTMENT */}
      {/* ======================================================== */}
      {isBookModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBookModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={18} className="text-blue" />
                <h3 style={{ margin: 0 }}>Book Service Appointment</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsBookModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div className="form-group">
                <label>Service Milestone / Package *</label>
                <input
                  className="simple-input"
                  value={bookingForm.title}
                  onChange={e => setBookingForm({ ...bookingForm, title: e.target.value })}
                  placeholder="e.g. 50,000 km Major Scheduled Service"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Scheduled Date *</label>
                  <input
                    type="date"
                    className="simple-input"
                    value={bookingForm.scheduledDate}
                    onChange={e => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time Slot *</label>
                  <select
                    className="simple-input"
                    value={bookingForm.timeSlot}
                    onChange={e => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                  >
                    <option value="09:00 AM">09:00 AM - Morning Slot</option>
                    <option value="10:00 AM">10:00 AM - Morning Slot</option>
                    <option value="11:30 AM">11:30 AM - Mid-Day Slot</option>
                    <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                    <option value="04:00 PM">04:00 PM - Evening Slot</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Authorized Service Center / Garage *</label>
                <input
                  className="simple-input"
                  value={bookingForm.garage}
                  onChange={e => setBookingForm({ ...bookingForm, garage: e.target.value })}
                  placeholder="e.g. Apex AutoCraft & Performance / Honda Pride"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Vehicle / Target Odometer</label>
                  <input
                    type="number"
                    className="simple-input"
                    value={bookingForm.odometer}
                    onChange={e => setBookingForm({ ...bookingForm, odometer: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Quoted Package Estimate (₹)</label>
                  <input
                    type="number"
                    className="simple-input"
                    value={bookingForm.quotedCost}
                    onChange={e => setBookingForm({ ...bookingForm, quotedCost: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Included Checklist & Services</label>
                <input
                  className="simple-input"
                  value={bookingForm.parts}
                  onChange={e => setBookingForm({ ...bookingForm, parts: e.target.value })}
                  placeholder="e.g. Engine Oil, Oil Filter, Spark Plugs, Brake Inspection"
                />
              </div>

              {/* BOOKING SUMMARY CALLOUT */}
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(56, 168, 255, 0.08)', border: '1px solid rgba(56, 168, 255, 0.25)', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="text-muted">Vehicle:</span>
                  <strong>{vehicle?.displayName || 'Honda City'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Estimated Cost:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>₹{Number(bookingForm.quotedCost || 7200).toLocaleString()}</strong>
                </div>
              </div>

              {bookingFormError && (
                <div style={{ color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{bookingFormError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="outline-button" style={{ width: 'auto' }} onClick={() => setIsBookModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ width: 'auto', padding: '10px 22px' }}>
                  Confirm & Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD SERVICE RECORD */}
      {/* ======================================================== */}
      {isServiceModalOpen && (
        <div className="modal-overlay" onClick={() => setIsServiceModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Verified Service Record</h3>
              <button className="modal-close-btn" onClick={() => setIsServiceModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleAddServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div className="form-group">
                <label>Service Title / Type *</label>
                <input
                  className="simple-input"
                  value={serviceForm.title}
                  onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. 50,000 km Scheduled Service"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Service Date *</label>
                  <input
                    type="date"
                    className="simple-input"
                    value={serviceForm.date}
                    onChange={e => setServiceForm({ ...serviceForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Odometer Reading (km) *</label>
                  <input
                    type="number"
                    className="simple-input"
                    value={serviceForm.odometer}
                    onChange={e => setServiceForm({ ...serviceForm, odometer: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Garage / Service Provider *</label>
                <input
                  className="simple-input"
                  value={serviceForm.garage}
                  onChange={e => setServiceForm({ ...serviceForm, garage: e.target.value })}
                  placeholder="e.g. Apex AutoCraft / Authorized Bay"
                  required
                />
              </div>

              <div className="form-group">
                <label>Parts Replaced (comma separated)</label>
                <input
                  className="simple-input"
                  value={serviceForm.parts}
                  onChange={e => setServiceForm({ ...serviceForm, parts: e.target.value })}
                  placeholder="e.g. Engine Oil 0W-20, OEM Oil Filter, Brake Pads"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Labour Cost (₹)</label>
                  <input
                    type="number"
                    className="simple-input"
                    value={serviceForm.labourCost}
                    onChange={e => setServiceForm({ ...serviceForm, labourCost: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Parts Cost (₹)</label>
                  <input
                    type="number"
                    className="simple-input"
                    value={serviceForm.partsCost}
                    onChange={e => setServiceForm({ ...serviceForm, partsCost: e.target.value })}
                  />
                </div>
              </div>

              {/* AUTOMATIC TOTAL COST PREVIEW */}
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(56, 168, 255, 0.08)', border: '1px solid rgba(56, 168, 255, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Calculated Total Service Cost:</span>
                <strong style={{ fontSize: '16px', color: 'var(--accent-emerald)' }}>
                  ₹{((Number(serviceForm.labourCost) || 0) + (Number(serviceForm.partsCost) || 0)).toLocaleString()}
                </strong>
              </div>

              <div className="form-group">
                <label>Service Description & Notes</label>
                <textarea
                  className="simple-input"
                  rows={2}
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Additional observations or recommendations from the service advisor..."
                />
              </div>

              {serviceFormError && (
                <div style={{ color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{serviceFormError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="outline-button" style={{ width: 'auto' }} onClick={() => setIsServiceModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ width: 'auto', padding: '10px 22px' }}>
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD MAINTENANCE ITEM */}
      {/* ======================================================== */}
      {isMaintModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMaintModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Maintenance Checklist Item</h3>
              <button className="modal-close-btn" onClick={() => setIsMaintModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleAddMaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div className="form-group">
                <label>Maintenance Item Title *</label>
                <input
                  className="simple-input"
                  value={maintForm.title}
                  onChange={e => setMaintForm({ ...maintForm, title: e.target.value })}
                  placeholder="e.g. Brake Pad Inspection / Coolant Flush"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  className="simple-input"
                  value={maintForm.category}
                  onChange={e => setMaintForm({ ...maintForm, category: e.target.value })}
                >
                  {MAINTENANCE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Due Odometer (km)</label>
                  <input
                    type="number"
                    className="simple-input"
                    value={maintForm.dueOdometer}
                    onChange={e => setMaintForm({ ...maintForm, dueOdometer: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="simple-input"
                    value={maintForm.dueDate}
                    onChange={e => setMaintForm({ ...maintForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Specification</label>
                <textarea
                  className="simple-input"
                  rows={2}
                  value={maintForm.notes}
                  onChange={e => setMaintForm({ ...maintForm, notes: e.target.value })}
                  placeholder="e.g. Use OEM DOT-4 fluid / Check lining thickness"
                />
              </div>

              {maintFormError && (
                <div style={{ color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{maintFormError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="outline-button" style={{ width: 'auto' }} onClick={() => setIsMaintModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ width: 'auto', padding: '10px 22px' }}>
                  Add to Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD EXPENSE */}
      {/* ======================================================== */}
      {isExpenseModalOpen && (
        <div className="modal-overlay" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Vehicle Expense</h3>
              <button className="modal-close-btn" onClick={() => setIsExpenseModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div className="form-group">
                <label>Expense Category *</label>
                <select
                  className="simple-input"
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    className="simple-input"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="e.g. 3500"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    className="simple-input"
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <input
                  className="simple-input"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g. Shell Petrol Refuel / Wiper Blades / Insurance Premium"
                  required
                />
              </div>

              {expenseFormError && (
                <div style={{ color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{expenseFormError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="outline-button" style={{ width: 'auto' }} onClick={() => setIsExpenseModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ width: 'auto', padding: '10px 22px' }}>
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}