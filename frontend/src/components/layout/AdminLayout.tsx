import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  GraduationCap, LayoutDashboard, Building2, Users, Briefcase,
  Menu, X, LogOut, Shield, ChevronRight, Moon, Sun,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { name: "Panel", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Empresas", href: "/admin/empresas", icon: Building2, exact: false },
  { name: "Vacantes", href: "/admin/vacantes", icon: Briefcase, exact: false },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users, exact: false },
];

const THEME_KEY = "inupa_admin_theme";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem(THEME_KEY) === "dark");

  // Persistimos la preferencia de tema (solo dentro del admin).
  useEffect(() => { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); }, [dark]);

  // Cerramos el drawer al navegar.
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/"); };
  const iniciales = user?.nombre_completo
    ? user.nombre_completo.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "AD";

  const isActive = (href: string, exact: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Topbar fija con hamburguesa (en todos los tamaños) */}
        <header className="sticky top-0 z-30 h-14 bg-[#001A33] text-white flex items-center justify-between px-3 sm:px-5 shadow-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              className="size-9 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-[#FFD700] text-[#003366] rounded-lg p-1.5"><GraduationCap className="size-4" /></div>
              <div className="leading-none">
                <span className="font-bold text-sm">InUPA</span>
                <span className="hidden sm:inline text-[10px] text-[#FFD700] font-semibold uppercase tracking-widest ml-2">Administrador</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDark((v) => !v)}
              aria-label="Cambiar tema"
              className="size-9 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-white/15">
              <div className="size-8 rounded-full bg-[#FFD700] text-[#003366] flex items-center justify-center text-xs font-bold">{iniciales}</div>
              <div className="min-w-0 max-w-[160px]">
                <p className="text-xs font-semibold truncate">{user?.nombre_completo || "Administrador"}</p>
                <p className="text-[10px] text-white/50 truncate">{user?.correo_institucional}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Overlay del drawer */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer lateral (hamburguesa) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[82vw] bg-[#001A33] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFD700] text-[#003366] rounded-xl p-2"><GraduationCap className="size-5" /></div>
              <div>
                <p className="font-bold text-base tracking-tight leading-none">InUPA</p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="size-2.5 text-[#FFD700]" />
                  <span className="text-[10px] text-[#FFD700] font-semibold uppercase tracking-widest">Administrador</span>
                </div>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú" className="size-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"><X className="size-5" /></button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold px-3 mb-3">Gestión</p>
            {navItems.map(({ name, href, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-white/[0.1] text-white translate-x-0.5" : "text-white/55 hover:text-white hover:bg-white/[0.06] hover:translate-x-0.5"}`}
                >
                  <Icon className={`size-4 flex-shrink-0 ${active ? "text-[#FFD700]" : ""}`} />
                  {name}
                  {active && <ChevronRight className="size-3.5 ml-auto text-white/30" />}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-white/10 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <div className="size-8 rounded-full bg-[#FFD700] text-[#003366] flex items-center justify-center text-xs font-bold flex-shrink-0">{iniciales}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.nombre_completo || "Administrador"}</p>
                <p className="text-xs text-white/40 truncate">{user?.correo_institucional || "admin@upa.edu.mx"}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/[0.06] transition-all">
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
