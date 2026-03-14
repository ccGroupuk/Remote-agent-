import React from 'react';

export default function ActionGateModal({ isOpen, request, onAuthorize, onDeny }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title alert-text">PERMISSION REQUESTED</h2>
                <div className="request-details">
                    <p><strong>Action:</strong> {request?.action || 'Unknown Action'}</p>
                    <p><strong>Target:</strong> {request?.target || 'System'}</p>
                    <p className="risk-level">Risk Level: HIGH</p>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-massive neon-green" onClick={onAuthorize}>
                        AUTHORIZE
                    </button>
                    <button className="btn btn-massive crimson" onClick={onDeny}>
                        DENY / ABORT
                    </button>
                </div>
            </div>
        </div>
    );
}
