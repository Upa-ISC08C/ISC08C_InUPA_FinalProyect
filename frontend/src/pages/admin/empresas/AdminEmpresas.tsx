import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Building2, Plus, Pencil, Trash2, Globe, MapPin, Loader2, Save, Search, LayoutGrid, List, X, ImagePlus, AlertTriangle } from "lucide-react";
import { companiesService, type Company } from "../../../services/companies.service";
import { fileToDataUrl } from "../../../utils/image";

export function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Company | "new" | null>(null);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | "activas" | "inactivas">("todos");
  const [filtroIndustria, setFiltroIndustria] = useState("todas");
  const [vista, setVista] = useState<"cuadricula" | "lista">(() => (localStorage.getItem("inupa_empresas_view") as any) || "cuadricula");

  useEffect(() => { localStorage.setItem("inupa_empresas_view", vista); }, [vista]);

  const cargar = (silent = false) => { if (!silent) setLoading(true); companiesService.list().then(setEmpresas).catch(() => setEmpresas([])).finally(() => { if (!silent) setLoading(false); }); };
  useEffect(() => { cargar(); }, []);

  const activas = empresas.filter((e) => e.activa).length;
  const [confirm, setConfirm] = useState<{ id: string; nombre: string; activa: boolean } | null>(null);
  const eliminar = (id: string, nombre: string, activa: boolean) => {
    setConfirm({ id, nombre, activa });
  };

  const uniqueIndustries = useMemo(() => {
    const inds = new Set<string>();
    empresas.forEach((e) => {
      if (e.industria && e.industria.trim()) {
        inds.add(e.industria.trim());
      }
    });
    return Array.from(inds).sort();
  }, [empresas]);

  const filtradas = useMemo(() => {
    const list = empresas.filter((e) => {
      const matchQ = (e.nombre + (e.industria || "") + (e.ciudad || "")).toLowerCase().includes(q.toLowerCase());
      const matchEst = estado === "todos" || (estado === "activas" ? e.activa : !e.activa);
      const matchInd = filtroIndustria === "todas" || e.industria === filtroIndustria;
      return matchQ && matchEst && matchInd;
    });
    return list.sort((a, b) => (a.activa === b.activa ? 0 : a.activa ? -1 : 1));
  }, [empresas, q, estado, filtroIndustria]);

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
          <option value="todos">Todos los estados</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>
        <select className={sel} value={filtroIndustria} onChange={(e) => setFiltroIndustria(e.target.value)}>
          <option value="todas">Todas las industrias</option>
          {uniqueIndustries.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
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
                    <div className="size-11 rounded-xl overflow-hidden flex-none flex items-center justify-center bg-muted">
                      {e.logo_url ? (
                        <img src={e.logo_url} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-[#003366] text-white flex items-center justify-center font-bold text-sm">{e.nombre.substring(0, 2).toUpperCase()}</div>
                      )}
                    </div>
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
                  <button onClick={() => eliminar(e.id, e.nombre, e.activa)} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${e.activa ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}>
                    <Trash2 className="size-3.5" />{e.activa ? "Desactivar" : "Activar"}
                  </button>
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
                        <div className="size-9 rounded-lg overflow-hidden flex-none flex items-center justify-center bg-muted">
                          {e.logo_url ? (
                            <img src={e.logo_url} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold">{e.nombre.substring(0, 2).toUpperCase()}</div>
                          )}
                        </div>
                        <span className="font-semibold text-foreground">{e.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{e.industria || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.ciudad || "—"}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{e.activa ? "Activa" : "Inactiva"}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEdit(e)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-[#003366]"><Pencil className="size-4" /></button>
                        <button onClick={() => eliminar(e.id, e.nombre, e.activa)} className={`size-8 flex items-center justify-center rounded-lg hover:text-white transition-colors ${e.activa ? "text-[#E74C3C] hover:bg-[#E74C3C]" : "text-[#16A34A] hover:bg-[#16A34A]"}`}><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {confirm && (
        <Dialog open onOpenChange={() => setConfirm(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <div className={`text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 ${confirm.activa ? "bg-[#E74C3C]" : "bg-[#16A34A]"}`}>
              <AlertTriangle className="size-5 text-white" />
              <span className="font-extrabold text-sm uppercase tracking-wider">{confirm.activa ? "¿Desactivar Empresa?" : "¿Activar Empresa?"}</span>
            </div>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                {confirm.activa ? (
                  <>¿Estás seguro de que deseas desactivar la empresa <strong>{confirm.nombre}</strong>? Esto ocultará su información y afectará a sus vacantes publicadas.</>
                ) : (
                  <>¿Deseas activar la empresa <strong>{confirm.nombre}</strong> para que vuelva a estar visible en el sistema?</>
                )}
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => setConfirm(null)} className="rounded-xl h-10 px-4 active:scale-95 transition-all">Cancelar</Button>
                <Button onClick={async () => {
                  const id = confirm.id;
                  const nuevoEstado = !confirm.activa;
                  setConfirm(null);
                  setEmpresas((prev) => prev.map((x) => x.id === id ? { ...x, activa: nuevoEstado } : x));
                  try {
                    await companiesService.update(id, { activa: nuevoEstado });
                    cargar(true);
                  } catch {
                    setEmpresas((prev) => prev.map((x) => x.id === id ? { ...x, activa: confirm.activa } : x));
                  }
                }} className={`rounded-xl h-10 px-4 text-white active:scale-95 transition-all ${confirm.activa ? "bg-[#E74C3C] hover:bg-[#C0392B]" : "bg-[#16A34A] hover:bg-[#15803d]"}`}>
                  {confirm.activa ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {edit && <EmpresaDialog item={edit === "new" ? null : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); cargar(true); }} />}
    </div>
  );
}

const INDUSTRIAS_COMUNES = [
  "Tecnología / Software",
  "Consultoría",
  "Finanzas / Banca",
  "Salud / Farmacéutica",
  "Educación",
  "Logística / Transporte",
  "Manufactura / Producción",
  "Construcción",
  "Marketing / Publicidad",
  "Alimentos / Bebidas",
  "Comercio / Retail",
];

export function EmpresaDialog({ item, onClose, onSaved }: { item: Company | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    nombre: item?.nombre || "", industria: item?.industria || "", descripcion: item?.descripcion || "",
    sitio_web: item?.sitio_web || "", correo_contacto: item?.correo_contacto || "", telefono: item?.telefono || "",
    ciudad: item?.ciudad || "", direccion: item?.direccion || "", tamano: item?.tamano || "", activa: item?.activa ?? true,
    logo_url: item?.logo_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const set = (k: string, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (v) {
      setFieldErrors((errs) => {
        const next = { ...errs };
        delete next[k];
        return next;
      });
    }
  };

  const [selIndustria, setSelIndustria] = useState(() => {
    if (!item?.industria) return "";
    if (INDUSTRIAS_COMUNES.includes(item.industria)) return item.industria;
    return "Otro";
  });

  const [otroIndustria, setOtroIndustria] = useState(item?.industria && !INDUSTRIAS_COMUNES.includes(item.industria) ? item.industria : "");

  const subirLogo = async (file?: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setError("El logotipo supera el límite de tamaño permitido (máximo 50MB).");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file, 400, 0.85);
      set("logo_url", dataUrl);
    } catch (e) {
      setError("No se pudo procesar el logotipo.");
    }
  };

  const sel = `w-full h-10 rounded-xl border px-3 text-sm bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] transition-all ${fieldErrors.industria ? "border-red-500" : "border-border"}`;
  
  const guardar = async () => {
    const errs: Record<string, boolean> = {};
    if (!form.nombre.trim()) errs.nombre = true;
    
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Por favor completa los campos requeridos marcados en rojo.");
      return;
    }
    
    const finalIndustria = selIndustria === "Otro" ? otroIndustria.trim() : selIndustria;
    const formData = { ...form, industria: finalIndustria || null };
    setSaving(true); setError("");
    try { 
      if (item) await companiesService.update(item.id, formData); 
      else await companiesService.create(formData); 
      onSaved(); 
    }
    catch (e: any) { 
      setError("Ha ocurrido un error, por favor contacta a un administrador"); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#001A33] text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14">
          <Building2 className="size-5 text-[#00A8E8]" />
          <span className="font-extrabold text-sm uppercase tracking-wider">{item ? "Editar Empresa" : "Nueva Empresa"}</span>
        </div>
        <div className="space-y-4 mt-5">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">{error}</div>}
          
          <div className="grid md:grid-cols-4 gap-4 items-start">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logotipo</Label>
              <div className="relative size-28 rounded-2xl border-2 border-dashed border-border bg-muted/10 flex items-center justify-center overflow-hidden hover:bg-muted/20 transition-all">
                {form.logo_url ? (
                  <>
                    <img src={form.logo_url} alt="Logo preview" className="size-full object-cover" />
                    <button type="button" onClick={() => set("logo_url", "")} className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow"><X className="size-3.5" /></button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1 py-3 cursor-pointer text-muted-foreground hover:text-[#003366] transition-colors select-none size-full text-center">
                    <ImagePlus className="size-5 text-[#00A8E8]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">Subir Logo</span>
                    <span className="text-[8px] text-muted-foreground/70 leading-none">Máx. 50MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => subirLogo(e.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>
            <div className="md:col-span-3 space-y-4">
              <F label="Nombre de la empresa *" error={fieldErrors.nombre}>
                <Input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]" placeholder="Ej. TechMéxico" />
              </F>
              <div className="grid grid-cols-2 gap-4 items-start">
                <F label="Industria">
                  <div className="space-y-2">
                    <select className={sel} value={selIndustria} onChange={(e) => {
                      const v = e.target.value;
                      setSelIndustria(v);
                      if (v !== "Otro") {
                        set("industria", v);
                      } else {
                        set("industria", "");
                      }
                    }}>
                      <option value="">Seleccione industria...</option>
                      {INDUSTRIAS_COMUNES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                      <option value="Otro">Otra (Escribir...)</option>
                    </select>
                    {selIndustria === "Otro" && (
                      <Input value={form.industria} onChange={(e) => set("industria", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366] animate-in slide-in-from-top-1 duration-150" placeholder="Escribe la industria..." />
                    )}
                  </div>
                </F>
                <F label="Tamaño (empleados)">
                  <Input placeholder="Ej. 50-200" value={form.tamano} onChange={(e) => set("tamano", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]" />
                </F>
              </div>
            </div>
          </div>
          
          <F label="Descripción">
            <Textarea rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} className="rounded-xl border-border bg-muted/20 focus-visible:ring-[#003366] resize-none" placeholder="Breve descripción de la empresa y su enfoque..." />
          </F>
          
          <div className="grid grid-cols-2 gap-4">
            <F label="Ciudad">
              <Input value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]" placeholder="Ej. Aguascalientes" />
            </F>
            <F label="Teléfono">
              <Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]" placeholder="Ej. 4491234567" />
            </F>
          </div>
          
          <F label="Correo de contacto">
            <Input value={form.correo_contacto} onChange={(e) => set("correo_contacto", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]" placeholder="contacto@empresa.com" />
          </F>
          
          <F label="Sitio web">
            <Input placeholder="https://www.empresa.com" value={form.sitio_web} onChange={(e) => set("sitio_web", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]" />
          </F>
          
          <F label="Dirección física">
            <Input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]" placeholder="Calle, Colonia, C.P." />
          </F>
          
          <label className="flex items-center gap-2.5 text-sm text-[#2C3E50] cursor-pointer select-none font-medium mt-2">
            <input type="checkbox" checked={form.activa} onChange={(e) => set("activa", e.target.checked)} className="size-4 rounded border-border text-[#003366] focus:ring-[#003366] cursor-pointer" /> 
            Empresa activa y visible
          </label>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl h-10 hover:bg-muted font-semibold">
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={saving} className="bg-[#003366] hover:bg-[#002244] text-white rounded-xl h-10 px-5 font-semibold flex items-center gap-1.5 active:scale-95 transition-all">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} 
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children, error }: any) {
  return (
    <div className="space-y-1.5">
      <Label className={`text-xs font-bold uppercase tracking-wider ${error ? 'text-red-500' : 'text-muted-foreground'}`}>{label}</Label>
      <div className={error ? "[&_input]:border-red-500 [&_textarea]:border-red-500 [&_select]:border-red-500" : ""}>
        {children}
      </div>
    </div>
  );
}
