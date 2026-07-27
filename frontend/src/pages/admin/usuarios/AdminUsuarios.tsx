import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import {
  Users, Search, Loader2, ShieldCheck, Ban, CheckCircle2, KeyRound, MailCheck, MailX,
  LayoutGrid, List, Eye, Lock, Mail, Phone, MapPin, Link2, GraduationCap, AlertTriangle,
} from "lucide-react";
import { adminService, type AdminUser, type AdminUserDetail } from "../../../services/admin.service";
import { CARRERAS_UPA } from "../../../utils/catalogos";

const scoreColor = (s: number) => (s >= 80 ? "#27AE60" : s >= 50 ? "#F59E0B" : "#E74C3C");

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [carrera, setCarrera] = useState("");
  const [estatus, setEstatus] = useState<"todos" | "activos" | "suspendidos">("todos");
  const [vista, setVista] = useState<"lista" | "cuadricula">(() => (localStorage.getItem("inupa_users_view") as any) || "lista");
  const [aviso, setAviso] = useState("");
  const [verId, setVerId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem("inupa_users_view", vista); }, [vista]);

  const cargar = (silent = false) => { if (!silent) setLoading(true); adminService.listUsers().then(setUsuarios).catch(() => setUsuarios([])).finally(() => { if (!silent) setLoading(false); }); };
  useEffect(() => { cargar(); }, []);

  const [confirm, setConfirm] = useState<AdminUser | null>(null);
  const toggleActivo = (u: AdminUser) => {
    setConfirm(u);
  };
  const ejecutarToggleActivo = async (u: AdminUser) => {
    setAviso("");
    // Actualización optimista inmediata
    setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, activo: !u.activo } : x));
    try {
      await adminService.updateUser(u.id, { activo: !u.activo });
      setAviso(u.activo ? "Usuario suspendido con éxito." : "Usuario activado con éxito.");
      cargar(true); // silent
    }
    catch (e: any) {
      // Revertir si hay error
      setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, activo: u.activo } : x));
      setAviso(e?.response?.data?.error || "No se pudo cambiar el estatus.");
    }
  };
  const resetPassword = async (u: AdminUser) => {
    setAviso("");
    try { const r = await adminService.resetPassword(u.id); setAviso(r.message || `Código enviado a ${u.correo_institucional}`); }
    catch { setAviso("No se pudo enviar el código de restablecimiento."); }
  };

  const estudiantes = useMemo(() => usuarios.filter((u) => u.rol === "estudiante"), [usuarios]);

  const filtrados = useMemo(() => {
    const res = estudiantes.filter((u) => {
      const matchTexto = (u.nombre_completo + u.correo_institucional + (u.matricula_o_rfc || "")).toLowerCase().includes(q.toLowerCase());
      const matchCarrera = !carrera || u.carrera === carrera;
      const matchEstatus = estatus === "todos" || (estatus === "activos" ? u.activo : !u.activo);
      return matchTexto && matchCarrera && matchEstatus;
    });
    return res.sort((a, b) => {
      if (a.activo !== b.activo) return a.activo ? -1 : 1;
      return new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime();
    });
  }, [estudiantes, q, carrera, estatus]);

  const activos = estudiantes.filter((u) => u.activo).length;
  const sel = "h-10 rounded-xl border border-border bg-background px-3 text-sm";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Estudiantes registrados</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{estudiantes.length} estudiantes · {activos} activos · {estudiantes.length - activos} suspendidos</p>
      </div>

      {aviso && <div className="p-3 rounded-xl bg-[#E8F5E9] text-[#16A34A] text-sm flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0" />{aviso}</div>}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, correo o matrícula..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-10 rounded-xl text-sm" />
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
        {/* Toggle lista / cuadrícula */}
        <div className="ml-auto flex items-center rounded-xl border border-border p-0.5">
          <button onClick={() => setVista("lista")} title="Vista de lista"
            className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "lista" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}><List className="size-4" /></button>
          <button onClick={() => setVista("cuadricula")} title="Vista de cuadrícula"
            className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "cuadricula" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid className="size-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : filtrados.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center text-muted-foreground"><Users className="size-6 mx-auto mb-2" />No hay usuarios que coincidan.</CardContent></Card>
      ) : vista === "lista" ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Carrera</th>
                  <th className="px-5 py-3 font-semibold">CV Score</th>
                  <th className="px-5 py-3 font-semibold">Rol</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar u={u} />
                        <div>
                          <p className="font-semibold text-foreground">{u.nombre_completo}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {u.rol === "estudiante" && (u.email_verificado
                              ? <MailCheck className="size-3 text-[#16A34A]" />
                              : <MailX className="size-3 text-[#F59E0B]" />)}
                            {u.correo_institucional}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground max-w-[170px]">{u.carrera || "—"}{u.cuatrimestre ? ` · ${u.cuatrimestre}º` : ""}</td>
                    <td className="px-5 py-3"><ScoreBar score={u.rol === "admin" ? null : (u.cv_score ?? 0)} /></td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.rol === "admin" ? "bg-[#003366]/[0.1] text-[#003366]" : "bg-muted text-muted-foreground"}`}>
                        {u.rol === "admin" && <ShieldCheck className="size-3" />}{u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.activo ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{u.activo ? "Activo" : "Suspendido"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Acciones u={u} onVer={() => setVerId(u.id)} onReset={() => resetPassword(u)} onToggle={() => toggleActivo(u)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((u) => (
            <Card key={u.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar u={u} big />
                    <div>
                      <p className="font-bold text-foreground leading-tight">{u.nombre_completo}</p>
                      <p className="text-xs text-muted-foreground">{u.matricula_o_rfc}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.activo ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{u.activo ? "Activo" : "Suspendido"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 truncate">{u.carrera || "Sin carrera"}{u.cuatrimestre ? ` · ${u.cuatrimestre}º cuatri` : ""}</p>
                {u.rol !== "admin" && <div className="mt-2"><ScoreBar score={u.cv_score ?? 0} /></div>}
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
                  <Acciones u={u} onVer={() => setVerId(u.id)} onReset={() => resetPassword(u)} onToggle={() => toggleActivo(u)} grid />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {confirm && (
        <Dialog open onOpenChange={() => setConfirm(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <div className={`text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 ${confirm.activo ? "bg-[#E74C3C]" : "bg-[#16A34A]"}`}>
              <AlertTriangle className="size-5 text-white" />
              <span className="font-extrabold text-sm uppercase tracking-wider">{confirm.activo ? "¿Suspender Usuario?" : "¿Activar Usuario?"}</span>
            </div>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                {confirm.activo ? (
                  <>¿Estás seguro de que deseas suspender al usuario <strong>{confirm.nombre_completo}</strong>? No podrá iniciar sesión en la plataforma mientras esté suspendido.</>
                ) : (
                  <>¿Deseas activar al usuario <strong>{confirm.nombre_completo}</strong> para permitirle acceder nuevamente a la plataforma?</>
                )}
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => setConfirm(null)} className="rounded-xl h-10 px-4 active:scale-95 transition-all">Cancelar</Button>
                <Button onClick={() => {
                  const u = confirm;
                  setConfirm(null);
                  ejecutarToggleActivo(u);
                }} className={`rounded-xl h-10 px-4 text-white active:scale-95 transition-all ${confirm.activo ? "bg-[#E74C3C] hover:bg-[#C0392B]" : "bg-[#16A34A] hover:bg-[#15803d]"}`}>
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {verId && <PerfilDialog id={verId} onClose={() => setVerId(null)} onChanged={(uid, activo) => { setUsuarios((prev) => prev.map((x) => x.id === uid ? { ...x, activo } : x)); cargar(true); }} onAviso={setAviso} />}
    </div>
  );
}

function Avatar({ u, big }: { u: { url_foto: string | null; nombre_completo: string }; big?: boolean }) {
  const size = big ? "size-11" : "size-9";
  return (
    <div className={`${size} rounded-full bg-[#003366] flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-none`}>
      {u.url_foto ? <img src={u.url_foto} alt="" className="size-full object-cover" /> : u.nombre_completo.substring(0, 2).toUpperCase()}
    </div>
  );
}

function ScoreBar({ score }: { score: any }) {
  if (score === null || score === undefined) return <span className="text-xs text-muted-foreground">—</span>;
  const numScore = Number(score);
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${numScore}%`, background: scoreColor(numScore) }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: scoreColor(numScore) }}>{numScore}%</span>
    </div>
  );
}

function Acciones({ u, onVer, onReset, onToggle, grid }: { u: AdminUser; onVer: () => void; onReset: () => void; onToggle: () => void; grid?: boolean }) {
  const esAdmin = u.rol === "admin";
  return (
    <div className={`flex items-center gap-1 ${grid ? "" : "justify-end"}`}>
      <button onClick={onVer} title="Ver perfil" className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08] transition-colors"><Eye className="size-3.5" />Ver</button>
      <button onClick={onReset} title="Enviar código de restablecimiento" className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08] transition-colors"><KeyRound className="size-3.5" />Reset</button>
      {esAdmin ? (
        <span title="El administrador del sistema está protegido" className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-muted-foreground"><Lock className="size-3.5" />Protegido</span>
      ) : (
        <button onClick={onToggle} className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${u.activo ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}>
          {u.activo ? <><Ban className="size-3.5" />Suspender</> : <><CheckCircle2 className="size-3.5" />Activar</>}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal: ver / administrar el perfil de un usuario.
// ---------------------------------------------------------------------------
function PerfilDialog({ id, onClose, onChanged, onAviso }: { id: string; onClose: () => void; onChanged: (uid: string, activo: boolean) => void; onAviso: (s: string) => void }) {
  const [u, setU] = useState<AdminUserDetail | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const cargar = (silent = false) => { if (!silent) setLoading(true); adminService.getUser(id).then(setU).catch(() => setU(null)).finally(() => { if (!silent) setLoading(false); }); };
  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [id]);

  const accion = async (fn: () => Promise<any>, msg: string) => {
    setBusy(true);
    const nuevoActivo = u ? !u.activo : false;
    // Optimización: Actualizar localmente en modal y lista del padre de forma inmediata
    if (u) {
      setU((prev) => prev ? { ...prev, activo: nuevoActivo } : null);
    }
    onChanged(id, nuevoActivo);
    try {
      await fn();
      onAviso(msg);
      cargar(true);
    } catch (e: any) {
      // Revertir si hay error
      if (u) {
        setU(u);
      }
      onChanged(id, u ? u.activo : false);
      onAviso(e?.response?.data?.error || "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  };

  const p = u?.perfil;
  const esAdmin = u?.rol === "admin";
  const Row = ({ icon: Icon, children }: any) => (
    <div className="flex items-center gap-3 text-sm text-foreground py-1">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#001A33] text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14">
          <Users className="size-5 text-[#00A8E8]" />
          <span className="font-extrabold text-sm uppercase tracking-wider">Perfil del Usuario</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-8 animate-spin text-[#003366]" /></div>
        ) : !u ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No se pudo cargar el perfil.</p>
        ) : (
          <div className="space-y-5 mt-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-[#003366] flex items-center justify-center text-white text-xl font-black overflow-hidden flex-none ring-4 ring-[#003366]/10 shadow-sm">
                {p?.url_foto ? <img src={p.url_foto} alt="" className="size-full object-cover" /> : u.nombre_completo.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-foreground text-lg leading-tight truncate max-w-[280px]">{u.nombre_completo}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${u.rol === "admin" ? "bg-[#003366]/15 text-[#003366] border border-[#003366]/20" : "bg-muted text-muted-foreground"}`}>{u.rol}</span>
                </div>
                {p?.titular_profesional && <p className="text-xs font-semibold text-muted-foreground mt-0.5 truncate">{p.titular_profesional}</p>}
                <p className="text-[11px] font-bold text-muted-foreground/80 tracking-wide mt-0.5">{u.matricula_o_rfc}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Información de Contacto</p>
              <div className="grid grid-cols-1 gap-1 rounded-2xl border border-border p-4 bg-muted/10">
                <Row icon={Mail}>
                  <span className="font-medium">{u.correo_institucional}</span>
                  {u.email_verificado ? (
                    <span className="text-[9px] bg-green-50 text-[#16A34A] border border-green-200/50 font-bold px-2 py-0.5 rounded-md ml-2 select-none">Verificado</span>
                  ) : (
                    <span className="text-[9px] bg-amber-50 text-[#F59E0B] border border-amber-200/50 font-bold px-2 py-0.5 rounded-md ml-2 select-none">Sin verificar</span>
                  )}
                </Row>
                {u.carrera && <Row icon={GraduationCap}><span className="font-medium text-foreground">{u.carrera}</span>{u.cuatrimestre ? <span className="text-muted-foreground"> · {u.cuatrimestre}º cuatrimestre</span> : ""}</Row>}
                {p?.telefono && <Row icon={Phone}><span className="font-medium">{p.telefono}</span></Row>}
                {p?.ubicacion && <Row icon={MapPin}><span className="font-medium">{p.ubicacion}</span></Row>}
                {p?.github_url && <Row icon={Link2}><a href={p.github_url} target="_blank" rel="noreferrer" className="text-[#003366] font-semibold hover:underline truncate">{p.github_url.replace(/^https?:\/\/(www\.)?/, "")}</a></Row>}
                {p?.linkedin_url && <Row icon={Link2}><a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-[#003366] font-semibold hover:underline truncate">{p.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")}</a></Row>}
              </div>
            </div>

            {p?.biografia && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acerca de</p>
                <p className="text-xs text-foreground bg-muted/5 rounded-xl border border-border/80 p-3 leading-relaxed max-h-36 overflow-y-auto">{p.biografia}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5 pt-4 border-t border-border mt-6">
              <Button variant="outline" size="sm" disabled={busy} onClick={() => accion(() => adminService.resetPassword(u.id), `Código de restablecimiento enviado a ${u.correo_institucional}`)} className="rounded-xl h-9 hover:bg-[#003366]/5 text-[#003366] font-bold border-border/85 active:scale-95 transition-all">
                <KeyRound className="size-3.5 mr-1.5" />Restablecer contraseña
              </Button>
              {esAdmin ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-muted-foreground bg-muted/40 border border-border/40 ml-auto"><Lock className="size-3.5" />Administrador protegido</span>
              ) : (
                <>
                  <Button variant="outline" size="sm" disabled={busy}
                    onClick={() => setConfirmOpen(true)}
                    className={`rounded-xl h-9 font-bold active:scale-95 transition-all ml-auto ${u.activo ? "border-red-200 hover:bg-red-50 text-[#E74C3C] hover:text-[#E74C3C]" : "border-green-200 hover:bg-green-50 text-[#16A34A] hover:text-[#16A34A]"}`}>
                    {u.activo ? <><Ban className="size-3.5 mr-1.5" />Suspender</> : <><CheckCircle2 className="size-3.5 mr-1.5" />Activar usuario</>}
                  </Button>

                  {confirmOpen && (
                    <Dialog open onOpenChange={() => setConfirmOpen(false)}>
                      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
                        <div className={`text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 ${u.activo ? "bg-[#E74C3C]" : "bg-[#16A34A]"}`}>
                          <AlertTriangle className="size-5 text-white" />
                          <span className="font-extrabold text-sm uppercase tracking-wider">{u.activo ? "¿Suspender Usuario?" : "¿Activar Usuario?"}</span>
                        </div>
                        <div className="space-y-4 mt-4">
                          <p className="text-sm text-foreground leading-relaxed">
                            {u.activo ? (
                              <>¿Estás seguro de que deseas suspender al usuario <strong>{u.nombre_completo}</strong>? No podrá iniciar sesión en la plataforma mientras esté suspendido.</>
                            ) : (
                              <>¿Deseas activar al usuario <strong>{u.nombre_completo}</strong> para permitirle acceder nuevamente a la plataforma?</>
                            )}
                          </p>
                          <div className="flex justify-end gap-3 pt-3 border-t border-border">
                            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-xl h-10 px-4 active:scale-95 transition-all">Cancelar</Button>
                            <Button onClick={() => {
                              setConfirmOpen(false);
                              accion(() => adminService.updateUser(u.id, { activo: !u.activo }), u.activo ? "Usuario suspendido" : "Usuario activado");
                            }} className={`rounded-xl h-10 px-4 text-white active:scale-95 transition-all ${u.activo ? "bg-[#E74C3C] hover:bg-[#C0392B]" : "bg-[#16A34A] hover:bg-[#15803d]"}`}>
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
