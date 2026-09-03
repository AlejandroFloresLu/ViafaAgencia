import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardForm from './CardForm';
import CardPreview from './CardPreview';
import CardList from './CardList';
import ConfirmModal from '../common/ConfirmModal';
import TransactionHistory from './TransactionHistory';
import apiClient from '../../api/apiClient';
import './Cards.css';

export default function CardDashboard() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState('list'); // 'list' | 'form'
  const [selectedCard, setSelectedCard] = useState(null);
  
  // States para borrar Tarjeta
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // States para Historial
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCardId, setHistoryCardId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cardsRes, txsRes] = await Promise.all([
        apiClient('/cards'),
        apiClient('/transactions')
      ]);
      setCards(cardsRes.data || cardsRes || []);
      setTransactions(txsRes.data || txsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- LOGICA DE TARJETAS ----------
  const handleAddNew = () => {
    setSelectedCard({
      numero: '',
      nombre_en_tarjeta: '',
      fecha_expiracion: '',
      cvv: '',
      alias: '',
      es_predeterminada: false,
      franquicia: ''
    });
    setCurrentView('form');
  };

  const handleEdit = (card) => {
    setSelectedCard(card);
    setCurrentView('form');
  };

  const handleDeleteRequest = (card) => {
    setCardToDelete(card);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (cardToDelete) {
      try {
        await apiClient(`/cards/${cardToDelete.tar_id}`, { method: 'DELETE' });
        setCards(cards.filter(c => c.tar_id !== cardToDelete.tar_id));
      } catch (err) {
        console.error('Error eliminando tarjeta:', err);
        alert('Error eliminando tarjeta: ' + err.message);
      }
    }
    setIsModalOpen(false);
    setCardToDelete(null);
  };

  const handleSaveForm = async (newCardData) => {
    try {
      const payload = {
        alias: newCardData.tar_alias || newCardData.alias,
        nombre: newCardData.tar_nombre_titular || newCardData.nombre_en_tarjeta,
        numero: newCardData.numero, // Solo se usa al crear
        fechaExp: newCardData.tar_fecha_expiracion || newCardData.fecha_expiracion,
        franquicia: newCardData.tar_franquicia || newCardData.marca_tarjeta,
        tipo: newCardData.tar_tipo || newCardData.tipo_tarjeta,
        cupo: Number(newCardData.tar_cupo_maximo || newCardData.cupo_maximo) || 0,
        permite_diferir: newCardData.tar_permite_diferir ?? newCardData.permite_diferir
      };

      if (newCardData.tar_id) {
        // Asume que tu backend soporta PUT /api/cards/:id
        await apiClient(`/cards/${newCardData.tar_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiClient('/cards', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      
      // Recargar la lista de tarjetas desde el servidor
      const cardsRes = await apiClient('/cards');
      setCards(cardsRes.data || cardsRes || []);
      setCurrentView('list');
    } catch (err) {
      console.error('Error guardando tarjeta:', err);
      alert('Error guardando tarjeta: ' + err.message);
    }
  };

  const openHistory = (card) => {
    setHistoryCardId(card.tar_id || card.id);
    setIsHistoryOpen(true);
  };

  // ---------- RENDER ----------
  if (currentView === 'form') {
    return (
      <CardFormContainer 
        initialData={selectedCard} 
        onSave={handleSaveForm} 
        onCancel={() => setCurrentView('list')} 
      />
    );
  }

  return (
    <>
      <CardList 
        cards={cards} 
        onAddNew={handleAddNew} 
        onEdit={handleEdit} 
        onDelete={handleDeleteRequest} 
        onViewHistory={openHistory}
      />

      <ConfirmModal 
        isOpen={isModalOpen}
        title="¿Eliminar Tarjeta?"
        message={cardToDelete ? `Estás a punto de eliminar la tarjeta terminada en ${cardToDelete.numero?.slice(-4) || cardToDelete.ultimos_digitos}. Esta acción no se puede deshacer.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => { setIsModalOpen(false); setCardToDelete(null); }}
      />

      {isHistoryOpen && (
        <TransactionHistory 
          cards={cards} 
          setCards={setCards} 
          transactions={transactions} 
          setTransactions={setTransactions} 
          userRole={"Gerente"} 
          onEditTx={(tx) => {
            setIsHistoryOpen(false);
            navigate('/expenses', { state: { txToEdit: tx } });
          }}
          initialCardId={historyCardId}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </>
  );
}

// Sub-componente para envolver Form y Preview juntos
function CardFormContainer({ initialData, onSave, onCancel }) {
  // Mapeamos los datos de la base de datos a los nombres de campos que usa el formulario temporalmente
  // Si initialData existe, estamos editando
  const formInitialState = initialData ? {
    ...initialData,
    numero: initialData.numero || '', // En DB no tenemos numero completo, quedará vacío para que no editen
    nombre_en_tarjeta: initialData.tar_nombre_titular || '',
    fecha_expiracion: initialData.tar_fecha_expiracion || '',
    cupo_maximo: initialData.tar_cupo_maximo || '',
    alias: initialData.tar_alias || '',
    tipo_tarjeta: initialData.tar_tipo || '',
    marca_tarjeta: initialData.tar_franquicia || '',
    permite_diferir: initialData.tar_permite_diferir || false,
  } : null;

  const [cardData, setCardData] = useState(formInitialState || initialData);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="grid-left">
          <CardForm 
            cardData={cardData} 
            setCardData={setCardData} 
            handleSave={() => onSave(cardData)} 
            handleCancel={onCancel}
          />
        </div>
        <div className="grid-right">
          <CardPreview cardData={cardData} />
        </div>
      </div>
    </div>
  );
}
