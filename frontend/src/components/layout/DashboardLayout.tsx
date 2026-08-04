import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Send,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../hooks/useTheme";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ofertas", href: "/dashboard/empleos", icon: Briefcase },
  { name: "Empresas", href: "/dashboard/empresas", icon: Users },
  { name: "Mi Perfil / CV", href: "/dashboard/perfil", icon: FileText },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Mismo tema que el panel de administrador (se guarda en <html>).
  const { dark, setDark } = useTheme();

  const handleLogout = () => { logout(); navigate("/"); };

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === path : location.pathname.startsWith(path);

  const iniciales = user?.nombre_completo
    ? user.nombre_completo.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "US";

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-950 transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-[#E5E7EB] dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="bg-[#003366] text-[#FFD700] rounded-xl p-2"><GraduationCap className="size-5" /></div>
              <span className="font-bold text-xl text-[#003366] dark:text-white hidden sm:inline tracking-tight">InUPA</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} to={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? "bg-[#003366]/[0.07] text-[#003366]" : "text-[#7F8C8D] hover:text-[#2C3E50] hover:bg-[#F5F7FA]"
                    }`}>
                    <Icon className={`size-4 ${active ? "text-[#FFD700]" : ""}`} />
                    {item.name}
                    {active && <span className="size-1.5 rounded-full bg-[#FFD700] ml-0.5" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Modo claro / oscuro */}
            <button
              onClick={() => setDark(!dark)}
              aria-label="Cambiar tema"
              title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="flex items-center justify-center size-9 rounded-lg text-[#7F8C8D] dark:text-slate-300 hover:text-[#2C3E50] dark:hover:text-white hover:bg-[#F5F7FA] dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-[#F5F7FA] transition-colors">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.url_foto || ""} alt={user?.nombre_completo || ""} />
                    <AvatarFallback className="bg-[#003366] text-white text-xs font-semibold">{iniciales}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-[#2C3E50] leading-none">{user?.nombre_completo?.split(" ")[0] || "Usuario"}</p>
                    <p className="text-xs text-[#7F8C8D] leading-none mt-0.5">{user?.matricula_o_rfc || "Estudiante"}</p>
                  </div>
                  <ChevronDown className="size-3.5 text-[#7F8C8D] hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user?.nombre_completo || "Usuario"}</p>
                    <p className="text-xs leading-none text-[#7F8C8D] font-normal">{user?.correo_institucional || ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard/perfil">Mi perfil</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[#E74C3C]" onSelect={handleLogout}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="md:hidden flex items-center justify-center size-9 rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-[#003366]/[0.07] text-[#003366]" : "text-[#7F8C8D] hover:text-[#2C3E50] hover:bg-[#F5F7FA]"
                    }`}>
                    <Icon className={`size-4 ${active ? "text-[#FFD700]" : ""}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
