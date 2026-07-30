import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
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
  Globe,
  DollarSign,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  SlidersHorizontal,
  MessageCircle,
  Star,
  CalendarClock,
  X,
} from "lucide-react";
import { jobsService } from "../../services/jobs.service";
import type { Vacante } from "../../services/types";
import { useAuthStore } from "../../store/authStore";
import {
  CARRERAS_UPA,
  CUATRIMESTRES,
  TIPOS_CONTRATO,
  MODALIDADES,
} from "../../utils/catalogos";

const PALETTE = [
  "#003366",
  "#E74C3C",
  "#9B59B6",
  "#E67E22",
  "#1ABC9C",
  "#34495E",
];
const rel = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "hoy";
  if (d === 1) return "hace 1 día";
  if (d < 7) return `hace ${d} días`;
  return `hace ${Math.floor(d / 7)} sem`;
};
const salaryStr = (min: number | null, max: number | null) => {
  if (min && max)
    return `$${min.toLocaleString()} – $${max.toLocaleString()} MXN`;
  if (min) return `Desde $${min.toLocaleString()} MXN`;
  return "Sueldo a convenir";
};
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const deadlineInfo = (iso: string | null) => {
  if (!iso) return null;
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (dias < 0)
    return {
      label: `Cerró el ${fmtFecha(iso)}`,
      cerrada: true,
      urgente: false,
    };
  if (dias === 0)
    return {
      label: "Último día para postularte",
      cerrada: false,
      urgente: true,
    };
  if (dias <= 5)
    return {
      label: `Cierra en ${dias} día${dias === 1 ? "" : "s"}`,
      cerrada: false,
      urgente: true,
    };
  return {
    label: `Cierra el ${fmtFecha(iso)}`,
    cerrada: false,
    urgente: false,
  };
};
const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
const color = (n: string) => PALETTE[(n?.charCodeAt(0) || 0) % PALETTE.length];

export function JobBoard() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<string[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vacante | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [f, setF] = useState({
    search: "",
    carrera: "",
    cuatrimestre: "",
    tipo_contrato: "",
    modalidad: "",
    salario_min: "",
    salario_max: "",
  });
  const setFilter = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const cargar = (filtros = f) => {
    setLoading(true);
    jobsService
      .list({
        activa: true,
        limit: 50,
        search: filtros.search || undefined,
        carrera: filtros.carrera || undefined,
        cuatrimestre: filtros.cuatrimestre
          ? Number(filtros.cuatrimestre)
          : undefined,
        tipo_contrato: filtros.tipo_contrato || undefined,
        modalidad: filtros.modalidad || undefined,
        salario_min: filtros.salario_min
          ? Number(filtros.salario_min)
          : undefined,
        salario_max: filtros.salario_max
          ? Number(filtros.salario_max)
          : undefined,
      })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    jobsService
      .myApplications()
      .then((a) => setApplied(a.map((x) => x.vacante_id)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const limpiar = () => {
    const empty = {
      search: "",
      carrera: "",
      cuatrimestre: "",
      tipo_contrato: "",
      modalidad: "",
      salario_min: "",
      salario_max: "",
    };
    setF(empty);
    cargar(empty);
  };

  const paraMiPerfil = () => {
    const nf = {
      ...f,
      carrera: user?.carrera || "",
      cuatrimestre: user?.cuatrimestre ? String(user.cuatrimestre) : "",
    };
    setF(nf);
    cargar(nf);
  };

  const toggleInteres = async (id: string) => {
    setApplying(id);
    try {
      if (applied.includes(id)) {
        await jobsService.unapply(id);
        setApplied((p) => p.filter((x) => x !== id));
      } else {
        await jobsService.apply(id);
        setApplied((p) => [...p, id]);
      }
    } catch (err: any) {
      if (err?.response?.status === 409) setApplied((p) => [...p, id]);
    } finally {
      setApplying(null);
    }
  };

  const mensajeSugerido = (v: Vacante) => {
    const carreraTxt = user?.carrera
      ? `, estudiante de ${user.carrera}${user?.cuatrimestre ? ` (${user.cuatrimestre}° cuatrimestre)` : ""} en la Universidad Politécnica de Aguascalientes`
      : "";
    return `Estimados de ${v.empresa?.nombre || "la empresa"}:

Mi nombre es ${user?.nombre_completo || ""}${carreraTxt}. Me interesa postularme a la vacante "${v.titulo}" que publicaron en InUPA.

Considero que mi formación y habilidades encajan con el perfil solicitado. Adjunto mi CV para su consideración y quedo a sus órdenes para una entrevista.

Saludos cordiales,
${user?.nombre_completo || ""}
${user?.correo_institucional || ""}`;
  };

  const mailtoLink = (v: Vacante) =>
    `mailto:${v.empresa?.correo_contacto || ""}?subject=${encodeURIComponent(`Postulación – ${v.titulo}`)}&body=${encodeURIComponent(mensajeSugerido(v))}`;

  const waLink = (v: Vacante) => {
    let tel = (v.empresa?.telefono || "").replace(/\D/g, "");
    if (tel.length === 10) tel = "52" + tel;
    return `https://wa.me/${tel}?text=${encodeURIComponent(mensajeSugerido(v))}`;
  };

  const selCls =
    "w-full h-10 rounded-xl border border-[#E5E7EB] dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 text-sm bg-white";
  const hayFiltros =
    f.carrera ||
    f.cuatrimestre ||
    f.tipo_contrato ||
    f.modalidad ||
    f.salario_min ||
    f.salario_max;

  const FilterPanel = () => (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-1.5">
          Carrera
        </p>
        <select
          value={f.carrera}
          onChange={(e) => setFilter("carrera", e.target.value)}
          className={selCls}
        >
          <option value="">Todas</option>
          {CARRERAS_UPA.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Cuatrimestre
          </p>
          <select
            value={f.cuatrimestre}
            onChange={(e) => setFilter("cuatrimestre", e.target.value)}
            className={selCls}
          >
            <option value="">Todos</option>
            {CUATRIMESTRES.map((c) => (
              <option key={c} value={c}>
                {c}°
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Tipo
          </p>
          <select
            value={f.tipo_contrato}
            onChange={(e) => setFilter("tipo_contrato", e.target.value)}
            className={selCls}
          >
            <option value="">Todos</option>
            {TIPOS_CONTRATO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-1.5">
          Modalidad
        </p>
        <select
          value={f.modalidad}
          onChange={(e) => setFilter("modalidad", e.target.value)}
          className={selCls}
        >
          <option value="">Todas</option>
          {MODALIDADES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-1.5">
          Rango Salarial (MXN)
        </p>
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Salario mínimo"
            value={f.salario_min}
            onChange={(e) => {
              // Esto elimina automáticamente cualquier letra o símbolo, dejando solo números
              const soloNumeros = e.target.value.replace(/\D/g, "");
              setFilter("salario_min", soloNumeros);
            }}
            className="h-10 rounded-xl border-[#E5E7EB] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Salario máximo"
            value={f.salario_max}
            onChange={(e) => {
              // Esto elimina automáticamente cualquier letra o símbolo, dejando solo números
              const soloNumeros = e.target.value.replace(/\D/g, "");
              setFilter("salario_max", soloNumeros);
            }}
            className="h-10 rounded-xl border-[#E5E7EB] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <button
        onClick={() => cargar()}
        className="w-full h-9 bg-[#003366] dark:bg-[#00A8E8] text-white rounded-xl text-sm font-semibold hover:bg-[#002244] dark:hover:bg-[#0090c7] transition-colors"
      >
        Aplicar filtros
      </button>
      <div className="flex gap-2">
        <button
          onClick={paraMiPerfil}
          className="flex-1 h-9 border border-[#003366]/30 dark:border-slate-600 text-[#003366] dark:text-[#00A8E8] rounded-xl text-xs font-semibold hover:bg-[#003366]/[0.05] dark:hover:bg-slate-800 transition-colors"
        >
          Para mi carrera
        </button>
        <button
          onClick={limpiar}
          className="flex-1 h-9 border border-[#003366]/30 dark:border-slate-600 text-[#003366] dark:text-[#00A8E8] rounded-xl text-xs font-semibold hover:bg-[#003366]/[0.05] dark:hover:bg-slate-800 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 dark:bg-slate-950 min-h-screen p-4 sm:p-6 transition-colors">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] dark:text-white tracking-tight">
          Bolsa de Trabajo
        </h1>
        <p className="text-sm text-[#7F8C8D] dark:text-slate-400 mt-0.5">
          Descubre oportunidades diseñadas para estudiantes universitarios
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D] dark:text-slate-500" />
          <Input
            placeholder="Buscar puesto, empresa o habilidad..."
            value={f.search}
            onChange={(e) => setFilter("search", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") cargar();
            }}
            className="pl-10 h-11 rounded-xl border-[#E5E7EB] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 text-sm"
          />
        </div>
        <button
          onClick={() => cargar()}
          className="h-11 px-5 bg-[#003366] dark:bg-[#00A8E8] text-white rounded-xl text-sm font-semibold hover:bg-[#002244] dark:hover:bg-[#0090c7] flex-shrink-0 transition-colors"
        >
          Buscar
        </button>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`h-11 px-3.5 rounded-xl border flex-shrink-0 lg:hidden transition-colors ${hayFiltros ? "border-[#003366] dark:border-[#00A8E8] text-[#003366] dark:text-[#00A8E8]" : "border-[#E5E7EB] dark:border-slate-700 text-[#7F8C8D] dark:text-slate-400"}`}
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      {showFilters && (
        <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800 lg:hidden">
          <CardContent className="p-4">
            <FilterPanel />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-800 p-5 shadow-sm transition-colors">
            <p className="font-bold text-[#2C3E50] dark:text-white mb-4 flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Filtros
            </p>
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1 space-y-3 min-w-0">
          <p className="text-sm text-[#7F8C8D] dark:text-slate-400">
            <span className="font-bold text-[#2C3E50] dark:text-white">
              {jobs.length} empleos
            </span>{" "}
            encontrados
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-7 animate-spin text-[#003366] dark:text-[#00A8E8]" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="p-10 text-center text-sm text-[#7F8C8D] dark:text-slate-400">
                No se encontraron vacantes con esos filtros.
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => {
              const dl = deadlineInfo(job.fecha_limite);
              return (
                <Card
                  key={job.id}
                  className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800 hover:shadow-md transition-all overflow-hidden"
                >
                  {job.imagen_url && (
                    <div className="h-32 bg-[#F5F7FA] dark:bg-slate-800 overflow-hidden">
                      <img
                        src={job.imagen_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div
                        className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{
                          backgroundColor: color(job.empresa?.nombre || "E"),
                        }}
                      >
                        {initials(job.empresa?.nombre || "E")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#2C3E50] dark:text-white text-base">
                          {job.titulo}
                        </h3>
                        <p className="text-sm font-semibold text-[#003366] dark:text-[#00A8E8]">
                          {job.empresa?.nombre}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#7F8C8D] dark:text-slate-400">
                          {job.ubicacion && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {job.ubicacion}
                            </span>
                          )}
                          {job.modalidad && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="size-3" />
                              {job.modalidad}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {rel(job.fecha_publicacion)}
                          </span>
                          {job.carreras && job.carreras.length > 0 && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="size-3" />
                              {job.carreras.length === 1
                                ? job.carreras[0]
                                : `${job.carreras.length} carreras`}
                            </span>
                          )}
                        </div>
                        {dl && (
                          <span
                            className={`inline-flex items-center gap-1 mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${dl.cerrada ? "bg-[#F1F1F1] dark:bg-slate-800 text-[#9CA3AF]" : dl.urgente ? "bg-[#FEE2E2] dark:bg-red-900/30 text-[#DC2626]" : "bg-[#FEF9E7] dark:bg-yellow-900/30 text-[#B7791F]"}`}
                          >
                            <CalendarClock className="size-3" />
                            {dl.label}
                          </span>
                        )}
                        <p className="text-xs text-[#7F8C8D] dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {job.descripcion}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F7FA] dark:border-slate-800 gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#2C3E50] dark:text-white">
                            {salaryStr(job.salario_min, job.salario_max)}
                          </span>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              onClick={() => toggleInteres(job.id)}
                              disabled={applying === job.id}
                              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${applied.includes(job.id) ? "bg-[#FEE2E2] dark:bg-red-900/30 text-[#DC2626] hover:bg-[#FECACA]" : "bg-[#003366] dark:bg-[#00A8E8] text-white hover:bg-[#002244] dark:hover:bg-[#0090c7]"}`}
                            >
                              {applying === job.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : applied.includes(job.id) ? (
                                <>
                                  <X className="size-3" />
                                  No me interesa
                                </>
                              ) : (
                                <>
                                  <Star className="size-3" />
                                  Me interesa
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setSelected(job)}
                              className="text-xs px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-[#2C3E50] dark:text-white rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              Ver detalles y Contactar
                            </button>
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

      {/* Detalle de la vacante */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="sm:max-w-2xl p-0 dark:bg-slate-900 dark:border-slate-800">
            {selected.imagen_url && (
              <div className="h-40 bg-[#F5F7FA] dark:bg-slate-800 overflow-hidden rounded-t-xl">
                <img
                  src={selected.imagen_url}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            )}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div
                  className="size-14 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    backgroundColor: color(selected.empresa?.nombre || "E"),
                  }}
                >
                  {initials(selected.empresa?.nombre || "E")}
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-lg font-bold text-[#2C3E50] dark:text-white">
                    {selected.titulo}
                  </DialogTitle>
                  <p className="text-sm font-semibold text-[#003366] dark:text-[#00A8E8]">
                    {selected.empresa?.nombre}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#7F8C8D] dark:text-slate-400">
                    {selected.ubicacion && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {selected.ubicacion}
                      </span>
                    )}
                    {selected.modalidad && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="size-3" />
                        {selected.modalidad}
                      </span>
                    )}
                    {selected.tipo_contrato && (
                      <span>{selected.tipo_contrato}</span>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[#F5F7FA] dark:bg-slate-800 text-[#2C3E50] dark:text-white px-2.5 py-1 rounded-full border border-[#E5E7EB] dark:border-slate-700 font-medium flex items-center gap-1">
                  <DollarSign className="size-3" />
                  {salaryStr(selected.salario_min, selected.salario_max)}
                </span>
                {selected.cuatrimestre && (
                  <span className="text-xs bg-[#F5F7FA] dark:bg-slate-800 text-[#7F8C8D] dark:text-slate-300 px-2.5 py-1 rounded-full border border-[#E5E7EB] dark:border-slate-700">
                    Desde {selected.cuatrimestre}° cuatri
                  </span>
                )}
                {(() => {
                  const dl = deadlineInfo(selected.fecha_limite);
                  return dl ? (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${dl.cerrada ? "bg-[#F1F1F1] dark:bg-slate-800 text-[#9CA3AF]" : dl.urgente ? "bg-[#FEE2E2] dark:bg-red-900/30 text-[#DC2626]" : "bg-[#FEF9E7] dark:bg-yellow-900/30 text-[#B7791F]"}`}
                    >
                      <CalendarClock className="size-3" />
                      {dl.label}
                    </span>
                  ) : null;
                })()}
              </div>

              <div>
                <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-2">
                  Descripción
                </p>
                <p className="text-sm text-[#2C3E50] dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {selected.descripcion}
                </p>
              </div>
              {selected.requisitos && (
                <div>
                  <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-2">
                    Requisitos
                  </p>
                  <p className="text-sm text-[#2C3E50] dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {selected.requisitos}
                  </p>
                </div>
              )}
              {selected.carreras && selected.carreras.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-2">
                    Carreras
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.carreras.map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-[#003366]/[0.06] dark:bg-[#00A8E8]/20 text-[#003366] dark:text-[#00A8E8] font-medium px-2.5 py-1 rounded-lg"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTACTO EXPLÍCITO */}
              <div className="rounded-xl border-2 border-[#003366]/20 dark:border-[#00A8E8]/30 bg-[#F0F6FF] dark:bg-slate-800/50 p-4 space-y-3">
                <p className="text-sm font-bold text-[#003366] dark:text-[#00A8E8] mb-1">
                  Datos de contacto
                </p>

                {selected.empresa?.correo_contacto ? (
                  <a
                    href={mailtoLink(selected)}
                    className="flex items-start gap-3 text-sm text-[#2C3E50] dark:text-slate-200 hover:text-[#003366] dark:hover:text-[#00A8E8] hover:bg-white/60 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                  >
                    <Mail className="size-5 text-[#003366] dark:text-[#00A8E8] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Enviar correo</p>
                      <p className="break-all text-xs text-[#7F8C8D] dark:text-slate-400">
                        {selected.empresa.correo_contacto}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-3 text-sm text-[#9CA3AF] p-2">
                    <Mail className="size-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Correo no disponible</p>
                      <p className="text-xs">
                        Esta empresa no registró un correo de contacto.
                      </p>
                    </div>
                  </div>
                )}

                {selected.empresa?.telefono ? (
                  <a
                    href={waLink(selected)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 text-sm text-[#2C3E50] dark:text-slate-200 hover:text-[#25D366] hover:bg-white/60 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                  >
                    <Phone className="size-5 text-[#25D366] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Contactar por WhatsApp</p>
                      <p className="text-xs text-[#7F8C8D] dark:text-slate-400">
                        {selected.empresa.telefono}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-3 text-sm text-[#9CA3AF] p-2">
                    <Phone className="size-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">WhatsApp no disponible</p>
                      <p className="text-xs">
                        Esta empresa no registró un número de teléfono.
                      </p>
                    </div>
                  </div>
                )}

                {selected.empresa?.sitio_web ? (
                  <a
                    href={selected.empresa.sitio_web}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 text-sm text-[#003366] dark:text-[#00A8E8] hover:bg-white/60 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                  >
                    <Globe className="size-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Sitio web de la empresa</p>
                      <p className="text-xs text-[#7F8C8D] dark:text-slate-400 break-all">
                        {selected.empresa.sitio_web}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-3 text-sm text-[#9CA3AF] p-2">
                    <Globe className="size-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Sitio web no disponible</p>
                      <p className="text-xs">
                        Esta empresa no registró un sitio web.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-[#7F8C8D] dark:text-slate-400">
                La plataforma <b>no contacta a la empresa por ti</b>: al pulsar
                los enlaces se abre <b>tu</b> aplicación con un{" "}
                <b>mensaje sugerido</b> que puedes editar antes de enviarlo.
                Recuerda adjuntar tu CV.
              </p>
            </div>

            <div className="px-6 pb-6 flex flex-wrap gap-2 border-t border-[#E5E7EB] dark:border-slate-800 pt-4">
              <a
                href={mailtoLink(selected)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003366] dark:bg-[#00A8E8] hover:bg-[#002244] dark:hover:bg-[#0090c7] text-white text-sm font-bold flex-1 min-w-[160px] transition-colors"
              >
                <Mail className="size-4" />
                Contactar por correo
              </a>
              <a
                href={waLink(selected)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-bold flex-1 min-w-[140px] transition-colors"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
              <button
                onClick={() => toggleInteres(selected.id)}
                disabled={applying === selected.id}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${applied.includes(selected.id) ? "border-[#DC2626] bg-[#FEE2E2] dark:bg-red-900/30 text-[#DC2626] hover:bg-[#FECACA]" : "border-[#003366] dark:border-[#00A8E8] bg-[#003366] dark:bg-[#00A8E8] text-white hover:bg-[#002244] dark:hover:bg-[#0090c7]"}`}
              >
                {applying === selected.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : applied.includes(selected.id) ? (
                  <>
                    <X className="size-4" />
                    No me interesa
                  </>
                ) : (
                  <>
                    <Star className="size-4" />
                    Me interesa
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
