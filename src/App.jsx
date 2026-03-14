import React, { useState } from 'react';
import WebAuthnGuard from './components/WebAuthnGuard';
import WebSocketTunnel from './components/WebSocketTunnel';
import ActionGateModal from './components/ActionGateModal';
import RailwayOrb from './components/RailwayOrb';
import QuickCommands from './components/QuickCommands';
import RemoteControl from './components/RemoteControl';
import './App.css';

function App() {
  const [isActionGateOpen, setActionGateOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [view, setView] = useState('remote'); // Defaulting to the new Mobile Remote Control

  // Stub function to trigger the Action Gate for UI testing
  const simulatePermissionRequest = () => {
    setCurrentRequest({ action: 'Delete Database', target: 'Railway Production DB' });
    setActionGateOpen(true);
  };

  return (
    <WebAuthnGuard>
      {view === 'remote' ? (
        <RemoteControl />
      ) : (
        <div className="adr-container">
          <header className="adr-header">
            <h1>ADR <span className="highlight">TERMINAL</span></h1>
            <RailwayOrb />
            <button
              onClick={() => setView('remote')}
              className="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded text-xs"
            >
              Open Mobile Remote
            </button>
          </header>

          <main className="adr-main">
            <WebSocketTunnel />
          </main>

          <footer className="adr-footer">
            <QuickCommands />
            <button className="btn dev-btn trigger-test" onClick={simulatePermissionRequest}>
              Test Action Gate UI
            </button>
          </footer>

          <ActionGateModal
            isOpen={isActionGateOpen}
            request={currentRequest}
            onAuthorize={() => setActionGateOpen(false)}
            onDeny={() => setActionGateOpen(false)}
          />
        </div>
      )}
    </WebAuthnGuard>
  );
}

export default App;
