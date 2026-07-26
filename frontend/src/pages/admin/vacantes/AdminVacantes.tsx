import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Save, Briefcase, X, ChevronsUpDown, Check, ImagePlus, Search, LayoutGrid, List } from "lucide-react";
import { jobsService } from "../../../services/jobs.service";
import { companiesService, type Company } from "../../../services/companies.service";
import { CARRERAS_UPA, CUATRIMESTRES, TIPOS_CONTRATO, MODALIDADES } from "../../../utils/catalogos";
import { fileToDataUrl } from "../../../utils/image";
import type { Vacante } from "../../../services/types";

const fmtFecha = (s: string | null) => s ? new Date(s).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : null;

export function AdminVacantes() {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Vacante | "new" | null>(null);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todas" | "activas" | "inactivas">("todas");
  const [vista, setVista] = useState<"lista" | "cuadricula">(() => (localStorage.getItem("inupa_vacantes_view") as any) || "lista");

  useEffect(() => { localStorage.setItem("inupa_vacantes_view", vista); }, [vista]);

  const cargar = () => {
    setLoading(true);
    jobsService.list({ limit: 100 }).then((r) => setVacantes(r.data || [])).catch(() => setVacantes([])).finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); companiesService.list().then(setEmpresas).catch(() => {}); }, []);

  const eliminar = async (id: string) => { await jobsService.remove(id); cargar(); };

  const filtradas = useMemo(() => vacantes.filter((v) => {
    const t = (v.titulo + (v.empresa?.nombre || "") + (v.ubicacion || "")).toLowerCase().includes(q.toLowerCase());
    const s = estado === "todas" || (estado === "activas" ? v.activa : !v.activa);
    return t && s;
  }), [vacantes, q, estado]);

  const sel = "h-10 rounded-xl border border-border bg-background px-3 text-sm";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Gestión de Vacantes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{vacantes.length} vacantes publicadas</p>
        </div>
        <Button onClick={() => setEdit("new")} className="flex items-center gap-1.5"><Plus className="size-4" /> Nueva vacante</Button>
      </div>

      {/* Búsqueda + filtro + toggle vista */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Buscar por título, empresa o ubicación..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-10 rounded-xl text-sm" />
        </div>
        <select className={sel} value={estado} onChange={(e) => setEstado(e.target.value as any)}>
          <option value="todas">Todas</option>
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
        <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center text-muted-foreground"><Briefcase className="size-6 mx-auto mb-2" />No hay vacantes que coincidan.</CardContent></Card>
      ) : vista === "cuadricula" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((v) => (
            <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="h-28 bg-[#F5F7FA] flex items-center justify-center overflow-hidden">
                {v.imagen_url ? <img src={v.imagen_url} alt="" className="size-full object-cover" /> : <Briefcase className="size-8 text-[#B0B8C1]" />}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{v.titulo}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.empresa?.nombre}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none ${v.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{v.activa ? "Activa" : "Inactiva"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{v.modalidad || "—"} · {v.ubicacion || "—"}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {v.carreras && v.carreras.length > 0
                    ? v.carreras.map((c) => <span key={c} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#003366]/[0.07] text-[#003366]">{abreviaCarrera(c)}</span>)
                    : <span className="text-[10px] text-muted-foreground">Todas las carreras</span>}
                  {v.cuatrimestre ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{v.cuatrimestre}º+</span> : null}
                </div>
                {fmtFecha(v.fecha_limite) && <p className="text-[11px] text-muted-foreground mt-2">Cierra el {fmtFecha(v.fecha_limite)}</p>}
                <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                  <button onClick={() => setEdit(v)} className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:bg-muted px-2.5 py-1.5 rounded-lg"><Pencil className="size-3.5" />Editar</button>
                  <button onClick={() => eliminar(v.id)} className="flex items-center gap-1 text-xs font-semibold text-[#E74C3C] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded-lg"><Trash2 className="size-3.5" />Desactivar</button>
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
                  <th className="px-5 py-3 font-semibold">Vacante</th>
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Carreras</th>
                  <th className="px-5 py-3 font-semibold">Cuatri</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center flex-none">
                          {v.imagen_url ? <img src={v.imagen_url} alt="" className="size-full object-cover" /> : <Briefcase className="size-4 text-[#B0B8C1]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{v.titulo}</p>
                          <p className="text-xs text-muted-foreground">{v.modalidad || "—"} · {v.ubicacion || "—"}{fmtFecha(v.fecha_limite) ? ` · Cierra ${fmtFecha(v.fecha_limite)}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground">{v.empresa?.nombre}</td>
                    <td className="px-5 py-3">
                      {v.carreras && v.carreras.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {v.carreras.map((c) => (
                            <span key={c} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#003366]/[0.1] text-[#003366]">{abreviaCarrera(c)}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">Todas</span>}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{v.cuatrimestre ? `${v.cuatrimestre}º+` : "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{v.activa ? "Activa" : "Inactiva"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEdit(v)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-[#003366]"><Pencil className="size-4" /></button>
                        <button onClick={() => eliminar(v.id)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-[#FEE2E2] hover:text-[#E74C3C]"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {edit && <VacanteDialog item={edit === "new" ? null : edit} empresas={empresas} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); cargar(); }} />}
    </div>
  );
}

// Abrevia el nombre de la carrera para las etiquetas (ISC, Mecatrónica, ...).
function abreviaCarrera(c: string): string {
  if (c.includes("Sistemas Computacionales")) return "ISC";
  if (c.includes("Sistemas Estratégicos")) return "ISEI";
  if (c.includes("Tecnologías")) return "ITI";
  if (c.includes("Administración")) return "LAGE";
  return c.replace(/^Ingeniería en |^Ingeniería |^Licenciatura en /, "");
}

// ---------------------------------------------------------------------------
// Combobox de empresa con búsqueda.
// ---------------------------------------------------------------------------
function EmpresaCombo({ empresas, value, onChange }: { empresas: Company[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const seleccionada = empresas.find((e) => e.id === value);
  const filtradas = empresas.filter((e) => e.nombre.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full h-10 rounded-xl border border-[#D1D5DB] px-3 text-sm bg-white flex items-center justify-between text-left">
        <span className={seleccionada ? "text-[#2C3E50]" : "text-[#9CA3AF]"}>{seleccionada?.nombre || "Selecciona empresa…"}</span>
        <ChevronsUpDown className="size-4 text-[#7F8C8D] shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          <div className="p-2 border-b border-[#F5F7FA]">
            <Input autoFocus placeholder="Buscar empresa…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtradas.map((e) => (
              <button key={e.id} type="button" onClick={() => { onChange(e.id); setOpen(false); setQ(""); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F7FA] flex items-center justify-between">
                <span className="text-[#2C3E50]">{e.nombre}</span>
                {e.id === value && <Check className="size-4 text-[#003366]" />}
              </button>
            ))}
            {filtradas.length === 0 && <p className="px-3 py-3 text-xs text-[#7F8C8D] text-center">Sin resultados.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function VacanteDialog({ item, empresas, onClose, onSaved }: { item: Vacante | null; empresas: Company[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    titulo: item?.titulo || "", descripcion: item?.descripcion || "",
    empresa_id: item?.empresa_id || "", salario_min: item?.salario_min?.toString() || "",
    salario_max: item?.salario_max?.toString() || "", modalidad: item?.modalidad || "Presencial",
    tipo_contrato: item?.tipo_contrato || TIPOS_CONTRATO[0], nivel_experiencia: item?.nivel_experiencia || "Junior",
    ubicacion: item?.ubicacion || "", activa: item?.activa ?? true,
    cuatrimestre: item?.cuatrimestre ? String(item.cuatrimestre) : "",
    fecha_limite: item?.fecha_limite ? item.fecha_limite.slice(0, 10) : "",
  });
  const [imagen, setImagen] = useState<string>(item?.imagen_url || "");
  const [imgError, setImgError] = useState("");
  // Requisitos como lista de chips (se guardan como texto separado por saltos de línea).
  const [requisitos, setRequisitos] = useState<string[]>(() =>
    (item?.requisitos || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  );
  const [reqInput, setReqInput] = useState("");
  const [carreras, setCarreras] = useState<string[]>(item?.carreras || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const subirImagen = async (file?: File) => {
    if (!file) return;
    setImgError("");
    try { setImagen(await fileToDataUrl(file, 900, 0.82)); }
    catch { setImgError("No se pudo procesar la imagen."); }
  };
  const addReq = () => { const t = reqInput.trim(); if (t && !requisitos.includes(t)) setRequisitos((r) => [...r, t]); setReqInput(""); };
  const toggleCarrera = (c: string) => setCarreras((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const guardar = async () => {
    if (!form.empresa_id) { setError("Selecciona una empresa."); return; }
    setSaving(true); setError("");
    try {
      const payload: any = {
        titulo: form.titulo, descripcion: form.descripcion, requisitos: requisitos.join("\n"), empresa_id: form.empresa_id,
        salario_min: form.salario_min ? Number(form.salario_min) : undefined, salario_max: form.salario_max ? Number(form.salario_max) : undefined,
        modalidad: form.modalidad, tipo_contrato: form.tipo_contrato, nivel_experiencia: form.nivel_experiencia, ubicacion: form.ubicacion,
        carreras, cuatrimestre: form.cuatrimestre ? Number(form.cuatrimestre) : undefined,
        fecha_limite: form.fecha_limite || undefined, imagen_url: imagen || undefined,
      };
      if (item) await jobsService.update(item.id, { ...payload, activa: form.activa }); else await jobsService.create(payload);
      onSaved();
    } catch (e: any) { setError(e?.response?.data?.error || "No se pudo guardar."); } finally { setSaving(false); }
  };
  const F = ({ label, children }: any) => (<div className="space-y-1"><Label className="text-xs font-semibold text-[#2C3E50]">{label}</Label>{children}</div>);
  const sel = "w-full h-10 rounded-xl border border-[#D1D5DB] px-3 text-sm bg-white";
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Editar vacante" : "Nueva vacante"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {error && <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>}

          {/* Imagen / banner de la vacante */}
          <F label="Imagen de la vacante">
            <div className="rounded-xl border border-dashed border-[#D1D5DB] p-3">
              {imagen ? (
                <div className="relative">
                  <img src={imagen} alt="Vista previa" className="w-full h-32 object-cover rounded-lg" />
                  <button type="button" onClick={() => setImagen("")} className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"><X className="size-4" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1 py-4 cursor-pointer text-[#7F8C8D] hover:text-[#003366]">
                  <ImagePlus className="size-6" />
                  <span className="text-xs font-medium">Subir imagen (logo o banner)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => subirImagen(e.target.files?.[0])} />
                </label>
              )}
              {imgError && <p className="text-xs text-red-600 mt-1">{imgError}</p>}
            </div>
          </F>

          <F label="Título *"><Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} /></F>
          <F label="Empresa *"><EmpresaCombo empresas={empresas} value={form.empresa_id} onChange={(id) => set("empresa_id", id)} /></F>
          <F label="Descripción *"><Textarea rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} /></F>

          <F label="Requisitos">
            <div className="flex gap-2">
              <Input value={reqInput} onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addReq(); } }}
                placeholder="Escribe un requisito y presiona +" />
              <Button type="button" variant="outline" onClick={addReq} className="shrink-0 px-3"><Plus className="size-4" /></Button>
            </div>
            {requisitos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {requisitos.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#F5F7FA] text-[#2C3E50]">
                    {r}
                    <button type="button" onClick={() => setRequisitos((rs) => rs.filter((x) => x !== r))} className="text-[#9CA3AF] hover:text-[#E74C3C]"><X className="size-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </F>

          <F label="Carreras dirigidas (ninguna = todas)">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#E5E7EB] p-2">
              {CARRERAS_UPA.map((c) => {
                const on = carreras.includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleCarrera(c)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${on ? "bg-[#003366] text-white border-[#003366]" : "bg-white text-[#7F8C8D] border-[#E5E7EB] hover:border-[#003366]"}`}>
                    {abreviaCarrera(c)}
                  </button>
                );
              })}
            </div>
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Cuatrimestre mínimo">
              <select className={sel} value={form.cuatrimestre} onChange={(e) => set("cuatrimestre", e.target.value)}>
                <option value="">Cualquiera</option>
                {CUATRIMESTRES.map((n) => <option key={n} value={n}>{n}º en adelante</option>)}
              </select>
            </F>
            <F label="Fecha límite para postularse"><Input type="date" value={form.fecha_limite} onChange={(e) => set("fecha_limite", e.target.value)} /></F>
          </div>
          <F label="Ubicación"><Input value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Salario mín."><Input type="number" value={form.salario_min} onChange={(e) => set("salario_min", e.target.value)} /></F>
            <F label="Salario máx."><Input type="number" value={form.salario_max} onChange={(e) => set("salario_max", e.target.value)} /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Modalidad"><select className={sel} value={form.modalidad} onChange={(e) => set("modalidad", e.target.value)}>{MODALIDADES.map((m) => <option key={m}>{m}</option>)}</select></F>
            <F label="Tipo"><select className={sel} value={form.tipo_contrato} onChange={(e) => set("tipo_contrato", e.target.value)}>{TIPOS_CONTRATO.map((t) => <option key={t}>{t}</option>)}</select></F>
          </div>
          <F label="Nivel"><select className={sel} value={form.nivel_experiencia} onChange={(e) => set("nivel_experiencia", e.target.value)}><option>Sin experiencia</option><option>Junior</option><option>Semi-senior</option><option>Senior</option></select></F>
          {item && <label className="flex items-center gap-2 text-sm text-[#2C3E50] cursor-pointer"><input type="checkbox" checked={form.activa} onChange={(e) => set("activa", e.target.checked)} /> Activa</label>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={guardar} disabled={saving} className="flex items-center gap-1.5">{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
