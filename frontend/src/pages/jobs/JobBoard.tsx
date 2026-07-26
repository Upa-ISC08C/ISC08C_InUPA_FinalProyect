import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import {
  Search, MapPin, Clock, Briefcase, X, Globe, DollarSign, CheckCircle2,
  Loader2, Send, Mail, Phone, GraduationCap, SlidersHorizontal, MessageCircle,
} from "lucide-react";
import { jobsService } from "../../services/jobs.service";
import type { Vacante } from "../../services/types";
import { useAuthStore } from "../../store/authStore";
import { CARRERAS_UPA, CUATRIMESTRES, TIPOS_CONTRATO, MODALIDADES } from "../../utils/catalogos";

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
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const color = (n: string) => PALETTE[(n?.charCodeAt(0) || 0) % PALETTE.length];

export function JobBoard() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<string[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vacante | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [f, setF] = useState({ search: "", carrera: "", cuatrimestre: "", tipo_contrato: "", modalidad: "", salario_min: "" });
  const setFilter = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const cargar = (filtros = f) => {
    setLoading(true);
    jobsService
      .list({
        activa: true, limit: 50,
        search: filtros.search || undefined,
        carrera: filtros.carrera || undefined,
        cuatrimestre: filtros.cuatrimestre ? Number(filtros.cuatrimestre) : undefined,
        tipo_contrato: filtros.tipo_contrato || undefined,
        modalidad: filtros.modalidad || undefined,
        salario_min: filtros.salario_min ? Number(filtros.salario_min) : undefined,
      })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); jobsService.myApplications().then((a) => setApplied(a.map((x) => x.vacante_id))).catch(() => {}); /* eslint-disable-next-line */ }, []);

  const limpiar = () => { const empty = { search: "", carrera: "", cuatrimestre: "", tipo_contrato: "", modalidad: "", salario_min: "" }; setF(empty); cargar(empty); };
  const paraMiPerfil = () => {
    const nf = { ...f, carrera: user?.carrera || "", cuatrimestre: user?.cuatrimestre ? String(user.cuatrimestre) : "" };
    setF(nf); cargar(nf);
  };

  const aplicar = async (id: string) => {
    if (applied.includes(id)) return;
    setApplying(id);
    try { await jobsService.apply(id); setApplied((p) => [...p, id]); }
    catch (err: any) { if (err?.response?.status === 409) setApplied((p) => [...p, id]); }
    finally { setApplying(null); }
  };

  // Mensaje sugerido usando el perfil del alumno
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
  const waLink = (v: Vacante) => {
    let tel = (v.empresa?.telefono || "").replace(/\D/g, "");
    if (tel.length === 10) tel = "52" + tel;
    return `https://wa.me/${tel}?text=${encodeURIComponent(mensajeSugerido(v))}`;
  };

  const selCls = "w-full h-10 rounded-xl border border-[#E5E7EB] px-3 text-sm bg-white";
  const hayFiltros = f.carrera || f.cuatrimestre || f.tipo_contrato || f.modalidad || f.salario_min;

  const FilterPanel = () => (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-1.5">Carrera</p>
        <select value={f.carrera} onChange={(e) => setFilter("carrera", e.target.value)} className={selCls}>
          <option value="">Todas</option>{CARRERAS_UPA.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-1.5">Cuatrimestre</p>
          <select value={f.cuatrimestre} onChange={(e) => setFilter("cuatrimestre", e.target.value)} className={selCls}>
            <option value="">Cualquiera</option>{CUATRIMESTRES.map((c) => <option key={c} value={c}>{c}°</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-1.5">Salario mín.</p>
          <select value={f.salario_min} onChange={(e) => setFilter("salario_min", e.target.value)} className={selCls}>
            <option value="">Cualquiera</option>
            <option value="5000">$5,000+</option><option value="10000">$10,000+</option>
            <option value="15000">$15,000+</option><option value="20000">$20,000+</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-1.5">Tipo</p>
          <select value={f.tipo_contrato} onChange={(e) => setFilter("tipo_contrato", e.target.value)} className={selCls}>
            <option value="">Todos</option>{TIPOS_CONTRATO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-1.5">Modalidad</p>
          <select value={f.modalidad} onChange={(e) => setFilter("modalidad", e.target.value)} className={selCls}>
            <option value="">Todas</option>{MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <button onClick={() => cargar()} className="w-full h-9 bg-[#003366] text-white rounded-xl text-sm font-semibold hover:bg-[#002244] transition-colors">Aplicar filtros</button>
      <div className="flex gap-2">
        <button onClick={paraMiPerfil} className="flex-1 h-9 border border-[#003366]/30 text-[#003366] rounded-xl text-xs font-semibold hover:bg-[#003366]/[0.05]">Para mi carrera</button>
        <button onClick={limpiar} className="flex-1 h-9 border border-[#E5E7EB] text-[#7F8C8D] rounded-xl text-xs font-medium hover:bg-[#F5F7FA]">Limpiar</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Bolsa de Trabajo</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">Descubre oportunidades diseñadas para estudiantes universitarios</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
          <Input placeholder="Buscar puesto, empresa o habilidad..." value={f.search}
            onChange={(e) => setFilter("search", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") cargar(); }}
            className="pl-10 h-11 rounded-xl border-[#E5E7EB] text-sm" />
        </div>
        <button onClick={() => cargar()} className="h-11 px-5 bg-[#003366] text-white rounded-xl text-sm font-semibold hover:bg-[#002244] flex-shrink-0">Buscar</button>
        <button onClick={() => setShowFilters((v) => !v)}
          className={`h-11 px-3.5 rounded-xl border flex-shrink-0 lg:hidden ${hayFiltros ? "border-[#003366] text-[#003366]" : "border-[#E5E7EB] text-[#7F8C8D]"}`}>
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      {showFilters && (
        <Card className="border-0 shadow-sm lg:hidden"><CardContent className="p-4"><FilterPanel /></CardContent></Card>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <p className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2"><SlidersHorizontal className="size-4" />Filtros</p>
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1 space-y-3 min-w-0">
          <p className="text-sm text-[#7F8C8D]"><span className="font-bold text-[#2C3E50]">{jobs.length} empleos</span> encontrados</p>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
          ) : jobs.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center text-sm text-[#7F8C8D]">No se encontraron vacantes con esos filtros.</CardContent></Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: color(job.empresa?.nombre || "E") }}>
                      {initials(job.empresa?.nombre || "E")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#2C3E50] text-base">{job.titulo}</h3>
                      <p className="text-sm font-semibold text-[#003366]">{job.empresa?.nombre}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#7F8C8D]">
                        {job.ubicacion && <span className="flex items-center gap-1"><MapPin className="size-3" />{job.ubicacion}</span>}
                        {job.modalidad && <span className="flex items-center gap-1"><Briefcase className="size-3" />{job.modalidad}</span>}
                        <span className="flex items-center gap-1"><Clock className="size-3" />{rel(job.fecha_publicacion)}</span>
                        {job.carreras && job.carreras.length > 0 && <span className="flex items-center gap-1"><GraduationCap className="size-3" />{job.carreras.length === 1 ? job.carreras[0] : `${job.carreras.length} carreras`}</span>}
                      </div>
                      <p className="text-xs text-[#7F8C8D] mt-2 line-clamp-2 leading-relaxed">{job.descripcion}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F7FA] gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#2C3E50]">{salaryStr(job.salario_min, job.salario_max)}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setSelected(job)} className="text-xs px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] text-[#2C3E50] font-semibold hover:bg-[#F5F7FA]">Ver detalles</button>
                          <button onClick={() => aplicar(job.id)} disabled={applied.includes(job.id) || applying === job.id}
                            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${applied.includes(job.id) ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#003366] text-white hover:bg-[#002244]"}`}>
                            {applying === job.id ? <Loader2 className="size-3 animate-spin" /> : applied.includes(job.id) ? <><CheckCircle2 className="size-3" />Postulado</> : <><Send className="size-3" />Aplicar</>}
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

      {/* Detalle */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="sm:max-w-2xl p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: color(selected.empresa?.nombre || "E") }}>
                  {initials(selected.empresa?.nombre || "E")}
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-lg font-bold text-[#2C3E50]">{selected.titulo}</DialogTitle>
                  <p className="text-sm font-semibold text-[#003366]">{selected.empresa?.nombre}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#7F8C8D]">
                    {selected.ubicacion && <span className="flex items-center gap-1"><MapPin className="size-3" />{selected.ubicacion}</span>}
                    {selected.modalidad && <span className="flex items-center gap-1"><Briefcase className="size-3" />{selected.modalidad}</span>}
                    {selected.tipo_contrato && <span>{selected.tipo_contrato}</span>}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[#F5F7FA] text-[#2C3E50] px-2.5 py-1 rounded-full border border-[#E5E7EB] font-medium flex items-center gap-1"><DollarSign className="size-3" />{salaryStr(selected.salario_min, selected.salario_max)}</span>
                {selected.cuatrimestre && <span className="text-xs bg-[#F5F7FA] text-[#7F8C8D] px-2.5 py-1 rounded-full border border-[#E5E7EB]">Desde {selected.cuatrimestre}° cuatri</span>}
              </div>

              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Descripción</p>
                <p className="text-sm text-[#2C3E50] leading-relaxed whitespace-pre-line">{selected.descripcion}</p>
              </div>
              {selected.requisitos && (
                <div>
                  <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Requisitos</p>
                  <p className="text-sm text-[#2C3E50] leading-relaxed whitespace-pre-line">{selected.requisitos}</p>
                </div>
              )}
              {selected.carreras && selected.carreras.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Carreras</p>
                  <div className="flex flex-wrap gap-1.5">{selected.carreras.map((c) => <span key={c} className="text-xs bg-[#003366]/[0.06] text-[#003366] font-medium px-2.5 py-1 rounded-lg">{c}</span>)}</div>
                </div>
              )}

              {/* Contacto de la empresa */}
              <div className="rounded-xl border-2 border-[#003366]/20 bg-[#F0F6FF] p-4 space-y-2.5">
                <p className="text-sm font-bold text-[#003366]">Datos de contacto</p>
                {selected.empresa?.correo_contacto && (
                  <div className="flex items-center gap-2 text-sm text-[#2C3E50]"><Mail className="size-4 text-[#003366]" />{selected.empresa.correo_contacto}</div>
                )}
                {selected.empresa?.telefono && (
                  <div className="flex items-center gap-2 text-sm text-[#2C3E50]"><Phone className="size-4 text-[#003366]" />{selected.empresa.telefono}</div>
                )}
                {selected.empresa?.sitio_web && (
                  <a href={selected.empresa.sitio_web} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#003366] font-semibold hover:underline"><Globe className="size-4" />Ir al sitio web de la empresa</a>
                )}
              </div>
              <p className="text-xs text-[#7F8C8D]">Se abrirá tu correo/WhatsApp con un <b>mensaje sugerido</b> que puedes editar antes de enviar. Recuerda adjuntar tu CV (genéralo en «Mi Perfil / CV»).</p>
            </div>

            <div className="px-6 pb-6 flex flex-wrap gap-2 border-t border-[#E5E7EB] pt-4">
              {selected.empresa?.correo_contacto && (
                <a href={mailtoLink(selected)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold flex-1 min-w-[160px]">
                  <Mail className="size-4" />Aplicar por correo
                </a>
              )}
              {selected.empresa?.telefono && (
                <a href={waLink(selected)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-bold flex-1 min-w-[140px]">
                  <MessageCircle className="size-4" />WhatsApp
                </a>
              )}
              <button onClick={() => aplicar(selected.id)} disabled={applied.includes(selected.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${applied.includes(selected.id) ? "border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]" : "border-[#E5E7EB] text-[#2C3E50] hover:bg-[#F5F7FA]"}`}>
                {applied.includes(selected.id) ? <><CheckCircle2 className="size-4" />Postulación registrada</> : <><Send className="size-4" />Registrar postulación</>}
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
