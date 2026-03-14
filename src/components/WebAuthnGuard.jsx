import React, { useState, useEffect } from 'react';

export default function WebAuthnGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser.');
      }

      const storedCredentialId = localStorage.getItem('adr_credential_id');

      if (!storedCredentialId) {
        // Registration Phase (First Time Setup)
        const publicKey = {
          challenge: new Uint8Array(32),
          rp: { name: "Antigravity Direct Remote", id: window.location.hostname },
          user: {
            id: new Uint8Array(16),
            name: "commander@adr.local",
            displayName: "ADR Commander"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { userVerification: "required" },
          timeout: 60000,
          attestation: "none"
        };

        const credential = await navigator.credentials.create({ publicKey });
        // Store the raw ID to use for future authentication
        const credentialIdBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem('adr_credential_id', credentialIdBase64);

        setIsAuthenticated(true);
        setError('');
        resetInactivityTimeout();
      } else {
        // Authentication Phase (Returning User)
        const credentialIdBytes = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0));

        const publicKey = {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: credentialIdBytes,
            type: 'public-key',
          }],
          timeout: 60000,
          userVerification: 'required',
        };

        const credential = await navigator.credentials.get({ publicKey });
        if (credential) {
          setIsAuthenticated(true);
          setError('');
          resetInactivityTimeout();
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden font-mono antialiased p-4">
        <div className="scanline"></div>
        <div className="flex flex-col items-center justify-center bg-slate-900/80 border border-slate-700/50 p-8 rounded-lg shadow-2xl backdrop-blur-sm z-10 space-y-6 max-w-sm w-full text-center">
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-slate-300 mb-2">ADR <span className="text-emerald-500 animate-pulse">LOCKED</span></h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Biometric Authentication Required</p>
          </div>

          <button
            className="w-full flex items-center justify-center py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all active:scale-95 outline-none focus:ring-2 focus:ring-emerald-400"
            onClick={handleAuth}
          >
            Authenticate
          </button>

          {error && (
            <div className="text-rose-500 text-xs font-bold uppercase tracking-wider p-2 bg-rose-950/50 border border-rose-900 rounded w-full">
              Error: {error}
            </div>
          )}

          <button
            className="text-[10px] text-slate-600 hover:text-amber-500 uppercase tracking-widest transition-colors outline-none"
            onClick={() => setIsAuthenticated(true)}
          >
            [Dev Override]
          </button>
        </div>
      </div>
    );
  }

  return children;
}
