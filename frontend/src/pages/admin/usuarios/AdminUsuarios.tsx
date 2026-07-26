import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Users, Search, Loader2, ShieldCheck, Ban, CheckCircle2, KeyRound, MailCheck, MailX } from "lucide-react";
import { adminService, type AdminUser } from "../../../services/admin.service";
import { CARRERAS_UPA } from "../../../utils/catalogos";

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [carrera, setCarrera] = useState("");
  const [estatus, setEstatus] = useState<"todos" | "activos" | "suspendidos">("todos");
  const [aviso, setAviso] = useState("");

  const cargar = () => { setLoading(true); adminService.listUsers().then(setUsuarios).catch(() => setUsuarios([])).finally(() => setLoading(false)); };
  useEffect(() => { cargar(); }, []);

  const toggleActivo = async (u: AdminUser) => { await adminService.updateUser(u.id, { activo: !u.activo }); cargar(); };

  const resetPassword = async (u: AdminUser) => {
    setAviso("");
    try {
      const r = await adminService.resetPassword(u.id);
      setAviso(r.message || `Código de restablecimiento enviado a ${u.correo_institucional}`);
    } catch {
      setAviso("No se pudo enviar el código de restablecimiento.");
    }
  };

  const filtrados = useMemo(() => usuarios.filter((u) => {
    const matchTexto = (u.nombre_completo + u.correo_institucional + (u.matricula_o_rfc || "")).toLowerCase().includes(q.toLowerCase());
    const matchCarrera = !carrera || u.carrera === carrera;
    const matchEstatus = estatus === "todos" || (estatus === "activos" ? u.activo : !u.activo);
    return matchTexto && matchCarrera && matchEstatus;
  }), [usuarios, q, carrera, estatus]);

  const activos = usuarios.filter((u) => u.activo).length;
  const sel = "h-10 rounded-xl border border-[#E5E7EB] px-3 text-sm bg-white";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Usuarios registrados</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">{usuarios.length} usuarios · {activos} activos · {usuarios.length - activos} suspendidos</p>
      </div>

      {aviso && <div className="p-3 rounded-xl bg-[#E8F5E9] text-[#16A34A] text-sm flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0" />{aviso}</div>}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
          <Input placeholder="Buscar por nombre, correo o matrícula..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-10 rounded-xl border-[#E5E7EB] text-sm" />
        </div>
        <select className={sel} value={carrera} onChange={(e) => setCarrera(e.target.value)}>
          <option value="">Todas las carreras</option>
          {CARRERAS_UPA.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={sel} value={estatus} onChange={(e) => setEstatus(e.target.value as any)}>
          <option value="todos">Todos los estatus</option>
          <option value="activos">Activos</option>
          <option value="suspendidos">Suspendidos</option>
        </select>
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
                  <th className="px-5 py-3 font-semibold">Carrera</th>
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
                        <div className="size-9 rounded-full bg-[#003366] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                          {u.url_foto ? <img src={u.url_foto} alt="" className="size-full object-cover" /> : u.nombre_completo.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C3E50]">{u.nombre_completo}</p>
                          <p className="text-xs text-[#7F8C8D]">{u.matricula_o_rfc}{u.cuatrimestre ? ` · ${u.cuatrimestre}º cuatri` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#7F8C8D] max-w-[180px]">{u.carrera || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-[#7F8C8D]">
                        {u.rol === "estudiante" && (u.email_verificado
                          ? <MailCheck className="size-3.5 text-[#16A34A]" aria-label="Correo verificado" />
                          : <MailX className="size-3.5 text-[#F59E0B]" aria-label="Correo sin verificar" />)}
                        {u.correo_institucional}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.rol === "admin" ? "bg-[#003366]/[0.08] text-[#003366]" : "bg-[#F5F7FA] text-[#7F8C8D]"}`}>
                        {u.rol === "admin" && <ShieldCheck className="size-3" />}{u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.activo ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{u.activo ? "Activo" : "Suspendido"}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => resetPassword(u)} title="Enviar código de restablecimiento"
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08]">
                          <KeyRound className="size-3.5" />Reset
                        </button>
                        <button onClick={() => toggleActivo(u)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${u.activo ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}>
                          {u.activo ? <><Ban className="size-3.5" />Suspender</> : <><CheckCircle2 className="size-3.5" />Activar</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-[#7F8C8D]"><Users className="size-6 mx-auto mb-2" />No hay usuarios que coincidan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
