import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Building2, Plus, Pencil, Trash2, Globe, MapPin, Loader2, Save } from "lucide-react";
import { companiesService, type Company } from "../../../services/companies.service";

export function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Company | "new" | null>(null);

  const cargar = () => { setLoading(true); companiesService.list().then(setEmpresas).catch(() => setEmpresas([])).finally(() => setLoading(false)); };
  useEffect(() => { cargar(); }, []);

  const activas = empresas.filter((e) => e.activa).length;

  const eliminar = async (id: string) => { await companiesService.remove(id); cargar(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Empresas</h1>
          <p className="text-sm text-[#7F8C8D] mt-0.5">{empresas.length} registradas · {activas} activas</p>
        </div>
        <Button onClick={() => setEdit("new")} className="flex items-center gap-1.5"><Plus className="size-4" /> Nueva empresa</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((e) => (
            <Card key={e.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-[#003366] flex items-center justify-center text-white font-bold">{e.nombre.substring(0, 2).toUpperCase()}</div>
                    <div>
                      <p className="font-bold text-[#2C3E50]">{e.nombre}</p>
                      <p className="text-xs text-[#7F8C8D]">{e.industria || "—"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{e.activa ? "Activa" : "Inactiva"}</span>
                </div>
                {e.descripcion && <p className="text-sm text-[#7F8C8D] mt-3 line-clamp-2">{e.descripcion}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-[#7F8C8D]">
                  {e.ciudad && <span className="flex items-center gap-1"><MapPin className="size-3" />{e.ciudad}</span>}
                  {e.tamano && <span>{e.tamano} empleados</span>}
                </div>
                {e.sitio_web && <a href={e.sitio_web} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#003366] font-semibold hover:underline mt-2"><Globe className="size-3" />Sitio web</a>}
                <div className="flex gap-2 mt-4 pt-3 border-t border-[#F5F7FA]">
                  <button onClick={() => setEdit(e)} className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:bg-[#F5F7FA] px-2.5 py-1.5 rounded-lg"><Pencil className="size-3.5" />Editar</button>
                  <button onClick={() => eliminar(e.id)} className="flex items-center gap-1 text-xs font-semibold text-[#E74C3C] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded-lg"><Trash2 className="size-3.5" />Desactivar</button>
                </div>
              </CardContent>
            </Card>
          ))}
          {empresas.length === 0 && (
            <Card className="border-0 shadow-sm col-span-full"><CardContent className="p-10 text-center text-sm text-[#7F8C8D]">
              <Building2 className="size-6 mx-auto mb-2 text-[#7F8C8D]" />No hay empresas registradas.
            </CardContent></Card>
          )}
        </div>
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
