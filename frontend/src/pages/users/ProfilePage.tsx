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
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-[#2C3E50]">{title}</h3>
    {onAdd && (
      <button onClick={onAdd} className="flex items-center gap-1.5 text-sm font-semibold text-[#003366] hover:bg-[#003366]/[0.06] px-2.5 py-1.5 rounded-lg transition-colors">
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
    <div className="max-w-4xl mx-auto space-y-5 pb-10">
      {/* Encabezado */}
      <Card className="overflow-hidden border-0 shadow-sm p-0 gap-0">
        <div className="h-24 bg-gradient-to-r from-[#003366] to-[#00509E]" />
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="size-24 rounded-full ring-4 ring-white bg-[#003366] flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
              {p.url_foto ? <img src={p.url_foto} alt="Foto" className="size-full object-cover" /> : <span className="text-white text-2xl font-bold">{initials(profile.nombre_completo)}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-[#2C3E50] leading-tight break-words">{profile.nombre_completo}</h2>
                  <p className="text-[#003366] font-medium">{p.titular_profesional || "Agrega tu titular profesional"}</p>
                </div>
                <Button variant="outline" onClick={() => setBasicsOpen(true)} className="flex items-center gap-1.5 flex-shrink-0 self-start">
                  <Pencil className="size-3.5" /> Editar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#7F8C8D]">
            {profile.carrera && <span className="flex items-center gap-1"><GraduationCap className="size-4" />{profile.carrera}{profile.cuatrimestre ? ` · ${profile.cuatrimestre}° cuatri` : ""}</span>}
            {p.ubicacion && <span className="flex items-center gap-1"><MapPin className="size-4" />{p.ubicacion}</span>}
            <span className="flex items-center gap-1 min-w-0"><Mail className="size-4 flex-shrink-0" /><span className="truncate">{profile.correo_institucional}</span></span>
            {p.telefono && <span className="flex items-center gap-1"><Phone className="size-4" />{p.telefono}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {p.buscando_empleo && <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full"><BadgeCheck className="size-3.5" /> Buscando empleo</span>}
            {p.disponibilidad && <span className="text-xs font-semibold text-[#003366] bg-[#003366]/[0.08] px-2.5 py-1 rounded-full">Disponible</span>}
            {p.nivel_experiencia && <span className="text-xs font-semibold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-full">{p.nivel_experiencia}</span>}
            {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="text-[#7F8C8D] hover:text-[#003366]"><Code2 className="size-4" /></a>}
            {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-[#7F8C8D] hover:text-[#003366]"><Link2 className="size-4" /></a>}
          </div>
        </div>
      </Card>

      {/* Acerca de */}
      <Card className="border-0 shadow-sm"><CardContent>
        <SectionHeader title="Acerca de" onAdd={() => setBasicsOpen(true)} />
        {p.biografia ? <p className="text-sm text-[#2C3E50] whitespace-pre-line leading-relaxed">{p.biografia}</p>
          : <p className="text-sm text-[#7F8C8D] italic">Cuéntale al mundo sobre ti: tus intereses, objetivos y fortalezas.</p>}
      </CardContent></Card>

      {/* Experiencia */}
      <Card className="border-0 shadow-sm"><CardContent>
        <SectionHeader title="Experiencia" onAdd={() => setExpEdit("new")} />
        {profile.experiencia.length === 0 ? <p className="text-sm text-[#7F8C8D] italic">Agrega tu experiencia laboral, prácticas o servicio social.</p> : (
          <div className="space-y-5">
            {profile.experiencia.map((e: any) => (
              <div key={e.id} className="flex gap-3">
                <div className="size-11 rounded-lg bg-[#F5F7FA] flex items-center justify-center flex-shrink-0"><Briefcase className="size-5 text-[#003366]" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#2C3E50]">{e.puesto}</p>
                      <p className="text-sm text-[#2C3E50]">{e.empresa_nombre}</p>
                      <p className="text-xs text-[#7F8C8D]">{rango(e.fecha_inicio, e.fecha_fin, e.actual)}</p>
                    </div>
                    <div className="flex flex-shrink-0">
                      <IconBtn onClick={() => setExpEdit(e)}><Pencil className="size-4" /></IconBtn>
                      <IconBtn onClick={async () => { await profileService.deleteExperience(e.id); cargar(); }}><Trash2 className="size-4" /></IconBtn>
                    </div>
                  </div>
                  {/* Actividades realizadas: actividad en negrita + su descripción debajo */}
                  {e.actividades?.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {e.actividades.map((ac: any, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="font-semibold text-[#2C3E50]">{ac.actividad}</span>
                          {ac.descripcion && <span className="block text-[#7F8C8D] leading-relaxed">{ac.descripcion}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    e.descripcion && <p className="text-sm text-[#2C3E50] mt-1.5 whitespace-pre-line">{e.descripcion}</p>
                  )}
                  {e.tecnologias_usadas?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{e.tecnologias_usadas.map((t: string, i: number) => <Chip key={i}>{t}</Chip>)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      {/* Educación */}
      <Card className="border-0 shadow-sm"><CardContent>
        <SectionHeader title="Educación" onAdd={() => setEduEdit("new")} />
        {profile.educacion.length === 0 ? <p className="text-sm text-[#7F8C8D] italic">Agrega tu formación académica.</p> : (
          <div className="space-y-5">
            {profile.educacion.map((ed: any) => (
              <div key={ed.id} className="flex gap-3">
                <div className="size-11 rounded-lg bg-[#F5F7FA] flex items-center justify-center flex-shrink-0"><GraduationCap className="size-5 text-[#003366]" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#2C3E50]">{ed.institucion}</p>
                      <p className="text-sm text-[#2C3E50]">{ed.carrera_o_grado}{ed.nivel_estudios ? ` · ${ed.nivel_estudios}` : ""}</p>
                      <p className="text-xs text-[#7F8C8D]">{rango(ed.fecha_inicio, ed.fecha_fin, false)}{ed.promedio ? ` · Promedio: ${ed.promedio}` : ""}</p>
                    </div>
                    <div className="flex flex-shrink-0">
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
      <Card className="border-0 shadow-sm"><CardContent>
        <SectionHeader title="Habilidades" />
        <SkillEditor skills={profile.habilidades} onChange={cargar} />
      </CardContent></Card>

      {/* Proyectos */}
      <Card className="border-0 shadow-sm"><CardContent>
        <SectionHeader title="Proyectos" onAdd={() => setProjEdit("new")} />
        {profile.proyectos.length === 0 ? <p className="text-sm text-[#7F8C8D] italic">Muestra los proyectos que has construido.</p> : (
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.proyectos.map((pr: any) => (
              <div key={pr.id} className="border border-[#E5E7EB] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2"><FolderGit2 className="size-5 text-[#003366]" /><p className="font-semibold text-[#2C3E50]">{pr.nombre_proyecto}</p></div>
                  <div className="flex flex-shrink-0">
                    <IconBtn onClick={() => setProjEdit(pr)}><Pencil className="size-4" /></IconBtn>
                    <IconBtn onClick={async () => { await profileService.deleteProject(pr.id); cargar(); }}><Trash2 className="size-4" /></IconBtn>
                  </div>
                </div>
                {pr.rol_en_proyecto && <p className="text-xs text-[#7F8C8D] mt-1">{pr.rol_en_proyecto}</p>}
                {pr.descripcion && <p className="text-sm text-[#2C3E50] mt-2 line-clamp-3">{pr.descripcion}</p>}
                {pr.tecnologias?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{pr.tecnologias.map((t: string, i: number) => <Chip key={i}>{t}</Chip>)}</div>}
                <div className="flex gap-3 mt-3">
                  {pr.url_repositorio && <a href={pr.url_repositorio} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:underline"><Code2 className="size-3.5" /> Código</a>}
                  {pr.url_despliegue && <a href={pr.url_despliegue} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:underline"><ExternalLink className="size-3.5" /> Demo</a>}
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Editar perfil</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {error && <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>}

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
          <div className="grid grid-cols-[1fr_auto] gap-3">
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold text-[#2C3E50]">Acerca de</Label>
              <button type="button" onClick={sugerirIA} disabled={iaLoading}
                className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:bg-[#FEF9C3] px-2 py-1 rounded-lg">
                {iaLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-[#CA8A04]" />} Sugerir con IA
              </button>
            </div>
            <Textarea rows={4} placeholder="Escribe algo tuyo y pulsa 'Sugerir con IA' para redactarlo profesionalmente…" value={form.biografia} onChange={(e) => set("biografia", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ubicación"><Input value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} /></Field>
            <Field label="Teléfono"><Input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} /></Field>
          </div>
          <Field label="Nivel de experiencia">
            <select value={form.nivel_experiencia} onChange={(e) => set("nivel_experiencia", e.target.value)} className={selCls}>
              <option value="">Selecciona…</option><option>Sin experiencia</option><option>Junior</option><option>Semi-senior</option><option>Senior</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub (URL)"><Input placeholder="https://github.com/…" value={form.github_url} onChange={(e) => set("github_url", e.target.value)} /></Field>
            <Field label="LinkedIn (URL)"><Input placeholder="https://linkedin.com/in/…" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} /></Field>
          </div>
          <div className="flex gap-5 pt-1">
            <label className="flex items-center gap-2 text-sm text-[#2C3E50] cursor-pointer"><input type="checkbox" checked={form.buscando_empleo} onChange={(e) => set("buscando_empleo", e.target.checked)} /> Buscando empleo</label>
            <label className="flex items-center gap-2 text-sm text-[#2C3E50] cursor-pointer"><input type="checkbox" checked={form.disponibilidad} onChange={(e) => set("disponibilidad", e.target.checked)} /> Disponible</label>
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{item ? "Editar experiencia" : "Agregar experiencia"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {error && <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>}
          <Field label="Puesto *"><Input value={form.puesto} onChange={(e) => set("puesto", e.target.value)} /></Field>
          <Field label="Empresa"><Input value={form.empresa_nombre} onChange={(e) => set("empresa_nombre", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio *"><Input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} /></Field>
            <Field label="Fin"><Input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} disabled={form.actual} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#2C3E50] cursor-pointer"><input type="checkbox" checked={form.actual} onChange={(e) => set("actual", e.target.checked)} /> Trabajo aquí actualmente</label>

          {/* Actividades realizadas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold text-[#2C3E50]">Actividades realizadas</Label>
              <button type="button" onClick={sugerirIA} disabled={iaLoading} className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:bg-[#FEF9C3] px-2 py-1 rounded-lg">
                {iaLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-[#CA8A04]" />} Sugerir con IA
              </button>
            </div>
            <div className="space-y-2.5">
              {actividades.map((a, i) => (
                <div key={i} className="border border-[#E5E7EB] rounded-xl p-2.5 space-y-1.5">
                  <div className="flex gap-2">
                    <Input placeholder="Actividad (título)" value={a.actividad} onChange={(e) => setAct(i, "actividad", e.target.value)} className="font-semibold" />
                    {actividades.length > 1 && <button type="button" onClick={() => rmAct(i)} className="size-9 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#FEE2E2] hover:text-[#E74C3C] flex-shrink-0"><X className="size-4" /></button>}
                  </div>
                  <Textarea rows={2} placeholder="Descripción de la actividad" value={a.descripcion} onChange={(e) => setAct(i, "descripcion", e.target.value)} />
                </div>
              ))}
            </div>
            <button type="button" onClick={addAct} className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:underline mt-2"><Plus className="size-3.5" /> Agregar actividad</button>
          </div>

          <Field label="Tecnologías (separadas por comas)"><Input value={form.tecnologias} onChange={(e) => set("tecnologias", e.target.value)} /></Field>
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Editar educación" : "Agregar educación"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Institución *"><Input value={form.institucion} onChange={(e) => set("institucion", e.target.value)} /></Field>
          <Field label="Carrera o grado *"><Input value={form.carrera_o_grado} onChange={(e) => set("carrera_o_grado", e.target.value)} /></Field>
          <Field label="Nivel de estudios"><Input placeholder="Licenciatura, Bachillerato…" value={form.nivel_estudios} onChange={(e) => set("nivel_estudios", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio *"><Input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} /></Field>
            <Field label="Fin"><Input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <Field label="Promedio"><Input type="number" step="0.01" value={form.promedio} onChange={(e) => set("promedio", e.target.value)} /></Field>
            <label className="flex items-center gap-2 text-sm text-[#2C3E50] cursor-pointer h-10"><input type="checkbox" checked={form.graduado} onChange={(e) => set("graduado", e.target.checked)} /> Graduado</label>
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Editar proyecto" : "Agregar proyecto"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Nombre del proyecto *"><Input value={form.nombre_proyecto} onChange={(e) => set("nombre_proyecto", e.target.value)} /></Field>
          <Field label="Tu rol"><Input placeholder="Ej. Desarrollador full-stack" value={form.rol_en_proyecto} onChange={(e) => set("rol_en_proyecto", e.target.value)} /></Field>
          <Field label="Descripción"><Textarea rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Repositorio (URL)"><Input placeholder="https://github.com/…" value={form.url_repositorio} onChange={(e) => set("url_repositorio", e.target.value)} /></Field>
            <Field label="Demo (URL)"><Input placeholder="https://…" value={form.url_despliegue} onChange={(e) => set("url_despliegue", e.target.value)} /></Field>
          </div>
          <Field label="Tecnologías (separadas por comas)"><Input value={form.tecnologias} onChange={(e) => set("tecnologias", e.target.value)} /></Field>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}
