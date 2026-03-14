import React from 'react';

export default function RemoteControl() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-green-400 p-4 relative overflow-hidden">
            <div className="scanline"></div>
            <h1 className="text-2xl font-bold mb-4 z-10">Mobile Remote Control</h1>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm z-10">
                <button className="p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-lg active:scale-95 transition-transform">
                    Fix Build
                </button>
                <button className="p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-lg active:scale-95 transition-transform text-red-500">
                    Rollback
                </button>
                <button className="p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-lg active:scale-95 transition-transform col-span-2">
                    Check Logs
                </button>
            </div>
        </div>
    );
}
