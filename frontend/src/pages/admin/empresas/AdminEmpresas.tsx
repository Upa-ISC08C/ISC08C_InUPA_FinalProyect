import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Building2, Plus, Pencil, Trash2, Globe, MapPin, Loader2, Save, Search, LayoutGrid, List } from "lucide-react";
import { companiesService, type Company } from "../../../services/companies.service";

export function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Company | "new" | null>(null);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | "activas" | "inactivas">("todos");
  const [vista, setVista] = useState<"cuadricula" | "lista">(() => (localStorage.getItem("inupa_empresas_view") as any) || "cuadricula");

  useEffect(() => { localStorage.setItem("inupa_empresas_view", vista); }, [vista]);

  const cargar = () => { setLoading(true); companiesService.list().then(setEmpresas).catch(() => setEmpresas([])).finally(() => setLoading(false)); };
  useEffect(() => { cargar(); }, []);

  const activas = empresas.filter((e) => e.activa).length;
  const eliminar = async (id: string) => { await companiesService.remove(id); cargar(); };

  const filtradas = useMemo(() => empresas.filter((e) => {
    const t = (e.nombre + (e.industria || "") + (e.ciudad || "")).toLowerCase().includes(q.toLowerCase());
    const s = estado === "todos" || (estado === "activas" ? e.activa : !e.activa);
    return t && s;
  }), [empresas, q, estado]);

  const sel = "h-10 rounded-xl border border-border bg-background px-3 text-sm";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{empresas.length} registradas · {activas} activas</p>
        </div>
        <Button onClick={() => setEdit("new")} className="flex items-center gap-1.5"><Plus className="size-4" /> Nueva empresa</Button>
      </div>

      {/* Barra de búsqueda + filtro + toggle vista */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, industria o ciudad..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-10 rounded-xl text-sm" />
        </div>
        <select className={sel} value={estado} onChange={(e) => setEstado(e.target.value as any)}>
          <option value="todos">Todos</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>
        <div className="ml-auto flex items-center rounded-xl border border-border p-0.5">
          <button onClick={() => setVista("lista")} title="Vista de lista" className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "lista" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}><List className="size-4" /></button>
          <button onClick={() => setVista("cuadricula")} title="Vista de cuadrícula" className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "cuadricula" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid className="size-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : filtradas.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center text-sm text-muted-foreground">
          <Building2 className="size-6 mx-auto mb-2" />No hay empresas que coincidan.
        </CardContent></Card>
      ) : vista === "cuadricula" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((e) => (
            <Card key={e.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-[#003366] flex items-center justify-center text-white font-bold">{e.nombre.substring(0, 2).toUpperCase()}</div>
                    <div>
                      <p className="font-bold text-foreground">{e.nombre}</p>
                      <p className="text-xs text-muted-foreground">{e.industria || "—"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{e.activa ? "Activa" : "Inactiva"}</span>
                </div>
                {e.descripcion && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{e.descripcion}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground">
                  {e.ciudad && <span className="flex items-center gap-1"><MapPin className="size-3" />{e.ciudad}</span>}
                  {e.tamano && <span>{e.tamano} empleados</span>}
                </div>
                {e.sitio_web && <a href={e.sitio_web} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#003366] font-semibold hover:underline mt-2"><Globe className="size-3" />Sitio web</a>}
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <button onClick={() => setEdit(e)} className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:bg-muted px-2.5 py-1.5 rounded-lg"><Pencil className="size-3.5" />Editar</button>
                  <button onClick={() => eliminar(e.id)} className="flex items-center gap-1 text-xs font-semibold text-[#E74C3C] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded-lg"><Trash2 className="size-3.5" />Desactivar</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Industria</th>
                  <th className="px-5 py-3 font-semibold">Ciudad</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-[#003366] flex items-center justify-center text-white text-xs font-bold flex-none">{e.nombre.substring(0, 2).toUpperCase()}</div>
                        <span className="font-semibold text-foreground">{e.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{e.industria || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.ciudad || "—"}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{e.activa ? "Activa" : "Inactiva"}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEdit(e)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-[#003366]"><Pencil className="size-4" /></button>
                        <button onClick={() => eliminar(e.id)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-[#FEE2E2] hover:text-[#E74C3C]"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {edit && <EmpresaDialog item={edit === "new" ? null : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); cargar(); }} />}
    </div>
  );
}

function EmpresaDialog({ item, onClose, onSaved }: { item: Company | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    nombre: item?.nombre || "", industria: item?.industria || "", descripcion: item?.descripcion || "",
    sitio_web: item?.sitio_web || "", correo_contacto: item?.correo_contacto || "", telefono: item?.telefono || "",
    ciudad: item?.ciudad || "", direccion: item?.direccion || "", tamano: item?.tamano || "", activa: item?.activa ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const guardar = async () => {
    setSaving(true); setError("");
    try { if (item) await companiesService.update(item.id, form); else await companiesService.create(form); onSaved(); }
    catch (e: any) { setError(e?.response?.data?.error || "No se pudo guardar."); } finally { setSaving(false); }
  };
  const F = ({ label, children }: any) => (<div className="space-y-1"><Label className="text-xs font-semibold text-[#2C3E50]">{label}</Label>{children}</div>);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Editar empresa" : "Nueva empresa"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {error && <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>}
          <F label="Nombre *"><Input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Industria"><Input value={form.industria} onChange={(e) => set("industria", e.target.value)} /></F>
            <F label="Tamaño"><Input placeholder="50–200" value={form.tamano} onChange={(e) => set("tamano", e.target.value)} /></F>
          </div>
          <F label="Descripción"><Textarea rows={2} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Ciudad"><Input value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} /></F>
            <F label="Teléfono"><Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} /></F>
          </div>
          <F label="Correo de contacto"><Input value={form.correo_contacto} onChange={(e) => set("correo_contacto", e.target.value)} /></F>
          <F label="Sitio web"><Input placeholder="https://…" value={form.sitio_web} onChange={(e) => set("sitio_web", e.target.value)} /></F>
          <F label="Dirección"><Input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} /></F>
          <label className="flex items-center gap-2 text-sm text-[#2C3E50] cursor-pointer"><input type="checkbox" checked={form.activa} onChange={(e) => set("activa", e.target.checked)} /> Activa</label>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={guardar} disabled={saving} className="flex items-center gap-1.5">{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
