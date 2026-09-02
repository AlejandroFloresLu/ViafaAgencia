import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { hasAccess } = useAuth();

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
              <li><NavLink to="/cards" onClick={() => setIsOpen(false)}>Gestión de Tarjetas</NavLink></li>
              <li><NavLink to="/balances" onClick={() => setIsOpen(false)}>Resumen de Saldos</NavLink></li>
            </ul>
          </div>

          <div className="nav-group">
            <h3>OPERACIONES</h3>
            <ul>
              <li><NavLink to="/expenses" onClick={() => setIsOpen(false)}>Registro de Operaciones</NavLink></li>
            </ul>
          </div>

          {/* Menú exclusivo para el Administrador (Nivel 1) */}
          {hasAccess(1) && (
            <div className="nav-group">
              <h3>ADMINISTRACIÓN</h3>
              <ul>
                <li><NavLink to="/admin/users" onClick={() => setIsOpen(false)}>Gestión de Usuarios</NavLink></li>
              </ul>
            </div>
          )}

          <div className="nav-group">
            <h3>PREFERENCIAS</h3>
            <ul>
              <li><NavLink to="/settings" onClick={() => setIsOpen(false)}>Ajustes</NavLink></li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <p>Modo Online Activo</p>
        </div>
      </aside>
    </>
  );
}
