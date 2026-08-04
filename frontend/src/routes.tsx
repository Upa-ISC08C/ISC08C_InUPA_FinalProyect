import { createBrowserRouter, Navigate, Outlet } from "react-router";
import type { ReactNode } from "react";
import { useAuthStore } from "./store/authStore";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { CVBuilder } from "./pages/cv/CVBuilder";
import { JobBoard } from "./pages/jobs/JobBoard";
import { ApplicationsPanel } from "./pages/dashboard/ApplicationsPanel";
import { ProfilePage } from "./pages/users/ProfilePage";
import { EmpresasAliadas } from "./pages/companies/EmpresasAliadas";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminEmpresas } from "./pages/admin/empresas/AdminEmpresas";
import { AdminUsuarios } from "./pages/admin/usuarios/AdminUsuarios";
import { AdminAdministradores } from "./pages/admin/usuarios/AdminAdministradores";
import { AdminVacantes } from "./pages/admin/vacantes/AdminVacantes";
import { AdminCarreras } from "./pages/admin/AdminCarreras"; // 👈 Asegúrate que la ruta coincida con donde guardes el archivo

// Solo usuarios autenticados; opcionalmente solo admins.
function RequireAuth({ adminOnly = false }: { adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (adminOnly && user?.rol !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Rutas públicas: si ya hay sesión, redirige según el rol.
function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) return <Navigate to={user?.rol === "admin" ? "/admin" : "/dashboard"} replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <PublicOnly><LoginPage /></PublicOnly> },
  { path: "/register", element: <PublicOnly><RegisterPage /></PublicOnly> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "cv-builder", Component: CVBuilder },
          { path: "empleos", Component: JobBoard },
          { path: "empresas", Component: EmpresasAliadas },
          { path: "postulaciones", Component: ApplicationsPanel },
          { path: "perfil", Component: ProfilePage },
        ],
      },
    ],
  },
  {
    element: <RequireAuth adminOnly />,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "empresas", Component: AdminEmpresas },
          { path: "vacantes", Component: AdminVacantes },
          { path: "usuarios", Component: AdminUsuarios },
          { path: "administradores", Component: AdminAdministradores },
          { path: "carreras", Component: AdminCarreras },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);