import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import '../balances/Balances.css';

export default function ReportDashboard() {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Estados para impresión
  const [printMode, setPrintMode] = useState('general'); // 'general' o 'specific'
  const [selectedCardId, setSelectedCardId] = useState('');
  const [showModal, setShowModal] = useState(false);
  
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
        
        if (cardsData.length > 0) {
          setSelectedCardId(cardsData[0].tar_id);
        }
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrintGeneral = () => {
    setPrintMode('general');
    setTimeout(() => window.print(), 100);
  };

  const handlePrintSpecific = () => {
    setPrintMode('specific');
    setShowModal(false);
    setTimeout(() => window.print(), 100);
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

  // Para impresión específica
  const selectedCard = cards.find(c => c.tar_id === selectedCardId);
  const specificTransactions = transactions.filter(t => t.tar_id === selectedCardId);
  specificTransactions.sort((a, b) => new Date(b.tra_fecha || b.fecha) - new Date(a.tra_fecha || a.fecha));
  
  // Para impresión general
  const generalTransactions = [...transactions].sort((a, b) => new Date(b.tra_fecha || b.fecha) - new Date(a.tra_fecha || a.fecha));

  const printCupoMaximo = selectedCard ? (parseFloat(selectedCard.tar_cupo_maximo) || 0) : 0;
  const printTotalUsado = selectedCard ? (parseFloat(selectedCard.tar_saldo_usado) || 0) : 0;
  const printDisponible = printCupoMaximo - printTotalUsado;

  return (
    <div className="dashboard balance-dashboard">
      <div className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 20px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-color)' }}>Estados de Cuenta</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
              🖨️ Imprimir Específico
            </button>
            <button className="btn btn-primary" onClick={handlePrintGeneral}>
              🖨️ Imprimir General
            </button>
          </div>
        </div>
        
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
                    <div className="balance-amounts">
                      <span className="used">${usado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className="separator"> / </span>
                      <span className="total">${cupo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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

      {/* Modal para Imprimir Específico */}
      {showModal && (
        <div className="modal-overlay no-print" onClick={(e) => { if (e.target.className.includes('modal-overlay')) setShowModal(false); }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3>Seleccionar Tarjeta a Imprimir</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Elige la tarjeta para generar su estado de cuenta individual.</p>
            
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <select 
                className="form-control" 
                value={selectedCardId} 
                onChange={(e) => setSelectedCardId(e.target.value)}
              >
                {cards.map(c => (
                  <option key={c.tar_id} value={c.tar_id}>
                    {c.tar_alias || 'Tarjeta'} - **** {c.tar_ultimos_digitos}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handlePrintSpecific}>🖨️ Imprimir Tarjeta</button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTO IMPRIMIBLE (Se oculta en pantalla por CSS y se muestra en impresión) */}
      <div className="printable-statement">
        {printMode === 'specific' && selectedCard && (
          <>
            {/* Header del Estado de Cuenta Específico */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem' }}>ESTADO DE CUENTA INDIVIDUAL</h1>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>Fecha de Emisión: {new Date().toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0 }}>{selectedCard.tar_alias || 'Tarjeta de Crédito'}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>{selectedCard.tar_franquicia || 'Visa'} Terminada en **** {selectedCard.tar_ultimos_digitos}</p>
                <p style={{ margin: '2px 0 0 0', color: '#555' }}>Titular: {selectedCard.tar_nombre_titular || 'Usuario'}</p>
              </div>
            </div>

            {/* Resumen de Saldos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase' }}>Cupo Máximo</p>
                <h2 style={{ margin: '5px 0 0 0' }}>${printCupoMaximo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
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
            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Movimientos Registrados</h3>
            
            {specificTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777', padding: '2rem 0' }}>No hay transacciones registradas para esta tarjeta.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f1f1', borderBottom: '2px solid #ccc' }}>
                    <th style={{ padding: '10px' }}>FECHA</th>
                    <th style={{ padding: '10px' }}>USUARIO</th>
                    <th style={{ padding: '10px' }}>CONCEPTO / DETALLE</th>
                    <th style={{ padding: '10px' }}>TIPO</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>VALOR</th>
                  </tr>
                </thead>
                <tbody>
                  {specificTransactions.map(tx => {
                    const isIngreso = tx.tra_tipo === 'ingreso' || tx.tipo === 'ingreso';
                    const amount = parseFloat(tx.tra_monto || tx.monto || 0);
                    return (
                      <tr key={tx.tra_id || tx.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{new Date(tx.tra_fecha || tx.fecha || tx.tra_created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '10px' }}>{tx.usuarios?.usu_nombre || 'Desconocido'}</td>
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
          </>
        )}

        {printMode === 'general' && (
          <>
            {/* Header del Estado de Cuenta General */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem' }}>ESTADO DE CUENTA GENERAL</h1>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>Reporte Consolidado Multitarjeta</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0 0 0', color: '#555', fontWeight: 'bold' }}>Fecha de Emisión: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Resumen de Saldos Generales */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase' }}>Cupo Máximo Consolidado</p>
                <h2 style={{ margin: '5px 0 0 0' }}>${totalCupo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase' }}>Liquidez Disponible</p>
                <h2 style={{ margin: '5px 0 0 0', color: '#10b981' }}>${totalDisponible.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>DEUDA TOTAL ACTUAL</p>
                <h1 style={{ margin: '5px 0 0 0', color: '#ef4444' }}>${totalUsado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h1>
              </div>
            </div>

            {/* Tabla de Movimientos Global */}
            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Últimos Movimientos Globales</h3>
            
            {generalTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777', padding: '2rem 0' }}>No hay transacciones registradas en el sistema.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f1f1', borderBottom: '2px solid #ccc' }}>
                    <th style={{ padding: '10px' }}>FECHA</th>
                    <th style={{ padding: '10px' }}>TARJETA</th>
                    <th style={{ padding: '10px' }}>USUARIO</th>
                    <th style={{ padding: '10px' }}>CONCEPTO / DETALLE</th>
                    <th style={{ padding: '10px' }}>TIPO</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>VALOR</th>
                  </tr>
                </thead>
                <tbody>
                  {generalTransactions.map(tx => {
                    const isIngreso = tx.tra_tipo === 'ingreso' || tx.tipo === 'ingreso';
                    const amount = parseFloat(tx.tra_monto || tx.monto || 0);
                    const cardForTx = cards.find(c => c.tar_id === tx.tar_id) || {};
                    
                    return (
                      <tr key={tx.tra_id || tx.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{new Date(tx.tra_fecha || tx.fecha || tx.tra_created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '10px' }}>{cardForTx.tar_alias || 'Tarjeta'} (****{cardForTx.tar_ultimos_digitos})</td>
                        <td style={{ padding: '10px' }}>{tx.usuarios?.usu_nombre || 'Desconocido'}</td>
                        <td style={{ padding: '10px' }}>{tx.tra_detalle || tx.detalle} {tx.tra_es_diferido ? `(Dif. ${tx.tra_meses} meses)` : ''}</td>
                        <td style={{ padding: '10px' }}>{isIngreso ? 'ABONO' : 'CARGO'}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: isIngreso ? '#10b981' : '#ef4444' }}>
                          {isIngreso ? '-' : ''}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
        
        {/* Footer del estado de cuenta */}
        <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #ddd', textAlign: 'center', color: '#777', fontSize: '0.85rem' }}>
          <p>Este documento es de uso exclusivamente informativo y refleja los saldos registrados en la plataforma TarjetasPro hasta la fecha de emisión.</p>
        </div>
      </div>
    </div>
  );
}
