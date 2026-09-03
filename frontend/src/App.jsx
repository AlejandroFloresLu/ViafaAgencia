import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import ExpenseDashboard from './components/expenses/ExpenseDashboard';
import UserManagement from './components/admin/UserManagement';
import AppLayout from './components/layout/AppLayout';
import './App.css';

import CardDashboard from './components/cards/CardDashboard';
import BalanceDashboard from './components/balances/BalanceDashboard';
import SettingsDashboard from './components/settings/SettingsDashboard';
import ReportDashboard from './components/reports/ReportDashboard';

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
        element={<Navigate to="/expenses" replace />} 
      />

      <Route 
        path="/expenses" 
        element={
          <ProtectedRoute minLevel={4}>
            <AppLayout>
              <ExpenseDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/cards" 
        element={
          <ProtectedRoute minLevel={4}>
            <AppLayout>
              <CardDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/balances" 
        element={
          <ProtectedRoute minLevel={4}>
            <AppLayout>
              <BalanceDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute minLevel={4}>
            <AppLayout>
              <SettingsDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/reports" 
        element={
          <ProtectedRoute minLevel={4}>
            <AppLayout>
              <ReportDashboard />
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
