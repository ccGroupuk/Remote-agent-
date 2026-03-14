import React from 'react';

export default function QuickCommands() {
    const handleCommand = (cmd) => {
        console.log(`Command dispatched via Connect RPC: ${cmd}`);
        // Connect RPC payload dispatch logic
    };

    return (
        <div className="quick-commands">
            <div className="cmd-grid">
                <button className="cmd-btn" onClick={() => handleCommand('fix-build')}>[Fix Build]</button>
                <button className="cmd-btn" onClick={() => handleCommand('rollback')}>[Rollback]</button>
                <button className="cmd-btn" onClick={() => handleCommand('logs')}>[Check Logs]</button>
                <button className="cmd-btn danger" onClick={() => handleCommand('pause')}>[Pause Agent]</button>
            </div>
        </div>
    );
}
