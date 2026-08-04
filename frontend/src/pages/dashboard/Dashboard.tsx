import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import {
  Briefcase, FileText, Sparkles, MapPin, ArrowRight, Loader2,
  GraduationCap, Building2, Mail, ExternalLink, X,
  MessageCircle, CheckCircle2, Star, AlertCircle, CalendarClock,
  Phone, Globe, Clock
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../services/user.service";
import { jobsService } from "../../services/jobs.service";
import { companiesService } from "../../services/companies.service";
import type { UserStats, Vacante } from "../../services/types";

const salaryStr = (min: number | null, max: number | null) => {
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min) return `$${min.toLocaleString()}`;
  return "A convenir";
};

const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
const deadlineInfo = (iso: string | null) => {
  if (!iso) return null;
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (dias < 0) return { label: `Cerró el ${fmtFecha(iso)}`, cerrada: true, urgente: false };
  if (dias === 0) return { label: "Último día", cerrada: false, urgente: true };
  if (dias <= 5) return { label: `Cierra en ${dias} día${dias === 1 ? "" : "s"}`, cerrada: false, urgente: true };
  return { label: `Cierra el ${fmtFecha(iso)}`, cerrada: false, urgente: false };
};

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [jobs, setJobs] = useState<Vacante[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Vacante | null>(null);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [interests, setInterests] = useState<Vacante[]>([]);
  const [applying, setApplying] = useState<string | null>(null);

  const toggleInteres = async (v: Vacante) => {
    setApplying(v.id);
    const isApplied = interests.some((i) => i.id === v.id);
    try {
      if (isApplied) {
        await jobsService.unapply(v.id);
        setInterests((prev) => prev.filter((i) => i.id !== v.id));
      } else {
        await jobsService.apply(v.id);
        setInterests((prev) => [...prev, v]);
      }
    } catch (error) { console.error(error); } finally { setApplying(null); }
  };

  const waLink = (v: Vacante) => {
    let tel = (v.empresa?.telefono || "").replace(/\D/g, "");
    if (tel.length === 10) tel = "52" + tel;
    return `https://wa.me/${tel}?text=${encodeURIComponent(mensajeSugerido(v))}`;
  };

  const mailtoLink = (v: Vacante) =>
    `mailto:${v.empresa?.correo_contacto || ""}?subject=${encodeURIComponent(`Postulación – ${v.titulo}`)}&body=${encodeURIComponent(mensajeSugerido(v))}`;

  const gmailLink = (v: Vacante) =>
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(v.empresa?.correo_contacto || "")}` +
    `&su=${encodeURIComponent(`Postulación – ${v.titulo}`)}` +
    `&body=${encodeURIComponent(mensajeSugerido(v))}`;

  const mensajeSugerido = (v: Vacante) => {
    const carreraTxt = user?.carrera ? `, estudiante de ${user.carrera}${user?.cuatrimestre ? ` (${user.cuatrimestre}° cuatrimestre)` : ""} en la Universidad Politécnica de Aguascalientes` : "";
    return `Estimados de ${v.empresa?.nombre || "la empresa"}:

Mi nombre es ${user?.nombre_completo || ""}${carreraTxt}. Me interesa postularme a la vacante "${v.titulo}" que publicaron en InUPA.

Considero que mi formación y habilidades encajan con el perfil solicitado. Adjunto mi CV para su consideración y quedo a sus órdenes para una entrevista.

Saludos cordiales,
${user?.nombre_completo || ""}
${user?.correo_institucional || ""}`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [s, j, activeJobs, activeCompanies, apps] = await Promise.all([
          userService.stats().catch(() => null),
          jobsService.list({ activa: true, carrera: user?.carrera || undefined, cuatrimestre: user?.cuatrimestre || undefined, limit: 4 }).catch(() => ({ data: [], pagination: { totalItems: 0 } })),
          jobsService.list({ activa: true, limit: 100 }).catch(() => ({ data: [], pagination: { totalItems: 0 } })),
          companiesService.list().catch(() => []),
          jobsService.myApplications().catch(() => [])
        ]);
        setStats(s);
        setJobs(j.data && j.data.length > 0 ? j.data : await jobsService.recent(4));
        setTotalJobs(activeJobs.pagination?.totalItems || activeJobs.data?.length || 0);
        setTotalCompanies(activeCompanies.filter((c: any) => c.activa).length);
        setInterests(apps.map((a: any) => a.vacante).filter(Boolean));
      } catch (err) { console.error("Error fetching dashboard data", err); } finally { setLoading(false); }
    };
    fetchStats();
  }, [user?.carrera, user?.cuatrimestre]);

  // Las "recomendadas" no deben repetir lo que ya aparece en "guardadas".
  const jobsRecomendadas = jobs.filter((v) => !interests.some((i) => i.id === v.id));

  const nombre = user?.nombre_completo?.split(" ")[0] || "Usuario";
  const cvPercentage = stats?.cvCompletion ?? 0;

  const getCvStatus = (pct: number) => {
    if (pct < 40) return { color: "bg-red-500", text: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800", msg: "Tu perfil está incompleto. Agrega tu experiencia y habilidades para destacar." };
    if (pct < 80) return { color: "bg-[#FFD700]", text: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800", msg: "Vas por buen camino. Completa los campos restantes para llegar al 100%." };
    return { color: "bg-[#27AE60]", text: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", msg: "¡Excelente! Tu perfil está completo y listo para que las empresas lo vean." };
  };
  const cvStatus = getCvStatus(cvPercentage);

  // TARJETA CON DISEÑO ORIGINAL (compacta, igual que antes)
  const renderJobCard = (v: Vacante) => (
    <Card key={v.id} className="border border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col group overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#003366] to-[#00A8E8] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      {v.imagen_url && (
        <div className="h-32 bg-[#F5F7FA] dark:bg-slate-800 overflow-hidden">
          <img
            src={v.imagen_url}
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => setImagenAmpliada(v.imagen_url)}
            className="size-full object-cover select-none cursor-zoom-in hover:opacity-90 transition-opacity"
          />
        </div>
      )}
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-[#003366]/5 dark:bg-[#00A8E8]/10 flex items-center justify-center text-[#003366] dark:text-[#00A8E8] font-black text-lg border border-[#003366]/10 dark:border-[#00A8E8]/20 shadow-sm flex-shrink-0">
            {v.empresa?.logo_url ? <img src={v.empresa.logo_url} alt="Logo" draggable={false} onDragStart={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()} className="size-8 object-contain select-none pointer-events-none" /> : (v.empresa?.nombre || "E").substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 pt-1">
            <h3 className="font-extrabold text-[#2C3E50] dark:text-white text-base leading-tight line-clamp-2" title={v.titulo}>{v.titulo}</h3>
            <p className="text-sm font-semibold text-[#00A8E8] mt-1 truncate">{v.empresa?.nombre}</p>
            {v.activa === false && (
              <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                Ya no disponible
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-2.5 flex-1">
          {v.ubicacion && (
            <div className="flex items-center gap-2 text-sm text-[#7F8C8D] dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
              <MapPin className="size-4 text-[#003366] dark:text-[#00A8E8]" /> <span className="truncate">{v.ubicacion}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {v.modalidad && <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold">{v.modalidad}</span>}
            {v.tipo_contrato && <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold">{v.tipo_contrato}</span>}
          </div>
        </div>
        
        <p className="text-lg font-black text-[#2C3E50] dark:text-white mt-5 pb-4 border-b border-slate-100 dark:border-slate-800">{salaryStr(v.salario_min, v.salario_max)}</p>
        
        <button 
          onClick={() => setSelectedJob(v)}
          className="w-full mt-4 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-[#003366] dark:bg-[#00A8E8] text-white hover:bg-[#002244] dark:hover:bg-[#0090c7] hover:shadow-lg transition-all"
        >
          Ver detalles y Contactar
        </button>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#003366] dark:text-[#00A8E8]" /></div>;

  return (
    <div className="space-y-6 pb-10 dark:bg-slate-950 min-h-screen p-4 sm:p-6 transition-colors">
      {/* Bienvenida */}
      <div className="rounded-[2rem] bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#00509E] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">¡Hola, {nombre}! </h1>
          <p className="text-white/80 text-base sm:text-lg mt-3 max-w-xl font-medium">
            {jobsRecomendadas.length > 0 ? `Hemos encontrado ${jobsRecomendadas.length} vacantes recomendadas para tu perfil.` : "Explora las oportunidades laborales exclusivas para la comunidad UPA."}
          </p>
        </div>
      </div>

      {/* Progreso del CV */}
      <Link to="/dashboard/perfil" className="block group">
        <Card className={`border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden ${cvStatus.text}`}>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4 flex-1">
                <div className="size-14 rounded-2xl bg-white/60 flex items-center justify-center text-[#003366] shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                  {cvPercentage < 100 ? <AlertCircle className="size-7" /> : <CheckCircle2 className="size-7" />}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2C3E50] flex items-center gap-2">
                    {cvPercentage < 100 ? "Completa tu perfil profesional" : "¡Tu perfil está al 100%!"}
                    <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm sm:text-base text-[#2C3E50]/80 mt-1 font-medium leading-relaxed">{cvStatus.msg}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:w-1/3 min-w-[200px]">
                <div className="flex-1 h-4 bg-white/60 rounded-full overflow-hidden border border-black/5">
                  <div className={`h-full rounded-full transition-all duration-1000 ease-out ${cvStatus.color}`} style={{ width: `${cvPercentage}%` }} />
                </div>
                <span className="text-xl font-black text-[#2C3E50] w-14 text-right">{cvPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: "Ofertas activas", value: totalJobs, icon: Briefcase, color: "#00A8E8", href: "/dashboard/empleos" },
          { label: "Empresas aliadas", value: totalCompanies, icon: Building2, color: "#CA8A04", href: "/dashboard/empresas" },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.label} to={t.href} className="block h-full">
              <Card className="border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl bg-white h-full">
                <CardContent className="p-6">
                  <div className="size-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110" style={{ backgroundColor: `${t.color}15` }}>
                    <Icon className="size-6" style={{ color: t.color }} />
                  </div>
                  <p className="text-3xl font-extrabold text-[#2C3E50] dark:text-white tracking-tight">{t.value}</p>
                  <p className="text-sm font-semibold text-[#7F8C8D] dark:text-slate-400 mt-1 uppercase tracking-wider">{t.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* CV con IA */}
      <Link to="/dashboard/cv-builder" className="block group">
        <Card className="border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-[#FEF9C3]/50 dark:from-yellow-900/20 to-white dark:to-slate-900 rounded-2xl overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[#CA8A04]/10 to-transparent pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-5 relative z-10">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#CA8A04] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-[#2C3E50] dark:text-white">Mejora tu CV con Inteligencia Artificial</p>
              <p className="text-sm text-[#7F8C8D] dark:text-slate-400 mt-1 font-medium">Genera descripciones de experiencia y optimiza tu currículum al instante.</p>
            </div>
            <ArrowRight className="size-5 text-[#CA8A04] group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </Link>

      {/* Vacantes guardadas */}
      {interests.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#16A34A]/10 dark:bg-green-900/20 rounded-xl"><Star className="size-6 text-[#16A34A]" /></div>
            <h2 className="text-xl font-extrabold text-[#2C3E50] dark:text-white">Vacantes guardadas</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {interests.map(renderJobCard)}
          </div>
        </div>
      )}

      {/* Recomendadas */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#003366]/10 dark:bg-[#00A8E8]/20 rounded-xl"><GraduationCap className="size-6 text-[#003366] dark:text-[#00A8E8]" /></div>
            <h2 className="text-xl font-extrabold text-[#2C3E50] dark:text-white">Recomendadas para {user?.carrera ? "tu perfil" : "ti"}</h2>
          </div>
          <Link to="/dashboard/empleos" className="text-sm text-[#003366] dark:text-[#00A8E8] font-bold hover:underline flex items-center gap-1.5 px-4 py-2 hover:bg-[#003366]/5 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Ver todas las ofertas <ArrowRight className="size-4" />
          </Link>
        </div>
        
        {jobsRecomendadas.length === 0 ? (
          <Card className="border border-dashed border-slate-300 dark:border-slate-700 shadow-none rounded-2xl bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <Briefcase className="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-base font-medium text-[#7F8C8D] dark:text-slate-400">No hay vacantes recomendadas por el momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {jobsRecomendadas.map(renderJobCard)}
          </div>
        )}
      </div>

      {/* MODAL COMPLETO (igual que JobBoard) */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedJob(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors z-10">
              <X className="size-5" />
            </button>

            {selectedJob.imagen_url && (
              <div className="h-40 bg-[#F5F7FA] dark:bg-slate-800 overflow-hidden rounded-t-[2rem]">
                <img
                  src={selectedJob.imagen_url}
                  alt=""
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => { e.stopPropagation(); setImagenAmpliada(selectedJob.imagen_url); }}
                  className="size-full object-cover select-none cursor-zoom-in hover:opacity-90 transition-opacity"
                />
              </div>
            )}

            <div className={`bg-gradient-to-r from-[#003366] to-[#00509E] px-8 pt-10 pb-20 text-white relative ${selectedJob.imagen_url ? "" : "rounded-t-[2rem]"}`}>
              <h2 className="text-3xl font-black mb-2">{selectedJob.titulo}</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 font-medium">
                <span className="flex items-center gap-1.5"><Building2 className="size-4" /> {selectedJob.empresa?.nombre}</span>
                {selectedJob.ubicacion && <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {selectedJob.ubicacion}</span>}
                {selectedJob.modalidad && <span className="flex items-center gap-1.5"><Briefcase className="size-4" /> {selectedJob.modalidad}</span>}
                {selectedJob.tipo_contrato && <span>{selectedJob.tipo_contrato}</span>}
              </div>
            </div>

            <div className="px-8 pb-8 -mt-10 relative z-10">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs bg-[#F5F7FA] dark:bg-slate-800 text-[#2C3E50] dark:text-white px-2.5 py-1 rounded-full border border-[#E5E7EB] dark:border-slate-700 font-medium flex items-center gap-1">
                    <span className="text-[#003366] dark:text-[#00A8E8] font-bold">$</span>{salaryStr(selectedJob.salario_min, selectedJob.salario_max)}
                  </span>
                  {selectedJob.cuatrimestre && <span className="text-xs bg-[#F5F7FA] dark:bg-slate-800 text-[#7F8C8D] dark:text-slate-300 px-2.5 py-1 rounded-full border border-[#E5E7EB] dark:border-slate-700">Desde {selectedJob.cuatrimestre}° cuatri</span>}
                  {(() => { const dl = deadlineInfo(selectedJob.fecha_limite); return dl ? (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${dl.cerrada ? "bg-[#F1F1F1] dark:bg-slate-800 text-[#9CA3AF]" : dl.urgente ? "bg-[#FEE2E2] dark:bg-red-900/30 text-[#DC2626]" : "bg-[#FEF9E7] dark:bg-yellow-900/30 text-[#B7791F]"}`}>
                      <CalendarClock className="size-3" />{dl.label}
                    </span>
                  ) : null; })()}
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-2">Descripción</p>
                    <p className="text-sm text-[#2C3E50] dark:text-slate-200 leading-relaxed whitespace-pre-line">{selectedJob.descripcion}</p>
                  </div>
                  {selectedJob.requisitos && (
                    <div>
                      <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-2">Requisitos</p>
                      <p className="text-sm text-[#2C3E50] dark:text-slate-200 leading-relaxed whitespace-pre-line">{selectedJob.requisitos}</p>
                    </div>
                  )}
                  {selectedJob.carreras && selectedJob.carreras.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-2">Carreras</p>
                      <div className="flex flex-wrap gap-1.5">{selectedJob.carreras.map((c) => <span key={c} className="text-xs bg-[#003366]/[0.06] dark:bg-[#00A8E8]/20 text-[#003366] dark:text-[#00A8E8] font-medium px-2.5 py-1 rounded-lg">{c}</span>)}</div>
                    </div>
                  )}

                  {/* DATOS DE CONTACTO EXPLÍCITOS (igual que JobBoard) */}
                  <div className="rounded-xl border-2 border-[#003366]/20 dark:border-[#00A8E8]/30 bg-[#F0F6FF] dark:bg-slate-800/50 p-4 space-y-3">
                    <p className="text-sm font-bold text-[#003366] dark:text-[#00A8E8] mb-1">Datos de contacto</p>
                    
                    {selectedJob.empresa?.correo_contacto ? (
                      <a href={gmailLink(selectedJob)} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-sm text-[#2C3E50] dark:text-slate-200 hover:text-[#003366] dark:hover:text-[#00A8E8] hover:bg-white/60 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                        <Mail className="size-5 text-[#003366] dark:text-[#00A8E8] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Enviar correo</p>
                          <p className="break-all text-xs text-[#7F8C8D] dark:text-slate-400">{selectedJob.empresa.correo_contacto}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-3 text-sm text-[#9CA3AF] p-2">
                        <Mail className="size-5 flex-shrink-0 mt-0.5" />
                        <div><p className="font-semibold">Correo no disponible</p><p className="text-xs">Esta empresa no registró un correo de contacto.</p></div>
                      </div>
                    )}

                    {selectedJob.empresa?.telefono ? (
                      <a href={waLink(selectedJob)} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-sm text-[#2C3E50] dark:text-slate-200 hover:text-[#25D366] hover:bg-white/60 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                        <MessageCircle className="size-5 text-[#25D366] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Contactar por WhatsApp</p>
                          <p className="text-xs text-[#7F8C8D] dark:text-slate-400">{selectedJob.empresa.telefono}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-3 text-sm text-[#9CA3AF] p-2">
                        <MessageCircle className="size-5 flex-shrink-0 mt-0.5" />
                        <div><p className="font-semibold">WhatsApp no disponible</p><p className="text-xs">Esta empresa no registró un número de teléfono.</p></div>
                      </div>
                    )}

                    {selectedJob.empresa?.sitio_web ? (
                      <a href={selectedJob.empresa.sitio_web} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-sm text-[#003366] dark:text-[#00A8E8] hover:bg-white/60 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                        <Globe className="size-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Sitio web de la empresa</p>
                          <p className="text-xs text-[#7F8C8D] dark:text-slate-400 break-all">{selectedJob.empresa.sitio_web}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-3 text-sm text-[#9CA3AF] p-2">
                        <Globe className="size-5 flex-shrink-0 mt-0.5" />
                        <div><p className="font-semibold">Sitio web no disponible</p><p className="text-xs">Esta empresa no registró un sitio web.</p></div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-[#7F8C8D] dark:text-slate-400">La plataforma <b>no contacta a la empresa por ti</b>: al pulsar los enlaces se abre Gmail con un <b>mensaje sugerido</b> que puedes editar antes de enviarlo. Recuerda adjuntar tu CV.</p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E5E7EB] dark:border-slate-800 flex flex-wrap gap-2">
                  <a href={gmailLink(selectedJob)} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003366] dark:bg-[#00A8E8] hover:bg-[#002244] dark:hover:bg-[#0090c7] text-white text-sm font-bold flex-1 min-w-[160px] transition-colors"
                  >
                    <Mail className="size-4" /> Contactar por correo
                  </a>
                  <a 
                    href={waLink(selectedJob)} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-bold flex-1 min-w-[140px] transition-colors"
                  >
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                  <button onClick={() => toggleInteres(selectedJob)} disabled={applying === selectedJob.id}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${interests.some(i => i.id === selectedJob.id) ? "border-[#DC2626] bg-[#FEE2E2] dark:bg-red-900/30 text-[#DC2626] hover:bg-[#FECACA]" : "border-[#003366] dark:border-[#00A8E8] bg-[#003366] dark:bg-[#00A8E8] text-white hover:bg-[#002244] dark:hover:bg-[#0090c7]"}`}>
                    {applying === selectedJob.id ? <Loader2 className="size-4 animate-spin" /> : interests.some(i => i.id === selectedJob.id) ? <><X className="size-4" /> No me interesa</> : <><Star className="size-4" /> Me interesa</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner ampliado: ver la imagen completa de la vacante */}
      {imagenAmpliada && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            onClick={() => setImagenAmpliada(null)}
            className="absolute top-4 right-4 size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="size-5" />
          </button>
          <img
            src={imagenAmpliada}
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg select-none cursor-default"
          />
        </div>
      )}
    </div>
  );
}