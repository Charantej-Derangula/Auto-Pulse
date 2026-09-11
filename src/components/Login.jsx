import React, { useState } from 'react';
import { 
  Zap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Gauge, 
  CheckCircle2,
  Car
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('charantej@autopulse.io');
  const [password, setPassword] = useState('autopulse2026');
  const [name, setName] = useState('Charantej');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your email and password.');
      return;
    }

    setIsLoading(true);

    // Realistic authentication flow simulation
    setTimeout(() => {
      setIsLoading(false);
      // Extract first name or use provided name
      const cleanName = name.trim() || email.split('@')[0];
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      login({
        name: capitalized,
        email: email.trim(),
        role: 'Car Enthusiast'
      });
    }, 850);
  };

  const handleDemoSignIn = (demoName, demoEmail) => {
    setName(demoName);
    setEmail(demoEmail);
    setPassword('demoPass123');
  };

  return (
    <div className="login-screen">
      {/* Background Animated Gradient Mesh & Grid */}
      <div className="login-bg-mesh"></div>
      <div className="login-grid-pattern"></div>

      <div className="login-card-container">
        {/* Left Branding Showcase */}
        <div className="login-branding-panel">
          <div className="login-brand-logo">
            <div className="brand-icon pulse">
              <Zap size={28} />
            </div>
            <div>
              <h2>AUTO<span>PULSE</span></h2>
              <p>Automotive Intelligence & Fleet Suite</p>
            </div>
          </div>

          <div className="login-hero-copy">
            <h3>Intelligent Vehicle Telemetry & Garage Management.</h3>
            <p>
              Real-time component health tracking, smart fault diagnosis, scheduled maintenance automation, and digital document compliance.
            </p>
          </div>

          <div className="login-feature-list">
            <div className="login-feat-item">
              <ShieldCheck size={18} className="text-emerald" />
              <span>Predictive subsystem diagnostic analytics</span>
            </div>
            <div className="login-feat-item">
              <Gauge size={18} className="text-blue" />
              <span>Real-time fuel efficiency & running cost metrics</span>
            </div>
            <div className="login-feat-item">
              <Car size={18} className="text-cyan" />
              <span>Multi-vehicle telemetry & digital glovebox</span>
            </div>
          </div>

          <div className="login-footer-quote">
            "Drive Smarter. Stay Ahead."
          </div>
        </div>

        {/* Right Form Card */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h3>Welcome Back</h3>
            <p>Sign in to access your garage telemetry & vehicle dashboard</p>
          </div>

          {error && (
            <div className="login-error-alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  placeholder="e.g. Charantej"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@autopulse.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input with-pad"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">
                  Forgot Password?
                </a>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input with-pad"
                  required
                />
                <button
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="login-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner-row">
                  <span className="spinner-dot"></span>
                  <span>Authenticating Auto Pulse Session...</span>
                </div>
              ) : (
                <div className="flex-center-gap">
                  <span>Sign In to Garage Dashboard</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="demo-accounts-strip">
            <span className="demo-strip-label">Quick Sign-in Personas:</span>
            <div className="demo-pills">
              <button 
                type="button" 
                className="demo-pill"
                onClick={() => handleDemoSignIn('Charantej', 'charantej@autopulse.io')}
              >
                Charantej
              </button>
              <button 
                type="button" 
                className="demo-pill"
                onClick={() => handleDemoSignIn('Rahul', 'rahul.verma@autopulse.io')}
              >
                Rahul
              </button>
              <button 
                type="button" 
                className="demo-pill"
                onClick={() => handleDemoSignIn('Priya', 'priya.sharma@autopulse.io')}
              >
                Priya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
