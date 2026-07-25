import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Save, Briefcase } from "lucide-react";
import { jobsService } from "../../../services/jobs.service";
import { companiesService, type Company } from "../../../services/companies.service";
import type { Vacante } from "../../../services/types";

export function AdminVacantes() {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Vacante | "new" | null>(null);

  const cargar = () => {
    setLoading(true);
    jobsService.list({ limit: 100 }).then((r) => setVacantes(r.data || [])).catch(() => setVacantes([])).finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); companiesService.list().then(setEmpresas).catch(() => {}); }, []);

  const eliminar = async (id: string) => { await jobsService.remove(id); cargar(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Gestión de Vacantes</h1>
          <p className="text-sm text-[#7F8C8D] mt-0.5">{vacantes.length} vacantes publicadas</p>
        </div>
        <Button onClick={() => setEdit("new")} className="flex items-center gap-1.5"><Plus className="size-4" /> Nueva vacante</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : (
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5F7FA] text-left text-xs text-[#7F8C8D] uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Vacante</th>
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Modalidad</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vacantes.map((v) => (
                  <tr key={v.id} className="border-b border-[#F5F7FA] last:border-0 hover:bg-[#FAFAFA]">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#2C3E50]">{v.titulo}</p>
                      <p className="text-xs text-[#7F8C8D]">{v.ubicacion}</p>
                    </td>
                    <td className="px-5 py-3 text-[#2C3E50]">{v.empresa?.nombre}</td>
                    <td className="px-5 py-3 text-[#7F8C8D]">{v.modalidad || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>{v.activa ? "Activa" : "Inactiva"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEdit(v)} className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] hover:text-[#003366]"><Pencil className="size-4" /></button>
                        <button onClick={() => eliminar(v.id)} className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#FEE2E2] hover:text-[#E74C3C]"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vacantes.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-[#7F8C8D]"><Briefcase className="size-6 mx-auto mb-2" />No hay vacantes.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {edit && <VacanteDialog item={edit === "new" ? null : edit} empresas={empresas} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); cargar(); }} />}
    </div>
  );
}

function VacanteDialog({ item, empresas, onClose, onSaved }: { item: Vacante | null; empresas: Company[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    titulo: item?.titulo || "", descripcion: item?.descripcion || "", requisitos: item?.requisitos || "",
    empresa_id: item?.empresa_id || (empresas[0]?.id ?? ""), salario_min: item?.salario_min?.toString() || "",
    salario_max: item?.salario_max?.toString() || "", modalidad: item?.modalidad || "Presencial",
    tipo_contrato: item?.tipo_contrato || "Tiempo completo", nivel_experiencia: item?.nivel_experiencia || "Junior",
    ubicacion: item?.ubicacion || "", activa: item?.activa ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const guardar = async () => {
    setSaving(true); setError("");
    try {
      const payload: any = {
        titulo: form.titulo, descripcion: form.descripcion, requisitos: form.requisitos, empresa_id: form.empresa_id,
        salario_min: form.salario_min ? Number(form.salario_min) : undefined, salario_max: form.salario_max ? Number(form.salario_max) : undefined,
        modalidad: form.modalidad, tipo_contrato: form.tipo_contrato, nivel_experiencia: form.nivel_experiencia, ubicacion: form.ubicacion,
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
          <F label="Título *"><Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} /></F>
          <F label="Empresa *">
            <select className={sel} value={form.empresa_id} onChange={(e) => set("empresa_id", e.target.value)}>
              <option value="">Selecciona…</option>
              {empresas.map((em) => <option key={em.id} value={em.id}>{em.nombre}</option>)}
            </select>
          </F>
          <F label="Descripción *"><Textarea rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} /></F>
          <F label="Requisitos"><Textarea rows={2} value={form.requisitos} onChange={(e) => set("requisitos", e.target.value)} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Salario mín."><Input type="number" value={form.salario_min} onChange={(e) => set("salario_min", e.target.value)} /></F>
            <F label="Salario máx."><Input type="number" value={form.salario_max} onChange={(e) => set("salario_max", e.target.value)} /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Modalidad"><select className={sel} value={form.modalidad} onChange={(e) => set("modalidad", e.target.value)}><option>Presencial</option><option>Remoto</option><option>Híbrido</option></select></F>
            <F label="Tipo"><select className={sel} value={form.tipo_contrato} onChange={(e) => set("tipo_contrato", e.target.value)}><option>Tiempo completo</option><option>Medio tiempo</option><option>Prácticas</option><option>Freelance</option></select></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Nivel"><select className={sel} value={form.nivel_experiencia} onChange={(e) => set("nivel_experiencia", e.target.value)}><option>Sin experiencia</option><option>Junior</option><option>Semi-senior</option><option>Senior</option></select></F>
            <F label="Ubicación"><Input value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} /></F>
          </div>
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
