import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFoundView() {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>404 - Page Not Found</h1>
        <p className="view-subtitle">The page you are looking for does not exist.</p>
      </div>

      <div className="feature-card flex-center" style={{ flexDirection: 'column', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>Oops! We couldn't find that page.</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          It seems you've navigated to an unknown route in AutoPulse.
        </p>
        <button className="primary-btn" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
