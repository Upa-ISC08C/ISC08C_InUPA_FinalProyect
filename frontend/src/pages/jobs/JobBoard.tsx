import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import {
  Search, MapPin, Clock, Briefcase, BookmarkPlus, Bookmark, X, Globe,
  DollarSign, CheckCircle2, Loader2, Send,
} from "lucide-react";
import { jobsService } from "../../services/jobs.service";
import type { Vacante } from "../../services/types";

const PALETTE = ["#003366", "#E74C3C", "#9B59B6", "#E67E22", "#1ABC9C", "#34495E"];

const rel = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "hoy";
  if (d === 1) return "hace 1 día";
  if (d < 7) return `hace ${d} días`;
  return `hace ${Math.floor(d / 7)} sem`;
};
const salaryStr = (min: number | null, max: number | null) => {
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()} MXN`;
  if (min) return `$${min.toLocaleString()} MXN`;
  return "Sueldo a convenir";
};

interface JobVM {
  id: string; title: string; company: string; initials: string; color: string;
  location: string; type: string; modality: string; salary: string; posted: string;
  description: string; requirements: string[]; web: string | null;
}

function toVM(v: Vacante): JobVM {
  const nombre = v.empresa?.nombre || "Empresa";
  return {
    id: v.id,
    title: v.titulo,
    company: nombre,
    initials: nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    color: PALETTE[nombre.charCodeAt(0) % PALETTE.length],
    location: v.ubicacion || "—",
    type: v.modalidad || "—",
    modality: v.tipo_contrato || "—",
    salary: salaryStr(v.salario_min, v.salario_max),
    posted: rel(v.fecha_publicacion),
    description: v.descripcion,
    requirements: (v.vacante_habilidades || []).map((h) => h.habilidad.nombre),
    web: v.empresa?.sitio_web || null,
  };
}

export function JobBoard() {
  const [jobs, setJobs] = useState<JobVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobVM | null>(null);

  const cargar = (q = "") => {
    setLoading(true);
    jobsService
      .list({ activa: true, search: q || undefined, limit: 50 })
      .then((res) => setJobs((res.data || []).map(toVM)))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  // Cargar las postulaciones existentes para marcar "Postulado"
  useEffect(() => {
    jobsService.myApplications().then((apps) => setApplied(apps.map((a) => a.vacante_id))).catch(() => {});
  }, []);

  const toggleSave = (id: string) =>
    setSavedJobs((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));

  const aplicar = async (id: string) => {
    if (applied.includes(id)) return;
    setApplying(id);
    try {
      await jobsService.apply(id);
      setApplied((p) => [...p, id]);
    } catch (err: any) {
      if (err?.response?.status === 409) setApplied((p) => [...p, id]);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Bolsa de Trabajo</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">Descubre oportunidades diseñadas para estudiantes universitarios</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
          <Input
            placeholder="Buscar puesto, empresa o habilidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") cargar(search); }}
            className="pl-10 h-11 rounded-xl border-[#E5E7EB] text-sm"
          />
        </div>
        <button onClick={() => cargar(search)}
          className="h-11 px-5 bg-[#003366] text-white rounded-xl text-sm font-semibold hover:bg-[#002244] transition-colors flex-shrink-0">
          Buscar
        </button>
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#7F8C8D]">
            <span className="font-bold text-[#2C3E50]">{jobs.length} empleos</span> encontrados
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-[#7F8C8D] text-center py-16">No se encontraron vacantes.</p>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: job.color }}>
                    {job.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#2C3E50] text-base">{job.title}</h3>
                        <p className="text-sm font-semibold text-[#003366] mt-0.5">{job.company}</p>
                      </div>
                      <button onClick={() => toggleSave(job.id)}
                        className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:text-[#003366] hover:bg-[#F5F7FA] transition-colors flex-shrink-0">
                        {savedJobs.includes(job.id)
                          ? <Bookmark className="size-4 fill-[#FFD700] text-[#FFD700]" />
                          : <BookmarkPlus className="size-4" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#7F8C8D]">
                      <span className="flex items-center gap-1"><MapPin className="size-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="size-3" />{job.type}</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" />{job.posted}</span>
                    </div>

                    <p className="text-xs text-[#7F8C8D] mt-2 line-clamp-2 leading-relaxed">{job.description}</p>

                    {job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {job.requirements.map((req) => (
                          <span key={req} className="text-xs bg-[#F5F7FA] text-[#2C3E50] px-2.5 py-1 rounded-full font-medium border border-[#E5E7EB]">{req}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F7FA]">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#2C3E50]">{job.salary}</span>
                        <span className="text-xs text-[#7F8C8D] bg-[#F5F7FA] px-2 py-0.5 rounded-full border border-[#E5E7EB]">{job.modality}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedJob(job)}
                          className="text-xs px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] text-[#2C3E50] font-semibold hover:bg-[#F5F7FA] transition-colors">
                          Ver detalles
                        </button>
                        <button onClick={() => aplicar(job.id)} disabled={applied.includes(job.id) || applying === job.id}
                          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                            applied.includes(job.id)
                              ? "bg-[#DCFCE7] text-[#16A34A] cursor-default"
                              : "bg-[#003366] text-white hover:bg-[#002244]"
                          }`}>
                          {applying === job.id ? <Loader2 className="size-3 animate-spin" />
                            : applied.includes(job.id) ? <><CheckCircle2 className="size-3" />Postulado</>
                            : <><Send className="size-3" />Aplicar</>}
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

      {/* Detail dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        {selectedJob && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="size-14 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0" style={{ backgroundColor: selectedJob.color }}>
                    {selectedJob.initials}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-[#2C3E50]">{selectedJob.title}</DialogTitle>
                    <p className="text-sm font-semibold text-[#003366]">{selectedJob.company}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#7F8C8D]">
                      <span className="flex items-center gap-1"><MapPin className="size-3" />{selectedJob.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="size-3" />{selectedJob.type}</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" />{selectedJob.posted}</span>
                    </div>
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
                  <DollarSign className="size-3" />{selectedJob.salary}
                </span>
                <span className="text-xs bg-[#F5F7FA] text-[#7F8C8D] px-2.5 py-1 rounded-full border border-[#E5E7EB]">{selectedJob.modality}</span>
              </div>

              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Descripción del puesto</p>
                <p className="text-sm text-[#2C3E50] leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Habilidades requeridas</p>
                  <div className="space-y-1.5">
                    {selectedJob.requirements.map((r) => (
                      <div key={r} className="flex items-center gap-2 text-sm text-[#2C3E50]">
                        <CheckCircle2 className="size-3.5 text-[#27AE60] flex-shrink-0" />{r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.web && (
                <a href={selectedJob.web} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#003366] font-semibold hover:underline">
                  <Globe className="size-4" />Sitio web de la empresa
                </a>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3 border-t border-[#E5E7EB] pt-4">
              <button onClick={() => toggleSave(selectedJob.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  savedJobs.includes(selectedJob.id) ? "border-[#FFD700] bg-[#FEF9C3] text-[#CA8A04]" : "border-[#E5E7EB] text-[#2C3E50] hover:bg-[#F5F7FA]"
                }`}>
                {savedJobs.includes(selectedJob.id) ? <><Bookmark className="size-4 fill-current" />Guardado</> : <><BookmarkPlus className="size-4" />Guardar</>}
              </button>
              <button onClick={() => aplicar(selectedJob.id)} disabled={applied.includes(selectedJob.id) || applying === selectedJob.id}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  applied.includes(selectedJob.id) ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#003366] hover:bg-[#002244] text-white"
                }`}>
                {applying === selectedJob.id ? <Loader2 className="size-4 animate-spin" />
                  : applied.includes(selectedJob.id) ? <><CheckCircle2 className="size-4" />Ya te postulaste</>
                  : <><Send className="size-4" />Postularme a esta vacante</>}
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
