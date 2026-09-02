import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import ExpenseDashboard from './components/expenses/ExpenseDashboard';
import UserManagement from './components/admin/UserManagement';
import AppLayout from './components/layout/AppLayout';
import './App.css';

const ProtectedRoute = ({ children, minLevel }) => {
  const { user, loading, hasAccess } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (minLevel && !hasAccess(minLevel)) {
    // Si no tiene el nivel necesario, redirigir al dashboard general o mostrar un error
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas genéricas (Lectores o más) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute minLevel={4}>
            <AppLayout>
              <ExpenseDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Gestión de Usuarios para Nivel 1 */}
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute minLevel={1}>
            <AppLayout>
              <UserManagement />
            </AppLayout>
          </ProtectedRoute>
        } 
      /> 
      
      <Route path="*" element={<div>404 No Encontrado</div>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
