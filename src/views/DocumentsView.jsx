import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function DocumentsView() {
  const { documents, addDocument } = useApp();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    subtitle: '',
    docNumber: '',
    category: 'Registration',
    expiryDate: '2028-12-31'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newDoc = {
      id: 'doc-' + Date.now(),
      title: uploadFormData.title,
      subtitle: uploadFormData.subtitle || 'Uploaded Document',
      docNumber: uploadFormData.docNumber,
      category: uploadFormData.category,
      status: 'Valid',
      statusType: 'success',
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: uploadFormData.expiryDate,
      fileSize: '1.5 MB',
      fileType: 'PDF'
    };

    addDocument(newDoc);
    setIsUploadModalOpen(false);
    setUploadFormData({ title: '', subtitle: '', docNumber: '', category: 'Registration', expiryDate: '2028-12-31' });
  };

  return (
    <div className="view-page-container">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Digital Document Vault</h2>
          <p>Secure encrypted storage for Registration, Insurance, PUC, and Driver compliance certificates.</p>
        </div>

        <button 
          className="primary-button flex-center-gap"
          style={{ width: 'auto', padding: '10px 22px' }}
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* DOCUMENT CARDS GRID */}
      <div className="documents-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-card-top">
              <div className="doc-icon-wrap">
                <FileText size={24} className="text-blue" />
              </div>
              <span className={`doc-status-badge ${doc.statusType}`}>
                {doc.statusType === 'warning' ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                <span>{doc.status}</span>
              </span>
            </div>

            <div className="doc-card-content">
              <span className="doc-cat-label">{doc.category}</span>
              <strong className="doc-title">{doc.title}</strong>
              <p className="doc-subtitle">{doc.subtitle}</p>

              <div className="doc-number-row">
                <span>Doc / Policy ID:</span>
                <strong>{doc.docNumber}</strong>
              </div>

              <div className="doc-expiry-row">
                <Calendar size={14} className="text-muted" />
                <span>Expires on: <strong>{doc.expiryDate}</strong></span>
              </div>
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
                onClick={() => alert(`Downloading verified copy of ${doc.title}...`)}
              >
                <Download size={15} />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW DOCUMENT MODAL */}
      {selectedDoc && (
        <div className="search-modal-backdrop" onClick={() => setSelectedDoc(null)}>
          <div className="search-modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="flex-center-gap">
                <ShieldCheck size={22} className="text-emerald" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedDoc.title}</h3>
              </div>
              <button className="search-modal-close" onClick={() => setSelectedDoc(null)}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div className="doc-preview-sheet">
                <div className="sheet-header">
                  <div className="sheet-logo">GOVERNMENT / INSURER PORTAL VERIFIED</div>
                  <span className="badge-good">Digital Verified Stamp</span>
                </div>

                <div className="sheet-body">
                  <div className="sheet-row">
                    <span>Document Title:</span>
                    <strong>{selectedDoc.title}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>Document ID:</span>
                    <strong>{selectedDoc.docNumber}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>Issued Date:</span>
                    <strong>{selectedDoc.issueDate}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>Expiry Date:</span>
                    <strong className="text-amber">{selectedDoc.expiryDate}</strong>
                  </div>
                  <div className="sheet-row">
                    <span>File Format & Size:</span>
                    <strong>{selectedDoc.fileType} • {selectedDoc.fileSize}</strong>
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button 
                  className="primary-button flex-center-gap"
                  onClick={() => {
                    alert(`Downloading verified copy of ${selectedDoc.title}...`);
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

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="search-modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div className="search-modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="flex-center-gap">
                <Upload size={20} className="text-blue" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Upload Compliance Certificate</h3>
              </div>
              <button className="search-modal-close" onClick={() => setIsUploadModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '20px' }}>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label>Document Title</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Road Tax Receipt or FASTag Certificate"
                    value={uploadFormData.title}
                    onChange={e => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group col-span-2">
                  <label>Issuing Authority / Subtitle</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. Transport Department"
                    value={uploadFormData.subtitle}
                    onChange={e => setUploadFormData({ ...uploadFormData, subtitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Document / Policy Number</label>
                  <input 
                    className="simple-input" 
                    placeholder="e.g. TAX-2026-90182"
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
                    <option>Registration</option>
                    <option>Insurance</option>
                    <option>Compliance</option>
                    <option>Personal ID</option>
                    <option>Warranty</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label>Expiry Date</label>
                  <input 
                    type="date" 
                    className="simple-input" 
                    value={uploadFormData.expiryDate}
                    onChange={e => setUploadFormData({ ...uploadFormData, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary-button">
                  Upload to Vault
                </button>
                <button type="button" className="outline-button" onClick={() => setIsUploadModalOpen(false)}>
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
