import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Users, Search, Loader2, ShieldCheck, Ban, CheckCircle2 } from "lucide-react";
import { adminService, type AdminUser } from "../../../services/admin.service";

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const cargar = () => { setLoading(true); adminService.listUsers().then(setUsuarios).catch(() => setUsuarios([])).finally(() => setLoading(false)); };
  useEffect(() => { cargar(); }, []);

  const toggleActivo = async (u: AdminUser) => { await adminService.updateUser(u.id, { activo: !u.activo }); cargar(); };

  const filtrados = usuarios.filter((u) =>
    (u.nombre_completo + u.correo_institucional).toLowerCase().includes(q.toLowerCase())
  );
  const activos = usuarios.filter((u) => u.activo).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Usuarios registrados</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">{usuarios.length} usuarios · {activos} activos · {usuarios.length - activos} suspendidos</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
        <Input placeholder="Buscar por nombre o correo..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-10 rounded-xl border-[#E5E7EB] text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : (
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5F7FA] text-left text-xs text-[#7F8C8D] uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Correo</th>
                  <th className="px-5 py-3 font-semibold">Rol</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id} className="border-b border-[#F5F7FA] last:border-0 hover:bg-[#FAFAFA]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-[#003366] flex items-center justify-center text-white text-xs font-bold">
                          {u.nombre_completo.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C3E50]">{u.nombre_completo}</p>
                          <p className="text-xs text-[#7F8C8D]">{u.matricula_o_rfc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#7F8C8D]">{u.correo_institucional}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.rol === "admin" ? "bg-[#003366]/[0.08] text-[#003366]" : "bg-[#F5F7FA] text-[#7F8C8D]"}`}>
                        {u.rol === "admin" && <ShieldCheck className="size-3" />}{u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.activo ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{u.activo ? "Activo" : "Suspendido"}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => toggleActivo(u)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${u.activo ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}>
                        {u.activo ? <><Ban className="size-3.5" />Suspender</> : <><CheckCircle2 className="size-3.5" />Activar</>}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-[#7F8C8D]"><Users className="size-6 mx-auto mb-2" />No hay usuarios.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
