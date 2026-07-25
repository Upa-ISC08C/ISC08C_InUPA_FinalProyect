import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Briefcase,
  FileText,
  MapPin,
  Clock,
  BookmarkPlus,
  Bookmark,
  ExternalLink,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { userService, type UserStats } from "../../features/user/userService";
import { jobsService, type Job } from "../../features/jobs/jobsService";
import { applicationsService } from "../../features/applications/applicationsService";

function MatchRing({ value }: { value: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (value / 100) * circ;
  const color = value >= 90 ? "#27AE60" : value >= 75 ? "#FFD700" : "#00A8E8";
  return (
    <div className="relative size-[52px] flex-shrink-0">
      <svg viewBox="0 0 40 40" className="size-[52px] -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#E5E7EB" strokeWidth="3" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold leading-none text-[#2C3E50]">{value}%</span>
        <span className="text-[7px] text-[#7F8C8D] leading-none mt-0.5">match</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        userService.getStats(),
        jobsService.getRecentJobs(3),
      ]);
      setStats(statsRes.data);
      setRecommendedJobs(jobsRes.data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (id: string) => {
    setSavedJobs((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
  };

  const handleApply = async (jobId: string) => {
    try {
      await applicationsService.createApplication(jobId);
      alert("¡Te has postulado exitosamente!");
      setSelectedJob(null);
      loadDashboardData(); // Recargar para actualizar contadores
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al crear postulación");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-[#7F8C8D]">Cargando dashboard...</div>;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl bg-[#003366] px-8 py-7 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/[0.04]" />
          <div className="absolute bottom-0 right-40 size-32 rounded-full bg-[#FFD700]/[0.08]" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="text-white/60 text-sm font-medium">Bienvenido de regreso</p>
            <h1 className="text-white text-3xl font-bold tracking-tight">¡Hola, {user.nombre_completo?.split(" ")[0] || "Usuario"}! 👋</h1>
            <p className="text-white/65 text-sm">
              Tienes <span className="text-[#FFD700] font-semibold">{stats?.recommendedJobs?.length || 0} nuevas oportunidades</span> que coinciden con tu perfil
            </p>
          </div>
          <div className="flex gap-8 sm:gap-10">
            <div className="text-center">
              <p className="text-[#FFD700] text-2xl font-bold">{stats?.cvCompletion || 0}%</p>
              <p className="text-white/50 text-xs mt-0.5">CV completado</p>
            </div>
            <div className="text-center">
              <p className="text-[#FFD700] text-2xl font-bold">{stats?.totalApplications || 0}</p>
              <p className="text-white/50 text-xs mt-0.5">Enviados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-[#7F8C8D] font-medium">Aplicaciones totales</p>
              <div className="size-8 rounded-lg flex items-center justify-center bg-[#003366]/10">
                <Briefcase className="size-4 text-[#003366]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2C3E50]">{stats?.totalApplications || 0}</p>
            <p className="text-xs text-[#7F8C8D] mt-1">+{stats?.applicationsByState?.pendiente || 0} pendientes de respuesta</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-[#7F8C8D] font-medium">Perfil completado</p>
              <div className="size-8 rounded-lg flex items-center justify-center bg-[#FFD700]/10">
                <FileText className="size-4 text-[#FFD700]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2C3E50]">{stats?.cvCompletion || 0}%</p>
            <p className="text-xs text-[#7F8C8D] mt-1">{stats?.cvDetails?.skills || 0} habilidades registradas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
                <Sparkles className="size-5 text-[#FFD700]" /> Recomendaciones IA
              </h2>
              <p className="text-sm text-[#7F8C8D] mt-0.5">Basado en tu perfil y preferencias</p>
            </div>
            <Link to="/dashboard/empleos" className="flex items-center gap-1.5 text-sm text-[#003366] font-semibold hover:gap-2.5 transition-all">
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedJobs.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Briefcase className="size-12 text-[#D1D5DB] mx-auto mb-3" />
                  <p className="font-semibold text-[#2C3E50]">No hay recomendaciones aún</p>
                  <p className="text-sm text-[#7F8C8D] mt-1">Completa tu CV para recibir mejores ofertas</p>
                </CardContent>
              </Card>
            ) : (
              recommendedJobs.map((job) => (
                <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => setSelectedJob(job)}>
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-[#003366]">
                        {job.empresa?.nombre?.substring(0, 2).toUpperCase() || "EM"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-[#2C3E50] text-base leading-tight">{job.titulo}</h3>
                            <p className="text-sm font-semibold text-[#003366] mt-0.5">{job.empresa?.nombre}</p>
                          </div>
                          <MatchRing value={85} /> {/* Valor mockeado visualmente si el backend no lo envía en recentJobs */}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#7F8C8D]">
                          <span className="flex items-center gap-1"><MapPin className="size-3" />{job.ubicacion || "Remoto"}</span>
                          <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(job.fecha_publicacion).toLocaleDateString("es-MX")}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F7FA]">
                          <span className="text-sm font-semibold text-[#2C3E50]">
                            {job.salario_min && job.salario_max ? `$${Number(job.salario_min)} - $${Number(job.salario_max)}` : "Salario no especificado"}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                              className={`size-8 flex items-center justify-center rounded-lg border transition-all ${
                                savedJobs.includes(job.id) ? "border-[#FFD700] bg-[#FEF9C3] text-[#CA8A04]" : "border-[#E5E7EB] text-[#7F8C8D] hover:border-[#003366]/30"
                              }`}
                            >
                              {savedJobs.includes(job.id) ? <Bookmark className="size-3.5 fill-current" /> : <BookmarkPlus className="size-3.5" />}
                            </button>
                            <button className="flex items-center gap-1.5 text-xs bg-[#003366] hover:bg-[#002244] text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
                              <ExternalLink className="size-3" /> Ver detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-[#2C3E50]">Completa tu perfil</CardTitle>
              <p className="text-xs text-[#7F8C8D]">Un perfil completo atrae más empresas</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7F8C8D]">Progreso</span>
                  <span className="font-bold text-[#003366]">{stats?.cvCompletion || 0}%</span>
                </div>
                <div className="h-2 bg-[#F5F7FA] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#FFD700]" style={{ width: `${stats?.cvCompletion || 0}%` }} />
                </div>
              </div>
              <Link to="/dashboard/cv-builder">
                <button className="w-full h-9 border-2 border-[#003366] text-[#003366] rounded-xl text-sm font-semibold hover:bg-[#003366] hover:text-white transition-all">
                  Completar perfil
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job detail modal (reutilizado del JobBoard) */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        {selectedJob && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="size-14 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-[#003366]">
                    {selectedJob.empresa?.nombre?.substring(0, 2).toUpperCase() || "EM"}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-[#2C3E50]">{selectedJob.titulo}</DialogTitle>
                    <p className="text-sm font-semibold text-[#003366]">{selectedJob.empresa?.nombre}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors">
                  <X className="size-4" />
                </button>
              </div>
            </DialogHeader>
            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[#F5F7FA] text-[#2C3E50] px-2.5 py-1 rounded-full border border-[#E5E7EB] font-medium flex items-center gap-1">
                  <DollarSign className="size-3" />
                  {selectedJob.salario_min && selectedJob.salario_max ? `$${Number(selectedJob.salario_min)} - $${Number(selectedJob.salario_max)}` : "No especificado"}
                </span>
                <span className="text-xs bg-[#F5F7FA] text-[#7F8C8D] px-2.5 py-1 rounded-full border border-[#E5E7EB]">{selectedJob.modalidad}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Descripción</p>
                <p className="text-sm text-[#2C3E50] leading-relaxed whitespace-pre-line">{selectedJob.descripcion}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Requisitos</p>
                <p className="text-sm text-[#2C3E50] leading-relaxed whitespace-pre-line">{selectedJob.requisitos}</p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 border-t border-[#E5E7EB] pt-4">
              <button
                onClick={() => handleApply(selectedJob.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold transition-colors"
              >
                Aplicar a esta vacante
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}