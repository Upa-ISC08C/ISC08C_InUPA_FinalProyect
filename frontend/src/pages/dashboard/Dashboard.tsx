import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Briefcase, FileText, Send, Sparkles, MapPin, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../services/user.service";
import { jobsService } from "../../services/jobs.service";
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
  const [applied, setApplied] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userService.stats(), jobsService.recent(3)])
      .then(([s, j]) => { setStats(s); setJobs(j); })
      .catch(() => {})
      .finally(() => setLoading(false));
    jobsService.myApplications().then((a) => setApplied(a.map((x) => x.vacante_id))).catch(() => {});
  }, []);

  const aplicar = async (id: string) => {
    try { await jobsService.apply(id); setApplied((p) => [...p, id]); }
    catch (err: any) { if (err?.response?.status === 409) setApplied((p) => [...p, id]); }
  };

  const nombre = user?.nombre_completo?.split(" ")[0] || "Usuario";

  const tarjetas = [
    { label: "CV completado", value: `${stats?.cvCompletion ?? 0}%`, icon: FileText, color: "#003366" },
    { label: "Postulaciones", value: stats?.totalApplications ?? 0, icon: Send, color: "#00A8E8" },
    {
      label: "En proceso",
      value: (stats?.applicationsByState?.pendiente ?? 0) + (stats?.applicationsByState?.revisada ?? 0),
      icon: Briefcase, color: "#CA8A04",
    },
    { label: "Habilidades", value: stats?.cvDetails?.skills ?? 0, icon: Sparkles, color: "#9B59B6" },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#003366]" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="rounded-2xl bg-gradient-to-r from-[#003366] to-[#00509E] p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">¡Hola, {nombre}! 👋</h1>
          <p className="text-white/70 text-sm mt-1">
            {jobs.length > 0 ? `Tienes ${jobs.length} nuevas oportunidades que coinciden contigo` : "Bienvenido de regreso a InUPA"}
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
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${t.color}18` }}>
                    <Icon className="size-5" style={{ color: t.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#2C3E50] mt-3">{t.value}</p>
                <p className="text-xs text-[#7F8C8D] mt-0.5">{t.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recomendaciones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#FFD700]" />
            <h2 className="text-lg font-bold text-[#2C3E50]">Vacantes recomendadas</h2>
          </div>
          <Link to="/dashboard/empleos" className="text-sm text-[#003366] font-semibold hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="size-4" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center text-sm text-[#7F8C8D]">No hay vacantes por ahora.</CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {jobs.map((v) => (
              <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-[#003366] flex items-center justify-center text-white font-bold text-sm">
                      {(v.empresa?.nombre || "E").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#2C3E50] text-sm truncate">{v.titulo}</h3>
                      <p className="text-xs font-semibold text-[#003366] truncate">{v.empresa?.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-[#7F8C8D]">
                    {v.ubicacion && <span className="flex items-center gap-1"><MapPin className="size-3" />{v.ubicacion}</span>}
                    {v.modalidad && <span>· {v.modalidad}</span>}
                  </div>
                  <p className="text-sm font-bold text-[#2C3E50] mt-2">{salaryStr(v.salario_min, v.salario_max)}</p>
                  <button onClick={() => aplicar(v.id)} disabled={applied.includes(v.id)}
                    className={`w-full mt-3 h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      applied.includes(v.id) ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#003366] text-white hover:bg-[#002244]"
                    }`}>
                    {applied.includes(v.id) ? <><CheckCircle2 className="size-4" />Postulado</> : <><Send className="size-4" />Aplicar</>}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
