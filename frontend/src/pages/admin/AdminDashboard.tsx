import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Building2, Briefcase, Users, Send, Loader2, FileDown, TrendingUp, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { adminService, type AdminDashboard as Dash } from "../../services/admin.service";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const PIE_COLORS = ["#003366", "#00A8E8", "#FFD700", "#27AE60", "#9B59B6", "#E67E22", "#E74C3C", "#1ABC9C", "#34495E", "#7F8C8D"];

// Últimos 6 meses como {key: 'YYYY-MM', label: 'ene'}
function last6Months() {
  const now = new Date();
  const arr: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: MESES[d.getMonth()] });
  }
  return arr;
}
const abreviaCarrera = (c: string) => c.replace(/^Ingeniería/, "Ing.").replace(/^Licenciatura/, "Lic.");

// Tooltip limpio (sin el ": " que se veía feo).
function CleanTooltip({ active, payload, label, unidad }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover text-popover-foreground shadow-md px-3 py-2 text-xs">
      {label && <p className="font-semibold capitalize mb-0.5">{label}</p>}
      <p className="text-muted-foreground">{payload[0].value} {unidad}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminService.dashboard().then(setD).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>;
  if (!d) return <div className="p-8 text-center text-muted-foreground">No se pudieron cargar las estadísticas.</div>;

  const meses = last6Months();
  const postData = meses.map((m) => ({ mes: m.label, total: d.postulacionesPorMes.find((x) => x.mes === m.key)?.total ?? 0 }));
  const regData = meses.map((m) => ({ mes: m.label, total: d.registrosPorMes.find((x) => x.mes === m.key)?.total ?? 0 }));
  const totalCarreras = d.porCarrera.reduce((a, c) => a + c.total, 0) || 1;
  const carreraData = d.porCarrera.map((c, i) => ({
    name: abreviaCarrera(c.carrera), full: c.carrera, total: c.total,
    pct: Math.round((c.total / totalCarreras) * 100), color: PIE_COLORS[i % PIE_COLORS.length],
  }));
  const cv = d.cvScore;
  let nombreAdmin = "Administrador";
  try { nombreAdmin = JSON.parse(localStorage.getItem("inupa_user") || "{}").nombre_completo?.split(" ")[0] || "Administrador"; } catch { /* noop */ }

  const cards = [
    { label: "Empresas registradas", value: d.totales.empresas, sub: `${d.totales.empresasActivas} activas`, icon: Building2, color: "#003366", to: "/admin/empresas" },
    { label: "Usuarios activos", value: d.totales.usuariosActivos, sub: `de ${d.totales.usuarios} registrados`, icon: Users, color: "#00A8E8", to: "/admin/usuarios" },
    { label: "Vacantes activas", value: d.totales.vacantesActivas, sub: "publicadas", icon: Briefcase, color: "#9B59B6", to: "/admin/vacantes" },
    { label: "Postulaciones", value: d.totales.postulaciones, sub: "en total", icon: Send, color: "#CA8A04", to: "/admin/usuarios" },
  ];

  // Informe PDF con gráficas visuales (barras dibujadas con divs) y datos claros.
  const imprimirInforme = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const maxPost = Math.max(1, ...postData.map((m) => m.total));
    const maxReg = Math.max(1, ...regData.map((m) => m.total));
    const barsMes = (rows: { mes: string; total: number }[], max: number, color: string) =>
      rows.map((m) => `
        <div class="row">
          <span class="rlabel">${m.mes}</span>
          <span class="track"><span class="fill" style="width:${(m.total / max) * 100}%;background:${color}"></span></span>
          <span class="rval">${m.total}</span>
        </div>`).join("");
    const barsCarrera = carreraData.map((c) => `
        <div class="row">
          <span class="rlabel wide"><span class="dot" style="background:${c.color}"></span>${c.full}</span>
          <span class="track"><span class="fill" style="width:${c.pct}%;background:${c.color}"></span></span>
          <span class="rval">${c.total} · ${c.pct}%</span>
        </div>`).join("");
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe InUPA</title>
      <style>
        *{box-sizing:border-box}
        body{font-family:Arial,Helvetica,sans-serif;color:#2C3E50;max-width:820px;margin:0 auto;padding:34px;}
        header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #FFD700;padding-bottom:12px;margin-bottom:6px;}
        h1{color:#003366;margin:0;font-size:24px;}
        .brand{background:#003366;color:#FFD700;font-weight:bold;border-radius:8px;padding:6px 12px;font-size:13px;letter-spacing:1px;}
        .sub{color:#7F8C8D;font-size:12px;margin-bottom:22px;}
        h2{color:#003366;font-size:14px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #E5E7EB;padding-bottom:5px;margin:24px 0 12px;}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0;}
        .kpi{border:1px solid #E5E7EB;border-radius:10px;padding:12px;text-align:center;}
        .kpi b{color:#003366;font-size:22px;display:block;}
        .kpi span{color:#7F8C8D;font-size:11px;}
        .row{display:flex;align-items:center;gap:10px;margin:7px 0;font-size:12px;}
        .rlabel{width:64px;color:#2C3E50;text-transform:capitalize;font-weight:600;}
        .rlabel.wide{width:280px;display:flex;align-items:center;gap:6px;font-weight:500;text-transform:none;}
        .dot{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none;}
        .track{flex:1;height:14px;background:#F0F2F5;border-radius:7px;overflow:hidden;}
        .fill{display:block;height:100%;border-radius:7px;}
        .rval{width:72px;text-align:right;color:#003366;font-weight:700;}
        .cvbox{display:flex;align-items:center;gap:20px;border:1px solid #E5E7EB;border-radius:12px;padding:16px;}
        .cvbig{font-size:40px;font-weight:800;color:#003366;}
        .foot{margin-top:28px;border-top:1px solid #E5E7EB;padding-top:8px;color:#9CA3AF;font-size:10px;text-align:center;}
        @media print{body{padding:6px 0;}}
      </style></head><body>
      <header><h1>Informe de la plataforma InUPA</h1><span class="brand">InUPA</span></header>
      <div class="sub">Generado el ${new Date().toLocaleString("es-MX")}</div>

      <h2>Resumen general</h2>
      <div class="grid">
        <div class="kpi"><b>${d.totales.empresas}</b><span>Empresas (${d.totales.empresasActivas} activas)</span></div>
        <div class="kpi"><b>${d.totales.usuariosActivos}</b><span>Usuarios activos</span></div>
        <div class="kpi"><b>${d.totales.vacantesActivas}</b><span>Vacantes activas</span></div>
        <div class="kpi"><b>${d.totales.postulaciones}</b><span>Postulaciones</span></div>
      </div>

      <h2>CV score general</h2>
      <div class="cvbox">
        <div><div class="cvbig">${cv.promedio}<span style="font-size:16px;color:#7F8C8D">/100</span></div><span style="font-size:11px;color:#7F8C8D">Promedio de ${cv.total} CV</span></div>
        <div style="flex:1">
          <div class="row"><span class="rlabel" style="width:130px">Altos (≥80)</span><span class="track"><span class="fill" style="width:${cv.total ? (cv.altos / cv.total) * 100 : 0}%;background:#27AE60"></span></span><span class="rval">${cv.altos}</span></div>
          <div class="row"><span class="rlabel" style="width:130px">Medios (50–79)</span><span class="track"><span class="fill" style="width:${cv.total ? (cv.medios / cv.total) * 100 : 0}%;background:#FFB020"></span></span><span class="rval">${cv.medios}</span></div>
          <div class="row"><span class="rlabel" style="width:130px">Bajos (&lt;50)</span><span class="track"><span class="fill" style="width:${cv.total ? (cv.bajos / cv.total) * 100 : 0}%;background:#E74C3C"></span></span><span class="rval">${cv.bajos}</span></div>
        </div>
      </div>

      <h2>Usuarios por carrera</h2>
      ${barsCarrera || '<p style="color:#7F8C8D;font-size:12px">Sin datos.</p>'}

      <h2>Postulaciones por mes (últimos 6 meses)</h2>
      ${barsMes(postData, maxPost, "#003366")}

      <h2>Nuevos registros por mes (últimos 6 meses)</h2>
      ${barsMes(regData, maxReg, "#00A8E8")}

      <div class="foot">InUPA · Universidad Politécnica de Aguascalientes — documento generado automáticamente</div>
      <script>window.onload=function(){window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Encabezado */}
      <div className="rounded-2xl bg-gradient-to-r from-[#001A33] to-[#003366] p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Panel de administración · InUPA</p>
          <h1 className="text-2xl font-bold mt-1 text-white">Bienvenido, {nombreAdmin}</h1>
          <p className="text-white/60 text-sm mt-0.5">Hoy es {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button onClick={imprimirInforme} className="flex items-center gap-2 bg-[#FFD700] text-[#003366] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#e6c200] transition-all active:scale-95 shadow">
          <FileDown className="size-4" /> Imprimir informe PDF
        </button>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}>
              <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                    <div className="size-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}22` }}><Icon className="size-5" style={{ color: c.color }} /></div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mt-2">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><TrendingUp className="size-3 text-[#27AE60]" />{c.sub}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Postulaciones mensuales (barras) */}
        <Card className="border-0 shadow-sm lg:col-span-2"><CardContent className="p-5">
          <h2 className="text-lg font-bold text-foreground">Postulaciones mensuales</h2>
          <p className="text-xs text-muted-foreground mb-4">Actividad de los últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={postData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<CleanTooltip unidad="postulaciones" />} />
              <Bar dataKey="total" fill="#003366" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={900}>
                <LabelList dataKey="total" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "var(--foreground)" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>

        {/* Usuarios por carrera (dona + leyenda propia bien distribuida) */}
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <h2 className="text-lg font-bold text-foreground">Usuarios por carrera</h2>
          <p className="text-xs text-muted-foreground mb-2">{d.totales.usuarios} estudiantes registrados</p>
          {carreraData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Sin datos de carrera.</p>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative">
                <ResponsiveContainer width={190} height={190}>
                  <PieChart>
                    <Pie data={carreraData} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2} stroke="none" animationDuration={800}>
                      {carreraData.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip content={<CleanTooltip unidad="estudiantes" />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground">{totalCarreras}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">total</span>
                </div>
              </div>
              <div className="w-full mt-4 space-y-1.5">
                {carreraData.map((c) => (
                  <div key={c.full} className="flex items-center gap-2 text-xs">
                    <span className="size-2.5 rounded-full flex-none" style={{ background: c.color }} />
                    <span className="text-foreground truncate flex-1" title={c.full}>{c.name}</span>
                    <span className="text-muted-foreground tabular-nums">{c.total}</span>
                    <span className="text-muted-foreground/70 tabular-nums w-9 text-right">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent></Card>
      </div>

      {/* CV score general + Nuevos registros */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#003366]" />
            <h2 className="text-lg font-bold text-foreground">CV score general</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Promedio de completitud de {cv.total} CV</p>
          <div className="flex items-center gap-5">
            <div className="relative size-28 flex-none">
              <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={cv.promedio >= 80 ? "#27AE60" : cv.promedio >= 50 ? "#FFB020" : "#E74C3C"}
                  strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(cv.promedio / 100) * 264} 264`}
                  style={{ transition: "stroke-dasharray 1s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{cv.promedio}</span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: "Altos", hint: "≥ 80", val: cv.altos, color: "#27AE60" },
                { label: "Medios", hint: "50–79", val: cv.medios, color: "#FFB020" },
                { label: "Bajos", hint: "< 50", val: cv.bajos, color: "#E74C3C" },
              ].map((r) => (
                <div key={r.label} className="text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-foreground font-medium">{r.label} <span className="text-muted-foreground/70">{r.hint}</span></span>
                    <span className="text-muted-foreground tabular-nums">{r.val}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cv.total ? (r.val / cv.total) * 100 : 0}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent></Card>

        {/* Nuevos registros (línea) */}
        <Card className="border-0 shadow-sm lg:col-span-2"><CardContent className="p-5">
          <h2 className="text-lg font-bold text-foreground">Nuevos registros</h2>
          <p className="text-xs text-muted-foreground mb-4">Estudiantes registrados por mes</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={regData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CleanTooltip unidad="registros" />} />
              <Line type="monotone" dataKey="total" stroke="#00A8E8" strokeWidth={2.5} dot={{ r: 4, fill: "#00A8E8" }} animationDuration={900}>
                <LabelList dataKey="total" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "var(--foreground)" }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>
    </div>
  );
}
