import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Search,
  Users,
  GraduationCap,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Settings2,
  X,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { usersService, type User } from "../../../features/user/usersService";

const carreras = [
  "Todas",
  "Ingeniería en Computación",
  "Ing. en Sistemas Empresariales",
  "Ingeniería en Nanotecnología",
  "Ingeniería en Logística",
  "Ing. en Mecatrónica",
];

function CvScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#27AE60" : score >= 60 ? "#FFD700" : "#E74C3C";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold w-7 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterCarrera, setFilterCarrera] = useState("Todas");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "config">("view");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers();
      setUsuarios(response.data || []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = usuarios.filter((u: any) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.nombre_completo?.toLowerCase().includes(q) ||
      u.correo_institucional?.toLowerCase().includes(q);
    const matchEstado = filterEstado === "todos" || u.activo === (filterEstado === "activo");
    return matchSearch && matchEstado;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleEstado = async (id: string, currentEstado: boolean) => {
    try {
      await usersService.updateUser(id, { activo: !currentEstado });
      loadUsuarios();
      const u = usuarios.find((u) => u.id === id);
      if (u) {
        const next = currentEstado ? "suspendido" : "activo";
        showToast(`${u.nombre_completo} ahora está ${next}`);
      }
    } catch (error) {
      alert("Error al actualizar estado");
      console.error(error);
    }
  };

  const handleResetPassword = (u: User) => {
    showToast(`Correo de restablecimiento enviado a ${u.correo_institucional}`);
    setSelectedUser(null);
  };

  const activos = usuarios.filter((u: any) => u.activo).length;
  const suspendidos = usuarios.filter((u: any) => !u.activo).length;

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-[#7F8C8D]">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Usuarios registrados</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">
          {usuarios.length} usuarios · {activos} activos · {suspendidos} suspendidos
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total usuarios", value: usuarios.length, icon: Users, color: "#003366" },
          { label: "Activos", value: activos, icon: CheckCircle2, color: "#27AE60" },
          { label: "Suspendidos", value: suspendidos, icon: ShieldAlert, color: "#E74C3C" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 flex items-center gap-4">
              <div
                className="size-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon className="size-5" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C3E50]">{value}</p>
                <p className="text-xs text-[#7F8C8D]">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-[#E5E7EB] text-sm"
          />
        </div>
        <Select value={filterCarrera} onValueChange={setFilterCarrera}>
          <SelectTrigger className="w-56 h-10 rounded-xl border-[#E5E7EB] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {carreras.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-36 h-10 rounded-xl border-[#E5E7EB] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Suspendidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users table card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F7FA] bg-[#FAFAFA]">
                <th className="text-left text-xs font-bold text-[#7F8C8D] uppercase tracking-wide px-5 py-3">
                  Usuario
                </th>
                <th className="text-left text-xs font-bold text-[#7F8C8D] uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                  Carrera
                </th>
                <th className="text-left text-xs font-bold text-[#7F8C8D] uppercase tracking-wide px-4 py-3">
                  Correo
                </th>
                <th className="text-center text-xs font-bold text-[#7F8C8D] uppercase tracking-wide px-4 py-3">
                  Estado
                </th>
                <th className="text-right text-xs font-bold text-[#7F8C8D] uppercase tracking-wide px-5 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F7FA]">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-[#003366]">
                        {u.nombre_completo?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2C3E50] truncate">
                          {u.nombre_completo || "Sin nombre"}
                        </p>
                        <p className="text-xs text-[#7F8C8D] truncate">{u.matricula_o_rfc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-xs text-[#2C3E50] font-medium max-w-[180px] truncate">
                      {u.perfil?.carrera || "Sin carrera"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-[#7F8C8D] truncate">{u.correo_institucional}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => toggleEstado(u.id, u.activo)}
                      className={`
                        inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border
                        ${u.activo
                          ? "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC] hover:bg-[#BBF7D0]"
                          : "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5] hover:bg-[#FECACA]"
                        } transition-colors
                      `}
                    >
                      {u.activo
                        ? <><CheckCircle2 className="size-2.5" />Activo</>
                        : <><XCircle className="size-2.5" />Suspendido</>
                      }
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedUser(u); setDialogMode("view"); }}
                        className="size-7 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:text-[#003366] hover:bg-[#F5F7FA] transition-colors"
                        title="Ver perfil"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        onClick={() => { setSelectedUser(u); setDialogMode("config"); }}
                        className="size-7 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:text-[#003366] hover:bg-[#F5F7FA] transition-colors"
                        title="Configurar"
                      >
                        <Settings2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="size-10 text-[#D1D5DB] mb-3" />
              <p className="text-[#2C3E50] font-semibold">No se encontraron usuarios</p>
              <p className="text-sm text-[#7F8C8D] mt-1">Intenta con otra búsqueda o filtro</p>
            </div>
          )}
        </div>
      </Card>

      {/* User detail / config dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        {selectedUser && (
          <DialogContent className="max-w-lg rounded-2xl p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold text-[#2C3E50]">
                  {dialogMode === "view" ? "Perfil del usuario" : "Configuración del usuario"}
                </DialogTitle>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 bg-[#003366]">
                  {(selectedUser as any).nombre_completo?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C3E50]">
                    {(selectedUser as any).nombre_completo || "Sin nombre"}
                  </h3>
                  <p className="text-sm text-[#7F8C8D]">{(selectedUser as any).perfil?.carrera || "Sin carrera"}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`
                        inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border
                        ${(selectedUser as any).activo
                          ? "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]"
                          : "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]"
                        }
                      `}
                    >
                      {(selectedUser as any).activo ? "Activo" : "Suspendido"}
                    </span>
                  </div>
                </div>
              </div>

              {dialogMode === "view" ? (
                <div className="space-y-3">
                  {[
                    { icon: Mail, label: "Correo institucional", value: (selectedUser as any).correo_institucional },
                    { icon: GraduationCap, label: "Matrícula", value: (selectedUser as any).matricula_o_rfc },
                    { icon: Calendar, label: "Fecha de registro", value: new Date((selectedUser as any).created_at).toLocaleDateString("es-MX") },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FA]">
                      <Icon className="size-4 text-[#7F8C8D] flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#7F8C8D] uppercase tracking-wide font-semibold">{label}</p>
                        <p className="text-sm text-[#2C3E50] font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#E5E7EB] space-y-3">
                    <p className="text-sm font-bold text-[#2C3E50]">Estado de la cuenta</p>
                    <div className="flex gap-2">
                      {(["activo", "suspendido"] as const).map((estado) => (
                        <button
                          key={estado}
                          onClick={() => {
                            toggleEstado((selectedUser as any).id, (selectedUser as any).activo);
                            setSelectedUser((prev) => prev ? { ...prev, activo: estado === "activo" } : prev);
                          }}
                          className={`
                            flex-1 h-9 rounded-xl text-sm font-semibold border-2 transition-all capitalize
                            ${((selectedUser as any).activo && estado === "activo") || (!(selectedUser as any).activo && estado === "suspendido")
                              ? estado === "activo"
                                ? "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]"
                                : "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]"
                              : "border-[#E5E7EB] text-[#7F8C8D] hover:bg-[#F5F7FA]"
                            }
                          `}
                        >
                          {estado === "activo" ? "Activo" : "Suspendido"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E5E7EB] space-y-3">
                    <p className="text-sm font-bold text-[#2C3E50]">Seguridad</p>
                    <button
                      onClick={() => handleResetPassword(selectedUser as User)}
                      className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#2C3E50] hover:bg-[#F5F7FA] transition-colors"
                    >
                      <KeyRound className="size-4 text-[#7F8C8D]" />
                      Restablecer contraseña
                    </button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C3E50] text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="size-4 text-[#27AE60]" />
          {toast}
        </div>
      )}
    </div>
  );
}