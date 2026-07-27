import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import {
  Briefcase, FileText, Sparkles, MapPin, ArrowRight, Loader2,
  GraduationCap, User, Building2, Mail, ExternalLink, X,
  MessageCircle, Phone, Globe, CheckCircle2, Star
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

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [jobs, setJobs] = useState<Vacante[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Vacante | null>(null);
  const [interests, setInterests] = useState<Vacante[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
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
    } catch (error) {
      console.error(error);
    } finally {
      setApplying(null);
    }
  };

  const waLink = (v: Vacante) => {
    let tel = (v.empresa?.telefono || "").replace(/\D/g, "");
    if (tel.length === 10) tel = "52" + tel;
    return `https://wa.me/${tel}?text=${encodeURIComponent(mensajeSugerido(v))}`;
  };

  const mensajeSugerido = (v: Vacante) => {
    const carreraTxt = user?.carrera ? `, estudiante de ${user.carrera}${user?.cuatrimestre ? ` (${user.cuatrimestre}° cuatrimestre)` : ""} en la Universidad Politécnica de Aguascalientes` : "";
    return `Estimados de ${v.empresa?.nombre || "la empresa"}:

Mi nombre es ${user?.nombre_completo || ""}${carreraTxt}. Me interesa postularme a la vacante "${v.titulo}" que publicaron en InUPA.

Considero que mi formación y habilidades encajan con el perfil solicitado. Adjunto mi CV para su consideración y quedo a sus órdenes para una entrevista.

Saludos cordiales,
${user?.nombre_completo || ""}
${user?.correo_institucional || ""}`;
  };

  const mailtoLink = (v: Vacante) =>
    `mailto:${v.empresa?.correo_contacto || ""}?subject=${encodeURIComponent(`Postulación – ${v.titulo}`)}&body=${encodeURIComponent(mensajeSugerido(v))}`;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [s, j, activeJobs, activeCompanies, apps] = await Promise.all([
          userService.stats().catch(() => null),
          jobsService.list({ activa: true, carrera: user?.carrera || undefined, cuatrimestre: user?.cuatrimestre || undefined, limit: 4 }).catch(() => ({ data: [], pagination: { totalItems: 0 } })),
          jobsService.list({ activa: true, limit: 1 }).catch(() => ({ data: [], pagination: { totalItems: 0 } })),
          companiesService.list().catch(() => []),
          jobsService.myApplications().catch(() => [])
        ]);
        setStats(s);
        setJobs(j.data && j.data.length > 0 ? j.data : await jobsService.recent(4));
        setTotalJobs(activeJobs.pagination?.totalItems || activeJobs.data?.length || 0);
        setTotalCompanies(activeCompanies.filter(c => c.activa).length);
        setInterests(apps.map((a: any) => a.vacante).filter(Boolean));
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.carrera, user?.cuatrimestre]);

  const nombre = user?.nombre_completo?.split(" ")[0] || "Usuario";
  const tarjetas = [
    { label: "CV completado", value: `${stats?.cvCompletion ?? 0}%`, icon: FileText, color: "#003366", href: "/dashboard/perfil" },
    { label: "Ofertas activas", value: totalJobs, icon: Briefcase, color: "#00A8E8", href: "/dashboard/empleos" },
    { label: "Empresas aliadas", value: totalCompanies, icon: Building2, color: "#CA8A04", href: "/dashboard/empleos" },
  ];

  const renderJobCard = (v: Vacante) => (
    <Card key={v.id} className="border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col group overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#003366] to-[#00A8E8] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-[#003366]/5 flex items-center justify-center text-[#003366] font-black text-lg border border-[#003366]/10 shadow-sm flex-shrink-0">
            {v.empresa?.logo_url ? <img src={v.empresa.logo_url} alt="Logo" className="size-8 object-contain" /> : (v.empresa?.nombre || "E").substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 pt-1">
            <h3 className="font-extrabold text-[#2C3E50] text-base leading-tight line-clamp-2" title={v.titulo}>{v.titulo}</h3>
            <p className="text-sm font-semibold text-[#00A8E8] mt-1 truncate">{v.empresa?.nombre}</p>
          </div>
        </div>
        
        <div className="mt-5 space-y-2.5 flex-1">
          {v.ubicacion && (
            <div className="flex items-center gap-2 text-sm text-[#7F8C8D] font-medium bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
              <MapPin className="size-4 text-[#003366]" /> <span className="truncate">{v.ubicacion}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {v.modalidad && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{v.modalidad}</span>}
            {v.tipo_contrato && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">{v.tipo_contrato}</span>}
          </div>
        </div>
        
        <p className="text-lg font-black text-[#2C3E50] mt-5 pb-4 border-b border-slate-100">{salaryStr(v.salario_min, v.salario_max)}</p>
        
        <button 
          onClick={() => setSelectedJob(v)}
          className="w-full mt-4 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-[#003366] text-white hover:bg-[#002244] hover:shadow-lg transition-all"
        >
          Ver detalles y Contactar
        </button>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#003366]" /></div>;

  return (
    <div className="space-y-6 pb-10">
      {/* Bienvenida Premium */}
      <div className="rounded-[2rem] bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#00509E] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">¡Hola, {nombre}! 👋</h1>
          <p className="text-white/80 text-base sm:text-lg mt-3 max-w-xl font-medium">
            {jobs.length > 0 
              ? `Hemos encontrado ${jobs.length} vacantes recomendadas para tu perfil.` 
              : "Explora las oportunidades laborales exclusivas para la comunidad UPA."}
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {tarjetas.map((t) => {
          const Icon = t.icon;
          const content = (
            <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="size-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110" style={{ backgroundColor: `${t.color}15` }}>
                  <Icon className="size-6" style={{ color: t.color }} />
                </div>
                <p className="text-3xl font-extrabold text-[#2C3E50] tracking-tight">{t.value}</p>
                <p className="text-sm font-semibold text-[#7F8C8D] mt-1 uppercase tracking-wider">{t.label}</p>
              </CardContent>
            </Card>
          );
          return t.href ? (
            <Link key={t.label} to={t.href} className="block h-full">
              {content}
            </Link>
          ) : (
            <div key={t.label} className="block h-full cursor-default">
              {content}
            </div>
          );
        })}
      </div>

      {/* CTAs: completar perfil + CV con IA */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Link to="/dashboard/perfil" className="group">
          <Card className="border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-[#F0F6FF] to-white rounded-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[#003366]/5 to-transparent pointer-events-none" />
            <CardContent className="p-6 flex items-center gap-5 relative z-10">
              <div className="size-14 rounded-2xl bg-[#003366] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"><User className="size-6" /></div>
              <div className="flex-1"><p className="text-lg font-bold text-[#2C3E50]">Completa tu perfil</p><p className="text-sm text-[#7F8C8D] mt-1 font-medium">Un perfil completo atrae más empresas</p></div>
              <ArrowRight className="size-5 text-[#003366] group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/cv-builder" className="group">
          <Card className="border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-[#FEF9C3]/50 to-white rounded-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[#CA8A04]/10 to-transparent pointer-events-none" />
            <CardContent className="p-6 flex items-center gap-5 relative z-10">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#CA8A04] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"><Sparkles className="size-6" /></div>
              <div className="flex-1"><p className="text-lg font-bold text-[#2C3E50]">Mejora tu CV con IA</p><p className="text-sm text-[#7F8C8D] mt-1 font-medium">Genera y optimiza tu currículum al instante</p></div>
              <ArrowRight className="size-5 text-[#CA8A04] group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Intereses */}
      {interests.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#16A34A]/10 rounded-xl"><Sparkles className="size-6 text-[#16A34A]" /></div>
            <h2 className="text-xl font-extrabold text-[#2C3E50]">Vacantes de tu interés</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {interests.map(renderJobCard)}
          </div>
        </div>
      )}

      {/* Recomendadas para ti */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#003366]/10 rounded-xl"><GraduationCap className="size-6 text-[#003366]" /></div>
            <h2 className="text-xl font-extrabold text-[#2C3E50]">Recomendadas para {user?.carrera ? "tu perfil" : "ti"}</h2>
          </div>
          <Link to="/dashboard/empleos" className="text-sm text-[#003366] font-bold hover:underline flex items-center gap-1.5 px-4 py-2 hover:bg-[#003366]/5 rounded-xl transition-colors">
            Ver todas las ofertas <ArrowRight className="size-4" />
          </Link>
        </div>
        
        {jobs.length === 0 ? (
          <Card className="border border-dashed border-slate-300 shadow-none rounded-2xl bg-slate-50">
            <CardContent className="p-12 text-center">
              <Briefcase className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-base font-medium text-[#7F8C8D]">No hay vacantes recomendadas por el momento.</p>
              <p className="text-sm text-slate-500 mt-2">Vuelve pronto o explora todas las ofertas disponibles.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {jobs.map(renderJobCard)}
          </div>
        )}
      </div>

      {/* Modal de Detalles de Vacante y Contacto */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors z-10">
              <X className="size-5" />
            </button>
            
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-8 pt-10 pb-20 rounded-t-[2rem] text-white relative">
              <h2 className="text-3xl font-black mb-2">{selectedJob.titulo}</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 font-medium">
                <span className="flex items-center gap-1.5"><Building2 className="size-4" /> {selectedJob.empresa?.nombre}</span>
                {selectedJob.ubicacion && <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {selectedJob.ubicacion}</span>}
                <span className="font-bold bg-white/20 px-3 py-1 rounded-lg">{salaryStr(selectedJob.salario_min, selectedJob.salario_max)}</span>
              </div>
            </div>

            <div className="px-8 pb-8 -mt-10 relative z-10">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2"><Briefcase className="size-5 text-[#00A8E8]" /> Descripción del puesto</h3>
                      <div className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedJob.descripcion}</div>
                  </div>
                  {selectedJob.requisitos && (
                    <div>
                      <h3 className="text-xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2"><Sparkles className="size-5 text-[#CA8A04]" /> Requisitos</h3>
                      <div className="text-slate-600 whitespace-pre-line leading-relaxed bg-[#FEF9C3]/30 p-5 rounded-2xl border border-[#FEF9C3]">{selectedJob.requisitos}</div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Sobre la empresa</h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#003366] font-bold text-lg shadow-sm">
                        {selectedJob.empresa?.logo_url ? <img src={selectedJob.empresa.logo_url} alt="Logo" className="size-8 object-contain" /> : (selectedJob.empresa?.nombre || "E").substring(0, 2).toUpperCase()}
                      </div>
                      <p className="font-bold text-[#2C3E50]">{selectedJob.empresa?.nombre}</p>
                    </div>
                    {selectedJob.empresa?.descripcion && (
                      <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.empresa.descripcion}</p>
                    )}
                    {selectedJob.empresa?.sitio_web && (
                      <a href={selectedJob.empresa.sitio_web} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#00A8E8] hover:underline">
                        <ExternalLink className="size-4" /> Visitar sitio web
                      </a>
                    )}
                    {selectedJob.empresa?.correo_contacto && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correo de contacto</p>
                        <p className="text-sm font-semibold text-slate-700 break-all">{selectedJob.empresa.correo_contacto}</p>
                      </div>
                    )}
                  </div>
                </div>
                </div>

                <div className="pt-6 mt-8 border-t border-[#E5E7EB]">
                  <div className="flex flex-wrap gap-2">
                    <a href={mailtoLink(selectedJob)}
                      className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F5B041] text-[#003366] font-black text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all flex-1 min-w-[160px]"
                    >
                      <Mail className="size-5" /> Enviar mensaje por correo
                    </a>
                    <a 
                      href={waLink(selectedJob)} target="_blank" rel="noreferrer"
                      className="h-11 px-6 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-all flex-1 min-w-[140px]"
                    >
                      <MessageCircle className="size-5" /> WhatsApp
                    </a>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-xs text-[#7F8C8D] max-w-lg">La plataforma <b>no contacta a la empresa por ti</b>: al pulsar los botones se abrirá tu aplicación con un <b>mensaje sugerido</b> que puedes editar.</p>
                    <button onClick={() => toggleInteres(selectedJob)} disabled={applying === selectedJob.id}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${interests.some(i => i.id === selectedJob.id) ? "border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]" : "border-[#E5E7EB] text-[#2C3E50] bg-white hover:bg-[#F5F7FA]"}`}>
                      {applying === selectedJob.id ? <Loader2 className="size-4 animate-spin" /> : interests.some(i => i.id === selectedJob.id) ? <><CheckCircle2 className="size-4" />Guardada en tus intereses</> : <><Star className="size-4" />Me interesa</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
