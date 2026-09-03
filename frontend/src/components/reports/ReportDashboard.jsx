import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function ReportDashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await apiClient('/cards');
        setCards(response.data || response);
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Cargando estado de cuenta...</div>;
  if (error) return <div className="alert error-alert" style={{ margin: '2rem' }}>{error}</div>;

  const totalCupo = cards.reduce((acc, c) => acc + (parseFloat(c.tar_cupo_maximo) || 0), 0);
  const totalUsado = cards.reduce((acc, c) => acc + (parseFloat(c.tar_saldo_usado) || 0), 0);
  const totalDisponible = totalCupo - totalUsado;

  return (
    <div className="dashboard report-dashboard">
      <h2 style={{ marginBottom: '1.5rem', padding: '0 20px', color: 'var(--text-color)' }}>
        📊 Estado de Cuenta Global
      </h2>

      <div className="expenses-grid" style={{ paddingTop: 0, display: 'block' }}>
        {/* Resumen Global */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: 'var(--sidebar-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total a Pagar (Usado)</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              ${totalUsado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ flex: 1, background: 'var(--sidebar-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Crédito Disponible Total</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              ${totalDisponible.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ flex: 1, background: 'var(--sidebar-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cupo Máximo Total</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
              ${totalCupo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Desglose por Tarjeta */}
        <h3 style={{ borderBottom: 'none', marginBottom: '1rem' }}>Desglose por Tarjeta</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {cards.map(card => {
            const porcentajeUsado = card.tar_cupo_maximo ? Math.min(100, ((card.tar_saldo_usado || 0) / card.tar_cupo_maximo) * 100) : 0;
            return (
              <div key={card.tar_id} style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--input-border)' }}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{card.tar_alias || 'Sin Alias'}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {card.tar_franquicia || 'Visa'} **** {card.tar_ultimos_digitos || '0000'}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Usado a Pagar:</span>
                  <span style={{ fontWeight: 'bold', color: '#ef4444' }}>${(card.tar_saldo_usado || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Disponible:</span>
                  <span style={{ fontWeight: 'bold', color: '#10b981' }}>${(card.tar_cupo_maximo - (card.tar_saldo_usado || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div style={{ height: '6px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${porcentajeUsado}%`, 
                    background: porcentajeUsado > 90 ? '#ef4444' : '#3b82f6'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
