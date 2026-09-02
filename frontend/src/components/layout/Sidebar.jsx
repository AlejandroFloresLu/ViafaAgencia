import React from 'react';

export default function Sidebar({ isOpen, setIsOpen, activePage, setActivePage }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="icon">💳</div>
          <h2>TarjetasPro</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <h3>MIS TARJETAS</h3>
            <ul>
              <li className={activePage === 'cards' ? 'active' : ''} onClick={() => { setActivePage('cards'); setIsOpen(false); }}>Gestión de Tarjetas</li>
              <li className={activePage === 'balances' ? 'active' : ''} onClick={() => { setActivePage('balances'); setIsOpen(false); }}>Resumen de Saldos</li>
            </ul>
          </div>

          <div className="nav-group">
            <h3>OPERACIONES</h3>
            <ul>
              <li className={activePage === 'expenses' ? 'active' : ''} onClick={() => { setActivePage('expenses'); setIsOpen(false); }}>Registro de Operaciones</li>
            </ul>
          </div>

          <div className="nav-group">
            <h3>PREFERENCIAS</h3>
            <ul>
              <li className={activePage === 'settings' ? 'active' : ''} onClick={() => { setActivePage('settings'); setIsOpen(false); }}>Ajustes</li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <p>Modo Simulación Activo</p>
        </div>
      </aside>
    </>
  );
}
