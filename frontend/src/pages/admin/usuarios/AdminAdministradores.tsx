import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { ShieldAlert, Search, Loader2, ShieldCheck, Ban, CheckCircle2, KeyRound, LayoutGrid, List, Lock, Mail, AlertTriangle, User, Edit, Plus, Shield, Trash2 } from "lucide-react";
import { adminService, type AdminUser } from "../../../services/admin.service";
import { useAuthStore } from "../../../store/authStore";

export function AdminAdministradores() {
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [estatus, setEstatus] = useState<"todos" | "activos" | "suspendidos">("todos");
  const [vista, setVista] = useState<"lista" | "cuadricula">(() => (localStorage.getItem("inupa_admins_view") as any) || "lista");
  const [aviso, setAviso] = useState("");
  const { user: currentUser } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ nombre_completo: "", correo_institucional: "", matricula_o_rfc: "", password: "" });
  const [errorModal, setErrorModal] = useState("");
  const [guardando, setGuardando] = useState(false);
  
  const [confirm, setConfirm] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nombre: string } | null>(null);

  useEffect(() => { localStorage.setItem("inupa_admins_view", vista); }, [vista]);

  const cargar = (silent = false) => {
    if (!silent) setLoading(true);
    adminService.listUsers().then(setUsuarios).catch(() => setUsuarios([])).finally(() => { if (!silent) setLoading(false); });
  };
  useEffect(() => { cargar(); }, []);

  const toggleActivo = (u: AdminUser) => setConfirm(u);

  const ejecutarToggleActivo = async (u: AdminUser) => {
    setAviso("");
    setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, activo: !u.activo } : x));
    try {
      await adminService.updateUser(u.id, { activo: !u.activo });
      setAviso(u.activo ? "Administrador suspendido con éxito." : "Administrador activado con éxito.");
      cargar(true);
    } catch (e: any) {
      setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, activo: u.activo } : x));
      setAviso(e?.response?.data?.error || "No se pudo cambiar el estatus.");
    }
  };

  const resetPassword = async (u: AdminUser) => {
    setAviso("");
    try {
      const r = await adminService.resetPassword(u.id);
      setAviso(r.message || `Se envió un código de restablecimiento a ${u.correo_institucional}`);
    } catch {
      setAviso("No se pudo enviar el código de restablecimiento.");
    }
  };

  const abrirRegistro = () => {
    setEditingAdmin(null);
    setFormData({ nombre_completo: "", correo_institucional: "", matricula_o_rfc: "", password: "" });
    setErrorModal("");
    setModalOpen(true);
  };

  const abrirEdicion = (u: AdminUser) => {
    setEditingAdmin(u);
    setFormData({ nombre_completo: u.nombre_completo, correo_institucional: u.correo_institucional, matricula_o_rfc: u.matricula_o_rfc || "", password: "" });
    setErrorModal("");
    setModalOpen(true);
    // Nota: Para editar, el backend debe permitir actualizar estos campos.
  };

  const guardarAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal("");
    if (!formData.nombre_completo.trim()) { setErrorModal("El nombre completo es obligatorio."); return; }
    if (!formData.correo_institucional.trim()) { setErrorModal("El correo institucional es obligatorio."); return; }
    if (!editingAdmin && !formData.password.trim()) { setErrorModal("La contraseña es obligatoria para nuevos administradores."); return; }

    setGuardando(true);
    try {
      if (editingAdmin) {
        await adminService.updateUser(editingAdmin.id, {
          nombre_completo: formData.nombre_completo.trim(),
          correo_institucional: formData.correo_institucional.trim().toLowerCase(),
          matricula_o_rfc: formData.matricula_o_rfc.trim().toUpperCase() || undefined,
          password: formData.password.trim() || undefined,
        });
        setAviso("Administrador actualizado con éxito.");
      } else {
        await adminService.createUser({
          nombre_completo: formData.nombre_completo.trim(),
          email: formData.correo_institucional.trim().toLowerCase(),
          matricula_o_rfc: formData.matricula_o_rfc.trim().toUpperCase() || undefined,
          password: formData.password.trim(),
          rol: "admin",
        });
        setAviso("Nuevo administrador registrado con éxito.");
      }
      setModalOpen(false);
      cargar(true);
    } catch (err: any) {
      setErrorModal(err?.response?.data?.error || "Error al procesar la solicitud.");
    } finally {
      setGuardando(false);
    }
  };

  const admins = useMemo(() => usuarios.filter((u) => u.rol === "admin"), [usuarios]);
  const filtrados = useMemo(() => {
    const res = admins.filter((u) => {
      const matchTexto = (u.nombre_completo + u.correo_institucional + (u.matricula_o_rfc || "")).toLowerCase().includes(q.toLowerCase());
      const matchEstatus = estatus === "todos" || (estatus === "activos" ? u.activo : !u.activo);
      return matchTexto && matchEstatus;
    });
    return res.sort((a, b) => {
      if (a.activo !== b.activo) return a.activo ? -1 : 1;
      return new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime();
    });
  }, [admins, q, estatus]);

  const activos = admins.filter((u) => u.activo).length;
  const sel = "h-10 rounded-xl border border-border bg-background px-3 text-sm";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Administradores del Sistema</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{admins.length} administradores · {activos} activos · {admins.length - activos} suspendidos</p>
        </div>
        <Button onClick={abrirRegistro} className="rounded-xl h-10 px-4 font-bold bg-[#003366] hover:bg-[#002244] text-white flex items-center gap-1.5 active:scale-95 transition-all shadow-md">
          <Plus className="size-4" /> Nuevo administrador
        </Button>
      </div>

      {aviso && <div className="p-3 rounded-xl bg-[#E8F5E9] text-[#16A34A] text-sm flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0" />{aviso}</div>}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, correo o rfc..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-10 rounded-xl text-sm" />
        </div>
        <select className={sel} value={estatus} onChange={(e) => setEstatus(e.target.value as any)}>
          <option value="todos">Todos los estatus</option>
          <option value="activos">Activos</option>
          <option value="suspendidos">Suspendidos</option>
        </select>
        <div className="ml-auto flex items-center rounded-xl border border-border p-0.5">
          <button onClick={() => setVista("lista")} className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "lista" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}><List className="size-4" /></button>
          <button onClick={() => setVista("cuadricula")} className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "cuadricula" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid className="size-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : filtrados.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center text-sm text-muted-foreground">
          <ShieldAlert className="size-6 mx-auto mb-2 text-muted-foreground/60" />No hay administradores registrados que coincidan.
        </CardContent></Card>
      ) : vista === "lista" ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Administrador</th>
                  <th className="px-5 py-3 font-semibold">RFC / Matrícula</th>
                  <th className="px-5 py-3 font-semibold">Correo</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => {
                  const esProtegido = u.correo_institucional === "admin@upa.edu.mx"; // Ajusta este email al de tu admin principal
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-foreground flex items-center gap-2">
                        <div className="size-7 rounded-full bg-[#003366]/10 text-[#003366] flex items-center justify-center font-bold text-[10px]">
                          {u.nombre_completo.substring(0, 2).toUpperCase()}
                        </div>
                        {u.nombre_completo}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{u.matricula_o_rfc}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.correo_institucional}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.activo ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{u.activo ? "Activo" : "Suspendido"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => abrirEdicion(u)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08] transition-colors"><Edit className="size-3.5" />Editar</button>
                          <button onClick={() => resetPassword(u)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08] transition-colors"><KeyRound className="size-3.5" />Reset</button>
                          {esProtegido ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-muted-foreground select-none"><Lock className="size-3.5" />Protegido</span>
                          ) : (
                            <>
                              <button onClick={() => setConfirmDelete({ id: u.id, nombre: u.nombre_completo })} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#E74C3C] hover:bg-[#FEE2E2] transition-colors"><Trash2 className="size-3.5" />Eliminar</button>
                              <button onClick={() => toggleActivo(u)} className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${u.activo ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}>
                                {u.activo ? <><Ban className="size-3.5" />Suspender</> : <><CheckCircle2 className="size-3.5" />Activar</>}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((u) => {
            const esProtegido = u.correo_institucional === "admin@upa.edu.mx";
            return (
              <Card key={u.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-[#003366]/10 text-[#003366] flex items-center justify-center font-bold text-xs">
                        {u.nombre_completo.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground leading-tight">{u.nombre_completo}</p>
                        <p className="text-xs text-muted-foreground">{u.matricula_o_rfc}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.activo ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{u.activo ? "Activo" : "Suspendido"}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">{u.correo_institucional}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
                    <button onClick={() => abrirEdicion(u)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08] transition-colors"><Edit className="size-3.5" />Editar</button>
                    <button onClick={() => resetPassword(u)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08] transition-colors"><KeyRound className="size-3.5" />Reset</button>
                    {esProtegido ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-muted-foreground ml-auto select-none"><Lock className="size-3.5" />Protegido</span>
                    ) : (
                      <>
                        <button onClick={() => setConfirmDelete({ id: u.id, nombre: u.nombre_completo })} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#E74C3C] hover:bg-[#FEE2E2] ml-auto transition-colors"><Trash2 className="size-3.5" />Eliminar</button>
                        <button onClick={() => toggleActivo(u)} className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${u.activo ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}>
                          {u.activo ? <><Ban className="size-3.5" />Suspender</> : <><CheckCircle2 className="size-3.5" />Activar</>}
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Registro / Edición */}
      {modalOpen && (
        <Dialog open onOpenChange={() => setModalOpen(false)}>
          <DialogContent className="sm:max-w-xl rounded-2xl border-0 shadow-2xl p-0 bg-background overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#001A33] text-white px-6 py-4 flex items-center gap-2 border-b border-white/10 h-14">
              <Shield className="size-5 text-[#00A8E8]" />
              <span className="font-extrabold text-sm uppercase tracking-wider">{editingAdmin ? "Editar Administrador" : "Registrar Administrador"}</span>
            </div>
            <form onSubmit={guardarAdmin} className="p-6 space-y-4">
              {errorModal && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-[#E74C3C] text-xs font-semibold flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" />{errorModal}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Nombre completo *</label>
                  <Input required placeholder="Ej. Juan Pérez" value={formData.nombre_completo} onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })} className="h-10 rounded-xl text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">RFC o Matrícula (opcional)</label>
                  <Input placeholder="Ej. ADMIN001 — se genera solo si se deja en blanco" value={formData.matricula_o_rfc} onChange={(e) => setFormData({ ...formData, matricula_o_rfc: e.target.value })} className="h-10 rounded-xl text-sm" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground">Correo institucional *</label>
                  <Input required type="email" placeholder="Ej. administrador@upa.edu.mx" value={formData.correo_institucional} onChange={(e) => setFormData({ ...formData, correo_institucional: e.target.value })} className="h-10 rounded-xl text-sm" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground">Contraseña {editingAdmin ? "(Dejar en blanco para mantener la actual)" : "*"}</label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" required={!editingAdmin} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-10 rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl h-10 px-4 active:scale-95 transition-all">Cancelar</Button>
                <Button type="submit" disabled={guardando} className="rounded-xl h-10 px-6 bg-[#003366] hover:bg-[#002244] text-white font-bold active:scale-95 transition-all flex items-center gap-2">
                  {guardando && <Loader2 className="size-4 animate-spin" />}{editingAdmin ? "Guardar cambios" : "Registrar administrador"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo Confirmar Suspensión/Activación */}
      {confirm && (
        <Dialog open onOpenChange={() => setConfirm(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <div className={`text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 ${confirm.activo ? "bg-[#E74C3C]" : "bg-[#16A34A]"}`}>
              <AlertTriangle className="size-5 text-white" />
              <span className="font-extrabold text-sm uppercase tracking-wider">{confirm.activo ? "¿Suspender Administrador?" : "¿Activar Administrador?"}</span>
            </div>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                {confirm.activo ? <>¿Estás seguro de que deseas suspender al administrador <strong>{confirm.nombre_completo}</strong>?</> : <>¿Deseas activar al administrador <strong>{confirm.nombre_completo}</strong>?</>}
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => setConfirm(null)} className="rounded-xl h-10 px-4 active:scale-95 transition-all">Cancelar</Button>
                <Button onClick={() => { const u = confirm; setConfirm(null); ejecutarToggleActivo(u); }} className={`rounded-xl h-10 px-4 text-white active:scale-95 transition-all ${confirm.activo ? "bg-[#E74C3C] hover:bg-[#C0392B]" : "bg-[#16A34A] hover:bg-[#15803d]"}`}>Confirmar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo Confirmar Eliminación */}
      {confirmDelete && (
        <Dialog open onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <div className="text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 bg-[#E74C3C]">
              <AlertTriangle className="size-5 text-white" />
              <span className="font-extrabold text-sm uppercase tracking-wider">¿Eliminar permanentemente?</span>
            </div>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                ¿Estás seguro de que deseas eliminar al administrador <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => setConfirmDelete(null)} className="rounded-xl h-10 px-4 active:scale-95 transition-all">Cancelar</Button>
                <Button onClick={async () => {
                  try {
                    // Asegúrate de tener este método en admin.service.ts: removeUser: (id) => api.delete(`/users/${id}`)
                    await import("../../../services/admin.service").then(mod => mod.adminService.removeUser(confirmDelete.id));
                    setConfirmDelete(null);
                    cargar(true);
                  } catch {
                    alert("No se pudo eliminar el administrador.");
                  }
                }} className="rounded-xl h-10 px-4 text-white bg-[#E74C3C] hover:bg-[#C0392B] active:scale-95 transition-all">
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}