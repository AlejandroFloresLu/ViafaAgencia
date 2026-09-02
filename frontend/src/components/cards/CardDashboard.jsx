import React, { useState, useEffect } from 'react';
import CardForm from './CardForm';
import CardPreview from './CardPreview';
import CardList from './CardList';
import ConfirmModal from '../common/ConfirmModal';
import TransactionHistory from './TransactionHistory';
import apiClient from '../../api/apiClient';
import './Cards.css';

export default function CardDashboard() {
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

  const confirmDelete = () => {
    if (cardToDelete) {
      setCards(cards.filter(c => c.id !== cardToDelete.id));
    }
    setIsModalOpen(false);
    setCardToDelete(null);
  };

  const handleSaveForm = (newCardData) => {
    if (newCardData.id) {
      setCards(cards.map(c => c.id === newCardData.id ? { ...c, ...newCardData } : c));
    } else {
      setCards([...cards, { ...newCardData, id: Date.now().toString() }]);
    }
    setCurrentView('list');
  };

  const openHistory = (card) => {
    setHistoryCardId(card.id);
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
          userRole={userRole} 
          onEditTx={(tx) => { setIsHistoryOpen(false); onEditTx(tx); }}
          initialCardId={historyCardId}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </>
  );
}

// Sub-componente para envolver Form y Preview juntos
function CardFormContainer({ initialData, onSave, onCancel }) {
  const [cardData, setCardData] = useState(initialData);

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
