import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./app/pages/auth/LoginPage";
import { useAuthStore } from "./store/authStore";

// Layouts
import { DashboardLayout } from "./app/layouts/DashboardLayout";
import { AdminLayout } from "./app/layouts/AdminLayout";

// Pages - Estudiante/Dashboard
import { Dashboard } from "./app/pages/Dashboard";
import { JobBoard } from "./app/pages/JobBoard";
import { Postulaciones } from "./app/pages/Postulaciones";
import { Networking } from "./app/pages/Networking";

// Pages - Admin
import { AdminDashboard } from "./app/pages/admin/AdminDashboard";
import { AdminVacantes } from "./app/pages/admin/AdminVacantes";
import { AdminEmpresas } from "./app/pages/admin/AdminEmpresas";
import { AdminUsuarios } from "./app/pages/admin/AdminUsuarios";

// Placeholders
const CVBuilder = () => <div className="p-8 text-center text-[#7F8C8D]">Constructor de CV (Próximamente)</div>;
const ProfilePage = () => <div className="p-8 text-center text-[#7F8C8D]">Mi Perfil (Próximamente)</div>;

// Rutas protegidas (para estudiantes)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Rutas protegidas (solo para admin)
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.rol === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Rutas de Estudiante/Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="empleos" element={<JobBoard />} />
          <Route path="postulaciones" element={<Postulaciones />} />
          <Route path="networking" element={<Networking />} />
          <Route path="cv-builder" element={<CVBuilder />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>

        {/* Rutas de Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="vacantes" element={<AdminVacantes />} />
          <Route path="empresas" element={<AdminEmpresas />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;