import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import {
  Briefcase, FileText, Send, Sparkles, MapPin, ArrowRight, Loader2, CheckCircle2,
  GraduationCap, User, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../services/user.service";
import { jobsService } from "../../services/jobs.service";
import type { UserStats, Vacante, Postulacion } from "../../services/types";

const salaryStr = (min: number | null, max: number | null) => {
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min) return `$${min.toLocaleString()}`;
  return "A convenir";
};
const ESTADOS: Record<string, { label: string; bg: string; text: string }> = {
  pendiente: { label: "Enviada", bg: "#EFF6FF", text: "#2563EB" },
  revisada: { label: "En revisión", bg: "#FEF9C3", text: "#CA8A04" },
  aceptada: { label: "Aceptada", bg: "#DCFCE7", text: "#16A34A" },
  rechazada: { label: "Rechazada", bg: "#FEE2E2", text: "#DC2626" },
};

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [jobs, setJobs] = useState<Vacante[]>([]);
  const [apps, setApps] = useState<Postulacion[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recomendadas = jobsService
      .list({ activa: true, carrera: user?.carrera || undefined, cuatrimestre: user?.cuatrimestre || undefined, limit: 3 })
      .then((r) => (r.data && r.data.length > 0 ? r.data : jobsService.recent(3)));

    Promise.all([userService.stats().catch(() => null), recomendadas, jobsService.myApplications().catch(() => [])])
      .then(([s, j, a]) => { setStats(s); setJobs(j); setApps(a); setApplied(a.map((x) => x.vacante_id)); })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [user?.carrera, user?.cuatrimestre]);

  const aplicar = async (id: string) => {
    try { await jobsService.apply(id); setApplied((p) => [...p, id]); }
    catch (err: any) { if (err?.response?.status === 409) setApplied((p) => [...p, id]); }
  };

  const nombre = user?.nombre_completo?.split(" ")[0] || "Usuario";
  const tarjetas = [
    { label: "CV completado", value: `${stats?.cvCompletion ?? 0}%`, icon: FileText, color: "#003366" },
    { label: "Postulaciones", value: stats?.totalApplications ?? 0, icon: Send, color: "#00A8E8" },
    { label: "En proceso", value: (stats?.applicationsByState?.pendiente ?? 0) + (stats?.applicationsByState?.revisada ?? 0), icon: Briefcase, color: "#CA8A04" },
    { label: "Habilidades", value: stats?.cvDetails?.skills ?? 0, icon: Sparkles, color: "#9B59B6" },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#003366]" /></div>;

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="rounded-2xl bg-gradient-to-r from-[#003366] to-[#00509E] p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">¡Hola, {nombre}! 👋</h1>
          <p className="text-white/70 text-sm mt-1">
            {jobs.length > 0 ? `${jobs.length} vacantes recomendadas para tu carrera` : "Bienvenido de regreso a InUPA"}
          </p>
        </div>
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/[0.06]" />
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${t.color}18` }}>
                  <Icon className="size-5" style={{ color: t.color }} />
                </div>
                <p className="text-2xl font-bold text-[#2C3E50] mt-3">{t.value}</p>
                <p className="text-xs text-[#7F8C8D] mt-0.5">{t.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTAs: completar perfil + CV con IA */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/dashboard/perfil">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all bg-[#F0F6FF]">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="size-11 rounded-xl bg-[#003366] flex items-center justify-center text-white"><User className="size-5" /></div>
              <div className="flex-1"><p className="font-bold text-[#2C3E50]">Completa tu perfil</p><p className="text-xs text-[#7F8C8D]">Un perfil completo atrae más empresas</p></div>
              <ArrowRight className="size-4 text-[#003366]" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/cv-builder">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all bg-[#FEF9C3]">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="size-11 rounded-xl bg-[#CA8A04] flex items-center justify-center text-white"><Sparkles className="size-5" /></div>
              <div className="flex-1"><p className="font-bold text-[#2C3E50]">Completar mi CV con IA</p><p className="text-xs text-[#7F8C8D]">Genera y optimiza tu currículum</p></div>
              <ArrowRight className="size-4 text-[#CA8A04]" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recomendaciones por carrera/cuatrimestre */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-[#003366]" />
              <h2 className="text-lg font-bold text-[#2C3E50]">Recomendadas para {user?.carrera ? "tu carrera" : "ti"}</h2>
            </div>
            <Link to="/dashboard/empleos" className="text-sm text-[#003366] font-semibold hover:underline flex items-center gap-1">Ver todas <ArrowRight className="size-4" /></Link>
          </div>
          {jobs.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center text-sm text-[#7F8C8D]">No hay vacantes por ahora.</CardContent></Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {jobs.map((v) => (
                <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-[#003366] flex items-center justify-center text-white font-bold text-sm">{(v.empresa?.nombre || "E").substring(0, 2).toUpperCase()}</div>
                      <div className="min-w-0"><h3 className="font-bold text-[#2C3E50] text-sm truncate">{v.titulo}</h3><p className="text-xs font-semibold text-[#003366] truncate">{v.empresa?.nombre}</p></div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-[#7F8C8D]">{v.ubicacion && <span className="flex items-center gap-1"><MapPin className="size-3" />{v.ubicacion}</span>}{v.modalidad && <span>· {v.modalidad}</span>}</div>
                    <p className="text-sm font-bold text-[#2C3E50] mt-2">{salaryStr(v.salario_min, v.salario_max)}</p>
                    <button onClick={() => aplicar(v.id)} disabled={applied.includes(v.id)}
                      className={`w-full mt-3 h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${applied.includes(v.id) ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#003366] text-white hover:bg-[#002244]"}`}>
                      {applied.includes(v.id) ? <><CheckCircle2 className="size-4" />Postulado</> : <><Send className="size-4" />Aplicar</>}
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Postulaciones recientes (integradas en Inicio) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#2C3E50]">Postulaciones recientes</h2>
            <Link to="/dashboard/postulaciones" className="text-sm text-[#003366] font-semibold hover:underline flex items-center gap-1">Ver más <ArrowRight className="size-4" /></Link>
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-2">
              {apps.length === 0 ? (
                <p className="text-sm text-[#7F8C8D] text-center py-6">Aún no te has postulado a ninguna vacante.</p>
              ) : (
                <div className="divide-y divide-[#F5F7FA]">
                  {apps.slice(0, 5).map((a) => {
                    const est = ESTADOS[a.estado] ?? ESTADOS.pendiente;
                    return (
                      <Link key={a.id} to="/dashboard/postulaciones" className="flex items-center gap-3 p-3 hover:bg-[#FAFAFA] rounded-lg">
                        <div className="size-9 rounded-lg bg-[#003366] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(a.vacante.empresa?.nombre || "E").substring(0, 2).toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#2C3E50] truncate">{a.vacante.titulo}</p>
                          <p className="text-xs text-[#7F8C8D] truncate">{a.vacante.empresa?.nombre}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: est.bg, color: est.text }}>{est.label}</span>
                        <ChevronRight className="size-4 text-[#7F8C8D] flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
