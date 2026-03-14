import React, { useState, useEffect, useRef } from 'react';
import { Activity, TerminalSquare, Rocket, ShieldAlert, Cpu } from 'lucide-react';

export default function RemoteControl() {
    const [heartbeat, setHeartbeat] = useState('offline'); // 'connected' | 'reconnecting' | 'offline'
    const [logs, setLogs] = useState([
        { id: 1, type: 'system', text: 'Initializing Antigravity Telemetry Protocol...' }
    ]);
    const [tunnelUrl, setTunnelUrl] = useState('');
    const [deploying, setDeploying] = useState(false);

    const terminalRef = useRef(null);
    const ws = useRef(null);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    // Establish WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            setHeartbeat('reconnecting');
            // Defaulting to local proxy; this can be made dynamic later
            ws.current = new WebSocket('ws://127.0.0.1:8080');

            ws.current.onopen = () => {
                setHeartbeat('connected');
                setLogs(prev => [...prev, { id: Date.now(), type: 'system', text: 'WebSocket connected securely to proxy.' }]);
            };

            ws.current.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    setLogs(prev => [...prev, { id: Date.now(), ...payload }]);
                } catch (e) {
                    setLogs(prev => [...prev, { id: Date.now(), type: 'stdout', text: event.data }]);
                }
            };

            ws.current.onclose = () => {
                setHeartbeat('offline');
                setLogs(prev => [...prev, { id: Date.now(), type: 'system', text: 'WebSocket disconnected. Retrying in 5s...' }]);
                setTimeout(connectWebSocket, 5000);
            };

            ws.current.onerror = () => {
                setHeartbeat('offline');
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const sendCommand = (cmd) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: cmd }));
            setLogs(prev => [...prev, { id: Date.now(), type: 'system', text: `Command dispatched: ${cmd}` }]);
        } else {
            setLogs(prev => [...prev, { id: Date.now(), type: 'system', text: 'Error: Tunnel not connected.' }]);
        }
    };

    const handleDeploy = async () => {
        if (!tunnelUrl) return alert('Enter a valid tunnel URL.');
        setDeploying(true);
        setLogs(prev => [...prev, { id: Date.now(), type: 'system', text: `Initiating deployment sequence to ${tunnelUrl}...` }]);

        try {
            const response = await fetch(tunnelUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ trigger: 'deploy', source: 'ADR_Remote' })
            });

            if (response.ok) {
                setLogs(prev => [...prev, { id: Date.now(), type: 'success', text: 'Deployment command dispatched via webhook successfully!' }]);
            } else {
                throw new Error(`Webhook failed with status: ${response.status}`);
            }
        } catch (error) {
            setLogs(prev => [...prev, { id: Date.now(), type: 'system', text: `Deployment Error: ${error.message}` }]);
        } finally {
            setDeploying(false);
        }
    };

    const heartbeatColor = heartbeat === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
        : heartbeat === 'reconnecting' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
            : 'bg-red-500 shadow-[0_0_10px_#ef4444]';

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden font-mono antialiased">
            {/* Scanline Overlay */}
            <div className="scanline"></div>

            {/* Header / Heartbeat */}
            <header className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-md z-10">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                    <h1 className="text-xl font-bold tracking-widest text-emerald-400">ADR <span className="text-slate-500">REMOTE</span></h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 tracking-wider">TUNNEL LINK</span>
                    <div className={`w-3 h-3 rounded-full ${heartbeatColor} transition-all duration-300`}></div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 gap-4 z-10 max-w-2xl mx-auto w-full">

                {/* Agent Terminal */}
                <section className="flex flex-col flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 p-2 bg-slate-800/80 border-b border-slate-700">
                        <TerminalSquare className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-sm font-bold text-emerald-500 tracking-wider uppercase">Live Telemetry</h2>
                    </div>
                    <div
                        ref={terminalRef}
                        className="flex-1 p-3 overflow-y-auto space-y-1 text-xs sm:text-sm h-[300px]"
                    >
                        {logs.map((log) => (
                            <div key={log.id} className="break-words leading-relaxed">
                                <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                <span className={
                                    log.type === 'metric' ? 'text-amber-400' :
                                        log.type === 'system' ? 'text-blue-400' :
                                            log.type === 'success' ? 'text-emerald-400 font-bold' :
                                                log.type === 'stdout' ? 'text-slate-300' :
                                                    'text-emerald-500' // 'thought'
                                }>
                                    {log.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Dashboard Controls Grid */}
                <section className="grid grid-cols-2 gap-3">
                    <button onClick={() => sendCommand('fix-build')} className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-lg active:scale-95 transition-all outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-800 z-10">
                        <Cpu className="w-6 h-6 mb-2 text-slate-400" />
                        <span className="text-xs uppercase font-bold text-slate-300">Fix Build</span>
                    </button>
                    <button onClick={() => sendCommand('rollback')} className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-rose-900/30 rounded-lg shadow-lg active:scale-95 transition-all outline-none focus:ring-2 focus:ring-rose-500 hover:bg-slate-800 z-10">
                        <Activity className="w-6 h-6 mb-2 text-rose-500" />
                        <span className="text-xs uppercase font-bold text-rose-500">Rollback</span>
                    </button>
                </section>

                {/* Deployment Pipeline */}
                <section className="flex flex-col bg-slate-900/80 border border-slate-700 rounded-lg p-3 shadow-xl mt-auto z-10">
                    <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">n8n Pipeline</span>
                    </div>
                    <input
                        type="url"
                        placeholder="Enter Tunnel URL / Webhook Target..."
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-400 placeholder-slate-600 rounded p-3 mb-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        value={tunnelUrl}
                        onChange={(e) => setTunnelUrl(e.target.value)}
                    />
                    <button
                        onClick={handleDeploy}
                        disabled={deploying}
                        className={`w-full flex items-center justify-center gap-2 p-4 rounded text-white font-bold tracking-widest uppercase transition-all shadow-lg ${deploying ? 'bg-rose-900 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 active:scale-[0.98]'
                            }`}
                    >
                        <Rocket className={`w-5 h-5 ${deploying ? 'animate-bounce' : ''}`} />
                        {deploying ? 'Deploying...' : 'Deploy Now'}
                    </button>
                </section>

            </main>
        </div>
    );
}
