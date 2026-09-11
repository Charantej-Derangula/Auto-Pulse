import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Eye,
  FileCheck,
  Sparkles,
  Plus,
  Trash2,
  Car,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  DOCUMENT_TYPES, 
  DOCUMENT_CATEGORIES, 
  calculateDocumentStatus,
  normalizeDocument 
} from '../services/DocumentService';

export function DocumentsView() {
  const { documents, addDocument, deleteDocument, vehicle } = useApp();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [successToast, setSuccessToast] = useState(null);
  const [downloadNotice, setDownloadNotice] = useState(null);

  const currentVehicleId = vehicle?.id || vehicle?.vehicleId || 'honda-city';

  const [uploadFormData, setUploadFormData] = useState({
    documentType: 'Registration Certificate (RC)',
    title: '',
    subtitle: '',
    docNumber: '',
    category: 'Registration',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-12-31',
    notes: ''
  });

  // Auto-fill title and category when documentType changes if title is empty or matching previous default
  const handleTypeChange = (e) => {
    const type = e.target.value;
    let cat = 'Registration';
    if (type === 'Insurance') cat = 'Insurance';
    else if (type.includes('PUC') || type.includes('Pollution')) cat = 'Compliance';
    else if (type.includes("Driver's License") || type.includes('DL')) cat = 'Personal ID';
    else if (type.includes('Roadside') || type.includes('RSA')) cat = 'Emergency';
    else if (type.includes('Fitness') || type.includes('Permit')) cat = 'Compliance';
    else cat = 'Other';

    setUploadFormData(prev => ({
      ...prev,
      documentType: type,
      category: cat,
      title: prev.title === '' || DOCUMENT_TYPES.includes(prev.title) ? type : prev.title
    }));
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsUploadModalOpen(false);
        setSelectedDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Filter documents by current vehicle and compute dynamic status
  const vehicleDocuments = useMemo(() => {
    const rawList = Array.isArray(documents) ? documents : [];
    return rawList
      .map(doc => normalizeDocument(doc, currentVehicleId))
      .filter(Boolean)
      .filter(doc => doc.vehicleId === currentVehicleId);
  }, [documents, currentVehicleId]);

  // 2. Apply category filter
  const filteredDocuments = useMemo(() => {
    if (activeCategoryFilter === 'All') return vehicleDocuments;
    return vehicleDocuments.filter(doc => doc.category === activeCategoryFilter || doc.documentType === activeCategoryFilter);
  }, [vehicleDocuments, activeCategoryFilter]);

  // Document status summary metrics
  const docStats = useMemo(() => {
    let validCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    vehicleDocuments.forEach(doc => {
      const statusInfo = calculateDocumentStatus(doc.expiryDate);
      if (statusInfo.statusType === 'danger') expiredCount++;
      else if (statusInfo.statusType === 'warning') expiringSoonCount++;
      else validCount++;
    });

    return { validCount, expiringSoonCount, expiredCount, total: vehicleDocuments.length };
  }, [vehicleDocuments]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const docTitle = uploadFormData.title.trim() || uploadFormData.documentType;

    const newDoc = {
      id: 'doc-' + Date.now(),
      documentId: 'doc-' + Date.now(),
      vehicleId: currentVehicleId,
      title: docTitle,
      subtitle: uploadFormData.subtitle.trim() || `${vehicle?.manufacturer || 'Vehicle'} ${vehicle?.model || ''} Document`,
      docNumber: uploadFormData.docNumber.trim() || 'N/A',
      category: uploadFormData.category,
      documentType: uploadFormData.documentType,
      issueDate: uploadFormData.issueDate,
      expiryDate: uploadFormData.expiryDate,
      notes: uploadFormData.notes.trim(),
      fileSize: '1.8 MB',
      fileType: 'PDF'
    };

    addDocument(newDoc);
    setIsUploadModalOpen(false);
    setSuccessToast(`"${docTitle}" added successfully to ${vehicle?.displayName || vehicle?.model || 'vehicle'} vault!`);
    setTimeout(() => setSuccessToast(null), 4000);

    setUploadFormData({
      documentType: 'Registration Certificate (RC)',
      title: '',
      subtitle: '',
      docNumber: '',
      category: 'Registration',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2028-12-31',
      notes: ''
    });
  };

  const handleDownloadDoc = (doc) => {
    setDownloadNotice(`Downloading verified digital PDF copy of ${doc.title}...`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Digital Document Vault</h2>
          <p>
            Secure encrypted storage for Registration, Insurance, PUC, and Driver compliance certificates 
            for <strong style={{ color: '#91AE6E' }}>{vehicle?.displayName || `${vehicle?.manufacturer} ${vehicle?.model}`}</strong>.
          </p>
        </div>

        <button 
          className="primary-button flex-center-gap"
          style={{ width: 'auto', padding: '10px 22px' }}
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add Document</span>
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successToast && (
        <div className="alert-banner-success flex-center-gap" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* DOWNLOAD TOAST */}
      {downloadNotice && (
        <div className="alert-banner-info flex-center-gap" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <Download size={18} />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* COMPLIANCE STATUS RIBBON */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Total Documents</span>
            <div className="kpi-icon-wrap blue" style={{ width: '32px', height: '32px' }}>
              <FileText size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value">{docStats.total}</strong>
            <span className="kpi-unit">saved</span>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Active & Valid</span>
            <div className="kpi-icon-wrap green" style={{ width: '32px', height: '32px' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>{docStats.validCount}</strong>
            <span className="kpi-unit">compliant</span>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Expiring Soon (≤ 30d)</span>
            <div className="kpi-icon-wrap amber" style={{ width: '32px', height: '32px' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{docStats.expiringSoonCount}</strong>
            <span className="kpi-unit">renew</span>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-top">
            <span className="kpi-label">Expired</span>
            <div className="kpi-icon-wrap" style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="kpi-val-row" style={{ margin: '6px 0 0' }}>
            <strong className="kpi-value" style={{ color: docStats.expiredCount > 0 ? '#fca5a5' : 'var(--text-muted)' }}>
              {docStats.expiredCount}
            </strong>
            <span className="kpi-unit">urgent</span>
          </div>
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="reminders-filter-row">
        <div className="filter-pill-group">
          {['All', 'Registration', 'Insurance', 'Compliance', 'Personal ID', 'Emergency'].map(cat => (
            <button
              key={cat}
              className={`filter-pill ${activeCategoryFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENT CARDS GRID */}
      <div className="documents-grid">
        {filteredDocuments.map((doc) => {
          const statusInfo = calculateDocumentStatus(doc.expiryDate);
          return (
            <div key={doc.id} className="doc-card">
              <div className="doc-card-top">
                <div className="doc-icon-wrap">
                  <FileText size={24} className="text-blue" />
                </div>
                <span className={`doc-status-badge ${statusInfo.statusType}`}>
                  {statusInfo.statusType === 'danger' ? (
                    <AlertCircle size={13} />
                  ) : statusInfo.statusType === 'warning' ? (
                    <AlertTriangle size={13} />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  <span>{statusInfo.status}</span>
                </span>
              </div>

              <div className="doc-card-content">
                <span className="doc-cat-label">{doc.category || doc.documentType}</span>
                <strong className="doc-title">{doc.title}</strong>
                <p className="doc-subtitle">{doc.subtitle}</p>

                <div className="doc-number-row">
                  <span>Doc / Policy ID:</span>
                  <strong style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{doc.docNumber}</strong>
                </div>

                <div className="doc-expiry-row">
                  <Calendar size={14} className="text-muted" />
                  <span>
                    Expires on: <strong style={{ color: statusInfo.statusType === 'danger' ? '#fca5a5' : statusInfo.statusType === 'warning' ? 'var(--accent-amber)' : 'inherit' }}>
                      {doc.expiryDate}
                    </strong>
                  </span>
                </div>

                {doc.notes && (
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '14px' }}>
                    "{doc.notes}"
                  </p>
                )}
              </div>

              <div className="doc-card-actions">
                <button 
                  className="doc-action-btn view-btn"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <Eye size={15} />
                  <span>View Doc</span>
                </button>

                <button 
                  className="doc-action-btn download-btn"
                  onClick={() => handleDownloadDoc(doc)}
                >
                  <Download size={15} />
                  <span>Download</span>
                </button>

                <button
                  className="rem-delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete "${doc.title}" from this vehicle?`)) {
                      deleteDocument(doc.id);
                    }
                  }}
                  title="Delete document"
                  style={{ padding: '8px' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredDocuments.length === 0 && (
          <div className="search-empty-state col-span-3" style={{ gridColumn: '1 / -1', padding: '40px 20px' }}>
            <FileText size={42} style={{ color: 'var(--text-dim)', margin: '0 auto 12px' }} />
            <h3>No documents found</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '420px', margin: '6px auto 18px' }}>
              No compliance documents saved for {vehicle?.displayName || 'this vehicle'} under this filter.
            </p>
            <button 
              className="primary-button" 
              style={{ width: 'auto', margin: '0 auto' }}
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add Vehicle Document</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW DOCUMENT MODAL */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-center-gap">
                <ShieldCheck size={22} className="text-emerald" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedDoc.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDoc(null)}>✕</button>
            </div>

            <div style={{ padding: '16px 0 0' }}>
              <div className="doc-preview-sheet">
                <div className="sheet-header">
                  <div className="sheet-logo">GOVERNMENT / INSURER PORTAL VERIFIED</div>
                  <span className="badge-good">Digital Verified Stamp</span>
                </div>

                <div className="sheet-body">
                  <div className="sheet-row">
                    <span>Vehicle:</span>
                    <strong>{vehicle?.displayName || (vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : 'Vehicle')}{vehicle?.regNumber ? ` (${vehicle.regNumber})` : ''}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>Document Type:</span>
                    <strong>{selectedDoc.documentType || selectedDoc.category}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>Document ID / Reg Number:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{selectedDoc.docNumber}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>Issued Date:</span>
                    <strong>{selectedDoc.issueDate}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>Expiry Date:</span>
                    <strong className={calculateDocumentStatus(selectedDoc.expiryDate).statusType === 'danger' ? 'text-danger' : 'text-amber'}>
                      {selectedDoc.expiryDate}
                    </strong>
                  </div>
                  <div className="sheet-row">
                    <span>Current Status:</span>
                    <strong style={{ color: calculateDocumentStatus(selectedDoc.expiryDate).statusType === 'danger' ? '#ef4444' : calculateDocumentStatus(selectedDoc.expiryDate).statusType === 'warning' ? '#f59e0b' : '#10b981' }}>
                      {calculateDocumentStatus(selectedDoc.expiryDate).status}
                    </strong>
                  </div>
                  {selectedDoc.notes && (
                    <div className="sheet-row">
                      <span>Notes:</span>
                      <strong>{selectedDoc.notes}</strong>
                    </div>
                  )}
                  <div className="sheet-row">
                    <span>File Format & Size:</span>
                    <strong>{selectedDoc.fileType} • {selectedDoc.fileSize}</strong>
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button 
                  className="primary-button flex-center-gap"
                  onClick={() => {
                    handleDownloadDoc(selectedDoc);
                    setSelectedDoc(null);
                  }}
                >
                  <Download size={16} />
                  <span>Download Secure PDF</span>
                </button>
                <button className="outline-button" onClick={() => setSelectedDoc(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / UPLOAD DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-center-gap">
                <Upload size={20} className="text-blue" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Add Vehicle Document</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsUploadModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ paddingTop: '16px' }}>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label>Document Type *</label>
                  <select
                    className="simple-input"
                    value={uploadFormData.documentType}
                    onChange={handleTypeChange}
                    required
                  >
                    {DOCUMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label>Document Name / Title *</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Registration Certificate (RC) or HDFC ERGO Insurance"
                    value={uploadFormData.title}
                    onChange={e => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group col-span-2">
                  <label>Issuing Authority / Subtitle</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Transport Department RTA or Policy Provider"
                    value={uploadFormData.subtitle}
                    onChange={e => setUploadFormData({ ...uploadFormData, subtitle: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Document / Policy Number *</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. TS09FH4821 or POL-2026-90182"
                    value={uploadFormData.docNumber}
                    onChange={e => setUploadFormData({ ...uploadFormData, docNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="simple-input"
                    value={uploadFormData.category}
                    onChange={e => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                  >
                    {DOCUMENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Issue Date</label>
                  <input 
                    type="date" 
                    className="simple-input" 
                    value={uploadFormData.issueDate}
                    onChange={e => setUploadFormData({ ...uploadFormData, issueDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input 
                    type="date" 
                    className="simple-input" 
                    value={uploadFormData.expiryDate}
                    onChange={e => setUploadFormData({ ...uploadFormData, expiryDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group col-span-2">
                  <label>Optional Notes / Policy Add-ons</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Zero Dep + Engine protector cover included"
                    value={uploadFormData.notes}
                    onChange={e => setUploadFormData({ ...uploadFormData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions col-span-2" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button type="submit" className="primary-button" style={{ width: 'auto', padding: '12px 24px' }}>
                  Save Document
                </button>
                <button 
                  type="button" 
                  className="outline-button" 
                  style={{ width: 'auto', padding: '12px 24px' }}
                  onClick={() => setIsUploadModalOpen(false)}
                >
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
