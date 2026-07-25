import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  BookmarkPlus,
  Bookmark,
  SlidersHorizontal,
  X,
  Globe,
  DollarSign,
  CheckCircle2,
  Mail,
  Phone,
  Copy,
  ExternalLink,
} from "lucide-react";
import { jobsService, type Job } from "../../features/jobs/jobsService";
import { applicationsService } from "../../features/applications/applicationsService";

function MatchPill({ value }: { value: number }) {
  const color =
    value >= 90
      ? { bg: "#DCFCE7", text: "#16A34A", border: "#86EFAC" }
      : value >= 75
        ? { bg: "#FEF9C3", text: "#CA8A04", border: "#FDE047" }
        : { bg: "#EFF6FF", text: "#2563EB", border: "#93C5FD" };
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: color.bg,
        color: color.text,
        borderColor: color.border,
      }}
    >
      {value}% match
    </span>
  );
}

export function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    modalidad: "",
    tipo_contrato: "",
    salario_min: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadJobs();
    loadAppliedJobs();
  }, [filters, searchTerm]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsService.getJobs({
        activa: true,
        modalidad: filters.modalidad || undefined,
        tipo_contrato: filters.tipo_contrato || undefined,
        salario_min: filters.salario_min
          ? Number(filters.salario_min)
          : undefined,
        search: searchTerm || undefined,
        limit: 20,
      });
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error cargando vacantes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      const response = await applicationsService.getMyApplications();
      const appliedIds = new Set(response.data.map((app) => app.vacante_id));
      setAppliedJobs(appliedIds);
    } catch (error) {
      console.error("Error cargando aplicaciones:", error);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await applicationsService.createApplication(jobId);
      setAppliedJobs((prev) => new Set([...Array.from(prev), jobId]));
      alert("¡Te has postulado exitosamente!");
      setSelectedJob(null);
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al crear postulación");
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSave = (id: string) =>
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const clearFilters = () => {
    setFilters({ modalidad: "", tipo_contrato: "", salario_min: "" });
    setSearchTerm("");
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-3">
          Tipo de empleo
        </p>
        <div className="space-y-2.5">
          {["Tiempo completo", "Medio tiempo", "Prácticas", "Por proyecto"].map(
            (label) => (
              <label
                key={label}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <Checkbox
                  checked={filters.tipo_contrato === label}
                  onChange={() =>
                    setFilters({
                      ...filters,
                      tipo_contrato:
                        filters.tipo_contrato === label ? "" : label,
                    })
                  }
                  className="border-[#D1D5DB]"
                />{" "}
                <span className="text-sm text-[#2C3E50]">{label}</span>
              </label>
            ),
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-3">
          Modalidad
        </p>
        <div className="space-y-2.5">
          {["Remoto", "Presencial", "Híbrido"].map((label) => (
            <label
              key={label}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <Checkbox
                checked={filters.modalidad === label}
                onChange={(checked) =>
                  setFilters({ ...filters, modalidad: checked ? label : "" })
                }
                className="border-[#D1D5DB]"
              />
              <span className="text-sm text-[#2C3E50]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-3">
          Salario mínimo
        </p>
        <Select
          value={filters.salario_min}
          onValueChange={(val) => setFilters({ ...filters, salario_min: val })}
        >
          <SelectTrigger className="h-9 rounded-xl text-sm border-[#E5E7EB]">
            <SelectValue placeholder="Cualquier salario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5000">$5,000+ MXN</SelectItem>
            <SelectItem value="10000">$10,000+ MXN</SelectItem>
            <SelectItem value="15000">$15,000+ MXN</SelectItem>
            <SelectItem value="20000">$20,000+ MXN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button
        onClick={clearFilters}
        className="w-full h-9 border border-[#E5E7EB] text-[#7F8C8D] rounded-xl text-sm font-medium hover:bg-[#F5F7FA] transition-colors"
      >
        Limpiar filtros
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">
          Bolsa de Trabajo
        </h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">
          Descubre oportunidades diseñadas para estudiantes universitarios
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
          <Input
            placeholder="Buscar puesto, empresa o habilidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-[#E5E7EB] text-sm"
          />
        </div>
        <button
          className="h-11 px-3.5 border border-[#E5E7EB] rounded-xl text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors lg:hidden flex-shrink-0"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      {mobileFiltersOpen && (
        <Card className="border-0 shadow-sm lg:hidden">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-[#2C3E50]">Filtros</p>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="size-4 text-[#7F8C8D]" />
              </button>
            </div>
            <FilterPanel />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <p className="font-bold text-[#2C3E50] mb-5 flex items-center gap-2">
              <SlidersHorizontal className="size-4" /> Filtros
            </p>
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#7F8C8D]">
              <span className="font-bold text-[#2C3E50]">{jobs.length}</span>{" "}
              empleos encontrados
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#7F8C8D]">
              Cargando vacantes...
            </div>
          ) : jobs.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Briefcase className="size-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="font-semibold text-[#2C3E50]">
                  No se encontraron vacantes
                </p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => {
              const isApplied = appliedJobs.has(job.id);
              const initials =
                job.empresa?.nombre?.substring(0, 2).toUpperCase() || "EM";

              return (
                <Card
                  key={job.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-[#003366]">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-[#2C3E50] text-base">
                                {job.titulo}
                              </h3>
                              {/* Si el backend no devuelve 'match', podemos omitirlo o poner uno por defecto */}
                              {/* <MatchPill value={job.match || 85} /> */}
                            </div>
                            <p className="text-sm font-semibold text-[#003366] mt-0.5">
                              {job.empresa?.nombre}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(job.id);
                            }}
                            className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:text-[#003366] hover:bg-[#F5F7FA] transition-colors flex-shrink-0"
                          >
                            {savedJobs.includes(job.id) ? (
                              <Bookmark className="size-4 fill-[#FFD700] text-[#FFD700]" />
                            ) : (
                              <BookmarkPlus className="size-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#7F8C8D]">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {job.ubicacion || "Remoto"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="size-3" />
                            {job.tipo_contrato || "Tiempo completo"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(job.fecha_publicacion).toLocaleDateString(
                              "es-MX",
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-[#7F8C8D] mt-2 line-clamp-2 leading-relaxed">
                          {job.descripcion}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {job.vacante_habilidades
                            ?.slice(0, 3)
                            .map((vh: any) => (
                              <span
                                key={vh.habilidad.id}
                                className="text-xs bg-[#F5F7FA] text-[#2C3E50] px-2.5 py-1 rounded-full font-medium border border-[#E5E7EB]"
                              >
                                {vh.habilidad.nombre}
                              </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F7FA]">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-[#2C3E50]">
                              {job.salario_min && job.salario_max
                                ? `$${Number(job.salario_min)} - $${Number(job.salario_max)} MXN`
                                : "Salario no especificado"}
                            </span>
                            {job.modalidad && (
                              <span className="text-xs text-[#7F8C8D] bg-[#F5F7FA] px-2 py-0.5 rounded-full border border-[#E5E7EB]">
                                {job.modalidad}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {isApplied ? (
                              <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
                                <CheckCircle2 className="size-3" /> Aplicado
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApply(job.id);
                                }}
                                className="text-xs px-3.5 py-1.5 rounded-lg bg-[#003366] text-white font-semibold hover:bg-[#002244] transition-colors"
                              >
                                Aplicar ahora
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Job detail dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        {selectedJob && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="size-14 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-[#003366]">
                    {selectedJob.empresa?.nombre
                      ?.substring(0, 2)
                      .toUpperCase() || "EM"}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-[#2C3E50]">
                      {selectedJob.titulo}
                    </DialogTitle>
                    <p className="text-sm font-semibold text-[#003366]">
                      {selectedJob.empresa?.nombre}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#7F8C8D]">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {selectedJob.ubicacion || "Remoto"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="size-3" />
                        {selectedJob.tipo_contrato}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(
                          selectedJob.fecha_publicacion,
                        ).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[#F5F7FA] text-[#2C3E50] px-2.5 py-1 rounded-full border border-[#E5E7EB] font-medium flex items-center gap-1">
                  <DollarSign className="size-3" />
                  {selectedJob.salario_min && selectedJob.salario_max
                    ? `$${Number(selectedJob.salario_min)} - $${Number(selectedJob.salario_max)}`
                    : "No especificado"}
                </span>
                <span className="text-xs bg-[#F5F7FA] text-[#7F8C8D] px-2.5 py-1 rounded-full border border-[#E5E7EB]">
                  {selectedJob.modalidad}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">
                  Descripción del puesto
                </p>
                <p className="text-sm text-[#2C3E50] leading-relaxed whitespace-pre-line">
                  {selectedJob.descripcion}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">
                  Requisitos
                </p>
                <p className="text-sm text-[#2C3E50] leading-relaxed whitespace-pre-line">
                  {selectedJob.requisitos}
                </p>
              </div>

              <div className="rounded-xl border-2 border-[#003366]/20 bg-[#F0F6FF] p-4 space-y-3">
                <p className="text-sm font-bold text-[#003366] flex items-center gap-2">
                  <ExternalLink className="size-4" />
                  ¿Cómo aplicar?
                </p>
                <p className="text-xs text-[#2C3E50] leading-relaxed">
                  Postúlate directamente desde la plataforma. Tu perfil y CV se
                  enviarán automáticamente al equipo de reclutamiento.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 border-t border-[#E5E7EB] pt-4">
              <button
                onClick={() => toggleSave(selectedJob.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  savedJobs.includes(selectedJob.id)
                    ? "border-[#FFD700] bg-[#FEF9C3] text-[#CA8A04]"
                    : "border-[#E5E7EB] text-[#2C3E50] hover:bg-[#F5F7FA]"
                }`}
              >
                {savedJobs.includes(selectedJob.id) ? (
                  <>
                    <Bookmark className="size-4 fill-current" />
                    Guardado
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="size-4" />
                    Guardar
                  </>
                )}
              </button>
              {appliedJobs.has(selectedJob.id) ? (
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-sm font-bold border border-[#86EFAC]"
                >
                  <CheckCircle2 className="size-4" /> Ya aplicado
                </button>
              ) : (
                <button
                  onClick={() => handleApply(selectedJob.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold transition-colors"
                >
                  Aplicar a esta vacante
                </button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
