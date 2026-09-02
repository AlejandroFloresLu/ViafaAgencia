import React, { useState, useEffect } from 'react';

export default function Topbar({ toggleSidebar, userRole, setUserRole }) {
  const [isLightMode, setIsLightMode] = useState(false);

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
          <div className="avatar">AL</div>
          <div className="user-info">
            <span className="name" style={{ color: 'var(--text-color)' }}>Alejandro</span>
            <span 
              className="role" 
              style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--btn-primary)' }}
              onClick={() => setUserRole(userRole === 'Gerente' ? 'Auxiliar' : 'Gerente')}
              title="Clic para cambiar de rol"
            >
              Rol: {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
