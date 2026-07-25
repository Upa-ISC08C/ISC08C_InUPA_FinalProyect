import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { name: "Panel", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Empresas", href: "/admin/empresas", icon: Building2, exact: false },
  { name: "Vacantes", href: "/admin/vacantes", icon: Briefcase, exact: false },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users, exact: false },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const iniciales = user?.nombre_completo
    ? user.nombre_completo.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "AD";

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#001A33] text-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFD700] text-[#003366] rounded-xl p-2">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="font-bold text-base tracking-tight leading-none">InUPA</p>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="size-2.5 text-[#FFD700]" />
              <span className="text-[10px] text-[#FFD700] font-semibold uppercase tracking-widest">
                Administrador
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold px-3 mb-3">
          Gestión
        </p>
        {navItems.map(({ name, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? "bg-white/[0.1] text-white"
                  : "text-white/55 hover:text-white hover:bg-white/[0.06]"
                }
              `}
            >
              <Icon className={`size-4 flex-shrink-0 ${active ? "text-[#FFD700]" : ""}`} />
              {name}
              {active && <ChevronRight className="size-3.5 ml-auto text-white/30" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="size-8 rounded-full bg-[#FFD700] text-[#003366] flex items-center justify-center text-xs font-bold flex-shrink-0">
            {iniciales}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.nombre_completo || "Administrador"}</p>
            <p className="text-xs text-white/40 truncate">{user?.correo_institucional || "admin@upa.edu.mx"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 flex-shrink-0 min-h-screen">
        <div className="fixed top-0 left-0 w-56 h-screen">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-56 lg:hidden transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#001A33] text-white px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FFD700] text-[#003366] rounded-lg p-1.5">
              <GraduationCap className="size-4" />
            </div>
            <span className="font-bold text-sm">InUPA Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="size-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}