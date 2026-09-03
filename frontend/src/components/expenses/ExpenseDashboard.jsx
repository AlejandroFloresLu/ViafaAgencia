import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Expenses.css';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

export default function ExpenseDashboard() {
  const { user, isAdmin, isGestor, isAuxiliar, isLector } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // States para Datos Reales
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txToEdit, setTxToEdit] = useState(location.state?.txToEdit || null);
  
  // States para "Nuevo Registro"
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [monto, setMonto] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState('gasto'); // 'gasto' o 'ingreso'
  const [diferido, setDiferido] = useState(false);
  const [meses, setMeses] = useState(3);
  const [detalle, setDetalle] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsRes, txsRes] = await Promise.all([
          apiClient('/cards'),
          apiClient('/transactions')
        ]);
        // Ajustar según la estructura de tu backend ({ data, total })
        const cardsData = cardsRes.data || cardsRes;
        const txsData = txsRes.data || txsRes;
        
        setCards(cardsData);
        setTransactions(txsData);
        // No auto-seleccionar tarjeta para forzar el flujo intuitivo
      } catch (err) {
        setError('Error cargando datos: ' + err.message);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Si nos pasan un txToEdit, lo cargamos
  useEffect(() => {
    if (txToEdit) {
      setSelectedCardId(txToEdit.tar_id);
      setMonto((txToEdit.tra_monto || txToEdit.monto || 0).toString());
      setTipoOperacion(txToEdit.tra_tipo || txToEdit.tipo || 'gasto');
      setDetalle(txToEdit.tra_detalle || txToEdit.detalle || '');
      
      // Intentar extraer la fecha en formato YYYY-MM-DD
      const fechaBase = txToEdit.tra_fecha || txToEdit.date;
      if (fechaBase) {
        const fechaParseada = new Date(fechaBase);
        if (!isNaN(fechaParseada.getTime())) {
          setFecha(fechaParseada.toISOString().split('T')[0]);
        }
      }

      if (txToEdit.tra_es_diferido || (txToEdit.tipo && txToEdit.tipo.includes('Diferido'))) {
        setDiferido(true);
        setMeses(txToEdit.tra_meses || (txToEdit.tipo ? parseInt(txToEdit.tipo.replace(/[^0-9]/g, '')) : 3) || 3);
      } else {
        setDiferido(false);
      }
    }
  }, [txToEdit]);

  const selectedCard = cards.find(c => c.tar_id === selectedCardId);
  const montoNum = parseFloat(monto) || 0;
  
  const cuota = diferido && meses > 0 ? (montoNum / meses).toFixed(2) : montoNum.toFixed(2);
  const hasEnoughBalance = selectedCard ? (selectedCard.tar_cupo_maximo - (selectedCard.tar_saldo_usado || 0)) >= montoNum : false;

  const resetForm = () => {
    setMonto('');
    setTipoOperacion('gasto');
    setDetalle('');
    setDiferido(false);
    setMeses(3);
    setFecha(new Date().toISOString().split('T')[0]);
    if (setTxToEdit) setTxToEdit(null);
    setError('');
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleSave = async () => {
    setError('');
    setSuccessMsg('');
    
    const cardToUpdate = txToEdit ? cards.find(c => c.tar_id === txToEdit.tar_id) : selectedCard;
    
    if (!cardToUpdate) {
      setError('Selecciona una tarjeta primero.');
      return;
    }
    if (montoNum <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }
    if (!detalle.trim()) {
      setError('Añade un detalle o concepto.');
      return;
    }

    try {
      const payload = {
        tar_id: cardToUpdate.tar_id,
        tipo: tipoOperacion, // 'gasto' o 'ingreso'
        monto: montoNum,
        detalle: detalle,
        fecha: fecha,
        es_diferido: diferido,
        meses: diferido ? meses : 1,
        cuota: parseFloat(cuota)
      };

      if (txToEdit) {
        // Asumiendo que el backend soporta PUT /transactions/:id
        await apiClient(`/transactions/${txToEdit.tra_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Operación modificada con éxito.');
      } else {
        await apiClient('/transactions', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Operación registrada con éxito.');
      }
      
      // Recargar datos
      const txsRes = await apiClient('/transactions');
      setTransactions(txsRes.data || txsRes);
      
      const cardsRes = await apiClient('/cards');
      setCards(cardsRes.data || cardsRes);
      
      resetForm();
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    }
    
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="dashboard expenses-dashboard">
      <h2 style={{ marginBottom: '1.5rem', padding: '0 20px', color: 'var(--text-color)' }}>
        {txToEdit ? '✏️ Editando Operación' : 'Registro de Operaciones'}
      </h2>

      {successMsg && <div className="alert success-alert" style={{ margin: '0 20px 2rem' }}>{successMsg}</div>}

      <div className="expenses-grid" style={{ paddingTop: 0 }}>
        {/* Selector de Tarjetas */}
        <div className="expenses-left">
          <h3 style={{ borderBottom: 'none', marginBottom: '1rem' }}>Cartera de Tarjetas</h3>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', marginBottom: '1rem' }}>
            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar tarjeta..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="card-selector-list" style={{ pointerEvents: txToEdit ? 'none' : 'auto', opacity: txToEdit ? 0.6 : 1 }}>
            {cards.filter(c => (c.tar_alias || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.tar_ultimos_digitos || '').includes(searchQuery)).map(card => {
              const isSelected = card.tar_id === selectedCardId;
              const hasBalance = (card.tar_limite_credito - (card.tar_saldo_usado || 0)) >= montoNum;
              return (
                <div 
                  key={card.tar_id} 
                  className={`card-selector-item ${isSelected ? 'selected' : ''}`}
                  style={{
                    borderColor: (!hasBalance && isSelected && montoNum > 0) ? '#f59e0b' : '',
                    backgroundColor: (!hasBalance && isSelected && montoNum > 0) ? 'rgba(245, 158, 11, 0.05)' : ''
                  }}
                  onClick={() => setSelectedCardId(card.tar_id)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="brand" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{card.tar_alias || 'Sin Alias'}</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '3px 8px', 
                      background: card.permite_diferir ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                      color: card.permite_diferir ? '#3b82f6' : '#f59e0b', 
                      borderRadius: '12px', 
                      fontWeight: 'bold',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      {card.permite_diferir ? 'Corriente / Diferido' : 'Solo Corriente'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="alias" style={{ background: 'transparent', padding: 0, color: 'var(--text-color)', opacity: 0.8, border: 'none', fontSize: '0.9rem' }}>
                      {card.tar_franquicia || 'Visa'} **** {card.tar_ultimos_digitos || '0000'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center" style={{ marginTop: '0.5rem' }}>
                    <span className="avail-label">Disponible:</span>
                    <div style={{ textAlign: 'right' }}>
                      {(card.tar_cupo_maximo - (card.tar_saldo_usado || 0)) < 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '1rem', textDecoration: 'line-through', opacity: 0.7 }}>$0.00</span>
                          <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '2px', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            Sobregiro: ${Math.abs(card.tar_cupo_maximo - (card.tar_saldo_usado || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1rem' }}>
                          ${(card.tar_cupo_maximo - (card.tar_saldo_usado || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {card.tar_cupo_maximo && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>Cupo Usado</span>
                        <span>${card.tar_cupo_maximo.toLocaleString('en-US')}</span>
                      </div>
                      <div style={{ height: '6px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${Math.min(100, ((card.tar_saldo_usado || 0) / card.tar_cupo_maximo) * 100)}%`, 
                          background: (card.tar_cupo_maximo - (card.tar_saldo_usado || 0)) < 0 ? '#ef4444' : '#3b82f6',
                          transition: 'width 0.3s ease'
                        }} />
                        {(card.tar_cupo_maximo - (card.tar_saldo_usado || 0)) < 0 && (
                          <div style={{ height: '100%', flex: 1, background: '#ef4444', opacity: 0.5 }} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="expenses-right" style={{ 
          opacity: selectedCardId ? 1 : 0.4, 
          filter: selectedCardId ? 'none' : 'grayscale(80%)',
          pointerEvents: selectedCardId ? 'auto' : 'none',
          transition: 'all 0.3s ease-in-out'
        }}>
           <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
             <h3 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>Datos de la Transacción</h3>
             {txToEdit && (
               <button className="btn btn-secondary" onClick={resetForm} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                 Cancelar Edición
               </button>
             )}
          </div>

          {/* TIPO DE OPERACION (Tabs tipo Carpeta) */}
          {!(isAuxiliar && isAuxiliar()) && (
            <div className="form-tabs">
              <button 
                className={`form-tab-btn ${tipoOperacion === 'gasto' ? 'active' : ''}`}
                onClick={() => setTipoOperacion('gasto')}
              >
                Gasto / Cargo
              </button>
              <button 
                className={`form-tab-btn ${tipoOperacion === 'ingreso' ? 'active' : ''}`}
                onClick={() => { setTipoOperacion('ingreso'); setDiferido(false); }}
              >
                Ingreso / Abono
              </button>
            </div>
          )}

          <div className={`expense-form-container ${!(isAuxiliar && isAuxiliar()) ? 'has-tabs' : ''}`}>
            {error && <div className="alert error-alert">{error}</div>}

            {/* MONTO GIGANTE */}
            <div className="amount-group-underline">
              <span className="currency-symbol">$</span>
              <input 
                type="number" 
                className="form-control amount-input-massive-underline" 
                placeholder="0.00" 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                min="0" step="0.01"
              />
            </div>

            {/* CONCEPTO Y FECHA (Apilados verticalmente) */}
            <div className="stacked-fields">
              <div className="form-group-underline">
                 <label>Concepto</label>
                 <input 
                   type="text" 
                   className="form-control underline-input" 
                   placeholder="Ej. Compra de insumos" 
                   value={detalle} 
                   onChange={(e) => setDetalle(e.target.value)} 
                 />
              </div>
              <div className="form-group-underline">
                 <label>Fecha</label>
                 <input 
                   type="date" 
                   className="form-control underline-input" 
                   value={fecha} 
                   onChange={(e) => setFecha(e.target.value)} 
                 />
              </div>
            </div>

            {/* OPCIONES DE PAGO DIFERIDO */}
            {tipoOperacion === 'gasto' && selectedCard?.permite_diferir && (
              <div className="payment-mode-group" style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Modalidad de Pago</label>
                <div className="flex" style={{ gap: '0.5rem', marginBottom: diferido ? '1rem' : '0' }}>
                   <button className={`pill-btn ${!diferido ? 'active' : ''}`} onClick={() => setDiferido(false)}>Corriente</button>
                   <button className={`pill-btn ${diferido ? 'active' : ''}`} onClick={() => setDiferido(true)}>Diferido</button>
                </div>
                
                {diferido && (
                   <div className="months-selector flex items-center" style={{ gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '8px' }}>
                      {[3, 6, 9, 12, 24].map(m => (
                        <button key={m} className={`pill-btn ${meses === m ? 'active' : ''}`} onClick={() => setMeses(m)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          {m} meses
                        </button>
                      ))}
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Cuota mensual</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>${cuota}</span>
                      </div>
                   </div>
                )}
              </div>
            )}

            {/* ADVERTENCIA DE SOBREGIRO */}
            <div className="validation-status" style={{ minHeight: '24px', marginBottom: '1.5rem', textAlign: 'center' }}>
              {selectedCard && montoNum > 0 && !hasEnoughBalance && !txToEdit && (
                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
                  ⚠️ Esta operación requiere un sobregiro de ${(montoNum - (selectedCard.tar_cupo_maximo - (selectedCard.tar_saldo_usado || 0))).toLocaleString('en-US', {minimumFractionDigits:2})}
                </span>
              )}
            </div>

            {/* BOTÓN PRINCIPAL A TODO ANCHO */}
            <button className="btn btn-primary btn-massive w-full" style={{ width: '100%', borderRadius: '8px' }} onClick={handleSave} disabled={montoNum <= 0}>
              {txToEdit ? 'Guardar Cambios' : 'Registrar Operación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
