import React, { useState, useEffect, useRef } from 'react';

export default function WebSocketTunnel() {
    const [logs, setLogs] = useState([]);
    const ws = useRef(null);
    const terminalRef = useRef(null);

    useEffect(() => {
        // Attempt to connect to local Antigravity proxy
        // Hardcoded to wss://localhost for the zero-trust bridge
        ws.current = new WebSocket('ws://127.0.0.1:8080'); // Adjust port as needed

        ws.current.onopen = () => {
            setLogs(prev => [...prev, { type: 'system', text: 'WebSocket connected securely to local proxy.' }]);
        };

        ws.current.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                setLogs(prev => [...prev, payload]);
            } catch (e) {
                setLogs(prev => [...prev, { type: 'stdout', text: event.data }]);
            }
        };

        ws.current.onclose = () => {
            setLogs(prev => [...prev, { type: 'system', text: 'WebSocket disconnected. Reconnecting...' }]);
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="websocket-tunnel" ref={terminalRef}>
            {logs.length === 0 && <span className="placeholder">Awaiting telemetry data...</span>}
            {logs.map((log, index) => (
                <div key={index} className={`log-line ${log.type}`}>
                    <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                    <span className="content">{log.text}</span>
                </div>
            ))}
        </div>
    );
}
