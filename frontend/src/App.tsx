import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { useAuthStore } from './store/authStore';

// Un componente de prueba para el dashboard protegido
const DashboardDummy = () => {
  const { logout } = useAuthStore();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>¡Bienvenido a InUPA!</h1>
      <p>Has iniciado sesión exitosamente.</p>
      <button onClick={logout} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>
        Cerrar Sesión
      </button>
    </div>
  );
};

// Rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardDummy />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
