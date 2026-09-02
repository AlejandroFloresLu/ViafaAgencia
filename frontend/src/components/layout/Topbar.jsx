import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ toggleSidebar }) {
  const [isLightMode, setIsLightMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cargar preferencia de tema al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left flex items-center">
        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Menú">
          ☰
        </button>
      </div>

      <div className="topbar-actions">
        {/* Botón de alternar tema Claro/Oscuro */}
        <button className="icon-btn" onClick={toggleTheme} aria-label="Cambiar Tema" title="Cambiar Tema">
          {isLightMode ? '🌙' : '☀️'}
        </button>

        <button className="icon-btn" aria-label="Notificaciones">
          🔔
          <span className="badge">2</span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">{user?.nombre?.substring(0, 2).toUpperCase() || 'AD'}</div>
          <div className="user-info">
            <span className="name" style={{ color: 'var(--text-color)' }}>{user?.nombre || 'Cargando...'}</span>
            <span className="role" style={{ color: 'var(--text-muted)' }}>
              Nivel: {user?.rol_nivel}
            </span>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ marginLeft: '10px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
