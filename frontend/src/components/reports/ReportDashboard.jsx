import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import '../balances/Balances.css'; // Reutilizamos los estilos del balance

export default function ReportDashboard() {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsRes, txsRes] = await Promise.all([
          apiClient('/cards'),
          apiClient('/transactions')
        ]);
        
        const cardsData = Array.isArray(cardsRes) ? cardsRes : (cardsRes?.data || []);
        const txsData = Array.isArray(txsRes) ? txsRes : (txsRes?.data || []);
        
        setCards(cardsData);
        setTransactions(txsData);
        
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrintCard = (cardId) => {
    setSelectedCardId(cardId);
    // Necesitamos un setTimeout mínimo para que React renderice la sección oculta antes de imprimir
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getProgressColor = (usado, cupo) => {
    if (!cupo) return 'var(--primary)';
    const pct = (usado / cupo) * 100;
    if (pct >= 90) return 'var(--danger)'; 
    if (pct >= 50) return '#f59e0b'; 
    return 'var(--primary)';
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Cargando saldos y movimientos...</div>;
  if (error) return <div className="alert alert-error" style={{ margin: '2rem' }}>{error}</div>;

  const totalCupo = cards.reduce((sum, card) => sum + (Number(card.tar_cupo_maximo) || 0), 0);
  const totalUsado = cards.reduce((sum, card) => sum + (Number(card.tar_saldo_usado) || 0), 0);
  const totalDisponible = cards.reduce((sum, card) => sum + (Number(card.tar_saldo_disponible) || 0), 0);

  const selectedCard = cards.find(c => c.tar_id === selectedCardId);
  const cardTransactions = transactions.filter(t => t.tar_id === selectedCardId);
  cardTransactions.sort((a, b) => new Date(b.tra_fecha || b.fecha) - new Date(a.tra_fecha || a.fecha));

  const printCupoMaximo = selectedCard ? (parseFloat(selectedCard.tar_cupo_maximo) || 0) : 0;
  const printTotalUsado = selectedCard ? (parseFloat(selectedCard.tar_saldo_usado) || 0) : 0;
  const printDisponible = printCupoMaximo - printTotalUsado;

  return (
    <div className="dashboard balance-dashboard">
      <div className="no-print">
        <h2 style={{ marginBottom: '2rem', padding: '0 20px', color: 'var(--text-color)' }}>Estados de Cuenta</h2>
        
        {/* Tarjetas KPI (Visión Macro para Gerentes) */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Cupo Total Global</span>
            <span className="kpi-value">${totalCupo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Deuda Actual</span>
            <span className="kpi-value used">${totalUsado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Liquidez Disponible</span>
            <span className="kpi-value available">${totalDisponible.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Desglose por Tarjeta (Barras de Progreso Dinámicas) */}
        <div className="balance-breakdown">
          <h3>Desglose por Tarjeta</h3>
          <div className="balance-list">
            {cards.map(card => {
              const cupo = Number(card.tar_cupo_maximo) || 0;
              const usado = Number(card.tar_saldo_usado) || 0;
              const pct = cupo ? ((usado / cupo) * 100).toFixed(1) : 0;
              const barColor = getProgressColor(usado, cupo);
              
              return (
                <div key={card.tar_id} className="balance-item">
                  <div className="balance-header flex justify-between items-center">
                    <div className="balance-title">
                      <span className="brand">{card.tar_franquicia || 'Visa'}</span>
                      <span className="number">**** {card.tar_ultimos_digitos || '0000'}</span>
                      {card.tar_alias && <span className="alias">({card.tar_alias})</span>}
                    </div>
                    <div className="balance-amounts" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        <span className="used">${usado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className="separator"> / </span>
                        <span className="total">${cupo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => handlePrintCard(card.tar_id)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        🖨️ Imprimir
                      </button>
                    </div>
                  </div>
                  
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: barColor }}></div>
                  </div>
                  
                  <div className="progress-stats flex justify-between">
                    <span className="pct-text" style={{ color: pct >= 90 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {pct}% Utilizado
                    </span>
                    <span className="avail-text">Disponible: ${(Number(card.tar_saldo_disponible) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              );
            })}
            {cards.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>No hay tarjetas registradas para mostrar saldos.</p>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENTO IMPRIMIBLE OCULTO EN PANTALLA */}
      <div className="printable-statement" style={{ display: 'none', background: '#fff', padding: '2rem', color: '#000' }}>
        {selectedCard && (
          <>
            {/* Header del Estado de Cuenta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#000' }}>ESTADO DE CUENTA</h1>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>Fecha de Emisión: {new Date().toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, color: '#000' }}>{selectedCard.tar_alias || 'Tarjeta de Crédito'}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>{selectedCard.tar_franquicia || 'Visa'} Terminada en **** {selectedCard.tar_ultimos_digitos}</p>
                <p style={{ margin: '2px 0 0 0', color: '#555' }}>Titular: {selectedCard.tar_nombre_titular || 'Usuario'}</p>
              </div>
            </div>

            {/* Resumen de Saldos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase' }}>Cupo Máximo</p>
                <h2 style={{ margin: '5px 0 0 0', color: '#000' }}>${printCupoMaximo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase' }}>Crédito Disponible</p>
                <h2 style={{ margin: '5px 0 0 0', color: '#10b981' }}>${printDisponible.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>SALDO A PAGAR</p>
                <h1 style={{ margin: '5px 0 0 0', color: '#ef4444' }}>${printTotalUsado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h1>
              </div>
            </div>

            {/* Tabla de Movimientos */}
            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#000' }}>
              Movimientos Registrados
            </h3>
            
            {cardTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777', padding: '2rem 0' }}>No hay transacciones registradas para esta tarjeta.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#000' }}>
                <thead>
                  <tr style={{ background: '#f1f1f1', borderBottom: '2px solid #ccc' }}>
                    <th style={{ padding: '10px' }}>FECHA</th>
                    <th style={{ padding: '10px' }}>CONCEPTO / DETALLE</th>
                    <th style={{ padding: '10px' }}>TIPO</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>VALOR</th>
                  </tr>
                </thead>
                <tbody>
                  {cardTransactions.map(tx => {
                    const isIngreso = tx.tra_tipo === 'ingreso' || tx.tipo === 'ingreso';
                    const amount = parseFloat(tx.tra_monto || tx.monto || 0);
                    
                    return (
                      <tr key={tx.tra_id || tx.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{new Date(tx.tra_fecha || tx.fecha || tx.tra_created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '10px' }}>{tx.tra_detalle || tx.detalle} {tx.tra_es_diferido ? `(Dif. ${tx.tra_meses} meses)` : ''}</td>
                        <td style={{ padding: '10px' }}>{isIngreso ? 'ABONO/PAGO' : 'CARGO/GASTO'}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: isIngreso ? '#10b981' : '#ef4444' }}>
                          {isIngreso ? '-' : ''}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            
            {/* Footer del estado de cuenta */}
            <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #ddd', textAlign: 'center', color: '#777', fontSize: '0.85rem' }}>
              <p>Este documento es de uso exclusivamente informativo y refleja los saldos registrados hasta la fecha de emisión.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
