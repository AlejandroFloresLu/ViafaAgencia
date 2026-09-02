import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import './Balances.css';

export default function BalanceDashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const cardsRes = await apiClient('/cards');
      const safeCards = Array.isArray(cardsRes) ? cardsRes : (cardsRes?.data || []);
      setCards(safeCards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCupo = cards.reduce((sum, card) => sum + (Number(card.tar_cupo_maximo) || 0), 0);
  const totalUsado = cards.reduce((sum, card) => sum + (Number(card.tar_saldo_usado) || 0), 0);
  const totalDisponible = cards.reduce((sum, card) => sum + (Number(card.tar_saldo_disponible) || 0), 0);

  // Heurística de colores (Niveles de Alerta sin saturar)
  const getProgressColor = (usado, cupo) => {
    if (!cupo) return 'var(--primary)';
    const pct = (usado / cupo) * 100;
    if (pct >= 90) return 'var(--danger)'; // Rojo (Alerta Máxima)
    if (pct >= 50) return '#f59e0b'; // Naranja/Amarillo (Precaución)
    return 'var(--primary)'; // Azul (Todo OK)
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Cargando saldos...</div>;

  return (
    <div className="dashboard balance-dashboard">
      <h2 style={{ marginBottom: '2rem', padding: '0 20px', color: 'var(--text-color)' }}>Resumen Gerencial de Saldos</h2>
      
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
  );
}
