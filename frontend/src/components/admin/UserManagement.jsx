import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nombre: '', correo: '', password: '', rol_id: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        apiClient('/users'),
        apiClient('/roles')
      ]);
      const safeUsers = Array.isArray(usersData) ? usersData : (usersData?.data || []);
      const safeRoles = Array.isArray(rolesData) ? rolesData : (rolesData?.data || []);
      setUsers(safeUsers);
      setRoles(safeRoles);
      if (safeRoles.length > 0) {
        setFormData(prev => ({ ...prev, rol_id: safeRoles[0].rol_id }));
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos. Verifica tu conexión o sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await apiClient('/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess('Usuario creado exitosamente');
      setFormData({ nombre: '', correo: '', password: '', rol_id: roles[0]?.rol_id || '' });
      fetchUsersAndRoles();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container">Cargando...</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h2>Gestión de Usuarios (Admin)</h2>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Crear Nuevo Usuario</h3>
        {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{success}</div>}
        
        <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre</label>
            <input 
              type="text" 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Correo</label>
            <input 
              type="email" 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
              value={formData.correo}
              onChange={e => setFormData({...formData, correo: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña</label>
            <input 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rol</label>
            <select 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
              value={formData.rol_id}
              onChange={e => setFormData({...formData, rol_id: e.target.value})}
            >
              {roles.map(r => (
                <option key={r.rol_id} value={r.rol_id}>{r.rol_nombre} (Nivel {r.rol_nivel})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Crear Usuario</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3>Usuarios Registrados</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '0.5rem' }}>Nombre</th>
              <th style={{ padding: '0.5rem' }}>Correo</th>
              <th style={{ padding: '0.5rem' }}>Rol</th>
              <th style={{ padding: '0.5rem' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.usu_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.5rem' }}>{u.usu_nombre}</td>
                <td style={{ padding: '0.5rem' }}>{u.usu_correo}</td>
                <td style={{ padding: '0.5rem' }}>{u.roles?.rol_nombre}</td>
                <td style={{ padding: '0.5rem' }}>{u.usu_estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
