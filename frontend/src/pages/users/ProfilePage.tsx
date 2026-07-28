import { useEffect, useState } from "react";
import {
  Briefcase, GraduationCap, MapPin, Mail, Phone, Code2, Link2,
  Pencil, Trash2, Plus, X, ExternalLink, FolderGit2, Loader2, Save, BadgeCheck,
  Sparkles, Upload,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { profileService, type FullProfile } from "../../services/profile.service";
import { userService } from "../../services/user.service";
import { aiService } from "../../services/ai.service";
import { CARRERAS_UPA, CUATRIMESTRES } from "../../utils/catalogos";

// Reescala una imagen a un cuadrado ~256px y la devuelve como data URL JPEG (ligero)
function fileToThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmtMes = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : `${MESES[d.getMonth()]} ${d.getFullYear()}`;
};
const rango = (ini: string, fin: string | null, actual: boolean) =>
  `${fmtMes(ini)} — ${actual ? "Actualidad" : fin ? fmtMes(fin) : ""}`;
const toDateInput = (iso: string | null) => (iso ? iso.substring(0, 10) : "");
const splitTech = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);
const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-[#003366]/[0.06] text-[#003366] text-xs font-medium px-2.5 py-1 rounded-lg">{children}</span>
);
const SectionHeader = ({ title, onAdd }: { title: string; onAdd?: () => void }) => (
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
    <h3 className="text-xl font-extrabold text-[#2C3E50]">{title}</h3>
    {onAdd && (
      <button onClick={onAdd} className="flex items-center gap-2 text-sm font-bold text-[#003366] hover:bg-[#003366]/10 px-4 py-2 rounded-xl transition-all">
        <Plus className="size-4" /> Agregar
      </button>
    )}
  </div>
);
const IconBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] hover:text-[#2C3E50] transition-colors">{children}</button>
);
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1"><Label className="text-xs font-semibold text-[#2C3E50]">{label}</Label>{children}</div>
);
const Footer = ({ onCancel, onSave, saving }: { onCancel: () => void; onSave: () => void; saving: boolean }) => (
  <div className="flex justify-end gap-2 mt-5">
    <Button variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
    <Button onClick={onSave} disabled={saving} className="flex items-center gap-1.5">
      {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar
    </Button>
  </div>
);

export function ProfilePage() {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [basicsOpen, setBasicsOpen] = useState(false);
  const [expEdit, setExpEdit] = useState<any | "new" | null>(null);
  const [eduEdit, setEduEdit] = useState<any | "new" | null>(null);
  const [projEdit, setProjEdit] = useState<any | "new" | null>(null);

  const cargar = () => profileService.getMyProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { cargar(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#003366]" /></div>;
  if (!profile) return <div className="p-8 text-center text-[#7F8C8D]">No se pudo cargar tu perfil.</div>;

  const p = profile.perfil;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Encabezado Premium */}
      <Card className="overflow-hidden border border-slate-100 shadow-lg rounded-[2rem] p-0 gap-0 bg-white">
        <div className="h-32 bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#00509E] relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-4">
            <div className="size-32 rounded-full ring-[6px] ring-white bg-gradient-to-br from-[#003366] to-[#00A8E8] shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
              {p.url_foto ? <img src={p.url_foto} alt="Foto" className="size-full object-cover" /> : <span className="text-white text-4xl font-extrabold">{initials(profile.nombre_completo)}</span>}
            </div>
            <div className="flex-1 min-w-0 pt-2 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-3xl font-black text-[#2C3E50] leading-tight tracking-tight break-words">{profile.nombre_completo}</h2>
                  <p className="text-[#00509E] font-bold mt-1 text-lg">{p.titular_profesional || "Agrega tu titular profesional"}</p>
                </div>
                <Button variant="outline" onClick={() => setBasicsOpen(true)} className="flex items-center gap-2 flex-shrink-0 self-start rounded-xl font-bold hover:bg-slate-50 border-slate-200">
                  <Pencil className="size-4" /> Editar perfil
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm font-medium text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {profile.carrera && <span className="flex items-center gap-1.5"><GraduationCap className="size-4 text-[#003366]" />{profile.carrera}{profile.cuatrimestre ? ` · ${profile.cuatrimestre}° cuatri` : ""}</span>}
            {p.ubicacion && <span className="flex items-center gap-1.5"><MapPin className="size-4 text-[#003366]" />{p.ubicacion}</span>}
            <span className="flex items-center gap-1.5 min-w-0"><Mail className="size-4 text-[#003366] flex-shrink-0" /><span className="truncate">{profile.correo_institucional}</span></span>
            {p.telefono && <span className="flex items-center gap-1.5"><Phone className="size-4 text-[#003366]" />{p.telefono}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {p.buscando_empleo && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#16A34A]/20 px-3 py-1.5 rounded-xl shadow-sm"><BadgeCheck className="size-4" /> Buscando empleo</span>}
            {p.disponibilidad && <span className="text-xs font-bold text-[#003366] bg-[#003366]/10 border border-[#003366]/20 px-3 py-1.5 rounded-xl shadow-sm">Disponible</span>}
            {p.nivel_experiencia && <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] border border-[#D97706]/20 px-3 py-1.5 rounded-xl shadow-sm">{p.nivel_experiencia}</span>}
            <div className="flex-1" />
            <div className="flex gap-2">
              {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-[#003366] hover:bg-[#003366]/5 transition-colors"><Code2 className="size-5" /></a>}
              {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-[#00A8E8] hover:bg-[#00A8E8]/5 transition-colors"><Link2 className="size-5" /></a>}
            </div>
          </div>
        </div>
      </Card>

      {/* Acerca de */}
      <Card className="border border-slate-100 shadow-sm rounded-3xl"><CardContent className="p-8">
        <SectionHeader title="Acerca de" onAdd={() => setBasicsOpen(true)} />
        {p.biografia ? <p className="text-base text-slate-700 whitespace-pre-line leading-relaxed">{p.biografia}</p>
          : <p className="text-sm text-slate-400 italic">Cuéntale al mundo sobre ti: tus intereses, objetivos y fortalezas.</p>}
      </CardContent></Card>

      {/* Experiencia (Timeline) */}
      <Card className="border border-slate-100 shadow-sm rounded-3xl"><CardContent className="p-8">
        <SectionHeader title="Experiencia" onAdd={() => setExpEdit("new")} />
        {profile.experiencia.length === 0 ? <p className="text-sm text-slate-400 italic">Agrega tu experiencia laboral, prácticas o servicio social.</p> : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {profile.experiencia.map((e: any, index: number) => (
              <div key={e.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-slate-50 text-[#003366] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Briefcase className="size-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border border-slate-100 shadow-sm bg-white transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-extrabold text-[#2C3E50] text-lg">{e.puesto}</p>
                      <p className="font-semibold text-[#00A8E8]">{e.empresa_nombre}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{rango(e.fecha_inicio, e.fecha_fin, e.actual)}</p>
                    </div>
                    <div className="flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconBtn onClick={() => setExpEdit(e)}><Pencil className="size-4" /></IconBtn>
                      <IconBtn onClick={async () => { await profileService.deleteExperience(e.id); cargar(); }}><Trash2 className="size-4" /></IconBtn>
                    </div>
                  </div>
                  {e.actividades?.length > 0 ? (
                    <ul className="mt-4 space-y-3">
                      {e.actividades.map((ac: any, i: number) => (
                        <li key={i} className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="font-bold text-[#2C3E50] block mb-1">{ac.actividad}</span>
                          {ac.descripcion && <span className="block text-slate-600 leading-relaxed">{ac.descripcion}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    e.descripcion && <p className="text-sm text-slate-600 mt-3 whitespace-pre-line leading-relaxed">{e.descripcion}</p>
                  )}
                  {e.tecnologias_usadas?.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{e.tecnologias_usadas.map((t: string, i: number) => <Chip key={i}>{t}</Chip>)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      {/* Educación (Timeline) */}
      <Card className="border border-slate-100 shadow-sm rounded-3xl"><CardContent className="p-8">
        <SectionHeader title="Educación" onAdd={() => setEduEdit("new")} />
        {profile.educacion.length === 0 ? <p className="text-sm text-slate-400 italic">Agrega tu formación académica.</p> : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {profile.educacion.map((ed: any) => (
              <div key={ed.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-slate-50 text-[#CA8A04] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <GraduationCap className="size-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border border-slate-100 shadow-sm bg-white transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-[#2C3E50] text-lg">{ed.institucion}</p>
                      <p className="font-semibold text-slate-700 mt-1">{ed.carrera_o_grado}{ed.nivel_estudios ? ` · ${ed.nivel_estudios}` : ""}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">
                        {rango(ed.fecha_inicio, ed.fecha_fin, false)}{ed.promedio ? ` · Promedio: ${ed.promedio}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconBtn onClick={() => setEduEdit(ed)}><Pencil className="size-4" /></IconBtn>
                      <IconBtn onClick={async () => { await profileService.deleteEducation(ed.id); cargar(); }}><Trash2 className="size-4" /></IconBtn>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      {/* Habilidades */}
      <Card className="border border-slate-100 shadow-sm rounded-3xl"><CardContent className="p-8">
        <SectionHeader title="Habilidades" />
        <SkillEditor skills={profile.habilidades} onChange={cargar} />
      </CardContent></Card>

      {/* Proyectos */}
      <Card className="border border-slate-100 shadow-sm rounded-3xl"><CardContent className="p-8">
        <SectionHeader title="Proyectos" onAdd={() => setProjEdit("new")} />
        {profile.proyectos.length === 0 ? <p className="text-sm text-slate-400 italic">Muestra los proyectos que has construido.</p> : (
          <div className="grid md:grid-cols-2 gap-6">
            {profile.proyectos.map((pr: any) => (
              <div key={pr.id} className="border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white relative group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#003366]/5 rounded-xl text-[#003366]"><FolderGit2 className="size-5" /></div>
                    <p className="font-extrabold text-[#2C3E50] text-lg">{pr.nombre_proyecto}</p>
                  </div>
                  <div className="flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm rounded-lg border border-slate-100">
                    <IconBtn onClick={() => setProjEdit(pr)}><Pencil className="size-4" /></IconBtn>
                    <IconBtn onClick={async () => { await profileService.deleteProject(pr.id); cargar(); }}><Trash2 className="size-4" /></IconBtn>
                  </div>
                </div>
                {pr.rol_en_proyecto && <p className="text-xs font-bold text-[#CA8A04] uppercase tracking-wider mb-2">{pr.rol_en_proyecto}</p>}
                {pr.descripcion && <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">{pr.descripcion}</p>}
                {pr.tecnologias?.length > 0 && <div className="flex flex-wrap gap-2 mb-4">{pr.tecnologias.map((t: string, i: number) => <Chip key={i}>{t}</Chip>)}</div>}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  {pr.url_repositorio && <a href={pr.url_repositorio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-[#00A8E8] hover:text-[#003366] transition-colors"><Code2 className="size-4" /> Código</a>}
                  {pr.url_despliegue && <a href={pr.url_despliegue} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-[#00A8E8] hover:text-[#003366] transition-colors"><ExternalLink className="size-4" /> Demo</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      {basicsOpen && <BasicsDialog profile={profile} onClose={() => setBasicsOpen(false)} onSaved={() => { setBasicsOpen(false); cargar(); }} />}
      {expEdit && <ExperienceDialog item={expEdit === "new" ? null : expEdit} onClose={() => setExpEdit(null)} onSaved={() => { setExpEdit(null); cargar(); }} />}
      {eduEdit && <EducationDialog item={eduEdit === "new" ? null : eduEdit} onClose={() => setEduEdit(null)} onSaved={() => { setEduEdit(null); cargar(); }} />}
      {projEdit && <ProjectDialog item={projEdit === "new" ? null : projEdit} onClose={() => setProjEdit(null)} onSaved={() => { setProjEdit(null); cargar(); }} />}
    </div>
  );
}

function SkillEditor({ skills, onChange }: { skills: any[]; onChange: () => void }) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const agregar = async () => {
    const n = nombre.trim(); if (!n) return;
    setSaving(true);
    try { await profileService.addSkill({ nombre: n }); setNombre(""); onChange(); } finally { setSaving(false); }
  };
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Ej. React, Python, Trabajo en equipo…" value={nombre} onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }} className="h-10" />
        <Button onClick={agregar} disabled={saving} className="flex items-center gap-1.5">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Agregar
        </Button>
      </div>
      {skills.length === 0 ? <p className="text-sm text-[#7F8C8D] italic">Agrega tus habilidades técnicas y blandas.</p> : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s: any) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 bg-[#003366]/[0.06] text-[#003366] text-sm font-medium px-3 py-1.5 rounded-lg">
              {s.nombre}
              <button onClick={async () => { await profileService.deleteSkill(s.id); onChange(); }} className="hover:text-[#E74C3C]"><X className="size-3.5" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BasicsDialog({ profile, onClose, onSaved }: { profile: FullProfile; onClose: () => void; onSaved: () => void }) {
  const p = profile.perfil;
  const [form, setForm] = useState({
    nombre_completo: profile.nombre_completo || "", carrera: profile.carrera || "", cuatrimestre: profile.cuatrimestre ? String(profile.cuatrimestre) : "",
    titular_profesional: p.titular_profesional || "", biografia: p.biografia || "",
    ubicacion: p.ubicacion || "", telefono: p.telefono || "", url_foto: p.url_foto || "", github_url: p.github_url || "",
    linkedin_url: p.linkedin_url || "", nivel_experiencia: p.nivel_experiencia || "", buscando_empleo: p.buscando_empleo, disponibilidad: p.disponibilidad,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const selCls = "w-full h-10 rounded-xl border border-[#D1D5DB] px-3 text-sm bg-white";

  const subirFoto = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setError("La imagen supera el límite de tamaño permitido (máximo 50MB).");
      return;
    }
    try { set("url_foto", await fileToThumbnail(file)); } catch { setError("No se pudo procesar la imagen."); }
  };

  // Sugerencia con IA: mejora "Acerca de" y propone un titular a partir de lo que escribiste + tu carrera
  const sugerirIA = async () => {
    setError(""); setIaLoading(true);
    try {
      const seed = [
        form.biografia,
        form.titular_profesional,
        form.carrera ? `Estudio ${form.carrera}` : "",
      ].filter(Boolean).join(". ") || `Soy estudiante de ${form.carrera || "mi carrera"} en la UPA`;
      const r = await aiService.optimizarTexto(seed);
      if (r?.error) { setError(r.error); return; }
      if (r.perfil) set("biografia", r.perfil);
      if (!form.titular_profesional && r.perfil) {
        set("titular_profesional", `Estudiante de ${form.carrera || "la UPA"}`);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || "No se pudo generar la sugerencia.");
    } finally { setIaLoading(false); }
  };

  const guardar = async () => {
    setSaving(true); setError("");
    try {
      await userService.updateMe({ ...form, cuatrimestre: form.cuatrimestre ? Number(form.cuatrimestre) : undefined });
      onSaved();
    } catch (e: any) { setError("Ha ocurrido un error, por favor contacta a un administrador"); } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl font-black text-[#2C3E50]">Editar perfil</DialogTitle></DialogHeader>
        <div className="space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">{error}</div>}

          {/* Foto */}
          <div className="flex items-center gap-3">
            <div className="size-16 rounded-full bg-[#003366] flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.url_foto ? <img src={form.url_foto} alt="" className="size-full object-cover" /> : <span className="text-white font-bold">{initials(form.nombre_completo)}</span>}
            </div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-[#003366] cursor-pointer hover:bg-[#003366]/[0.06] px-3 py-2 rounded-lg">
              <Upload className="size-4" /> Subir foto
              <input type="file" accept="image/*" className="hidden" onChange={(e) => subirFoto(e.target.files?.[0])} />
            </label>
            <span className="text-[10px] text-muted-foreground/80">(Máx. 50MB)</span>
            {form.url_foto && <button type="button" onClick={() => set("url_foto", "")} className="text-xs text-[#E74C3C] hover:underline ml-auto">Quitar</button>}
          </div>

          <Field label="Nombre completo"><Input value={form.nombre_completo} onChange={(e) => set("nombre_completo", e.target.value)} /></Field>
          <div className="grid grid-cols-[1fr_auto] gap-5">
            <Field label="Carrera">
              <select value={form.carrera} onChange={(e) => set("carrera", e.target.value)} className={selCls}>
                <option value="">Selecciona…</option>{CARRERAS_UPA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Cuatri">
              <select value={form.cuatrimestre} onChange={(e) => set("cuatrimestre", e.target.value)} className={selCls}>
                <option value="">—</option>{CUATRIMESTRES.map((c) => <option key={c} value={c}>{c}°</option>)}
              </select>
            </Field>
          </div>

          <Field label="Titular profesional"><Input placeholder="Ej. Estudiante de ISC | Desarrollador Frontend" value={form.titular_profesional} onChange={(e) => set("titular_profesional", e.target.value)} /></Field>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-bold text-[#2C3E50]">Acerca de ti</Label>
              <button type="button" onClick={sugerirIA} disabled={iaLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-[#003366] bg-[#FEF9C3] hover:bg-[#FDE047] px-3 py-1.5 rounded-xl transition-colors shadow-sm">
                {iaLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-[#CA8A04]" />} ✨ Sugerir con IA
              </button>
            </div>
            <Textarea rows={5} placeholder="Escribe algo tuyo y pulsa 'Sugerir con IA' para redactarlo profesionalmente…" value={form.biografia} onChange={(e) => set("biografia", e.target.value)} className="bg-white" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Ubicación"><Input value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} /></Field>
            <Field label="Teléfono"><Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} /></Field>
          </div>
          <Field label="Nivel de experiencia">
            <select value={form.nivel_experiencia} onChange={(e) => set("nivel_experiencia", e.target.value)} className={selCls}>
              <option value="">Selecciona…</option><option>Sin experiencia</option><option>Junior</option><option>Semi-senior</option><option>Senior</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label="GitHub (URL)"><Input placeholder="https://github.com/…" value={form.github_url} onChange={(e) => set("github_url", e.target.value)} /></Field>
            <Field label="LinkedIn (URL)"><Input placeholder="https://linkedin.com/in/…" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} /></Field>
          </div>
          <div className="flex gap-6 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] cursor-pointer"><input type="checkbox" checked={form.buscando_empleo} onChange={(e) => set("buscando_empleo", e.target.checked)} className="size-4 rounded text-[#003366]" /> Buscando empleo</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] cursor-pointer"><input type="checkbox" checked={form.disponibilidad} onChange={(e) => set("disponibilidad", e.target.checked)} className="size-4 rounded text-[#003366]" /> Disponible</label>
          </div>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}

function ExperienceDialog({ item, onClose, onSaved }: { item: any | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    puesto: item?.puesto || "", empresa_nombre: item?.empresa_nombre || "",
    fecha_inicio: toDateInput(item?.fecha_inicio ?? null), fecha_fin: toDateInput(item?.fecha_fin ?? null),
    actual: item?.actual ?? false, tecnologias: (item?.tecnologias_usadas || []).join(", "),
  });
  const [actividades, setActividades] = useState<{ actividad: string; descripcion: string }[]>(
    item?.actividades?.length ? item.actividades.map((a: any) => ({ actividad: a.actividad || "", descripcion: a.descripcion || "" }))
      : [{ actividad: "", descripcion: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const setAct = (i: number, k: string, v: string) => setActividades((p) => p.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const addAct = () => setActividades((p) => [...p, { actividad: "", descripcion: "" }]);
  const rmAct = (i: number) => setActividades((p) => p.filter((_, j) => j !== i));

  // Sugerir actividades con IA a partir del puesto + lo que ya escribiste
  const sugerirIA = async () => {
    setError(""); setIaLoading(true);
    try {
      const seed = `Puesto: ${form.puesto || "(sin especificar)"}${form.empresa_nombre ? ` en ${form.empresa_nombre}` : ""}. Actividades: ` +
        actividades.map((a) => `${a.actividad} ${a.descripcion}`).join("; ");
      const r = await aiService.optimizarTexto(seed);
      if (r?.error) { setError(r.error); return; }
      if (r.experiencia?.length) {
        setActividades(r.experiencia.map((linea: string) => {
          const idx = linea.indexOf(":");
          if (idx > 0 && idx < 60) return { actividad: linea.slice(0, idx).trim(), descripcion: linea.slice(idx + 1).trim() };
          return { actividad: linea.trim(), descripcion: "" };
        }));
      }
    } catch (e: any) { setError(e?.response?.data?.error || "No se pudo generar la sugerencia."); }
    finally { setIaLoading(false); }
  };

  const guardar = async () => {
    setSaving(true); setError("");
    try {
      const acts = actividades.filter((a) => a.actividad.trim());
      const payload = {
        puesto: form.puesto, empresa_nombre: form.empresa_nombre,
        fecha_inicio: form.fecha_inicio, fecha_fin: form.actual ? null : form.fecha_fin || null, actual: form.actual,
        actividades: acts, tecnologias_usadas: splitTech(form.tecnologias),
      };
      if (item) await profileService.updateExperience(item.id, payload); else await profileService.addExperience(payload);
      onSaved();
    } catch (e: any) { setError(e?.response?.data?.error || "No se pudo guardar."); } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl font-black text-[#2C3E50]">{item ? "Editar experiencia" : "Agregar experiencia"}</DialogTitle></DialogHeader>
        <div className="space-y-5 mt-2">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">{error}</div>}
          <Field label="Puesto *"><Input value={form.puesto} onChange={(e) => set("puesto", e.target.value)} /></Field>
          <Field label="Empresa"><Input value={form.empresa_nombre} onChange={(e) => set("empresa_nombre", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Field label="Inicio *"><Input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} /></Field>
            <Field label="Fin">
              <Input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} disabled={form.actual} className={form.actual ? "opacity-50" : ""} />
            </Field>
            <div className="col-span-2 pt-1 border-t border-slate-200 mt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] cursor-pointer">
                <input type="checkbox" checked={form.actual} onChange={(e) => set("actual", e.target.checked)} className="size-4 rounded text-[#003366]" /> 
                Trabajo aquí actualmente
              </label>
            </div>
          </div>

          {/* Actividades realizadas */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-bold text-[#2C3E50]">Actividades realizadas</Label>
              <button type="button" onClick={sugerirIA} disabled={iaLoading} className="flex items-center gap-1.5 text-xs font-bold text-[#003366] bg-[#FEF9C3] hover:bg-[#FDE047] px-3 py-1.5 rounded-xl transition-colors shadow-sm">
                {iaLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-[#CA8A04]" />} ✨ Sugerir con IA
              </button>
            </div>
            <div className="space-y-4">
              {actividades.map((a, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 relative group">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500 mb-1 block">Título de la actividad</Label>
                      <Input placeholder="Ej. Desarrollo Frontend" value={a.actividad} onChange={(e) => setAct(i, "actividad", e.target.value)} className="font-bold" />
                    </div>
                    {actividades.length > 1 && (
                      <button type="button" onClick={() => rmAct(i)} className="size-10 mt-5 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                        <X className="size-5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">Descripción (opcional)</Label>
                    <Textarea rows={2} placeholder="Detalla qué hiciste o qué lograste..." value={a.descripcion} onChange={(e) => setAct(i, "descripcion", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addAct} className="flex items-center gap-1.5 text-sm font-bold text-[#003366] hover:bg-[#003366]/10 px-4 py-2 rounded-xl mt-4 transition-all">
              <Plus className="size-4" /> Agregar otra actividad
            </button>
          </div>

          <Field label="Tecnologías (separadas por comas)"><Input placeholder="Ej. React, Node.js, AWS..." value={form.tecnologias} onChange={(e) => set("tecnologias", e.target.value)} /></Field>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}

function EducationDialog({ item, onClose, onSaved }: { item: any | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    institucion: item?.institucion || "", carrera_o_grado: item?.carrera_o_grado || "", nivel_estudios: item?.nivel_estudios || "",
    fecha_inicio: toDateInput(item?.fecha_inicio ?? null), fecha_fin: toDateInput(item?.fecha_fin ?? null),
    graduado: item?.graduado ?? false, promedio: item?.promedio != null ? String(item.promedio) : "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const guardar = async () => {
    setSaving(true);
    try {
      const payload = { institucion: form.institucion, carrera_o_grado: form.carrera_o_grado, nivel_estudios: form.nivel_estudios,
        fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin || null, graduado: form.graduado, promedio: form.promedio ? parseFloat(form.promedio) : null };
      if (item) await profileService.updateEducation(item.id, payload); else await profileService.addEducation(payload);
      onSaved();
    } finally { setSaving(false); }
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl font-black text-[#2C3E50]">{item ? "Editar educación" : "Agregar educación"}</DialogTitle></DialogHeader>
        <div className="space-y-5 mt-2">
          <Field label="Institución *"><Input value={form.institucion} onChange={(e) => set("institucion", e.target.value)} /></Field>
          <Field label="Carrera o grado *"><Input value={form.carrera_o_grado} onChange={(e) => set("carrera_o_grado", e.target.value)} /></Field>
          <Field label="Nivel de estudios"><Input placeholder="Licenciatura, Bachillerato…" value={form.nivel_estudios} onChange={(e) => set("nivel_estudios", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Field label="Inicio *"><Input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} /></Field>
            <Field label="Fin"><Input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-5 items-end">
            <Field label="Promedio"><Input type="number" step="0.01" value={form.promedio} onChange={(e) => set("promedio", e.target.value)} /></Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] cursor-pointer h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl">
              <input type="checkbox" checked={form.graduado} onChange={(e) => set("graduado", e.target.checked)} className="size-4 rounded text-[#003366]" /> Graduado
            </label>
          </div>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}

function ProjectDialog({ item, onClose, onSaved }: { item: any | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    nombre_proyecto: item?.nombre_proyecto || "", rol_en_proyecto: item?.rol_en_proyecto || "", descripcion: item?.descripcion || "",
    url_repositorio: item?.url_repositorio || "", url_despliegue: item?.url_despliegue || "", tecnologias: (item?.tecnologias || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const guardar = async () => {
    setSaving(true);
    try {
      const payload = { nombre_proyecto: form.nombre_proyecto, rol_en_proyecto: form.rol_en_proyecto, descripcion: form.descripcion,
        url_repositorio: form.url_repositorio, url_despliegue: form.url_despliegue, tecnologias: splitTech(form.tecnologias) };
      if (item) await profileService.updateProject(item.id, payload); else await profileService.addProject(payload);
      onSaved();
    } finally { setSaving(false); }
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl font-black text-[#2C3E50]">{item ? "Editar proyecto" : "Agregar proyecto"}</DialogTitle></DialogHeader>
        <div className="space-y-5 mt-2">
          <Field label="Nombre del proyecto *"><Input value={form.nombre_proyecto} onChange={(e) => set("nombre_proyecto", e.target.value)} /></Field>
          <Field label="Tu rol"><Input placeholder="Ej. Desarrollador full-stack" value={form.rol_en_proyecto} onChange={(e) => set("rol_en_proyecto", e.target.value)} /></Field>
          <Field label="Descripción"><Textarea rows={4} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Field label="Repositorio (URL)"><Input placeholder="https://github.com/…" value={form.url_repositorio} onChange={(e) => set("url_repositorio", e.target.value)} className="bg-white" /></Field>
            <Field label="Demo (URL)"><Input placeholder="https://…" value={form.url_despliegue} onChange={(e) => set("url_despliegue", e.target.value)} className="bg-white" /></Field>
          </div>
          <Field label="Tecnologías (separadas por comas)"><Input value={form.tecnologias} onChange={(e) => set("tecnologias", e.target.value)} /></Field>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}
