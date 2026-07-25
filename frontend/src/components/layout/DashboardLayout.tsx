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
  Bell,
  Menu,
  X,
  ChevronDown,
  CheckCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { notificationsService } from "../../services/notifications.service";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ofertas", href: "/dashboard/empleos", icon: Briefcase },
  { name: "Postulaciones", href: "/dashboard/postulaciones", icon: Send },
  { name: "Red", href: "/dashboard/networking", icon: Users },
  { name: "Mi CV", href: "/dashboard/cv-builder", icon: FileText },
];

type Notif = { id: string; title: string; desc: string; time: string; read: boolean };

const tiempoRel = (iso: string) => {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    notificationsService
      .list()
      .then((data) =>
        setNotifs(
          (data?.notificaciones ?? []).map((n: any) => ({
            id: n.id, title: n.titulo, desc: n.mensaje, time: tiempoRel(n.created_at), read: n.leida,
          }))
        )
      )
      .catch(() => {});
  }, []);

  const markAllRead = async () => {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    try { await notificationsService.markAllRead(); } catch { /* optimista */ }
  };
  const markRead = async (id: string) => {
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await notificationsService.markRead(id); } catch { /* optimista */ }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === path : location.pathname.startsWith(path);

  const iniciales = user?.nombre_completo
    ? user.nombre_completo.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "US";

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="bg-[#003366] text-[#FFD700] rounded-xl p-2"><GraduationCap className="size-5" /></div>
              <span className="font-bold text-xl text-[#003366] hidden sm:inline tracking-tight">InUPA</span>
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
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen((v) => !v)}
                className="relative flex items-center justify-center size-9 rounded-lg text-[#7F8C8D] hover:text-[#2C3E50] hover:bg-[#F5F7FA] transition-colors">
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-4 bg-[#E74C3C] rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F7FA]">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#2C3E50]">Notificaciones</p>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-[#E74C3C] text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#003366] font-semibold hover:underline">
                          <CheckCheck className="size-3" />Marcar todas
                        </button>
                      )}
                    </div>
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F5F7FA]">
                      {notifs.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs text-[#7F8C8D]">No tienes notificaciones por ahora</div>
                      )}
                      {notifs.map((n) => (
                        <div key={n.id} onClick={() => markRead(n.id)}
                          className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${n.read ? "hover:bg-[#FAFAFA]" : "bg-[#F0F6FF] hover:bg-[#E8F0FC]"}`}>
                          <div className="size-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#E8F0FC]">
                            <Bell className="size-4 text-[#003366]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p className={`text-xs font-bold leading-tight ${n.read ? "text-[#7F8C8D]" : "text-[#2C3E50]"}`}>{n.title}</p>
                              {!n.read && <div className="size-2 rounded-full bg-[#003366] flex-shrink-0 mt-1" />}
                            </div>
                            <p className="text-[11px] text-[#7F8C8D] mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                            <p className="text-[10px] text-[#7F8C8D]/60 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

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
