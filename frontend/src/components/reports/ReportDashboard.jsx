import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

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
        
        const cardsData = cardsRes.data || cardsRes;
        setCards(cardsData);
        setTransactions(txsRes.data || txsRes);
        
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando estado de cuenta...</div>;
  if (error) return <div className="alert error-alert" style={{ margin: '2rem' }}>{error}</div>;

  const selectedCard = cards.find(c => c.tar_id === selectedCardId);
  const cardTransactions = transactions.filter(t => t.tar_id === selectedCardId);

  // Ordenar transacciones por fecha desc
  cardTransactions.sort((a, b) => new Date(b.tra_fecha || b.fecha) - new Date(a.tra_fecha || a.fecha));

  const totalUsado = selectedCard ? (parseFloat(selectedCard.tar_saldo_usado) || 0) : 0;
  const cupoMaximo = selectedCard ? (parseFloat(selectedCard.tar_cupo_maximo) || 0) : 0;
  const disponible = cupoMaximo - totalUsado;

  return (
    <div className="dashboard report-dashboard">
      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Generar Estado de Cuenta</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="form-control" 
            value={selectedCardId} 
            onChange={(e) => setSelectedCardId(e.target.value)}
            style={{ width: '250px' }}
          >
            {cards.map(c => (
              <option key={c.tar_id} value={c.tar_id}>
                {c.tar_alias || 'Tarjeta'} - **** {c.tar_ultimos_digitos}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Imprimir Estado de Cuenta
          </button>
        </div>
      </div>

      {selectedCard ? (
        <div className="printable-statement" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd', color: '#000' }}>
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
              <h2 style={{ margin: '5px 0 0 0', color: '#000' }}>${cupoMaximo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>
            <div>
              <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase' }}>Crédito Disponible</p>
              <h2 style={{ margin: '5px 0 0 0', color: '#10b981' }}>${disponible.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>SALDO A PAGAR</p>
              <h1 style={{ margin: '5px 0 0 0', color: '#ef4444' }}>${totalUsado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h1>
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
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Por favor, selecciona una tarjeta.
        </div>
      )}
    </div>
  );
}
