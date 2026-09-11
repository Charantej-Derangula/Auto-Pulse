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
  Car,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('charantej@autopulse.io');
  const [password, setPassword] = useState('autopulse2026');
  const [name, setName] = useState('Charantej');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError('Please provide both your email address and password.');
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email format (e.g. name@autopulse.io).');
      return;
    }

    // Safe demo authentication check: allow password length >= 6
    if (trimmedPass.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    // Realistic authentication flow simulation with Framer Motion success transition
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      const cleanName = name.trim() || trimmedEmail.split('@')[0];
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      setTimeout(() => {
        login({
          name: capitalized,
          email: trimmedEmail,
          role: 'Car Enthusiast'
        }, rememberMe);
      }, 550);
    }, 750);
  };

  return (
    <div className="login-screen">
      {/* Background Animated Gradient Mesh & Grid */}
      <div className="login-bg-mesh"></div>
      <div className="login-grid-pattern"></div>

      <motion.div 
        className="login-card-container"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left Branding Showcase */}
        <motion.div 
          className="login-branding-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="login-brand-logo">
            <motion.div 
              className="brand-icon pulse"
              whileHover={{ rotate: 12, scale: 1.05 }}
            >
              <Zap size={28} />
            </motion.div>
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
            <motion.div 
              className="login-feat-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <ShieldCheck size={18} className="text-emerald" />
              <span>Predictive subsystem diagnostic analytics</span>
            </motion.div>
            <motion.div 
              className="login-feat-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Gauge size={18} className="text-blue" />
              <span>Real-time fuel efficiency & running cost metrics</span>
            </motion.div>
            <motion.div 
              className="login-feat-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Car size={18} className="text-cyan" />
              <span>Multi-vehicle telemetry & digital glovebox</span>
            </motion.div>
          </div>

          <div className="login-footer-quote">
            "Drive Smarter. Stay Ahead."
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div 
          className="login-form-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="login-form-header">
            <h3>Welcome Back</h3>
            <p>Sign in to access your garage telemetry & vehicle dashboard</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className="login-error-alert"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  placeholder="e.g. Charantej"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="login-input with-pad"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">
                  Demo access enabled
                </a>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
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

            <motion.button 
              type="submit" 
              className="login-submit-btn" 
              disabled={isLoading || isSuccess}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSuccess ? (
                <motion.div 
                  className="flex-center-gap text-white"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <CheckCircle2 size={18} />
                  <span>Session Verified! Launching Dashboard...</span>
                </motion.div>
              ) : isLoading ? (
                <div className="loading-spinner-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="spinner-dot"></span>
                  <span>Authenticating Auto Pulse Session...</span>
                </div>
              ) : (
                <div className="flex-center-gap">
                  <span>Sign In to Garage Dashboard</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
