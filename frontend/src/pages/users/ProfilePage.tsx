import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Code2,
  Link2,
  Pencil,
  Trash2,
  Plus,
  X,
  ExternalLink,
  FolderGit2,
  Loader2,
  Save,
  BadgeCheck,
  Sparkles,
  Upload,
  FileText,
  ArrowRight,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  profileService,
  type FullProfile,
} from "../../services/profile.service";
import { userService } from "../../services/user.service";
import { aiService } from "../../services/ai.service";
import { CARRERAS_UPA, CUATRIMESTRES } from "../../utils/catalogos";

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

// Solo letras, acentos, ñ y espacios
const soloLetras = (v: string) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

// Capitaliza primera letra de cada palabra
const capitalizar = (v: string) => v.replace(/\b\w/g, (l) => l.toUpperCase());

// Formatear nombre completo: solo letras, capitaliza
const formatNombre = (v: string) => capitalizar(soloLetras(v));

// Teléfono: solo dígitos, máximo 10
const formatTelefono = (v: string) => v.replace(/\D/g, "").slice(0, 10);

// URLs: limpiar espacios
const formatURL = (v: string) => v.trim();

// Texto simple (letras, números, espacios, algunos símbolos)
const formatTextoSimple = (v: string) =>
  v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.\,\(\)]/g, "");

// Validadores que retornan mensajes de error (string vacío = válido)
const validarNombre = (v: string): string => {
  const limpio = v.trim();
  if (!limpio) return "El nombre es obligatorio";
  if (limpio.length < 5) return "Mínimo 5 caracteres";
  if (limpio.length > 80) return "Máximo 80 caracteres";
  const palabras = limpio.split(/\s+/).filter(Boolean);
  if (palabras.length < 2) return "Debes escribir nombre y apellido";
  if (palabras.some((p) => p.length < 2))
    return "Cada palabra debe tener al menos 2 letras";
  return "";
};

const validarTelefono = (v: string): string => {
  if (!v) return ""; // opcional
  if (v.length !== 10) return "Debe tener 10 dígitos";
  if (!/^[2-9]\d{9}$/.test(v)) return "Debe iniciar con 2-9 (formato México)";
  return "";
};

const validarURL = (
  v: string,
  tipo: "github" | "linkedin" | "general",
): string => {
  if (!v) return ""; // opcional
  if (!/^https?:\/\//.test(v)) return "Debe comenzar con http:// o https://";
  if (tipo === "github" && !v.includes("github.com"))
    return "Debe ser una URL de GitHub";
  if (tipo === "linkedin" && !v.includes("linkedin.com"))
    return "Debe ser una URL de LinkedIn";
  if (v.length > 200) return "URL demasiado larga";
  return "";
};

const validarTitular = (v: string): string => {
  if (!v) return "";
  if (v.length < 5) return "Mínimo 5 caracteres";
  if (v.length > 300) return "Máximo 300 caracteres";
  return "";
};

const validarBiografia = (v: string): string => {
  if (!v) return "";
  if (v.length < 20) return "Mínimo 20 caracteres para que sea útil";
  if (v.length > 1000) return "Máximo 1000 caracteres";
  return "";
};

const validarUbicacion = (v: string): string => {
  if (!v) return "";
  if (v.length < 3) return "Mínimo 3 caracteres";
  if (v.length > 50) return "Máximo 50 caracteres";
  return "";
};

const validarPuesto = (v: string): string => {
  if (!v.trim()) return "El puesto es obligatorio";
  if (v.trim().length < 3) return "Mínimo 3 caracteres";
  if (v.trim().length > 80) return "Máximo 80 caracteres";
  return "";
};

const validarEmpresa = (v: string): string => {
  if (!v.trim()) return "";
  if (v.trim().length < 2) return "Mínimo 2 caracteres";
  if (v.trim().length > 80) return "Máximo 80 caracteres";
  return "";
};

const validarFechaInicio = (v: string): string => {
  if (!v) return "La fecha de inicio es obligatoria";
  const fecha = new Date(v);
  if (fecha > new Date()) return "No puede ser una fecha futura";
  return "";
};

const validarFechaFin = (
  inicio: string,
  fin: string,
  actual: boolean,
): string => {
  if (actual) return "";
  if (!fin) return ""; // opcional si no está actual
  if (!inicio) return "";
  if (new Date(fin) < new Date(inicio))
    return "No puede ser anterior al inicio";
  if (new Date(fin) > new Date()) return "No puede ser una fecha futura";
  return "";
};

const validarActividad = (v: string): string => {
  if (!v.trim()) return "El título es obligatorio";
  if (v.trim().length < 5) return "Mínimo 5 caracteres";
  if (v.trim().length > 400) return "Máximo 400 caracteres";
  return "";
};

const validarDescripcion = (v: string): string => {
  if (!v) return "";
  if (v.length < 10) return "Mínimo 10 caracteres";
  if (v.length > 500) return "Máximo 500 caracteres";
  return "";
};

const validarTecnologia = (v: string): string => {
  if (!v.trim()) return "Escribe una tecnología";
  if (v.trim().length < 2) return "Mínimo 2 caracteres";
  if (v.trim().length > 30) return "Máximo 30 caracteres";
  return "";
};

const validarInstitucion = (v: string): string => {
  if (!v.trim()) return "La institución es obligatoria";
  if (v.trim().length < 3) return "Mínimo 3 caracteres";
  if (v.trim().length > 300) return "Máximo 300 caracteres";
  return "";
};

const validarCarrera = (v: string): string => {
  if (!v.trim()) return "La carrera es obligatoria";
  if (v.trim().length < 3) return "Mínimo 3 caracteres";
  if (v.trim().length > 100) return "Máximo 100 caracteres";
  return "";
};

const validarNivelEstudios = (v: string): string => {
  if (!v) return "";
  if (v.length > 50) return "Máximo 50 caracteres";
  return "";
};

const validarProyecto = (v: string): string => {
  if (!v.trim()) return "El nombre es obligatorio";
  if (v.trim().length < 3) return "Mínimo 3 caracteres";
  if (v.trim().length > 80) return "Máximo 80 caracteres";
  return "";
};

const validarRol = (v: string): string => {
  if (!v) return "";
  if (v.length > 60) return "Máximo 60 caracteres";
  return "";
};

const validarDescripcionProyecto = (v: string): string => {
  if (!v) return "";
  if (v.length < 20) return "Mínimo 20 caracteres";
  if (v.length > 800) return "Máximo 800 caracteres";
  return "";
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function fileToThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2,
          sy = (img.height - min) / 2;
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

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const fmtMes = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : `${MESES[d.getMonth()]} ${d.getFullYear()}`;
};
const rango = (ini: string, fin: string | null, actual: boolean) =>
  `${fmtMes(ini)} — ${actual ? "Actualidad" : fin ? fmtMes(fin) : ""}`;
const toDateInput = (iso: string | null) => (iso ? iso.substring(0, 10) : "");
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

const Chip = ({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
}) => (
  <span className="inline-flex items-center gap-1.5 bg-[#003366]/[0.06] text-[#003366] text-xs font-medium px-3 py-1.5 rounded-lg">
    {children}
    {onRemove && (
      <button onClick={onRemove} className="hover:text-[#E74C3C]">
        <X className="size-3.5" />
      </button>
    )}
  </span>
);

const SectionHeader = ({
  title,
  onAdd,
}: {
  title: string;
  onAdd?: () => void;
}) => (
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
    <h3 className="text-xl font-extrabold text-[#2C3E50] dark:text-white">{title}</h3>
    {onAdd && (
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-sm font-bold text-[#003366] hover:bg-[#003366]/10 px-4 py-2 rounded-xl transition-all"
      >
        <Plus className="size-4" /> Agregar
      </button>
    )}
  </div>
);

const IconBtn = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] dark:text-slate-400 hover:bg-[#F5F7FA] dark:bg-slate-800 hover:text-[#2C3E50] dark:text-white transition-colors"
  >
    {children}
  </button>
);

// Campo con validación en tiempo real
const Field = ({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) => (
  <div className="space-y-1">
    <Label className="text-xs font-semibold text-[#2C3E50] dark:text-white">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="size-3" /> {error}
      </p>
    )}
  </div>
);

const Footer = ({
  onCancel,
  onSave,
  saving,
}: {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) => (
  <div className="flex justify-end gap-2 mt-5">
    <Button variant="outline" onClick={onCancel} disabled={saving}>
      Cancelar
    </Button>
    <Button
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-1.5"
    >
      {saving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}{" "}
      Guardar
    </Button>
  </div>
);

// ============================================================
// PROFILE PAGE PRINCIPAL
// ============================================================

export function ProfilePage() {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [basicsOpen, setBasicsOpen] = useState(false);
  const [expEdit, setExpEdit] = useState<any | "new" | null>(null);
  const [eduEdit, setEduEdit] = useState<any | "new" | null>(null);
  const [projEdit, setProjEdit] = useState<any | "new" | null>(null);
  const [activeTab, setActiveTab] = useState<
    "experiencia" | "educacion" | "habilidades" | "proyectos"
  >("experiencia");

  const cargar = () =>
    profileService
      .getMyProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  useEffect(() => {
    cargar();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#003366]" />
      </div>
    );
  if (!profile)
    return (
      <div className="p-8 text-center text-[#7F8C8D] dark:text-slate-400">
        No se pudo cargar tu perfil.
      </div>
    );

  const p = profile.perfil;

  // Formatear nivel de experiencia para mostrar
  const formatExperiencia = (v: string) => {
    if (v === "0") return "Sin experiencia";
    if (v === "1") return "1 año";
    if (v === "10+") return "10+ años";
    if (v) return `${v} años`;
    return "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Encabezado */}
      <Card className="overflow-hidden border border-slate-100 shadow-lg rounded-[2rem] p-0 gap-0 bg-white dark:bg-slate-900">
        <div className="h-40 bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#00509E] relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-slate-900/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-8 mb-6">
            <div className="size-32 rounded-full ring-[6px] ring-white bg-gradient-to-br from-[#003366] to-[#00A8E8] shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
              {p.url_foto ? (
                <img
                  src={p.url_foto}
                  alt="Foto"
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl font-extrabold">
                  {initials(profile.nombre_completo)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 pt-2 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-3xl font-black text-[#2C3E50] dark:text-white leading-tight tracking-tight break-words mt-2">
                    {profile.nombre_completo}
                  </h2>
                  <p className="text-[#00509E] font-bold mt-1 text-lg">
                    {p.titular_profesional || "Agrega tu titular profesional"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setBasicsOpen(true)}
                  className="flex items-center gap-2 flex-shrink-0 self-start rounded-xl font-bold hover:bg-slate-50 border-slate-200 mt-2"
                >
                  <Pencil className="size-4" /> Editar perfil
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm font-medium text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {profile.carrera && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="size-4 text-[#003366]" />
                {profile.carrera}
                {profile.cuatrimestre
                  ? ` · ${profile.cuatrimestre}° cuatri`
                  : ""}
              </span>
            )}
            <span className="flex items-center gap-1.5 min-w-0">
              <Mail className="size-4 text-[#003366] flex-shrink-0" />
              <span className="truncate">{profile.correo_institucional}</span>
            </span>
            {p.ubicacion && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-[#003366]" />
                {p.ubicacion}
              </span>
            )}
            {p.telefono && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-4 text-[#003366]" />
                {p.telefono}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {p.buscando_empleo && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#16A34A]/20 px-3 py-1.5 rounded-xl shadow-sm">
                <BadgeCheck className="size-4" /> Buscando empleo
              </span>
            )}
            {p.disponibilidad && (
              <span className="text-xs font-bold text-[#003366] bg-[#003366]/10 border border-[#003366]/20 px-3 py-1.5 rounded-xl shadow-sm">
                Disponible
              </span>
            )}
            {p.nivel_experiencia && (
              <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] border border-[#D97706]/20 px-3 py-1.5 rounded-xl shadow-sm">
                {formatExperiencia(p.nivel_experiencia)}
              </span>
            )}
            <div className="flex-1" />
            <div className="flex gap-2">
              {p.github_url && (
                <a
                  href={p.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-[#003366] hover:bg-[#003366]/5 transition-colors"
                >
                  <Code2 className="size-5" />
                </a>
              )}
              {p.linkedin_url && (
                <a
                  href={p.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-[#00A8E8] hover:bg-[#00A8E8]/5 transition-colors"
                >
                  <Link2 className="size-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Banner CV con IA */}
      <Link to="/dashboard/cv-builder" className="block group">
        <Card className="border border-[#FFD700]/30 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-[#FFD700]/10 to-white rounded-2xl overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-[#FFD700]/20 to-transparent pointer-events-none" />
          <CardContent className="p-5 flex items-center gap-5 relative z-10">
            <div className="size-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#CA8A04] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-[#2C3E50] dark:text-white">
                ¿Tu CV necesita un impulso?
              </p>
              <p className="text-sm text-[#7F8C8D] dark:text-slate-400 mt-0.5">
                Usa nuestra IA para redactar tu experiencia y habilidades al
                instante.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003366] text-white text-sm font-semibold group-hover:bg-[#002244] transition-colors">
              <FileText className="size-4" /> Ir al Constructor{" "}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 p-1.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab("experiencia")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "experiencia" ? "bg-[#003366] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Briefcase className="size-4" />{" "}
            <span className="hidden sm:inline">Experiencia</span>
          </button>
          <button
            onClick={() => setActiveTab("educacion")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "educacion" ? "bg-[#003366] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <GraduationCap className="size-4" />{" "}
            <span className="hidden sm:inline">Educación</span>
          </button>
          <button
            onClick={() => setActiveTab("habilidades")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "habilidades" ? "bg-[#003366] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Wrench className="size-4" />{" "}
            <span className="hidden sm:inline">Habilidades</span>
          </button>
          <button
            onClick={() => setActiveTab("proyectos")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "proyectos" ? "bg-[#003366] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <FolderGit2 className="size-4" />{" "}
            <span className="hidden sm:inline">Proyectos</span>
          </button>
        </div>
      </div>

      {/* Contenido tabs */}
      {activeTab === "experiencia" && (
        <Card className="border border-slate-100 shadow-sm rounded-3xl">
          <CardContent className="p-8">
            <SectionHeader
              title="Experiencia Laboral"
              onAdd={() => setExpEdit("new")}
            />
            {profile.experiencia.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Briefcase className="size-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  Aún no has agregado experiencia laboral
                </p>
                <button
                  onClick={() => setExpEdit("new")}
                  className="mt-3 text-sm font-bold text-[#003366] hover:underline"
                >
                  + Agregar mi primera experiencia
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.experiencia.map((e: any) => (
                  <div
                    key={e.id}
                    className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#2C3E50] dark:text-white mb-1">
                          {e.puesto}
                        </h3>
                        <p className="text-[#00A8E8] font-semibold">
                          {e.empresa_nombre}
                        </p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">
                          {rango(e.fecha_inicio, e.fecha_fin, e.actual)}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconBtn onClick={() => setExpEdit(e)}>
                          <Pencil className="size-4" />
                        </IconBtn>
                        <IconBtn
                          onClick={async () => {
                            await profileService.deleteExperience(e.id);
                            cargar();
                          }}
                        >
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    </div>
                    {e.descripcion && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {e.descripcion}
                        </p>
                      </div>
                    )}
                    {e.actividades?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Actividades:
                        </p>
                        <ul className="space-y-2">
                          {e.actividades.map((ac: any, i: number) => (
                            <li
                              key={i}
                              className="text-sm bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200"
                            >
                              <span className="font-bold text-[#2C3E50] dark:text-white block mb-1">
                                {ac.actividad}
                              </span>
                              {ac.descripcion && (
                                <span className="block text-slate-600 leading-relaxed">
                                  {ac.descripcion}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {e.tecnologias_usadas?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {e.tecnologias_usadas.map((t: string, i: number) => (
                          <Chip key={i}>{t}</Chip>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "educacion" && (
        <Card className="border border-slate-100 shadow-sm rounded-3xl">
          <CardContent className="p-8">
            <SectionHeader
              title="Formación Académica"
              onAdd={() => setEduEdit("new")}
            />
            {profile.educacion.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <GraduationCap className="size-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  Aún no has agregado tu formación
                </p>
                <button
                  onClick={() => setEduEdit("new")}
                  className="mt-3 text-sm font-bold text-[#003366] hover:underline"
                >
                  + Agregar mi educación
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.educacion.map((ed: any) => (
                  <div
                    key={ed.id}
                    className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#2C3E50] dark:text-white mb-1">
                          {ed.institucion}
                        </h3>
                        <p className="text-slate-700 font-semibold">
                          {ed.carrera_o_grado}
                        </p>
                        {ed.nivel_estudios && (
                          <p className="text-sm text-slate-600">
                            {ed.nivel_estudios}
                          </p>
                        )}
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">
                          {rango(ed.fecha_inicio, ed.fecha_fin, false)}
                          {ed.graduado && ` · Graduado`}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconBtn onClick={() => setEduEdit(ed)}>
                          <Pencil className="size-4" />
                        </IconBtn>
                        <IconBtn
                          onClick={async () => {
                            await profileService.deleteEducation(ed.id);
                            cargar();
                          }}
                        >
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "habilidades" && (
        <Card className="border border-slate-100 shadow-sm rounded-3xl">
          <CardContent className="p-8">
            <SectionHeader title="Habilidades y Competencias" />
            <SkillEditor skills={profile.habilidades} onChange={cargar} />
          </CardContent>
        </Card>
      )}

      {activeTab === "proyectos" && (
        <Card className="border border-slate-100 shadow-sm rounded-3xl">
          <CardContent className="p-8">
            <SectionHeader
              title="Proyectos Personales"
              onAdd={() => setProjEdit("new")}
            />
            {profile.proyectos.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <FolderGit2 className="size-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  Aún no has agregado proyectos
                </p>
                <button
                  onClick={() => setProjEdit("new")}
                  className="mt-3 text-sm font-bold text-[#003366] hover:underline"
                >
                  + Agregar mi primer proyecto
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {profile.proyectos.map((pr: any) => (
                  <div
                    key={pr.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#003366]/5 rounded-xl text-[#003366]">
                          <FolderGit2 className="size-5" />
                        </div>
                        <p className="font-extrabold text-[#2C3E50] dark:text-white text-lg">
                          {pr.nombre_proyecto}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-100">
                        <IconBtn onClick={() => setProjEdit(pr)}>
                          <Pencil className="size-4" />
                        </IconBtn>
                        <IconBtn
                          onClick={async () => {
                            await profileService.deleteProject(pr.id);
                            cargar();
                          }}
                        >
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    </div>
                    {pr.rol_en_proyecto && (
                      <p className="text-xs font-bold text-[#CA8A04] uppercase tracking-wider mb-2">
                        {pr.rol_en_proyecto}
                      </p>
                    )}
                    {pr.descripcion && (
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {pr.descripcion}
                      </p>
                    )}
                    {pr.tecnologias?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pr.tecnologias.map((t: string, i: number) => (
                          <Chip key={i}>{t}</Chip>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                      {pr.url_repositorio && (
                        <a
                          href={pr.url_repositorio}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sm font-bold text-[#00A8E8] hover:text-[#003366] transition-colors"
                        >
                          <Code2 className="size-4" /> Código
                        </a>
                      )}
                      {pr.url_despliegue && (
                        <a
                          href={pr.url_despliegue}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sm font-bold text-[#00A8E8] hover:text-[#003366] transition-colors"
                        >
                          <ExternalLink className="size-4" /> Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {basicsOpen && (
        <BasicsDialog
          profile={profile}
          onClose={() => setBasicsOpen(false)}
          onSaved={() => {
            setBasicsOpen(false);
            cargar();
          }}
        />
      )}
      {expEdit && (
        <ExperienceDialog
          item={expEdit === "new" ? null : expEdit}
          onClose={() => setExpEdit(null)}
          onSaved={() => {
            setExpEdit(null);
            cargar();
          }}
        />
      )}
      {eduEdit && (
        <EducationDialog
          item={eduEdit === "new" ? null : eduEdit}
          onClose={() => setEduEdit(null)}
          onSaved={() => {
            setEduEdit(null);
            cargar();
          }}
        />
      )}
      {projEdit && (
        <ProjectDialog
          item={projEdit === "new" ? null : projEdit}
          onClose={() => setProjEdit(null)}
          onSaved={() => {
            setProjEdit(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// SKILL EDITOR
// ============================================================

function SkillEditor({
  skills,
  onChange,
}: {
  skills: any[];
  onChange: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const agregar = async () => {
    const n = nombre.trim();
    const err = validarTecnologia(n);
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await profileService.addSkill({ nombre: n });
      setNombre("");
      onChange();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Ej. React, Python, Trabajo en equipo…"
          value={nombre}
          onChange={(e) => {
            setNombre(formatTextoSimple(e.target.value));
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar();
            }
          }}
          className="h-10"
        />
        <Button
          onClick={agregar}
          disabled={saving || nombre.trim().length < 2}
          className="flex items-center gap-1.5"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}{" "}
          Agregar
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
          <AlertCircle className="size-3" /> {error}
        </p>
      )}
      {skills.length === 0 ? (
        <p className="text-sm text-[#7F8C8D] dark:text-slate-400 italic">
          Agrega tus habilidades técnicas y blandas.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s: any) => (
            <Chip
              key={s.id}
              onRemove={async () => {
                await profileService.deleteSkill(s.id);
                onChange();
              }}
            >
              {s.nombre}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// BASICS DIALOG
// ============================================================

function BasicsDialog({
  profile,
  onClose,
  onSaved,
}: {
  profile: FullProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const p = profile.perfil;
  const [form, setForm] = useState({
    nombre_completo: profile.nombre_completo || "",
    carrera: profile.carrera || "",
    cuatrimestre: profile.cuatrimestre ? String(profile.cuatrimestre) : "",
    titular_profesional: p.titular_profesional || "",
    biografia: p.biografia || "",
    ubicacion: p.ubicacion || "",
    telefono: p.telefono || "",
    url_foto: p.url_foto || "",
    github_url: p.github_url || "",
    linkedin_url: p.linkedin_url || "",
    nivel_experiencia: p.nivel_experiencia || "",
    buscando_empleo: p.buscando_empleo,
    disponibilidad: p.disponibilidad,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const selCls =
    "w-full h-10 rounded-xl border border-[#D1D5DB] px-3 text-sm bg-white dark:bg-slate-900";

  // Validar un campo específico
  const validate = (name: string, value: any): string => {
    switch (name) {
      case "nombre_completo":
        return validarNombre(value);
      case "telefono":
        return validarTelefono(value);
      case "github_url":
        return validarURL(value, "github");
      case "linkedin_url":
        return validarURL(value, "linkedin");
      case "titular_profesional":
        return validarTitular(value);
      case "biografia":
        return validarBiografia(value);
      case "ubicacion":
        return validarUbicacion(value);
      default:
        return "";
    }
  };

  // Actualizar campo con formateo y validación
  const updateField = (name: string, rawValue: string) => {
    let value = rawValue;
    // Aplicar formateo según el campo
    if (name === "nombre_completo") value = formatNombre(rawValue);
    else if (name === "telefono") value = formatTelefono(rawValue);
    else if (name === "github_url" || name === "linkedin_url")
      value = formatURL(rawValue);

    set(name, value);
    if (touched[name]) {
      const err = validate(name, value);
      setErrors((prev: any) => ({ ...prev, [name]: err }));
    }
  };

  const touch = (name: string) => {
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    const err = validate(name, (form as any)[name]);
    setErrors((prev: any) => ({ ...prev, [name]: err }));
  };

  const subirFoto = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setError("La imagen supera el límite de 50MB.");
      return;
    }
    try {
      set("url_foto", await fileToThumbnail(file));
    } catch {
      setError("No se pudo procesar la imagen.");
    }
  };

  const validarTodo = (): boolean => {
    const newErrors: any = {};
    const camposRequeridos = ["nombre_completo", "carrera"];
    const todosLosCampos = [
      "nombre_completo",
      "telefono",
      "github_url",
      "linkedin_url",
      "titular_profesional",
      "biografia",
      "ubicacion",
    ];

    todosLosCampos.forEach((campo) => {
      const err = validate(campo, (form as any)[campo]);
      if (err) newErrors[campo] = err;
    });

    if (!form.carrera) newErrors.carrera = "Debes seleccionar una carrera";

    setErrors(newErrors);
    setTouched(Object.fromEntries(todosLosCampos.map((c) => [c, true])));
    return Object.keys(newErrors).length === 0;
  };

  const sugerirIA = async () => {
    setError("");
    setIaLoading(true);
    try {
      const seed =
        [
          form.biografia,
          form.titular_profesional,
          form.carrera ? `Estudio ${form.carrera}` : "",
        ]
          .filter(Boolean)
          .join(". ") ||
        `Soy estudiante de ${form.carrera || "mi carrera"} en la UPA`;
      const r = await aiService.optimizarTexto(seed);
      if (r?.error) {
        setError(r.error);
        return;
      }
      if (r.perfil) set("biografia", r.perfil);
      if (!form.titular_profesional && r.perfil)
        set("titular_profesional", `Estudiante de ${form.carrera || "la UPA"}`);
    } catch (e: any) {
      setError(e?.response?.data?.error || "No se pudo generar la sugerencia.");
    } finally {
      setIaLoading(false);
    }
  };

  const guardar = async () => {
    if (!validarTodo()) {
      setError("Por favor corrige los campos marcados en rojo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await userService.updateMe({
        ...form,
        cuatrimestre: form.cuatrimestre ? Number(form.cuatrimestre) : undefined,
      } as any);
      onSaved();
    } catch (e: any) {
      setError("Ha ocurrido un error, por favor contacta a un administrador");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#2C3E50] dark:text-white">
            Editar perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}

          {/* Foto */}
          <div className="flex items-center gap-3">
            <div className="size-16 rounded-full bg-[#003366] flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.url_foto ? (
                <img
                  src={form.url_foto}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {initials(form.nombre_completo || "U")}
                </span>
              )}
            </div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-[#003366] cursor-pointer hover:bg-[#003366]/[0.06] px-3 py-2 rounded-lg">
              <Upload className="size-4" /> Subir foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => subirFoto(e.target.files?.[0])}
              />
            </label>
            <span className="text-[10px] text-muted-foreground/80">
              (Máx. 50MB)
            </span>
            {form.url_foto && (
              <button
                type="button"
                onClick={() => set("url_foto", "")}
                className="text-xs text-[#E74C3C] hover:underline ml-auto"
              >
                Quitar
              </button>
            )}
          </div>

          {/* Nombre */}
          <Field
            label="Nombre completo"
            error={errors.nombre_completo}
            required
          >
            <Input
              value={form.nombre_completo}
              onChange={(e) => updateField("nombre_completo", e.target.value)}
              onBlur={() => touch("nombre_completo")}
              placeholder="Andrea Mariana Surdez"
            />
          </Field>

          {/* Carrera y Cuatrimestre */}
          <div className="grid grid-cols-[1fr_auto] gap-5">
            <Field label="Carrera" error={errors.carrera} required>
              <select
                value={form.carrera}
                onChange={(e) => {
                  set("carrera", e.target.value);
                  touch("carrera");
                }}
                className={selCls}
              >
                <option value="">Selecciona…</option>
                {CARRERAS_UPA.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cuatrimestre">
              <select
                value={form.cuatrimestre}
                onChange={(e) => set("cuatrimestre", e.target.value)}
                className={selCls}
              >
                <option value="">—</option>
                {CUATRIMESTRES.map((c) => (
                  <option key={c} value={c}>
                    {c}°
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Titular profesional */}
          <Field label="Titular profesional" error={errors.titular_profesional}>
            <Input
              placeholder="Ej. Estudiante de ISC | Desarrollador Frontend"
              value={form.titular_profesional}
              onChange={(e) =>
                updateField("titular_profesional", e.target.value)
              }
              onBlur={() => touch("titular_profesional")}
            />
          </Field>

          {/* Biografía */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-bold text-[#2C3E50] dark:text-white">
                Acerca de ti
              </Label>
              <button
                type="button"
                onClick={sugerirIA}
                disabled={iaLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-[#003366] bg-[#FEF9C3] hover:bg-[#FDE047] px-3 py-1.5 rounded-xl transition-colors shadow-sm"
              >
                {iaLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4 text-[#CA8A04]" />
                )}{" "}
                Sugerir con IA
              </button>
            </div>
            <Textarea
              rows={5}
              placeholder="Escribe algo tuyo y pulsa 'Sugerir con IA' para redactarlo profesionalmente…"
              value={form.biografia}
              onChange={(e) => updateField("biografia", e.target.value)}
              onBlur={() => touch("biografia")}
              className="bg-white dark:bg-slate-900"
            />
            {errors.biografia && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.biografia}
              </p>
            )}
          </div>

          {/* Ubicación y Teléfono */}
          <div className="grid grid-cols-2 gap-5">
            <Field label="Ubicación" error={errors.ubicacion}>
              <Input
                value={form.ubicacion}
                onChange={(e) => updateField("ubicacion", e.target.value)}
                onBlur={() => touch("ubicacion")}
                placeholder="Aguascalientes, México"
              />
            </Field>
            <Field label="Teléfono" error={errors.telefono}>
              <Input
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                onBlur={() => touch("telefono")}
                placeholder="4491234567"
                maxLength={10}
              />
            </Field>
          </div>

          {/* Años de experiencia */}
          <Field label="Años de experiencia">
            <select
              value={form.nivel_experiencia}
              onChange={(e) => set("nivel_experiencia", e.target.value)}
              className={selCls}
            >
              <option value="">Selecciona…</option>
              <option value="0">Sin experiencia</option>
              <option value="1">1 año</option>
              <option value="2">2 años</option>
              <option value="3">3 años</option>
              <option value="4">4 años</option>
              <option value="5">5 años</option>
              <option value="6">6 años</option>
              <option value="7">7 años</option>
              <option value="8">8 años</option>
              <option value="9">9 años</option>
              <option value="10+">10+ años</option>
            </select>
          </Field>

          {/* GitHub y LinkedIn */}
          <div className="grid grid-cols-2 gap-5">
            <Field label="GitHub (URL)" error={errors.github_url}>
              <Input
                placeholder="https://github.com/usuario"
                value={form.github_url}
                onChange={(e) => updateField("github_url", e.target.value)}
                onBlur={() => touch("github_url")}
              />
            </Field>
            <Field label="LinkedIn (URL)" error={errors.linkedin_url}>
              <Input
                placeholder="https://linkedin.com/in/usuario"
                value={form.linkedin_url}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
                onBlur={() => touch("linkedin_url")}
              />
            </Field>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={form.buscando_empleo}
                onChange={(e) => set("buscando_empleo", e.target.checked)}
                className="size-4 rounded text-[#003366]"
              />{" "}
              Buscando empleo
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={form.disponibilidad}
                onChange={(e) => set("disponibilidad", e.target.checked)}
                className="size-4 rounded text-[#003366]"
              />{" "}
              Disponible
            </label>
          </div>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// EXPERIENCE DIALOG
// ============================================================

function ExperienceDialog({
  item,
  onClose,
  onSaved,
}: {
  item: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    puesto: item?.puesto || "",
    empresa_nombre: item?.empresa_nombre || "",
    fecha_inicio: toDateInput(item?.fecha_inicio ?? null),
    fecha_fin: toDateInput(item?.fecha_fin ?? null),
    actual: item?.actual ?? false,
  });
  const [actividades, setActividades] = useState<
    { actividad: string; descripcion: string }[]
  >(
    item?.actividades?.length
      ? item.actividades.map((a: any) => ({
          actividad: a.actividad || "",
          descripcion: a.descripcion || "",
        }))
      : [{ actividad: "", descripcion: "" }],
  );
  const [tecnologias, setTecnologias] = useState<string[]>(
    item?.tecnologias_usadas || [],
  );
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const setAct = (i: number, k: string, v: string) =>
    setActividades((p) => p.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const addAct = () =>
    setActividades((p) => [...p, { actividad: "", descripcion: "" }]);
  const rmAct = (i: number) =>
    setActividades((p) => p.filter((_, j) => j !== i));

  const addTecnologia = () => {
    const tech = techInput.trim();
    const err = validarTecnologia(tech);
    if (err) {
      setError(err);
      return;
    }
    setTecnologias((prev) => [...prev, tech]);
    setTechInput("");
    setError("");
  };
  const removeTecnologia = (index: number) =>
    setTecnologias((prev) => prev.filter((_, i) => i !== index));

  const validate = (name: string, value: any, formState?: any): string => {
    const f = formState || form;
    switch (name) {
      case "puesto":
        return validarPuesto(value);
      case "empresa_nombre":
        return validarEmpresa(value);
      case "fecha_inicio":
        return validarFechaInicio(value);
      case "fecha_fin":
        return validarFechaFin(f.fecha_inicio, value, f.actual);
      default:
        return "";
    }
  };

  const updateField = (name: string, value: any) => {
    set(name, value);
    if (touched[name]) {
      const err = validate(name, value);
      setErrors((prev: any) => ({ ...prev, [name]: err }));
    }
  };

  const touch = (name: string) => {
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    const err = validate(name, (form as any)[name]);
    setErrors((prev: any) => ({ ...prev, [name]: err }));
  };

  const validarTodo = (): boolean => {
    const newErrors: any = {};
    const campos = ["puesto", "empresa_nombre", "fecha_inicio", "fecha_fin"];
    campos.forEach((campo) => {
      const err = validate(campo, (form as any)[campo]);
      if (err) newErrors[campo] = err;
    });

    // Validar actividades
    const actErrors: any[] = [];
    actividades.forEach((a, i) => {
      const err = validarActividad(a.actividad);
      if (err) actErrors[i] = { ...actErrors[i], actividad: err };
      if (a.descripcion) {
        const descErr = validarDescripcion(a.descripcion);
        if (descErr)
          actErrors[i] = { ...(actErrors[i] || {}), descripcion: descErr };
      }
    });
    if (actErrors.some(Boolean)) newErrors.actividades = actErrors;

    setErrors(newErrors);
    setTouched(Object.fromEntries(campos.map((c) => [c, true])));
    return Object.keys(newErrors).length === 0;
  };

  const sugerirIA = async () => {
    setError("");
    setIaLoading(true);
    try {
      const seed =
        `Puesto: ${form.puesto || "(sin especificar)"}${form.empresa_nombre ? ` en ${form.empresa_nombre}` : ""}. Actividades: ` +
        actividades.map((a) => `${a.actividad} ${a.descripcion}`).join("; ");
      const r = await aiService.optimizarTexto(seed);
      if (r?.error) {
        setError(r.error);
        return;
      }
      if (r.experiencia?.length) {
        setActividades(
          r.experiencia.map((linea: string) => {
            const idx = linea.indexOf(":");
            if (idx > 0 && idx < 60)
              return {
                actividad: linea.slice(0, idx).trim(),
                descripcion: linea.slice(idx + 1).trim(),
              };
            return { actividad: linea.trim(), descripcion: "" };
          }),
        );
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || "No se pudo generar la sugerencia.");
    } finally {
      setIaLoading(false);
    }
  };

  const guardar = async () => {
    if (!validarTodo()) {
      setError("Por favor corrige los campos marcados en rojo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const acts = actividades.filter((a) => a.actividad.trim());
      const payload = {
        puesto: form.puesto,
        empresa_nombre: form.empresa_nombre,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.actual ? null : form.fecha_fin || null,
        actual: form.actual,
        actividades: acts,
        tecnologias_usadas: tecnologias,
      };
      if (item) await profileService.updateExperience(item.id, payload);
      else await profileService.addExperience(payload);
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.error || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#2C3E50] dark:text-white">
            {item ? "Editar experiencia" : "Agregar experiencia"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}

          <Field label="Puesto" error={errors.puesto} required>
            <Input
              value={form.puesto}
              onChange={(e) =>
                updateField("puesto", formatTextoSimple(e.target.value))
              }
              onBlur={() => touch("puesto")}
              placeholder="Desarrollador Frontend"
            />
          </Field>

          <Field label="Empresa" error={errors.empresa_nombre}>
            <Input
              value={form.empresa_nombre}
              onChange={(e) =>
                updateField("empresa_nombre", formatTextoSimple(e.target.value))
              }
              onBlur={() => touch("empresa_nombre")}
              placeholder="TechStartup"
            />
          </Field>

          <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Field label="Inicio" error={errors.fecha_inicio} required>
              <Input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => updateField("fecha_inicio", e.target.value)}
                onBlur={() => touch("fecha_inicio")}
                max={new Date().toISOString().split("T")[0]}
              />
            </Field>
            <Field label="Fin" error={errors.fecha_fin}>
              <Input
                type="date"
                value={form.fecha_fin}
                onChange={(e) => updateField("fecha_fin", e.target.value)}
                onBlur={() => touch("fecha_fin")}
                disabled={form.actual}
                className={form.actual ? "opacity-50" : ""}
                max={new Date().toISOString().split("T")[0]}
              />
            </Field>
            <div className="col-span-2 pt-1 border-t border-slate-200 mt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] dark:text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.actual}
                  onChange={(e) => {
                    set("actual", e.target.checked);
                    if (e.target.checked) set("fecha_fin", "");
                  }}
                  className="size-4 rounded text-[#003366]"
                />{" "}
                Trabajo aquí actualmente
              </label>
            </div>
          </div>

          {/* Actividades */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-bold text-[#2C3E50] dark:text-white">
                Actividades realizadas
              </Label>
              <button
                type="button"
                onClick={sugerirIA}
                disabled={iaLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-[#003366] bg-[#FEF9C3] hover:bg-[#FDE047] px-3 py-1.5 rounded-xl transition-colors shadow-sm"
              >
                {iaLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4 text-[#CA8A04]" />
                )}{" "}
                Sugerir con IA
              </button>
            </div>
            <div className="space-y-4">
              {actividades.map((a, i) => (
                <div
                  key={i}
                  className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm space-y-3 ${errors.actividades?.[i] ? "border-red-300" : "border-slate-200"}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500 mb-1 block">
                        Título de la actividad *
                      </Label>
                      <Input
                        placeholder="Ej. Desarrollo Frontend"
                        value={a.actividad}
                        onChange={(e) =>
                          setAct(
                            i,
                            "actividad",
                            formatTextoSimple(e.target.value),
                          )
                        }
                        className="font-bold"
                      />
                      {errors.actividades?.[i]?.actividad && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="size-3" />
                          {errors.actividades[i].actividad}
                        </p>
                      )}
                    </div>
                    {actividades.length > 1 && (
                      <button
                        type="button"
                        onClick={() => rmAct(i)}
                        className="size-10 mt-5 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="size-5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      Descripción (opcional)
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Detalla qué hiciste o qué lograste..."
                      value={a.descripcion}
                      onChange={(e) => setAct(i, "descripcion", e.target.value)}
                    />
                    {errors.actividades?.[i]?.descripcion && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="size-3" />
                        {errors.actividades[i].descripcion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAct}
              className="flex items-center gap-1.5 text-sm font-bold text-[#003366] hover:bg-[#003366]/10 px-4 py-2 rounded-xl mt-4 transition-all"
            >
              <Plus className="size-4" /> Agregar otra actividad
            </button>
          </div>

          {/* Tecnologías */}
          <div>
            <Label className="text-xs font-semibold text-[#2C3E50] dark:text-white mb-2 block">
              Tecnologías utilizadas
            </Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ej. React, Node.js, AWS..."
                value={techInput}
                onChange={(e) => {
                  setTechInput(formatTextoSimple(e.target.value));
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTecnologia();
                  }
                }}
                className="h-10"
              />
              <Button
                onClick={addTecnologia}
                disabled={!techInput.trim()}
                className="flex items-center gap-1.5"
              >
                <Plus className="size-4" /> Agregar
              </Button>
            </div>
            {tecnologias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tecnologias.map((tech, index) => (
                  <Chip key={index} onRemove={() => removeTecnologia(index)}>
                    {tech}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// EDUCATION DIALOG
// ============================================================

function EducationDialog({
  item,
  onClose,
  onSaved,
}: {
  item: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    institucion: item?.institucion || "",
    carrera_o_grado: item?.carrera_o_grado || "",
    nivel_estudios: item?.nivel_estudios || "",
    fecha_inicio: toDateInput(item?.fecha_inicio ?? null),
    fecha_fin: toDateInput(item?.fecha_fin ?? null),
    graduado: item?.graduado ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (name: string, value: any): string => {
    switch (name) {
      case "institucion":
        return validarInstitucion(value);
      case "carrera_o_grado":
        return validarCarrera(value);
      case "nivel_estudios":
        return validarNivelEstudios(value);
      case "fecha_inicio":
        return validarFechaInicio(value);
      case "fecha_fin":
        return form.fecha_inicio &&
          value &&
          new Date(value) < new Date(form.fecha_inicio)
          ? "No puede ser anterior al inicio"
          : "";
      default:
        return "";
    }
  };

  const updateField = (name: string, value: any) => {
    let v = value;
    if (
      name === "institucion" ||
      name === "carrera_o_grado" ||
      name === "nivel_estudios"
    )
      v = formatTextoSimple(value);
    set(name, v);
    if (touched[name]) {
      const err = validate(name, v);
      setErrors((prev: any) => ({ ...prev, [name]: err }));
    }
  };

  const touch = (name: string) => {
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    const err = validate(name, (form as any)[name]);
    setErrors((prev: any) => ({ ...prev, [name]: err }));
  };

  const validarTodo = (): boolean => {
    const newErrors: any = {};
    const campos = [
      "institucion",
      "carrera_o_grado",
      "nivel_estudios",
      "fecha_inicio",
      "fecha_fin",
    ];
    campos.forEach((campo) => {
      const err = validate(campo, (form as any)[campo]);
      if (err) newErrors[campo] = err;
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(campos.map((c) => [c, true])));
    return Object.keys(newErrors).length === 0;
  };

  const guardar = async () => {
    if (!validarTodo()) return;
    setSaving(true);
    try {
      const payload = {
        institucion: form.institucion,
        carrera_o_grado: form.carrera_o_grado,
        nivel_estudios: form.nivel_estudios,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        graduado: form.graduado,
        promedio: null,
      };
      if (item) await profileService.updateEducation(item.id, payload);
      else await profileService.addEducation(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#2C3E50] dark:text-white">
            {item ? "Editar educación" : "Agregar educación"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <Field label="Institución" error={errors.institucion} required>
            <Input
              value={form.institucion}
              onChange={(e) => updateField("institucion", e.target.value)}
              onBlur={() => touch("institucion")}
              placeholder="Universidad Politécnica de Aguascalientes"
            />
          </Field>
          <Field
            label="Carrera o grado"
            error={errors.carrera_o_grado}
            required
          >
            <Input
              value={form.carrera_o_grado}
              onChange={(e) => updateField("carrera_o_grado", e.target.value)}
              onBlur={() => touch("carrera_o_grado")}
              placeholder="Ingeniería en Sistemas Computacionales"
            />
          </Field>
          <Field label="Nivel de estudios" error={errors.nivel_estudios}>
            <Input
              placeholder="Licenciatura, Bachillerato…"
              value={form.nivel_estudios}
              onChange={(e) => updateField("nivel_estudios", e.target.value)}
              onBlur={() => touch("nivel_estudios")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Field label="Inicio" error={errors.fecha_inicio} required>
              <Input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => updateField("fecha_inicio", e.target.value)}
                onBlur={() => touch("fecha_inicio")}
                max={new Date().toISOString().split("T")[0]}
              />
            </Field>
            <Field label="Fin" error={errors.fecha_fin}>
              <Input
                type="date"
                value={form.fecha_fin}
                onChange={(e) => updateField("fecha_fin", e.target.value)}
                onBlur={() => touch("fecha_fin")}
                max={new Date().toISOString().split("T")[0]}
              />
            </Field>
          </div>
          <div className="pt-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E50] dark:text-white cursor-pointer h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                checked={form.graduado}
                onChange={(e) => set("graduado", e.target.checked)}
                className="size-4 rounded text-[#003366]"
              />{" "}
              Graduado
            </label>
          </div>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// PROJECT DIALOG
// ============================================================

function ProjectDialog({
  item,
  onClose,
  onSaved,
}: {
  item: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nombre_proyecto: item?.nombre_proyecto || "",
    rol_en_proyecto: item?.rol_en_proyecto || "",
    descripcion: item?.descripcion || "",
    url_repositorio: item?.url_repositorio || "",
    url_despliegue: item?.url_despliegue || "",
  });
  const [tecnologias, setTecnologias] = useState<string[]>(
    item?.tecnologias || [],
  );
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addTecnologia = () => {
    const tech = techInput.trim();
    const err = validarTecnologia(tech);
    if (err) return;
    setTecnologias((prev) => [...prev, tech]);
    setTechInput("");
  };
  const removeTecnologia = (index: number) =>
    setTecnologias((prev) => prev.filter((_, i) => i !== index));

  const validate = (name: string, value: any): string => {
    switch (name) {
      case "nombre_proyecto":
        return validarProyecto(value);
      case "rol_en_proyecto":
        return validarRol(value);
      case "descripcion":
        return validarDescripcionProyecto(value);
      case "url_repositorio":
        return validarURL(value, "general");
      case "url_despliegue":
        return validarURL(value, "general");
      default:
        return "";
    }
  };

  const updateField = (name: string, value: any) => {
    let v = value;
    if (name === "nombre_proyecto" || name === "rol_en_proyecto")
      v = formatTextoSimple(value);
    else if (name === "url_repositorio" || name === "url_despliegue")
      v = formatURL(value);
    set(name, v);
    if (touched[name]) {
      const err = validate(name, v);
      setErrors((prev: any) => ({ ...prev, [name]: err }));
    }
  };

  const touch = (name: string) => {
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    const err = validate(name, (form as any)[name]);
    setErrors((prev: any) => ({ ...prev, [name]: err }));
  };

  const validarTodo = (): boolean => {
    const newErrors: any = {};
    const campos = [
      "nombre_proyecto",
      "rol_en_proyecto",
      "descripcion",
      "url_repositorio",
      "url_despliegue",
    ];
    campos.forEach((campo) => {
      const err = validate(campo, (form as any)[campo]);
      if (err) newErrors[campo] = err;
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(campos.map((c) => [c, true])));
    return Object.keys(newErrors).length === 0;
  };

  const guardar = async () => {
    if (!validarTodo()) return;
    setSaving(true);
    try {
      const payload = {
        nombre_proyecto: form.nombre_proyecto,
        rol_en_proyecto: form.rol_en_proyecto,
        descripcion: form.descripcion,
        url_repositorio: form.url_repositorio,
        url_despliegue: form.url_despliegue,
        tecnologias: tecnologias,
      };
      if (item) await profileService.updateProject(item.id, payload);
      else await profileService.addProject(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#2C3E50] dark:text-white">
            {item ? "Editar proyecto" : "Agregar proyecto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <Field
            label="Nombre del proyecto"
            error={errors.nombre_proyecto}
            required
          >
            <Input
              value={form.nombre_proyecto}
              onChange={(e) => updateField("nombre_proyecto", e.target.value)}
              onBlur={() => touch("nombre_proyecto")}
              placeholder="Mi Proyecto"
            />
          </Field>
          <Field label="Tu rol" error={errors.rol_en_proyecto}>
            <Input
              placeholder="Ej. Desarrollador full-stack"
              value={form.rol_en_proyecto}
              onChange={(e) => updateField("rol_en_proyecto", e.target.value)}
              onBlur={() => touch("rol_en_proyecto")}
            />
          </Field>
          <Field label="Descripción" error={errors.descripcion}>
            <Textarea
              rows={4}
              value={form.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
              onBlur={() => touch("descripcion")}
              placeholder="Describe tu proyecto..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Field label="Repositorio (URL)" error={errors.url_repositorio}>
              <Input
                placeholder="https://github.com/…"
                value={form.url_repositorio}
                onChange={(e) => updateField("url_repositorio", e.target.value)}
                onBlur={() => touch("url_repositorio")}
                className="bg-white dark:bg-slate-900"
              />
            </Field>
            <Field label="Demo (URL)" error={errors.url_despliegue}>
              <Input
                placeholder="https://…"
                value={form.url_despliegue}
                onChange={(e) => updateField("url_despliegue", e.target.value)}
                onBlur={() => touch("url_despliegue")}
                className="bg-white dark:bg-slate-900"
              />
            </Field>
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#2C3E50] dark:text-white mb-2 block">
              Tecnologías utilizadas
            </Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ej. React, Node.js, AWS..."
                value={techInput}
                onChange={(e) =>
                  setTechInput(formatTextoSimple(e.target.value))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTecnologia();
                  }
                }}
                className="h-10"
              />
              <Button
                onClick={addTecnologia}
                disabled={!techInput.trim()}
                className="flex items-center gap-1.5"
              >
                <Plus className="size-4" /> Agregar
              </Button>
            </div>
            {tecnologias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tecnologias.map((tech, index) => (
                  <Chip key={index} onRemove={() => removeTecnologia(index)}>
                    {tech}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer onCancel={onClose} onSave={guardar} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}
