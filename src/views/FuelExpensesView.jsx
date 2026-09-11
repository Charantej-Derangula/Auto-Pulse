import React, { useState, useMemo } from 'react';
import {
  Fuel,
  Plus,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Gauge,
  MapPin,
  CheckCircle2,
  PieChart,
  BarChart3,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function FuelExpensesView() {
  const { fuelLogs, addFuelLog, vehicle } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    station: 'Shell V-Power — Jubilee Hills',
    litres: '35',
    cost: '3900',
    odometer: vehicle ? String(vehicle.odometer) : '43200',
    tripDistance: '520',
    fullTank: true
  });

  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || 'honda-city';

  // Filter fuel logs strictly for currently active vehicle
  const vehicleFuelLogs = useMemo(() => {
    const raw = Array.isArray(fuelLogs) ? fuelLogs : [];
    return raw.filter(log => (log.vehicleId === currentVehicleId || !log.vehicleId));
  }, [fuelLogs, currentVehicleId]);

  const totalSpend = vehicleFuelLogs.reduce((acc, log) => acc + (Number(log.cost) || 0), 0);
  const totalLitres = vehicleFuelLogs.reduce((acc, log) => acc + (Number(log.litres) || 0), 0);
  const totalTripDist = vehicleFuelLogs.reduce((acc, log) => acc + (Number(log.tripDistance) || 0), 0);
  const avgEfficiency = vehicleFuelLogs.length > 0 ? (vehicleFuelLogs.reduce((acc, log) => acc + (Number(log.efficiency) || 0), 0) / vehicleFuelLogs.length).toFixed(1) : '0.0';
  const costPerKm = totalTripDist > 0 ? (totalSpend / totalTripDist).toFixed(2) : '0.00';

  const handleSubmit = (e) => {
    e.preventDefault();
    const litresNum = parseFloat(formData.litres) || 0;
    const costNum = parseFloat(formData.cost) || 0;
    const tripNum = parseFloat(formData.tripDistance) || 0;
    const odoNum = parseInt(formData.odometer) || (vehicle?.odometer || 0);

    const calculatedEfficiency = litresNum > 0 ? parseFloat((tripNum / litresNum).toFixed(2)) : 0;
    const pricePerLitre = litresNum > 0 ? parseFloat((costNum / litresNum).toFixed(1)) : 0;

    const newLog = {
      id: 'fuel-' + Date.now(),
      vehicleId: currentVehicleId,
      vehicleName: vehicle?.displayName || 'Honda City',
      date: formData.date,
      station: formData.station,
      litres: litresNum,
      cost: costNum,
      pricePerLitre,
      odometer: odoNum,
      tripDistance: tripNum,
      efficiency: calculatedEfficiency,
      fullTank: formData.fullTank
    };

    addFuelLog(newLog);
    setIsModalOpen(false);
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Fuel & Expense Analytics</h2>
          <p>Track refuelling logs, running cost per kilometre, and real-world powertrain efficiency trends.</p>
        </div>

        <button 
          className="primary-button flex-center-gap"
          style={{ width: 'auto', padding: '10px 22px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add Fuel Log</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Refuel Spend</span>
            <div className="kpi-icon-wrap amber"><Fuel size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">₹{totalSpend.toLocaleString()}</strong>
            <span className="kpi-unit">INR</span>
          </div>
          <div className="kpi-footer text-muted">
            <span>Across {fuelLogs.length} logged fill-ups</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Average Efficiency</span>
            <div className="kpi-icon-wrap green"><TrendingUp size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">{avgEfficiency}</strong>
            <span className="kpi-unit">{vehicle?.type === 'EV' ? 'km/kWh' : 'km/L'}</span>
          </div>
          <div className="kpi-footer text-emerald">
            <span>+1.2 km/L better than city average</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Cost per Kilometre</span>
            <div className="kpi-icon-wrap blue"><Receipt size={20} /></div>
          </div>
          <div className="kpi-val-row">
            <strong className="kpi-value">₹{costPerKm}</strong>
            <span className="kpi-unit">/ km</span>
          </div>
          <div className="kpi-footer text-blue">
            <span>Total Fuel: {totalLitres.toFixed(1)} Litres</span>
          </div>
        </div>
      </div>

      {/* REFUEL LOGS TABLE */}
      <div className="panel" style={{ marginTop: '24px' }}>
        <div className="section-header">
          <h3>Refuel & Charging History</h3>
          <span className="text-muted">{vehicleFuelLogs.length} transactions for {vehicle?.displayName || 'Honda City'}</span>
        </div>

        <div className="table-responsive-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fuel Station / Hub</th>
                <th>Volume</th>
                <th>Total Cost</th>
                <th>Trip Dist.</th>
                <th>Calculated Efficiency</th>
                <th>Odometer</th>
              </tr>
            </thead>
            <tbody>
              {vehicleFuelLogs.map((log) => (
                <tr key={log.id}>
                  <td><strong>{log.date}</strong></td>
                  <td>
                    <div className="flex-center-gap">
                      <MapPin size={14} className="text-blue" />
                      <span>{log.station}</span>
                    </div>
                  </td>
                  <td>{log.litres} {vehicle?.type === 'EV' ? 'kWh' : 'L'}</td>
                  <td><strong className="text-emerald">₹{Number(log.cost).toLocaleString()}</strong></td>
                  <td>{log.tripDistance} km</td>
                  <td>
                    <span className="efficiency-badge">
                      {log.efficiency} {vehicle?.type === 'EV' ? 'km/kWh' : 'km/L'}
                    </span>
                  </td>
                  <td>{log.odometer?.toLocaleString()} km</td>
                </tr>
              ))}
              {vehicleFuelLogs.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No fuel / energy logs recorded for this vehicle yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD FUEL LOG MODAL */}
      {isModalOpen && (
        <div className="search-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="search-modal" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="flex-center-gap">
                <Fuel size={22} className="text-amber" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Log Vehicle Refuel</h3>
              </div>
              <button className="search-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="simple-input" 
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Station Name</label>
                  <input 
                    className="simple-input" 
                    value={formData.station}
                    onChange={e => setFormData({ ...formData, station: e.target.value })}
                    placeholder="e.g. Shell V-Power"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{vehicle?.type === 'EV' ? 'Energy Charged (kWh)' : 'Fuel Quantity (Litres)'}</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="simple-input" 
                    value={formData.litres}
                    onChange={e => setFormData({ ...formData, litres: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Cost (INR ₹)</label>
                  <input 
                    type="number" 
                    className="simple-input" 
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trip Distance (km since last fill)</label>
                  <input 
                    type="number" 
                    className="simple-input" 
                    value={formData.tripDistance}
                    onChange={e => setFormData({ ...formData, tripDistance: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Current Odometer (km)</label>
                  <input 
                    type="number" 
                    className="simple-input" 
                    value={formData.odometer}
                    onChange={e => setFormData({ ...formData, odometer: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary-button">
                  Save Refuel Log
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
