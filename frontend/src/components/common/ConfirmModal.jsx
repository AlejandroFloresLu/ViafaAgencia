import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions flex justify-between" style={{ marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          {/* BOTÓN ROJO DESTRUCTIVO: Único lugar donde se permite según AGENTS.md */}
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar Definitivamente</button>
        </div>
      </div>
    </div>
  );
}
