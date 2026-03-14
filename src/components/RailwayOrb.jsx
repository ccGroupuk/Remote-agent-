import React, { useState, useEffect } from 'react';

export default function RailwayOrb() {
    const [status, setStatus] = useState('stable'); // 'stable' | 'building' | 'failed'

    useEffect(() => {
        // Stub to poll Railway API
        const pollStatus = setInterval(() => {
            // Simulate real-time polling
            // setStatus(fetchedStatus);
        }, 10000);
        return () => clearInterval(pollStatus);
    }, []);

    const orbClass = status === 'stable' ? 'green-pulse' :
        status === 'building' ? 'yellow-spin' : 'red-flash';

    return (
        <div className="railway-orb-container">
            <div className={`orb ${orbClass}`}></div>
            <span className="orb-label">RAILWAY: {status.toUpperCase()}</span>
        </div>
    );
}
