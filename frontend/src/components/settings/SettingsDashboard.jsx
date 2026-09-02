import React from 'react';

export default function SettingsDashboard() {
  return (
    <div className="dashboard">
      <h2 style={{ marginBottom: '1.5rem', padding: '0 20px', color: 'var(--text-color)' }}>Ajustes Generales</h2>
      
      <div style={{ padding: '0 20px', maxWidth: '800px' }}>
        
        {/* BLOQUE 1: PERFIL */}
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '25px', marginBottom: '2rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '20px' }}>Perfil de Usuario</h3>
          <div className="form-row flex justify-between" style={{ gap: '20px' }}>
            <div className="form-group flex-1">
              <label>Nombre Completo</label>
              <input type="text" className="form-control" value="Alejandro" readOnly />
            </div>
            <div className="form-group flex-1">
              <label>Correo Electrónico</label>
              <input type="email" className="form-control" value="alejandro@empresa.com" readOnly />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '10px', opacity: 0.7 }}>Cambiar Contraseña</button>
        </div>

        {/* BLOQUE 2: PREFERENCIAS DEL SISTEMA */}
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '25px', marginBottom: '2rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '20px' }}>Preferencias del Sistema</h3>
          
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-color)' }}>Notificaciones Push</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Recibir alertas de saldos bajos en tiempo real.</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-color)' }}>Reportes Diarios Automáticos</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enviar un PDF al correo con el cierre del día.</p>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-color)' }}>Idioma por defecto</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Idioma de la interfaz para este usuario.</p>
            </div>
            <select className="form-control" style={{ width: '150px' }}>
              <option>Español (ES)</option>
              <option>English (US)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
