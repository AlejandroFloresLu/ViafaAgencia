import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar estado inicial desde localStorage al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Roles helpers
  const isAdmin = () => user?.rol === 'Super-Admin'; // Nivel 1
  const isGestor = () => user?.rol === 'Gestor'; // Nivel 2
  const isAuxiliar = () => user?.rol === 'Auxiliar'; // Nivel 3
  const isLector = () => user?.rol === 'Auditor'; // Nivel 4

  const hasAccess = (minLevel) => {
    if (!user) return false;
    const niveles = {
      'Super-Admin': 1,
      'Gestor': 2,
      'Auxiliar': 3,
      'Auditor': 4
    };
    return niveles[user.rol] <= minLevel;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin, isGestor, isAuxiliar, isLector, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};
