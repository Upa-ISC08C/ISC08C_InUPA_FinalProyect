import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { MapPin, Briefcase, Loader2, Send } from "lucide-react";
import { jobsService } from "../../services/jobs.service";
import type { Postulacion } from "../../services/types";

const ESTADOS: Record<string, { label: string; bg: string; text: string }> = {
  pendiente: { label: "Enviada", bg: "#EFF6FF", text: "#2563EB" },
  revisada: { label: "En revisión", bg: "#FEF9C3", text: "#CA8A04" },
  aceptada: { label: "Aceptada", bg: "#DCFCE7", text: "#16A34A" },
  rechazada: { label: "Rechazada", bg: "#FEE2E2", text: "#DC2626" },
};

const salaryStr = (min: number | null, max: number | null) => {
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min) return `$${min.toLocaleString()}`;
  return "A convenir";
};

const FILTROS = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Enviadas" },
  { value: "revisada", label: "En revisión" },
  { value: "aceptada", label: "Aceptadas" },
  { value: "rechazada", label: "Rechazadas" },
];

export function ApplicationsPanel() {
  const [apps, setApps] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");

  useEffect(() => {
    jobsService.myApplications().then(setApps).catch(() => setApps([])).finally(() => setLoading(false));
  }, []);

  const visibles = filtro === "todas" ? apps : apps.filter((a) => a.estado === filtro);
  const count = (estado: string) => apps.filter((a) => a.estado === estado).length;

  const resumen = [
    { label: "Total", value: apps.length, color: "#003366" },
    { label: "En proceso", value: count("pendiente") + count("revisada"), color: "#CA8A04" },
    { label: "Aceptadas", value: count("aceptada"), color: "#16A34A" },
    { label: "Rechazadas", value: count("rechazada"), color: "#DC2626" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] dark:text-white tracking-tight">Mis Postulaciones</h1>
        <p className="text-sm text-[#7F8C8D] dark:text-slate-400 mt-0.5">Seguimiento de todas tus aplicaciones laborales</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {resumen.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[#7F8C8D] dark:text-slate-400 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de filtro */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium border transition-all ${
              filtro === f.value ? "bg-[#003366] text-white border-[#003366]" : "bg-white dark:bg-slate-900 text-[#2C3E50] dark:text-white border-[#E5E7EB] dark:border-slate-800 hover:border-[#003366]/40"
            }`}>
            {f.label}{f.value !== "todas" ? ` (${count(f.value)})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : visibles.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 text-center">
            <div className="size-12 rounded-2xl bg-[#F5F7FA] dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <Send className="size-5 text-[#7F8C8D] dark:text-slate-400" />
            </div>
            <p className="text-sm text-[#7F8C8D] dark:text-slate-400">Aún no tienes postulaciones en esta categoría.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibles.map((a) => {
            const est = ESTADOS[a.estado] ?? ESTADOS.pendiente;
            const emp = a.vacante.empresa;
            return (
              <Card key={a.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl bg-[#003366] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(emp?.nombre || "E").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-[#2C3E50] dark:text-white">{a.vacante.titulo}</h3>
                          <p className="text-sm font-semibold text-[#003366]">{emp?.nombre}</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: est.bg, color: est.text }}>{est.label}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#7F8C8D] dark:text-slate-400">
                        {a.vacante.ubicacion && <span className="flex items-center gap-1"><MapPin className="size-3" />{a.vacante.ubicacion}</span>}
                        {a.vacante.modalidad && <span className="flex items-center gap-1"><Briefcase className="size-3" />{a.vacante.modalidad}</span>}
                        <span>Postulado el {new Date(a.fecha_postulacion).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-[#2C3E50] dark:text-white mt-2">
                        {salaryStr(a.vacante.salario_min, a.vacante.salario_max)} <span className="text-xs font-normal text-[#7F8C8D] dark:text-slate-400">MXN</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
