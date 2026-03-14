import React, { useState, useEffect } from 'react';

export default function WebAuthnGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser.');
      }
      
      const publicKey = {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: 'required',
      };
      
      const credential = await navigator.credentials.get({ publicKey });
      if (credential) {
        setIsAuthenticated(true);
        setError('');
        resetInactivityTimeout();
      }
    } catch (err) {
      // For development purposes, allow fallback or show error
      setError(err.message || 'Authentication failed');
      // Uncomment to bypass in dev:
      // setIsAuthenticated(true);
    }
  };

  // Aggressive Session Timeout (5 minutes)
  const resetInactivityTimeout = () => {
    if (window.inactivityTimeout) clearTimeout(window.inactivityTimeout);
    window.inactivityTimeout = setTimeout(() => {
      setIsAuthenticated(false);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousemove', 'keydown', 'touchstart'];
      events.forEach(e => window.addEventListener(e, resetInactivityTimeout));
      return () => events.forEach(e => window.removeEventListener(e, resetInactivityTimeout));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="auth-guard">
        <h1 className="title">ADR <span className="neon-text">LOCKED</span></h1>
        <p className="subtitle">Biometric Authentication Required</p>
        <button className="btn btn-massive neon-green" onClick={handleAuth}>
          UNLOCK
        </button>
        {error && <p className="error">{error}</p>}
        {/* DEV ONLY BUTTON */}
        <button className="btn dev-btn" onClick={() => setIsAuthenticated(true)}>Bypass (Dev Only)</button>
      </div>
    );
  }

  return children;
}
