import React, { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';

export default function TransactionHistory({ cards, setCards, transactions, setTransactions, userRole, onEditTx, initialCardId, onClose }) {
  const [historyCardId, setHistoryCardId] = useState(initialCardId || (cards.length > 0 ? cards[0].id : null));
  const [searchTerm, setSearchTerm] = useState('');
  
  // States para borrar Operación
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleDeleteTxRequest = (tx) => {
    setTxToDelete(tx);
    setIsTxModalOpen(true);
  };

  const confirmDeleteTx = () => {
    if (txToDelete) {
      const updatedCards = cards.map(c => {
        if (c.id === txToDelete.cardId) {
          return {
            ...c,
            saldo_usado: (c.saldo_usado || 0) - txToDelete.monto,
            saldo_disponible: (c.saldo_disponible || 0) + txToDelete.monto
          };
        }
        return c;
      });
      setCards(updatedCards);
      setTransactions(transactions.filter(t => t.id !== txToDelete.id));
      setSuccessMsg('Gasto eliminado y fondos devueltos.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    setIsTxModalOpen(false);
    setTxToDelete(null);
  };

  const filteredTransactions = transactions.filter(t => {
    if (t.cardId !== historyCardId) return false;
    if (searchTerm) {
      return t.detalle.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%', maxWidth: '850px',
        maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '16px',
        padding: '30px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Header del Modal */}
        <div className="flex justify-between items-center" style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>Movimientos de la Tarjeta</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.8rem', color: '#888', cursor: 'pointer' }}>&times;</button>
        </div>

        {successMsg && <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px' }}>{successMsg}</div>}

        {/* Controles: Diseño idéntico a la Imagen 1 pero solo con el Buscador */}
        <div className="flex justify-center" style={{ marginBottom: '30px' }}>
          
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>
              BUSCAR EN ESTA TARJETA:
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Buscar transacción por concepto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        </div>

        {/* Lista de Movimientos */}
        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '20px', border: '1px solid #eee' }}>
          {filteredTransactions.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px 0', margin: 0 }}>No hay movimientos para mostrar.</p>
          ) : (
            filteredTransactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center" style={{ background: '#fff', border: '1px solid #eee', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', gap: '15px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1' }}>
                  <span style={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}>{tx.detalle}</span>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>{tx.date} • {tx.tipo} • Autor: {tx.autor}</span>
                </div>

                <div className="text-right" style={{ minWidth: '150px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                    -${tx.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  
                  {/* Controles: Diseño idéntico a la Imagen 2 */}
                  {userRole === 'Gerente' && (
                    <div className="flex justify-end" style={{ gap: '15px' }}>
                      <button 
                        onClick={() => onEditTx(tx)} 
                        style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: '500' }}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteTxRequest(tx)} 
                        style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: '500' }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

        <ConfirmModal 
          isOpen={isTxModalOpen}
          title="¿Eliminar Operación?"
          message="¿Estás seguro? El monto será devuelto matemáticamente al saldo disponible de la tarjeta."
          onConfirm={confirmDeleteTx}
          onCancel={() => setIsTxModalOpen(false)}
        />

      </div>
    </div>
  );
}
