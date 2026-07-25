import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  ChevronRight,
  SendHorizonal,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import {
  applicationsService,
  type Application,
} from "../../features/applications/applicationsService";

type Estado = "pendiente" | "revisada" | "aceptada" | "rechazada";

const estadoConfig: Record<
  Estado,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  pendiente: {
    label: "Enviada",
    bg: "#EFF6FF",
    text: "#2563EB",
    border: "#BFDBFE",
    icon: SendHorizonal,
  },
  revisada: {
    label: "En revisión",
    bg: "#FEF9C3",
    text: "#CA8A04",
    border: "#FDE047",
    icon: Eye,
  },
  aceptada: {
    label: "Aceptada",
    bg: "#DCFCE7",
    text: "#15803D",
    border: "#4ADE80",
    icon: CheckCircle2,
  },
  rechazada: {
    label: "Rechazada",
    bg: "#FEE2E2",
    text: "#DC2626",
    border: "#FCA5A5",
    icon: XCircle,
  },
};

const filterTabs: { value: string; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Enviadas" },
  { value: "revisada", label: "En revisión" },
  { value: "aceptada", label: "Aceptadas" },
  { value: "rechazada", label: "Rechazadas" },
];

function EstadoBadge({ estado }: { estado: Estado }) {
  const cfg = estadoConfig[estado];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
      }}
    >
      <Icon className="size-2.5" />
      {cfg.label}
    </span>
  );
}

export function Postulaciones() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("todas");
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsService.getMyApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error cargando aplicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    activeFilter === "todas"
      ? applications
      : applications.filter((p) => p.estado === activeFilter);

  const counts = {
    pendiente: applications.filter((p) => p.estado === "pendiente").length,
    revisada: applications.filter((p) => p.estado === "revisada").length,
    aceptada: applications.filter((p) => p.estado === "aceptada").length,
    rechazada: applications.filter((p) => p.estado === "rechazada").length,
  };

  const summaryCards = [
    { label: "Total", value: applications.length, color: "#003366" },
    {
      label: "En proceso",
      value: counts.pendiente + counts.revisada,
      color: "#00A8E8",
    },
    { label: "Entrevistas", value: counts.revisada, color: "#27AE60" },
    { label: "Aceptadas", value: counts.aceptada, color: "#FFD700" },
  ];

  const generateTimeline = (app: Application) => {
    const baseDate = new Date(app.fecha_postulacion).toLocaleDateString(
      "es-MX",
      { day: "2-digit", month: "short", year: "numeric" },
    );
    const steps = [
      {
        fecha: baseDate,
        evento: "Postulación enviada",
        desc: "Tu perfil fue enviado al equipo de reclutamiento.",
      },
    ];

    if (
      app.estado === "revisada" ||
      app.estado === "aceptada" ||
      app.estado === "rechazada"
    ) {
      steps.push({
        fecha: baseDate,
        evento: "En revisión",
        desc: "El equipo está revisando tu currículum y perfil.",
      });
    }
    if (app.estado === "aceptada") {
      steps.push({
        fecha: baseDate,
        evento: "¡Oferta aceptada!",
        desc: "Felicidades, fuiste seleccionado para el puesto.",
      });
    }
    if (app.estado === "rechazada") {
      steps.push({
        fecha: baseDate,
        evento: "No seleccionado",
        desc: "La empresa avanzó con otros candidatos. ¡No te rindas!",
      });
    }
    return steps;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">
          Mis Postulaciones
        </h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">
          Seguimiento de todas tus aplicaciones laborales
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map(({ label, value, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold" style={{ color }}>
                {value}
              </p>
              <p className="text-xs text-[#7F8C8D] mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {filterTabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`text-xs px-3.5 py-2 rounded-xl font-semibold border transition-all ${
              activeFilter === value
                ? "bg-[#003366] text-white border-[#003366]"
                : "bg-white text-[#7F8C8D] border-[#E5E7EB] hover:border-[#003366]/30 hover:text-[#2C3E50]"
            }`}
          >
            {label}
            {value !== "todas" && (counts as any)[value] > 0 && (
              <span
                className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === value ? "bg-white/20" : "bg-[#F5F7FA]"}`}
              >
                {(counts as any)[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-[#7F8C8D]">
            Cargando postulaciones...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="size-12 text-[#D1D5DB] mb-3" />
            <p className="font-semibold text-[#2C3E50]">
              No hay postulaciones en esta categoría
            </p>
            <p className="text-sm text-[#7F8C8D] mt-1">
              Explora la bolsa de trabajo para aplicar a nuevas vacantes
            </p>
          </div>
        ) : (
          filtered.map((p) => {
            const initials =
              p.vacante?.empresa?.nombre?.substring(0, 2).toUpperCase() || "EM";
            return (
              <Card
                key={p.id}
                className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                onClick={() => setSelected(p)}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-[#003366]">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-[#2C3E50] text-base leading-tight">
                            {p.vacante?.titulo || "Vacante"}
                          </h3>
                          <p className="text-sm font-semibold text-[#003366]">
                            {p.vacante?.empresa?.nombre || "Empresa"}
                          </p>
                        </div>
                        <EstadoBadge estado={p.estado as Estado} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#7F8C8D]">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {p.vacante?.ubicacion || "Remoto"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3" />
                          {p.vacante?.modalidad || "Tiempo completo"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Postulado el{" "}
                          {new Date(p.fecha_postulacion).toLocaleDateString(
                            "es-MX",
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F7FA]">
                        <span className="text-sm font-bold text-[#2C3E50]">
                          {p.vacante?.salario_min && p.vacante?.salario_max
                            ? `$${Number(p.vacante.salario_min)} - $${Number(p.vacante.salario_max)}`
                            : "Salario no especificado"}
                        </span>
                        <button className="flex items-center gap-1 text-xs text-[#003366] font-semibold hover:gap-1.5 transition-all">
                          Ver detalle <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg rounded-2xl p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-[#003366]">
                    {selected.vacante?.empresa?.nombre
                      ?.substring(0, 2)
                      .toUpperCase() || "EM"}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-[#2C3E50]">
                      {selected.vacante?.titulo}
                    </DialogTitle>
                    <p className="text-sm font-semibold text-[#003366]">
                      {selected.vacante?.empresa?.nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="size-7 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                <EstadoBadge estado={selected.estado as Estado} />
                <span className="text-xs bg-[#F5F7FA] text-[#7F8C8D] px-2.5 py-1 rounded-full border border-[#E5E7EB] font-medium">
                  {selected.vacante?.modalidad || "Remoto"}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-3">
                  Historial de seguimiento
                </p>
                <div className="space-y-0">
                  {generateTimeline(selected).map((step, i, arr) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center pt-0.5">
                        <div
                          className="size-2.5 rounded-full flex-shrink-0 border-2"
                          style={{
                            backgroundColor:
                              i === arr.length - 1
                                ? estadoConfig[selected.estado as Estado].bg
                                : "#F5F7FA",
                            borderColor:
                              i === arr.length - 1
                                ? estadoConfig[selected.estado as Estado].border
                                : "#D1D5DB",
                          }}
                        />
                        {i < arr.length - 1 && (
                          <div className="w-px flex-1 min-h-[28px] bg-[#E5E7EB] mt-1" />
                        )}
                      </div>
                      <div className="pb-4 min-w-0">
                        <p className="text-sm font-semibold text-[#2C3E50]">
                          {step.evento}
                        </p>
                        <p className="text-xs text-[#7F8C8D]">{step.desc}</p>
                        <p className="text-[10px] text-[#7F8C8D]/60 mt-0.5">
                          {step.fecha}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.estado === "aceptada" && (
                <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#4ADE80]">
                  <p className="text-sm font-bold text-[#15803D] flex items-center gap-2">
                    <CheckCircle2 className="size-4" />
                    ¡Felicidades! Fuiste seleccionada
                  </p>
                  <p className="text-xs text-[#16A34A] mt-1">
                    El equipo de RRHH se pondrá en contacto para coordinar tu
                    inicio.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
