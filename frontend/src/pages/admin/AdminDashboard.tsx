import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Building2, Briefcase, Users, Send, Loader2, FileDown, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
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

export function AdminDashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminService.dashboard().then(setD).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>;
  if (!d) return <div className="p-8 text-center text-[#7F8C8D]">No se pudieron cargar las estadísticas.</div>;

  const meses = last6Months();
  const postData = meses.map((m) => ({ mes: m.label, total: d.postulacionesPorMes.find((x) => x.mes === m.key)?.total ?? 0 }));
  const regData = meses.map((m) => ({ mes: m.label, total: d.registrosPorMes.find((x) => x.mes === m.key)?.total ?? 0 }));
  const carreraData = d.porCarrera.map((c) => ({ name: abreviaCarrera(c.carrera), total: c.total, full: c.carrera }));

  const cards = [
    { label: "Empresas registradas", value: d.totales.empresas, sub: `${d.totales.empresasActivas} activas`, icon: Building2, color: "#003366", to: "/admin/empresas" },
    { label: "Usuarios activos", value: d.totales.usuariosActivos, sub: `de ${d.totales.usuarios} registrados`, icon: Users, color: "#00A8E8", to: "/admin/usuarios" },
    { label: "Vacantes activas", value: d.totales.vacantesActivas, sub: "publicadas", icon: Briefcase, color: "#9B59B6", to: "/admin/vacantes" },
    { label: "Postulaciones", value: d.totales.postulaciones, sub: "en total", icon: Send, color: "#CA8A04", to: "/admin/usuarios" },
  ];

  // Informe PDF: abre ventana de impresión con TODA la info de las gráficas
  const imprimirInforme = () => {
    const filas = (rows: string[][]) => rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe InUPA</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body{font-family:'Poppins',Arial,sans-serif;color:#2C3E50;max-width:800px;margin:0 auto;padding:36px;}
        h1{color:#003366;border-bottom:3px solid #FFD700;padding-bottom:8px;margin:0 0 4px;}
        .sub{color:#7F8C8D;font-size:13px;margin-bottom:24px;}
        h2{color:#003366;font-size:15px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #E5E7EB;padding-bottom:4px;margin:26px 0 8px;}
        .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:12px 0;}
        .kpi{border:1px solid #E5E7EB;border-radius:10px;padding:12px;}
        .kpi b{color:#003366;font-size:22px;display:block;}
        .kpi span{color:#7F8C8D;font-size:12px;}
        table{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0 16px;}
        th{text-align:left;background:#F0F6FF;color:#003366;padding:7px 10px;}
        td{padding:6px 10px;border-bottom:1px solid #F0F0F0;}
        @media print{body{padding:0;}}
      </style></head><body>
      <h1>Informe de la plataforma InUPA</h1>
      <div class="sub">Generado el ${new Date().toLocaleString("es-MX")}</div>
      <h2>Resumen general</h2>
      <div class="grid">
        <div class="kpi"><b>${d.totales.empresas}</b><span>Empresas registradas (${d.totales.empresasActivas} activas)</span></div>
        <div class="kpi"><b>${d.totales.usuariosActivos}</b><span>Usuarios activos de ${d.totales.usuarios}</span></div>
        <div class="kpi"><b>${d.totales.vacantesActivas}</b><span>Vacantes activas</span></div>
        <div class="kpi"><b>${d.totales.postulaciones}</b><span>Postulaciones totales</span></div>
      </div>
      <h2>Usuarios por carrera</h2>
      <table><thead><tr><th>Carrera</th><th>Usuarios</th></tr></thead><tbody>
        ${filas(d.porCarrera.map((c) => [c.carrera, String(c.total)])) || '<tr><td colspan="2">Sin datos</td></tr>'}
      </tbody></table>
      <h2>Postulaciones por mes (últimos 6 meses)</h2>
      <table><thead><tr><th>Mes</th><th>Postulaciones</th></tr></thead><tbody>
        ${filas(postData.map((m) => [m.mes, String(m.total)]))}
      </tbody></table>
      <h2>Nuevos registros por mes (últimos 6 meses)</h2>
      <table><thead><tr><th>Mes</th><th>Registros</th></tr></thead><tbody>
        ${filas(regData.map((m) => [m.mes, String(m.total)]))}
      </tbody></table>
      <script>window.onload=function(){window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl bg-gradient-to-r from-[#001A33] to-[#003366] p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Panel de administración · InUPA</p>
          <h1 className="text-2xl font-bold mt-1">Bienvenido, Administrador</h1>
          <p className="text-white/60 text-sm mt-0.5">Hoy es {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button onClick={imprimirInforme} className="flex items-center gap-2 bg-[#FFD700] text-[#003366] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#e6c200] transition-colors">
          <FileDown className="size-4" /> Imprimir informe PDF
        </button>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#7F8C8D] font-medium">{c.label}</p>
                    <div className="size-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}18` }}><Icon className="size-5" style={{ color: c.color }} /></div>
                  </div>
                  <p className="text-3xl font-bold text-[#2C3E50] mt-2">{c.value}</p>
                  <p className="text-xs text-[#7F8C8D] mt-1 flex items-center gap-1"><TrendingUp className="size-3 text-[#27AE60]" />{c.sub}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Postulaciones mensuales (barras con etiquetas) */}
        <Card className="border-0 shadow-sm lg:col-span-2"><CardContent className="p-5">
          <h2 className="text-lg font-bold text-[#2C3E50]">Postulaciones mensuales</h2>
          <p className="text-xs text-[#7F8C8D] mb-4">Actividad de los últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={postData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#7F8C8D" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#7F8C8D" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#F5F7FA" }} formatter={(v: any) => [`${v} postulaciones`, ""]} />
              <Bar dataKey="total" fill="#003366" radius={[6, 6, 0, 0]} maxBarSize={48}>
                <LabelList dataKey="total" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "#2C3E50" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>

        {/* Usuarios por carrera (dona con etiquetas + leyenda) */}
        <Card className="border-0 shadow-sm"><CardContent className="p-5">
          <h2 className="text-lg font-bold text-[#2C3E50]">Usuarios por carrera</h2>
          <p className="text-xs text-[#7F8C8D] mb-2">{d.totales.usuarios} estudiantes registrados</p>
          {carreraData.length === 0 ? (
            <p className="text-sm text-[#7F8C8D] text-center py-10">Sin datos de carrera.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={carreraData} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}
                  label={({ name, total }: any) => `${name}: ${total}`} labelLine={false} style={{ fontSize: 11 }}>
                  {carreraData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any, _n: any, p: any) => [`${v} usuarios`, p?.payload?.full]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent></Card>
      </div>

      {/* Nuevos registros (línea con etiquetas) */}
      <Card className="border-0 shadow-sm"><CardContent className="p-5">
        <h2 className="text-lg font-bold text-[#2C3E50]">Nuevos registros</h2>
        <p className="text-xs text-[#7F8C8D] mb-4">Estudiantes registrados por mes</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={regData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#7F8C8D" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#7F8C8D" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => [`${v} registros`, ""]} />
            <Line type="monotone" dataKey="total" stroke="#003366" strokeWidth={2.5} dot={{ r: 4, fill: "#003366" }}>
              <LabelList dataKey="total" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "#2C3E50" }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </CardContent></Card>
    </div>
  );
}
