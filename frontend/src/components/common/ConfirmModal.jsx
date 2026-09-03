import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, type = 'danger', showCancel = true, confirmText = 'Aceptar' }) {
  if (!isOpen) return null;
  
  // Determinar color del botón según el tipo
  let btnClass = 'btn-primary';
  if (type === 'danger') btnClass = 'btn-danger';
  if (type === 'success') btnClass = 'btn-primary'; // Podría ser btn-success si existiera, pero primary está bien para aceptar
  if (type === 'warning') btnClass = 'btn-primary';
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{
          color: type === 'danger' ? 'var(--danger)' : 
                 type === 'success' ? '#10b981' : 
                 type === 'warning' ? '#f59e0b' : 'inherit'
        }}>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions flex justify-between" style={{ marginTop: '2rem', justifyContent: showCancel ? 'space-between' : 'center' }}>
          {showCancel && <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>}
          <button className={`btn ${btnClass}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
