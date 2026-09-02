import React from 'react';

export default function CardList({ cards, onAddNew, onEdit, onDelete, onViewHistory }) {
  return (
    <div className="card-list-container dashboard">
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', padding: '0 20px' }}>
        <h2>Mis Tarjetas</h2>
        <button className="btn btn-primary" onClick={onAddNew}>
          + Nueva Tarjeta
        </button>
      </div>
      
      <div className="search-box" style={{ padding: '0 20px', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar tarjeta por alias o número..." 
            style={{
              width: '100%',
              padding: '12px 15px 12px 45px',
              borderRadius: '25px',
              border: '1px solid #ddd',
              background: '#f8f9fa',
              color: '#333',
              fontSize: '1rem',
              outline: 'none'
            }} 
          />
        </div>
      </div>
      
      <div className="cards-grid" style={{ padding: '0 20px' }}>
        {cards.map(card => (
          <div key={card.id} className="card-grid-item">
            <div className="card-grid-header flex justify-between items-center">
              <span className="brand">{card.franquicia || 'Visa'}</span>

            </div>
            
            <div className="card-grid-number">
              **** **** **** {card.ultimos_digitos || card.numero?.slice(-4) || '0000'}
            </div>
            
            <div className="card-grid-details flex justify-between">
              <div className="flex-col">
                <span className="label">Alias</span>
                <span className="value">{card.alias || 'Sin Alias'}</span>
              </div>
              <div className="flex-col" style={{ textAlign: 'right' }}>
                <span className="label">Expira</span>
                <span className="value">{card.fecha_expiracion || 'MM/YY'}</span>
              </div>
            </div>

            <div className="card-actions flex justify-between" style={{ marginTop: '15px' }}>
              <div className="flex" style={{ gap: '10px' }}>
                <button className="btn-icon text-primary" onClick={() => onEdit(card)} aria-label="Editar" title="Editar">
                  ✏️
                </button>
                <button className="btn-icon danger-icon" onClick={() => onDelete(card)} aria-label="Eliminar" title="Eliminar">
                  🗑️
                </button>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '0.85rem', padding: '6px 12px', background: 'var(--glass-bg)', border: '1px solid var(--btn-primary)', color: 'var(--btn-primary)', fontWeight: 'bold' }}
                onClick={() => onViewHistory(card)}
              >
                Ver Movimientos
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No hay tarjetas registradas.</p>
        )}
      </div>
    </div>
  );
}
