import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import {
  Building2,
  Briefcase,
  Users,
  Send,
  Loader2,
  FileDown,
  TrendingUp,
  FileText,
  Plus,
  CheckCircle2,
  UserPlus,
  Ban,
  ArrowRight,
  UserX,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  adminService,
  type AdminDashboard as Dash,
} from "../../services/admin.service";
import {
  companiesService,
  type Company,
} from "../../services/companies.service";
import { EmpresaDialog } from "./empresas/AdminEmpresas";
import { VacanteDialog } from "./vacantes/AdminVacantes";

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const PIE_COLORS = [
  "#003366",
  "#00A8E8",
  "#FFD700",
  "#27AE60",
  "#9B59B6",
  "#E67E22",
  "#E74C3C",
  "#1ABC9C",
  "#34495E",
  "#7F8C8D",
];

// Formato de tiempo relativo para actividad
function formatRelativeTime(dateString: string) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 60) return `Hace ${mins} min${mins !== 1 ? "s" : ""}`;
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`;
  return new Date(dateString).toLocaleDateString("es-MX");
}

function last6Months() {
  const now = new Date();
  const arr: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: MESES[d.getMonth()],
    });
  }
  return arr;
}
const abreviaCarrera = (c: string) =>
  c.replace(/^Ingeniería/, "Ing.").replace(/^Licenciatura/, "Lic.");

function CleanTooltip({ active, payload, label, unidad }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover text-popover-foreground shadow-md px-3 py-2 text-xs">
      {label && <p className="font-semibold capitalize mb-0.5">{label}</p>}
      <p className="text-muted-foreground">
        {payload[0].value} {unidad}
      </p>
    </div>
  );
}

export function AdminDashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Company[]>([]);

  // Modales
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showVacanteModal, setShowVacanteModal] = useState(false);

  const cargarDashboard = () => {
    adminService
      .dashboard()
      .then(setD)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const cargarEmpresas = () => {
    companiesService
      .list()
      .then(setEmpresas)
      .catch(() => {});
  };

  useEffect(() => {
    cargarDashboard();
    cargarEmpresas();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#003366]" />
      </div>
    );
  if (!d)
    return (
      <div className="p-8 text-center text-muted-foreground">
        No se pudieron cargar las estadísticas.
      </div>
    );

  const meses = last6Months();
  const postData = meses.map((m) => ({
    mes: m.label,
    total: d.postulacionesPorMes.find((x) => x.mes === m.key)?.total ?? 0,
  }));
  const regData = meses.map((m) => ({
    mes: m.label,
    total: d.registrosPorMes.find((x) => x.mes === m.key)?.total ?? 0,
  }));
  const totalCarreras = d.porCarrera.reduce((a, c) => a + c.total, 0) || 1;
  const carreraData = d.porCarrera.map((c, i) => ({
    name: abreviaCarrera(c.carrera),
    full: c.carrera,
    total: c.total,
    pct: Math.round((c.total / totalCarreras) * 100),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));
  const cv = d.cvScore;
  let nombreAdmin = "Admin UPA";
  try {
    nombreAdmin =
      JSON.parse(localStorage.getItem("inupa_user") || "{}").nombre_completo ||
      "Admin UPA";
  } catch {
    /* noop */
  }

  const cards = [
    {
      label: "Empresas registradas",
      value: d.totales.empresas,
      sub: "+ 1 esta semana",
      icon: Building2,
      color: "#003366",
      to: "/admin/empresas",
    },
    {
      label: "Usuarios activos",
      value: d.totales.usuariosActivos,
      sub: `De ${d.totales.usuarios} registrados`,
      icon: Users,
      color: "#00A8E8",
      to: "/admin/usuarios",
    },
    {
      label: "Vacantes activas",
      value: d.totales.vacantesActivas,
      sub: `En ${d.resumenPlataforma?.empresasConVacantes ?? 0} empresas`,
      icon: Briefcase,
      color: "#9B59B6",
      to: "/admin/vacantes",
    },
  ];

  // Informe PDF
  // Informe PDF
  // Informe PDF
  const imprimirInforme = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const upaLogoUrl = window.location.origin + "/logo-upa.png";

    // Función para dibujar un gráfico de líneas SVG
    const drawLineChart = (
      chartData: { mes: string; total: number }[],
      color: string,
    ) => {
      if (chartData.length === 0)
        return '<p style="font-size:11px;color:#64748B;text-align:center;padding:20px;">Sin registros en el rango</p>';
      var width = 600;
      var height = 180;
      var paddingX = 40;
      var paddingY = 30;
      var maxVal = Math.max(
        1,
        ...chartData.map(function (d) {
          return d.total;
        }),
      );

      var points = chartData.map(function (d, i) {
        var x =
          paddingX +
          (i * (width - paddingX * 2)) / Math.max(1, chartData.length - 1);
        var y =
          height - paddingY - (d.total * (height - paddingY * 2)) / maxVal;
        return { x: x, y: y, val: d.total, label: d.mes };
      });

      var pathD =
        "M " +
        points
          .map(function (p) {
            return p.x + "," + p.y;
          })
          .join(" L ");
      var dots = points
        .map(function (p) {
          return (
            '<circle cx="' +
            p.x +
            '" cy="' +
            p.y +
            '" r="4.5" fill="' +
            color +
            '" stroke="#ffffff" stroke-width="2" />'
          );
        })
        .join("");
      var labels = points
        .map(function (p) {
          return (
            '<text x="' +
            p.x +
            '" y="' +
            (p.y - 10) +
            '" font-size="10" font-weight="850" fill="#2C3E50" text-anchor="middle">' +
            p.val +
            "</text>" +
            '<text x="' +
            p.x +
            '" y="' +
            (height - 8) +
            '" font-size="9" font-weight="700" fill="#7F8C8D" text-anchor="middle">' +
            p.label +
            "</text>"
          );
        })
        .join("");

      var gridLines = [0, 0.5, 1]
        .map(function (pct) {
          var y = paddingY + pct * (height - paddingY * 2);
          return (
            '<line x1="' +
            paddingX +
            '" y1="' +
            y +
            '" x2="' +
            (width - paddingX) +
            '" y2="' +
            y +
            '" stroke="#E2E8F0" stroke-width="0.75" stroke-dasharray="3 3" />'
          );
        })
        .join("");

      return (
        '<svg viewBox="0 0 ' +
        width +
        " " +
        height +
        '" style="width:100%;height:auto;margin-top:10px;">' +
        gridLines +
        '<path d="' +
        pathD +
        '" fill="none" stroke="' +
        color +
        '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />' +
        dots +
        labels +
        '<line x1="' +
        paddingX +
        '" y1="' +
        (height - paddingY) +
        '" x2="' +
        (width - paddingX) +
        '" y2="' +
        (height - paddingY) +
        '" stroke="#CBD5E1" stroke-width="1.5" />' +
        "</svg>"
      );
    };

    // Función para dibujar un gráfico de barras SVG
    const drawBarChart = (
      chartData: { mes: string; total: number }[],
      color: string,
    ) => {
      if (chartData.length === 0)
        return '<p style="font-size:11px;color:#64748B;text-align:center;padding:20px;">Sin postulaciones en el rango</p>';
      var width = 600;
      var height = 180;
      var paddingX = 40;
      var paddingY = 30;
      var maxVal = Math.max(
        1,
        ...chartData.map(function (d) {
          return d.total;
        }),
      );
      var barWidth =
        (width - paddingX * 2) / Math.max(1, chartData.length) - 20;

      var bars = chartData
        .map(function (d, i) {
          var x =
            paddingX + i * ((width - paddingX * 2) / chartData.length) + 10;
          var barHeight = (d.total * (height - paddingY * 2)) / maxVal;
          var y = height - paddingY - barHeight;
          return (
            '<rect x="' +
            x +
            '" y="' +
            y +
            '" width="' +
            barWidth +
            '" height="' +
            barHeight +
            '" fill="' +
            color +
            '" rx="4" />' +
            '<text x="' +
            (x + barWidth / 2) +
            '" y="' +
            (y - 8) +
            '" font-size="10" font-weight="850" fill="#2C3E50" text-anchor="middle">' +
            d.total +
            "</text>" +
            '<text x="' +
            (x + barWidth / 2) +
            '" y="' +
            (height - 8) +
            '" font-size="9" font-weight="700" fill="#7F8C8D" text-anchor="middle">' +
            d.mes +
            "</text>"
          );
        })
        .join("");

      var gridLines = [0, 0.5, 1]
        .map(function (pct) {
          var y = paddingY + pct * (height - paddingY * 2);
          return (
            '<line x1="' +
            paddingX +
            '" y1="' +
            y +
            '" x2="' +
            (width - paddingX) +
            '" y2="' +
            y +
            '" stroke="#E2E8F0" stroke-width="0.75" stroke-dasharray="3 3" />'
          );
        })
        .join("");

      return (
        '<svg viewBox="0 0 ' +
        width +
        " " +
        height +
        '" style="width:100%;height:auto;margin-top:10px;">' +
        gridLines +
        bars +
        '<line x1="' +
        paddingX +
        '" y1="' +
        (height - paddingY) +
        '" x2="' +
        (width - paddingX) +
        '" y2="' +
        (height - paddingY) +
        '" stroke="#CBD5E1" stroke-width="1.5" />' +
        "</svg>"
      );
    };

    const rawData = {
      totales: d.totales,
      cvScore: cv,
      carreraData: carreraData,
      postData: postData,
      regData: regData,
      actividades: d.actividadReciente || [],
      empresas: d.empresasRecientes || [],
      usuarios: d.ultimosUsuarios || [],
    };

    const modoOscuro = document.documentElement.classList.contains("dark");
    w.document.write(`<!doctype html>
<html lang="es" class="${modoOscuro ? "dark" : ""}">
<head>
  <meta charset="utf-8">
  <title>Informe UPA - InUPA</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      max-width: 900px;
      margin: 0 auto;
      padding: 30px;
      background: #ffffff;
      line-height: 1.5;
    }
    
    .filter-bar {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 16px 24px;
      margin-bottom: 30px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .filter-inputs-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .filter-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .filter-field label {
      font-size: 10px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-field input {
      height: 36px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 0 10px;
      font-size: 13px;
      color: #1E293B;
      outline: none;
      transition: all 0.15s;
    }
    .filter-field input:focus {
      border-color: #003366;
    }
    .filter-field input.invalid-input {
      border-color: #E74C3C !important;
      background-color: #FFF5F5;
    }
    .filter-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn {
      height: 38px;
      padding: 0 16px;
      font-size: 12px;
      font-weight: 750;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .btn-primary {
      background: #003366;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #002244;
    }
    .btn-accent {
      background: #FFD700;
      color: #003366;
    }
    .btn-accent:hover {
      background: #E6C200;
    }

    #dateWarning {
      color: #E74C3C;
      font-size: 11px;
      font-weight: bold;
      margin-top: 4px;
      display: none;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4px solid #FFD700;
      padding-bottom: 16px;
      margin-bottom: 8px;
    }
    .logo-container img { height: 55px; width: auto; display: block; }
    .header-title-container { text-align: right; }
    h1 { color: #003366; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header-subtitle { color: #64748B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .sub { color: #94A3B8; font-size: 11px; margin-bottom: 24px; text-align: right; }
    
    .section-block { page-break-inside: avoid; margin-bottom: 28px; }
    h2 {
      color: #003366;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #F1F5F9;
      padding-bottom: 6px;
      margin: 20px 0 14px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    h2::before { content: ""; display: inline-block; width: 4px; height: 14px; background: #FFD700; border-radius: 2px; }
    
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 12px 0; }
    .kpi { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 10px; text-align: center; }
    .kpi b { color: #003366; font-size: 24px; display: block; font-weight: 850; letter-spacing: -1px; }
    .kpi span { color: #64748B; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; display: block; }
    
    .row-bar { display: flex; align-items: center; gap: 12px; margin: 9px 0; font-size: 11px; font-weight: 600; }
    .rlabel-wide { width: 260px; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex: none; }
    .track { flex: 1; height: 12px; background: #F1F5F9; border-radius: 6px; overflow: hidden; }
    .fill { display: block; height: 100%; border-radius: 6px; }
    .rval { width: 80px; text-align: right; color: #003366; font-weight: 800; font-size: 11px; }
    .pct-val { color: #64748B; font-size: 10px; font-weight: 500; }
    
    .cvbox { display: flex; align-items: center; gap: 24px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; }
    .cvbig-wrapper { text-align: center; border-right: 2px solid #E2E8F0; padding-right: 24px; }
    .cvbig { font-size: 44px; font-weight: 900; color: #003366; line-height: 1; }
    .cvbig-label { font-size: 9px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px; display: block; }
    .cvrows-container { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .cv-row { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 600; }
    .cv-lbl { width: 110px; color: #475569; }
    
    .charts-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; page-break-inside: avoid; }
    .chart-box { background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; }
    .chart-title { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
    th { background: #F8FAFC; color: #475569; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 2px solid #E2E8F0; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #F1F5F9; color: #334155; }
    tr:hover td { background: #F8FAFC; }
    .badge { display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: 750; border-radius: 4px; text-transform: uppercase; }
    .badge-info { background: #E0F2FE; color: #0369A1; }
    .badge-success { background: #DCFCE7; color: #15803D; }
    .badge-primary { background: #EEF2F6; color: #003366; border: 1px solid #CBD5E1; }
    .badge-warning { background: #FEF3C7; color: #B45309; }
    .badge-danger { background: #FEE2E2; color: #B91C1C; }

    .foot { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 12px; color: #94A3B8; font-size: 10px; text-align: center; font-weight: 500; }

    /* Modo oscuro: solo aplica en pantalla, @media print de abajo lo revierte a blanco. */
    html.dark body { background: #0F172A; color: #E2E8F0; }
    html.dark .filter-bar { background: #1E293B; border-color: #334155; }
    html.dark .filter-field label { color: #94A3B8; }
    html.dark .filter-field input { background: #0F172A; border-color: #334155; color: #E2E8F0; }
    html.dark .btn-secondary { background: #1E293B !important; border-color: #334155 !important; color: #E2E8F0 !important; }
    html.dark h1, html.dark .cvbig { color: #7DD3FC; }
    html.dark h2 { color: #7DD3FC; border-bottom-color: #334155; }
    html.dark .header-subtitle, html.dark .sub, html.dark .chart-title, html.dark .foot, html.dark .cv-lbl, html.dark .kpi span { color: #94A3B8; }
    html.dark .kpi, html.dark .cvbox, html.dark .chart-box { background: #1E293B; border-color: #334155; }
    html.dark .kpi b { color: #7DD3FC; }
    html.dark .cvbig-wrapper { border-color: #334155; }
    html.dark .track { background: #334155; }
    html.dark .rlabel-wide { color: #CBD5E1; }
    html.dark table th { background: #1E293B; color: #CBD5E1; border-color: #334155; }
    html.dark table td { color: #E2E8F0; border-color: #334155; }
    html.dark tr:hover td { background: #1E293B; }
    html.dark .chart-box svg text { fill: #CBD5E1; }
    html.dark .chart-box svg line { stroke: #334155; }

    @media print {
      body, html.dark body { padding: 10px 0; background: #ffffff !important; color: #1E293B !important; }
      .filter-bar, html.dark .filter-bar { display: none !important; }
      .kpi, html.dark .kpi, .cvbox, html.dark .cvbox, .chart-box, html.dark .chart-box { background: #F8FAFC !important; border-color: #E2E8F0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .track, html.dark .track { background: #F1F5F9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th, html.dark table th { background: #F8FAFC !important; color: #475569 !important; border-color: #E2E8F0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      html.dark table td { color: #334155 !important; border-color: #F1F5F9 !important; }
      html.dark h1, html.dark h2, html.dark .cvbig { color: #003366 !important; }
      html.dark .header-subtitle, html.dark .sub, html.dark .chart-title, html.dark .foot, html.dark .cv-lbl, html.dark .kpi span, html.dark .rlabel-wide { color: #64748B !important; }
      html.dark .chart-box svg text { fill: #2C3E50 !important; }
      html.dark .chart-box svg line { stroke: #E2E8F0 !important; }
    }
  </style>
</head>
<body>
  <!-- Barra de Filtros interactiva (solo pantalla) -->
  <div class="filter-bar">
    <div class="filter-inputs-wrapper">
      <div class="filter-inputs">
        <div class="filter-field">
          <label for="startDate">Fecha Inicio</label>
          <input type="date" id="startDate" />
        </div>
        <div class="filter-field">
          <label for="endDate">Fecha Fin</label>
          <input type="date" id="endDate" />
        </div>
      </div>
      <div id="dateWarning">La fecha de inicio no puede ser posterior a la fecha de fin.</div>
    </div>
    <div class="filter-actions">
      <button class="btn btn-secondary" onclick="window.close()" style="background:#ffffff; border:1px solid #CBD5E1; color:#475569; hover:background:#F1F5F9;">← Volver al Panel</button>
      <button class="btn btn-primary" onclick="filtrarReporte()">Filtrar Rango</button>
      <button class="btn btn-accent" onclick="window.print()">Imprimir Reporte</button>
    </div>
  </div>

  <header>
    <div class="logo-container">
      <img src="${upaLogoUrl}" alt="Logo UPA" />
    </div>
    <div class="header-title-container">
      <h1>Informe de la plataforma InUPA</h1>
      <div class="header-subtitle">Vinculación Laboral Universitaria</div>
    </div>
  </header>
  
  <div class="sub" id="reportDate">Generado el ...</div>

  <div id="reportContent">
    <div class="section-block">
      <h2>Resumen general del periodo</h2>
      <div class="grid" id="kpiGrid"></div>
    </div>

    <div class="section-block">
      <h2>CV score general</h2>
      <div class="cvbox" id="cvBox"></div>
    </div>

    <div class="section-block">
      <h2>Usuarios por carrera</h2>
      <div id="carrerasBlock"></div>
    </div>

    <div class="section-block">
      <h2>Nuevos registros por mes</h2>
      <div id="regChartBlock"></div>
    </div>

    <div class="section-block">
      <h2>Detalle de actividades en el periodo</h2>
      <table id="actividadesTable">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Evento</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>

  <div class="foot">InUPA · Universidad Politécnica de Aguascalientes — documento generado automáticamente</div>

  <script>
    const data = ${JSON.stringify(rawData)};

    const getMonthNum = function(mesName) {
      const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return meses.indexOf(mesName.toLowerCase().slice(0, 3));
    };

    // Recolectar fechas reales de los gráficos y actividades
    var allDates = [];
    data.actividades.forEach(function(a) { if (a.fecha) allDates.push(new Date(a.fecha)); });
    data.empresas.forEach(function(e) { if (e.created_at) allDates.push(new Date(e.created_at)); });
    data.usuarios.forEach(function(u) { if (u.fecha_registro) allDates.push(new Date(u.fecha_registro)); });

    const currentYear = new Date().getFullYear();
    data.postData.forEach(function(p) {
      const mIdx = getMonthNum(p.mes);
      if (mIdx !== -1) {
        allDates.push(new Date(currentYear, mIdx, 1));
        allDates.push(new Date(currentYear, mIdx, 28));
      }
    });

    var minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 6);
    var maxDate = new Date();

    if (allDates.length > 0) {
      minDate = new Date(Math.min.apply(null, allDates));
      maxDate = new Date(Math.max.apply(null, allDates));
      minDate.setDate(1); // Iniciar en día 1 para rango completo
    }

    var toISODate = function(d) {
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + day;
    };

    var minStr = toISODate(minDate);
    var maxStr = toISODate(maxDate);

    var startInput = document.getElementById("startDate");
    var endInput = document.getElementById("endDate");

    startInput.value = minStr;
    startInput.min = minStr;
    startInput.max = maxStr;

    endInput.value = maxStr;
    endInput.min = minStr;
    endInput.max = maxStr;

    const fmt = function(dateStr) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-MX", { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getBadge = function(tipo) {
      switch(tipo) {
        case "nueva_empresa": return '<span class="badge badge-primary">Empresa</span>';
        case "nuevo_usuario": return '<span class="badge badge-success">Estudiante</span>';
        case "nueva_vacante": return '<span class="badge badge-info">Vacante</span>';
        case "postulacion_aceptada": return '<span class="badge badge-success">Postulación Aceptada</span>';
        case "usuario_suspendido": return '<span class="badge badge-danger">Suspendido</span>';
        default: return '<span class="badge badge-warning">Actividad</span>';
      }
    };

    const getTexto = function(act) {
      switch(act.tipo) {
        case "nueva_empresa": return 'Se registró la empresa "' + act.detalle + '"';
        case "nuevo_usuario": return 'Se registró el estudiante "' + act.detalle + '"';
        case "nueva_vacante": return 'Se publicó la vacante "' + act.detalle + '"';
        case "postulacion_aceptada": return 'Postulación aceptada para "' + act.detalle + '"';
        case "usuario_suspendido": return 'Se suspendió al usuario "' + act.detalle + '"';
        default: return act.detalle || "Evento registrado";
      }
    };

    const drawLineChart = ${drawLineChart.toString()};
    const drawBarChart = ${drawBarChart.toString()};

    function filtrarReporte() {
      const startVal = startInput.value;
      const endVal = endInput.value;
      
      const start = startVal ? new Date(startVal + "T00:00:00") : new Date(0);
      const end = endVal ? new Date(endVal + "T23:59:59") : new Date();

      const warningEl = document.getElementById("dateWarning");

      // VALIDACIÓN DE FECHAS
      if (start > end) {
        warningEl.style.display = "block";
        startInput.classList.add("invalid-input");
        endInput.classList.add("invalid-input");
        document.getElementById("reportContent").style.opacity = "0.5";
        return; // Salir sin filtrar
      } else {
        warningEl.style.display = "none";
        startInput.classList.remove("invalid-input");
        endInput.classList.remove("invalid-input");
        document.getElementById("reportContent").style.opacity = "1";
      }

      document.getElementById("reportDate").innerText = "Periodo de análisis: " + fmt(start) + " al " + fmt(end) + " · Generado el " + new Date().toLocaleString("es-MX");

      const actividadesFiltradas = data.actividades.filter(function(act) {
        const d = new Date(act.fecha);
        return d >= start && d <= end;
      });

      const empresasFiltradas = data.empresas.filter(function(emp) {
        const d = new Date(emp.created_at);
        return d >= start && d <= end;
      });

      // Filtrar meses de los gráficos para calcular totales agregados del periodo
      const chartPostFiltrados = data.postData.filter(function(d) {
        const mIdx = getMonthNum(d.mes);
        if (mIdx === -1) return true;
        const dYear = new Date().getFullYear();
        const itemDate = new Date(dYear, mIdx, 15);
        return itemDate >= start && itemDate <= end;
      });

      const chartRegFiltrados = data.regData.filter(function(d) {
        const mIdx = getMonthNum(d.mes);
        if (mIdx === -1) return true;
        const dYear = new Date().getFullYear();
        const itemDate = new Date(dYear, mIdx, 15);
        return itemDate >= start && itemDate <= end;
      });

      // Calcular contadores agregados basándose en los datos mensuales sumados y los registros recientes
      const numEmpresas = empresasFiltradas.length || (chartRegFiltrados.length > 0 ? Math.ceil(chartRegFiltrados.length * 0.5) : 0);
      
      // Sumar los registros del periodo según los gráficos mensuales
      var numEstudiantesPeriodo = 0;
      chartRegFiltrados.forEach(function(r) { numEstudiantesPeriodo += r.total; });

      const numVacantes = actividadesFiltradas.filter(function(a) { return a.tipo === "nueva_vacante"; }).length;

      document.getElementById("kpiGrid").innerHTML = 
        '<div class="kpi"><b>' + numEmpresas + '</b><span>Nuevas Empresas</span></div>' +
        '<div class="kpi"><b>' + numEstudiantesPeriodo + '</b><span>Nuevos Estudiantes</span></div>' +
        '<div class="kpi"><b>' + numVacantes + '</b><span>Vacantes Publicadas</span></div>';

      document.getElementById("cvBox").innerHTML = 
        '<div class="cvbig-wrapper">' +
          '<div class="cvbig">' + data.cvScore.promedio + '<span style="font-size:16px;color:#64748B;font-weight:600">/100</span></div>' +
          '<span class="cvbig-label">Promedio de ' + data.cvScore.total + ' currículums</span>' +
        '</div>' +
        '<div class="cvrows-container">' +
          '<div class="cv-row"><span class="cv-lbl">Altos (≥80)</span><span class="track"><span class="fill" style="width:' + (data.cvScore.total ? (data.cvScore.altos / data.cvScore.total) * 100 : 0) + '%;background:#27AE60"></span></span><span class="rval">' + data.cvScore.altos + '</span></div>' +
          '<div class="cv-row"><span class="cv-lbl">Medios (50–79)</span><span class="track"><span class="fill" style="width:' + (data.cvScore.total ? (data.cvScore.medios / data.cvScore.total) * 100 : 0) + '%;background:#FFB020"></span></span><span class="rval">' + data.cvScore.medios + '</span></div>' +
          '<div class="cv-row"><span class="cv-lbl">Bajos (&lt;50)</span><span class="track"><span class="fill" style="width:' + (data.cvScore.total ? (data.cvScore.bajos / data.cvScore.total) * 100 : 0) + '%;background:#E74C3C"></span></span><span class="rval">' + data.cvScore.bajos + '</span></div>' +
        '</div>';

      const barsCarreraHtml = data.carreraData.map(function(c) {
        return '<div class="row-bar">' +
          '<span class="rlabel-wide"><span class="dot" style="background:' + c.color + '"></span>' + c.full + '</span>' +
          '<span class="track"><span class="fill" style="width:' + c.pct + '%;background:' + c.color + '"></span></span>' +
          '<span class="rval">' + c.total + ' <span class="pct-val">(' + c.pct + '%)</span></span>' +
        '</div>';
      }).join("");
      document.getElementById("carrerasBlock").innerHTML = barsCarreraHtml;

      document.getElementById("regChartBlock").innerHTML = drawLineChart(chartRegFiltrados, "#00A8E8");

      const tbody = document.querySelector("#actividadesTable tbody");
      tbody.innerHTML = "";
      if (actividadesFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#64748B;">Sin actividades en este rango de fechas.</td></tr>';
      } else {
        actividadesFiltradas.forEach(function(act) {
          const tr = document.createElement("tr");
          tr.innerHTML = '<td>' + fmt(act.fecha) + '</td><td>' + getBadge(act.tipo) + '</td><td>' + getTexto(act) + '</td>';
          tbody.appendChild(tr);
        });
      }
    }

    filtrarReporte();
  </script>
</body>
</html>`);
    w.document.close();
  };

  const getActividadIcon = (tipo: string) => {
    switch (tipo) {
      case "nueva_empresa":
        return <Building2 className="size-4 text-[#003366]" />;
      case "nuevo_usuario":
        return <UserPlus className="size-4 text-[#27AE60]" />;
      case "nueva_vacante":
        return <Briefcase className="size-4 text-[#9B59B6]" />;
      case "postulacion_aceptada":
        return <CheckCircle2 className="size-4 text-[#00A8E8]" />;
      case "usuario_suspendido":
        return <UserX className="size-4 text-[#E74C3C]" />;
      case "empresa_editada":
      case "vacante_editada":
        return <Pencil className="size-4 text-[#F39C12]" />;
      case "empresa_eliminada":
      case "vacante_eliminada":
        return <Trash2 className="size-4 text-[#E74C3C]" />;
      default:
        return <FileText className="size-4 text-muted-foreground" />;
    }
  };

  const getActividadBg = (tipo: string) => {
    switch (tipo) {
      case "nueva_empresa":
        return "bg-[#003366]/10";
      case "nuevo_usuario":
        return "bg-[#27AE60]/10";
      case "nueva_vacante":
        return "bg-[#9B59B6]/10";
      case "postulacion_aceptada":
        return "bg-[#00A8E8]/10";
      case "usuario_suspendido":
        return "bg-[#E74C3C]/10";
      case "empresa_editada":
      case "vacante_editada":
        return "bg-[#F39C12]/10";
      case "empresa_eliminada":
      case "vacante_eliminada":
        return "bg-[#E74C3C]/10";
      default:
        return "bg-muted";
    }
  };

  const getActividadTexto = (act: any) => {
    switch (act.tipo) {
      case "nueva_empresa":
        return `Nueva empresa registrada: ${act.detalle}`;
      case "nuevo_usuario":
        return `Nuevo usuario: ${act.detalle}`;
      case "nueva_vacante":
        return `Nueva vacante publicada: ${act.detalle} – ${act.subdetalle || ""}`;
      case "postulacion_aceptada":
        return `Postulación aceptada: ${act.detalle} en ${act.subdetalle || ""}`;
      case "usuario_suspendido":
        return `Usuario suspendido: ${act.detalle}`;
      case "empresa_editada":
        return `Empresa editada: ${act.detalle}`;
      case "empresa_eliminada":
        return `Empresa eliminada: ${act.detalle}`;
      case "vacante_editada":
        return `Vacante editada: ${act.detalle}${act.subdetalle ? ` – ${act.subdetalle}` : ""}`;
      case "vacante_eliminada":
        return `Vacante eliminada: ${act.detalle}${act.subdetalle ? ` – ${act.subdetalle}` : ""}`;
      default:
        return `${act.detalle}`;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
      {/* Encabezado */}
      <div className="rounded-2xl bg-gradient-to-r from-[#001A33] to-[#003366] p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl border border-[#003366]/10 transition-all duration-300">
        <div>
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">
            Panel de administración · InUPA
          </p>
          <h1 className="text-2xl font-extrabold mt-1 text-white tracking-tight">
            Bienvenido, {nombreAdmin}
          </h1>
          <p className="text-white/60 text-xs mt-1 font-medium">
            Hoy es{" "}
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · Todo en orden
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEmpresaModal(true)}
            className="flex items-center gap-1.5 bg-[#FFD700] text-[#003366] font-bold text-xs px-4.5 py-2.5 rounded-xl hover:bg-[#e6c200] transition-all active:scale-95 shadow-md"
          >
            <Plus className="size-4" /> Nuevo empresa
          </button>

          <button
            onClick={() => setShowVacanteModal(true)}
            className="flex items-center gap-1.5 bg-transparent border border-white/20 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl hover:bg-white/10 transition-all active:scale-95"
          >
            <Plus className="size-4" /> Nueva vacante
          </button>

          <button
            onClick={imprimirInforme}
            title="Imprimir informe PDF"
            className="size-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
          >
            <FileDown className="size-4" />
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const isPositive = c.sub.startsWith("+");

          const cardContent = (
            <Card
              className={`border-0 shadow-sm transition-all duration-300 rounded-2xl group overflow-hidden ${c.to ? "hover:shadow-xl hover:-translate-y-1" : ""}`}
            >
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    {c.label}
                  </p>
                  <div
                    className="size-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${c.color}15` }}
                  >
                    <Icon className="size-5" style={{ color: c.color }} />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-foreground mt-2.5 tracking-tight">
                  {c.value}
                </p>

                <p className="text-[11px] mt-2 flex items-center gap-1 font-semibold text-muted-foreground">
                  {isPositive ? (
                    <>
                      <TrendingUp className="size-3 text-[#27AE60]" />
                      <span className="text-[#27AE60]">{c.sub}</span>
                    </>
                  ) : (
                    <span>{c.sub}</span>
                  )}
                </p>
              </CardContent>
            </Card>
          );

          if (c.to) {
            return (
              <Link
                key={c.label}
                to={c.to}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div
              key={c.label}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{
                animationDelay: `${i * 60}ms`,
                animationFillMode: "backwards",
              }}
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Primera Fila de Gráficos */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Nuevos registros (línea) */}
        <Card className="border-0 shadow-sm lg:col-span-2 rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-foreground">
              Nuevos registros
            </h2>
            <p className="text-[11px] text-muted-foreground mb-4">
              Usuarios por mes
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={regData}
                margin={{ top: 15, right: 15, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CleanTooltip unidad="registros" />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#00A8E8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#00A8E8" }}
                  animationDuration={900}
                >
                  <LabelList
                    dataKey="total"
                    position="top"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fill: "var(--foreground)",
                    }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usuarios por carrera */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Usuarios por carrera
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {totalCarreras} estudiantes registrados
                </p>
              </div>
              <Link
                to="/admin/carreras"
                className="text-xs text-[#003366] font-bold hover:underline flex items-center gap-1 group"
              >
                Gestionar
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {carreraData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-16">
                Sin datos de carrera.
              </p>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={carreraData}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={2.5}
                        stroke="none"
                        animationDuration={800}
                      >
                        {carreraData.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CleanTooltip unidad="estudiantes" />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-foreground">
                      {totalCarreras}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                      total
                    </span>
                  </div>
                </div>
                <div className="w-full mt-4 space-y-1.5 max-h-[105px] overflow-y-auto pr-1">
                  {carreraData.map((c) => (
                    <div
                      key={c.full}
                      className="flex items-center gap-2 text-[11px]"
                    >
                      <span
                        className="size-2 rounded-full flex-none"
                        style={{ background: c.color }}
                      />
                      <span
                        className="text-foreground font-medium truncate flex-1"
                        title={c.full}
                      >
                        {c.name}
                      </span>
                      <span className="text-muted-foreground tabular-nums font-bold">
                        {c.total}
                      </span>
                      <span className="text-muted-foreground/70 tabular-nums w-8 text-right font-medium">
                        {c.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Segunda Fila de Gráficos y Listas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Empresas recientes */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Empresas recientes
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Últimos registros agregados
                </p>
              </div>
              <Link
                to="/admin/empresas"
                className="text-xs text-[#003366] font-bold hover:underline flex items-center gap-1 group"
              >
                Ver todas{" "}
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-3.5 flex-1">
              {d.empresasRecientes?.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {emp.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[130px]">
                        {emp.nombre}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {emp.industria || "Tecnología"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${emp.activa ? "bg-green-50 text-[#27AE60] border border-green-200/50" : "bg-red-50 text-[#E74C3C] border border-red-200/50"}`}
                    >
                      {emp.activa ? "Activa" : "Inactiva"}
                    </span>
                    <p className="text-[9px] text-muted-foreground/80 mt-1">
                      {formatRelativeTime(emp.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              {(!d.empresasRecientes || d.empresasRecientes.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-10">
                  Sin empresas recientes.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente timeline */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <CardContent className="p-5 flex-1 flex flex-col">
            <h2 className="text-base font-bold text-foreground">
              Actividad reciente
            </h2>
            <p className="text-[11px] text-muted-foreground mb-4">
              Línea de tiempo de eventos
            </p>

            <div className="relative flex-1 pl-4 space-y-4 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-border/60">
              {d.actividadReciente?.map((act, idx) => (
                <div
                  key={idx}
                  className="relative flex items-start gap-3 text-xs text-[#2C3E50] leading-snug"
                >
                  <span
                    className={`absolute -left-4.5 size-6 rounded-full border-2 border-background flex items-center justify-center shadow-sm ${getActividadBg(act.tipo)}`}
                  >
                    {getActividadIcon(act.tipo)}
                  </span>

                  <div className="pl-4">
                    <p className="text-xs font-medium text-foreground leading-snug">
                      {getActividadTexto(act)}
                    </p>
                    <p className="text-[9px] text-muted-foreground/80 mt-0.5">
                      {formatRelativeTime(act.fecha)}
                    </p>
                  </div>
                </div>
              ))}
              {(!d.actividadReciente || d.actividadReciente.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-10">
                  Sin actividades registradas.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tercera Fila - Últimos Usuarios y Resumen */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Últimos usuarios */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Últimos usuarios registrados
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Estudiantes agregados recientemente
                </p>
              </div>
              <Link
                to="/admin/usuarios"
                className="text-xs text-[#003366] font-bold hover:underline flex items-center gap-1 group"
              >
                Ver todos{" "}
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-3.5 flex-1">
              {d.ultimosUsuarios?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-[#00A8E8]/10 text-[#00A8E8] flex items-center justify-center font-bold text-xs border border-[#00A8E8]/20">
                      {user.nombre_completo.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[130px]">
                        {user.nombre_completo}
                      </p>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {user.carrera
                          ? abreviaCarrera(user.carrera)
                          : "Estudiante"}{" "}
                        {user.cuatrimestre
                          ? `· ${user.cuatrimestre}º sem.`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] bg-[#003366]/5 text-[#003366] border border-[#003366]/10 px-2 py-0.5 rounded-full font-bold">
                      Estudiante
                    </span>
                    <p className="text-[9px] text-muted-foreground/80 mt-1">
                      {formatRelativeTime(user.fecha_registro)}
                    </p>
                  </div>
                </div>
              ))}
              {(!d.ultimosUsuarios || d.ultimosUsuarios.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-10">
                  Sin usuarios recientes.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogos / Modales */}
      {showEmpresaModal && (
        <EmpresaDialog
          item={null}
          onClose={() => setShowEmpresaModal(false)}
          onSaved={() => {
            setShowEmpresaModal(false);
            cargarDashboard();
            cargarEmpresas();
          }}
        />
      )}

      {showVacanteModal && (
        <VacanteDialog
          item={null}
          empresas={empresas}
          onClose={() => setShowVacanteModal(false)}
          onSaved={() => {
            setShowVacanteModal(false);
            cargarDashboard();
          }}
        />
      )}
    </div>
  );
}
