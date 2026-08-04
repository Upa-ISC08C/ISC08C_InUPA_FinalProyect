import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Sparkles, Loader2, FileText, Upload, User, Briefcase, GraduationCap, Wrench, AlertCircle, Download, FileDown } from "lucide-react";
import { aiService, type PerfilOptimizado } from "../../services/ai.service";
import { profileService, type FullProfile } from "../../services/profile.service";

const fmtFecha = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("es-MX", { month: "short", year: "numeric" });
};

// Construye un texto con toda la info del perfil para que la IA arme el CV
function perfilATexto(p: FullProfile): string {
  const L: string[] = [];
  L.push(`Nombre: ${p.nombre_completo}`);
  if (p.carrera) L.push(`Carrera: ${p.carrera}${p.cuatrimestre ? ` (${p.cuatrimestre}° cuatrimestre)` : ""}`);
  L.push(`Correo: ${p.correo_institucional}`);
  const pe: any = p.perfil || {};
  if (pe.telefono) L.push(`Teléfono: ${pe.telefono}`);
  if (pe.ubicacion) L.push(`Ubicación: ${pe.ubicacion}`);
  if (pe.github_url) L.push(`GitHub: ${pe.github_url}`);
  if (pe.linkedin_url) L.push(`LinkedIn: ${pe.linkedin_url}`);
  if (pe.titular_profesional) L.push(`Titular profesional: ${pe.titular_profesional}`);
  if (pe.biografia) L.push(`Perfil: ${pe.biografia}`);
  if (p.experiencia?.length) {
    L.push("\nExperiencia:");
    p.experiencia.forEach((e: any) => {
      L.push(`- ${e.puesto}${e.empresa_nombre ? " en " + e.empresa_nombre : ""} (${fmtFecha(e.fecha_inicio)} - ${e.actual ? "Actualidad" : fmtFecha(e.fecha_fin)})`);
      (e.actividades || []).forEach((a: any) => L.push(`  * ${a.actividad}${a.descripcion ? ": " + a.descripcion : ""}`));
      if (e.tecnologias_usadas?.length) L.push(`  Tecnologías: ${e.tecnologias_usadas.join(", ")}`);
    });
  }
  if (p.educacion?.length) { L.push("\nEducación:"); p.educacion.forEach((ed: any) => L.push(`- ${ed.carrera_o_grado} en ${ed.institucion} (${fmtFecha(ed.fecha_inicio)} - ${ed.graduado ? "Graduado" : fmtFecha(ed.fecha_fin) || "En curso"})`)); }
  if (p.habilidades?.length) L.push(`\nHabilidades: ${p.habilidades.map((h: any) => h.nombre).join(", ")}`);
  if (p.proyectos?.length) { L.push("\nProyectos:"); p.proyectos.forEach((pr: any) => L.push(`- ${pr.nombre_proyecto}${pr.descripcion ? ": " + pr.descripcion : ""}${pr.tecnologias?.length ? ` [${pr.tecnologias.join(", ")}]` : ""}`)); }
  return L.join("\n");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Markdown -> HTML minimalista para el PDF
function mdToHtml(md: string): string {
  const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  const out: string[] = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  md.split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (/^#{3}\s/.test(t)) { closeList(); out.push(`<h3>${inline(t.replace(/^#{3}\s/, ""))}</h3>`); }
    else if (/^#{2}\s/.test(t)) { closeList(); out.push(`<h2>${inline(t.replace(/^#{2}\s/, ""))}</h2>`); }
    else if (/^#\s/.test(t)) { closeList(); out.push(`<h1>${inline(t.replace(/^#\s/, ""))}</h1>`); }
    else if (/^[-*]\s/.test(t)) { if (!inList) { out.push("<ul>"); inList = true; } out.push(`<li>${inline(t.replace(/^[-*]\s/, ""))}</li>`); }
    else if (t === "") { closeList(); }
    else { closeList(); out.push(`<p>${inline(t)}</p>`); }
  });
  closeList();
  return out.join("\n");
}

export function CVBuilder() {
  const [texto, setTexto] = useState("");
  const [loadingTexto, setLoadingTexto] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [resultado, setResultado] = useState<PerfilOptimizado | null>(null);
  const [errorTexto, setErrorTexto] = useState("");

  const [archivo, setArchivo] = useState<File | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [errorPdf, setErrorPdf] = useState("");

  // Generador de CV con IA (desde el perfil)
  const [cvMd, setCvMd] = useState("");
  const [cvLoading, setCvLoading] = useState(false);
  const [cvNombre, setCvNombre] = useState("");
  const [cvError, setCvError] = useState("");
  const [cvProfile, setCvProfile] = useState<FullProfile | null>(null); // <-- NUEVO ESTADO

  const generarMiCV = async () => {
    setCvLoading(true); setCvError(""); setCvMd("");
    try {
      const p = await profileService.getMyProfile();
      setCvProfile(p); // <-- GUARDAMOS EL PERFIL COMPLETO
      setCvNombre(p.nombre_completo || "CV");
      const texto = perfilATexto(p);
      const md = await aiService.generarCV(texto);
      setCvMd(md);
    } catch (e: any) {
      setCvError(e?.response?.data?.error || "No se pudo generar el CV. Completa tu perfil e intenta de nuevo.");
    } finally { setCvLoading(false); }
  };

  // Abre una ventana con el markdown ya formateado como documento y dispara
  // el diálogo de impresión (permite guardar como PDF real, en vez del texto
  // plano sin formato que se mostraba antes).
  const abrirVentanaPDF = (titulo: string, infoPersonalHtml: string, md: string) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}]/gu;
    const cleanMd = md.replace(emojiRegex, "");
    const html = mdToHtml(cleanMd);
    const w = window.open("", "_blank");
    if (!w) {
      alert("Tu navegador bloqueó la ventana para generar el PDF. Permite las ventanas emergentes para este sitio e intenta de nuevo.");
      return;
    }

    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Poppins', Arial, sans-serif; color: #2C3E50; max-width: 780px; margin: 0 auto; padding: 40px; line-height: 1.5; }
        h1 { color: #003366; font-size: 26px; margin: 0 0 4px; border-bottom: 1.5px solid #003366; padding-bottom: 8px; }
        h2 { color: #003366; font-size: 16px; margin: 22px 0 6px; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #003366; padding-bottom: 4px; }
        h3 { color: #2C3E50; font-size: 14px; margin: 12px 0 2px; }
        p { margin: 4px 0; font-size: 13px; }
        ul { margin: 4px 0 10px; padding-left: 20px; } li { font-size: 13px; margin: 2px 0; }
        strong { color: #003366; }
        @media print { body { padding: 0; } }
      </style></head><body>${infoPersonalHtml}${html}
      <script>window.onload=function(){window.print();}<\/script></body></html>`);
    w.document.close();
  };

  // Bloque con nombre/carrera/correo/teléfono/ubicación, reutilizado por
  // ambos flujos de descarga de PDF (antes "Optimiza tu CV en PDF" no lo
  // incluía porque ese flujo no cargaba el perfil del usuario).
  const buildInfoPersonalHtml = (perfil: FullProfile) => {
    const pe: any = perfil.perfil || {};
    return `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1.5px solid #003366;">
        <h1 style="font-size: 28px; margin: 0 0 8px; color: #003366; border: none; padding: 0;">${esc(perfil.nombre_completo || "")}</h1>
        <p style="margin: 4px 0; font-size: 14px; color: #2C3E50;"><strong>Carrera:</strong> ${esc(perfil.carrera || "No especificada")} ${perfil.cuatrimestre ? `(${perfil.cuatrimestre}° cuatrimestre)` : ""}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #2C3E50;"><strong>Correo:</strong> ${esc(perfil.correo_institucional || "")}</p>
        ${pe.telefono ? `<p style="margin: 4px 0; font-size: 14px; color: #2C3E50;"><strong>Teléfono:</strong> ${esc(pe.telefono)}</p>` : ""}
        ${pe.ubicacion ? `<p style="margin: 4px 0; font-size: 14px; color: #2C3E50;"><strong>Ubicación:</strong> ${esc(pe.ubicacion)}</p>` : ""}
      </div>
    `;
  };

  const descargarPDF = () => {
    if (!cvMd || !cvProfile) return;
    abrirVentanaPDF(`CV - ${esc(cvNombre)}`, buildInfoPersonalHtml(cvProfile), cvMd);
  };

  // "Aceptar": confirma el CV optimizado a partir del PDF subido y genera el
  // PDF final con el mismo formato que "Genera mi CV con IA" (antes solo se
  // mostraba texto plano, sin nombre/carrera/contacto, porque este flujo no
  // cargaba el perfil del usuario logueado).
  const [aceptandoPdf, setAceptandoPdf] = useState(false);
  const aceptarYDescargarPdfOptimizado = async () => {
    if (!markdown) return;
    setAceptandoPdf(true);
    try {
      const perfil = cvProfile ?? (await profileService.getMyProfile());
      if (!cvProfile) setCvProfile(perfil);
      abrirVentanaPDF("CV optimizado", buildInfoPersonalHtml(perfil), markdown);
    } catch {
      setErrorPdf("No se pudo cargar tu perfil para armar el PDF. Intenta de nuevo.");
    } finally {
      setAceptandoPdf(false);
    }
  };

  // Precargar el textarea con los datos del perfil del usuario
  const usarMiPerfil = async () => {
    setPrefilling(true);
    try {
      const p = await profileService.getMyProfile();
      const partes: string[] = [];
      if (p.perfil?.titular_profesional) partes.push(`Soy ${p.perfil.titular_profesional}.`);
      if (p.perfil?.biografia) partes.push(p.perfil.biografia);
      if (p.experiencia?.length) {
        partes.push("Experiencia: " + p.experiencia.map((e: any) =>
          `${e.puesto}${e.empresa_nombre ? " en " + e.empresa_nombre : ""}${e.descripcion ? " (" + e.descripcion + ")" : ""}`
        ).join("; ") + ".");
      }
      if (p.educacion?.length) {
        partes.push("Educación: " + p.educacion.map((e: any) => `${e.carrera_o_grado} en ${e.institucion}`).join("; ") + ".");
      }
      if (p.habilidades?.length) {
        partes.push("Habilidades: " + p.habilidades.map((h: any) => h.nombre).join(", ") + ".");
      }
      setTexto(partes.join("\n") || "");
    } finally {
      setPrefilling(false);
    }
  };

  const generar = async () => {
    if (texto.trim().length < 10) { setErrorTexto("Escribe un poco más sobre tu experiencia."); return; }
    setLoadingTexto(true); setErrorTexto(""); setResultado(null);
    try {
      const r = await aiService.optimizarTexto(texto.trim());
      if (r?.error) setErrorTexto(r.error);
      else setResultado(r);
    } catch (e: any) {
      setErrorTexto(e?.response?.data?.error || "No se pudo generar. Intenta de nuevo.");
    } finally {
      setLoadingTexto(false);
    }
  };

  const optimizarPdf = async () => {
    if (!archivo) return;
    setLoadingPdf(true); setErrorPdf(""); setMarkdown("");
    try {
      const r = await aiService.pdfAMarkdown(archivo);
      setMarkdown(r.markdown);
    } catch (e: any) {
      setErrorPdf(e?.response?.data?.error || "No se pudo procesar el PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] dark:text-white tracking-tight">Constructor de CV con IA</h1>
        <p className="text-sm text-[#7F8C8D] dark:text-slate-400 mt-0.5">Genera y optimiza tu currículum con inteligencia artificial</p>
      </div>

      {/* Generar CV desde el perfil (principal) */}
      <Card className="border-0 shadow-sm ring-1 ring-[#003366]/10">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-[#E8F0FC] flex items-center justify-center"><FileDown className="size-5 text-[#003366]" /></div>
            <div>
              <h2 className="font-bold text-[#2C3E50] dark:text-white">Genera mi CV con IA</h2>
              <p className="text-xs text-[#7F8C8D] dark:text-slate-400">Arma tu currículum a partir de la información de tu perfil (incluye tus links de GitHub/LinkedIn) y descárgalo en PDF.</p>
            </div>
          </div>

          {cvError && (
            <div className="flex items-center gap-2 text-xs text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2"><AlertCircle className="size-4 flex-shrink-0" />{cvError}</div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={generarMiCV} disabled={cvLoading} className="flex items-center gap-1.5">
              {cvLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Generar mi CV con IA
            </Button>
            {cvMd && (
              <Button variant="outline" onClick={descargarPDF} className="flex items-center gap-1.5">
                <Download className="size-4" /> Descargar PDF
              </Button>
            )}
          </div>

          {cvMd && (
            <div
              className="rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-[#2C3E50] dark:text-white [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#003366] [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#003366] [&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:uppercase [&_h3]:font-semibold [&_h3]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1 [&_strong]:text-[#003366]"
              dangerouslySetInnerHTML={{ __html: mdToHtml(cvMd) }}
            />
          )}
        </CardContent>
      </Card>

      {/* Generar desde texto */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-[#FEF9C3] flex items-center justify-center"><Sparkles className="size-5 text-[#CA8A04]" /></div>
            <div>
              <h2 className="font-bold text-[#2C3E50] dark:text-white">Genera tu perfil profesional</h2>
              <p className="text-xs text-[#7F8C8D] dark:text-slate-400">Describe lo que haces en lenguaje cotidiano y la IA lo redacta profesionalmente.</p>
            </div>
          </div>

          <Textarea rows={5} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej. Soy estudiante de sistemas, hice una app con React y una base de datos, también trabajé haciendo reportes en Excel…"
            className="rounded-xl border-[#E5E7EB] dark:border-slate-800 text-sm" />

          {errorTexto && (
            <div className="flex items-center gap-2 text-xs text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 flex-shrink-0" />{errorTexto}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={generar} disabled={loadingTexto} className="flex items-center gap-1.5">
              {loadingTexto ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generar con IA
            </Button>
            <Button variant="outline" onClick={usarMiPerfil} disabled={prefilling} className="flex items-center gap-1.5">
              {prefilling ? <Loader2 className="size-4 animate-spin" /> : <User className="size-4" />}
              Usar mi perfil
            </Button>
          </div>

          {resultado && (
            <div className="space-y-4 pt-2">
              {resultado.perfil && (
                <Bloque icon={User} title="Perfil profesional">
                  <p className="text-sm text-[#2C3E50] dark:text-white leading-relaxed">{resultado.perfil}</p>
                </Bloque>
              )}
              {resultado.experiencia?.length ? (
                <Bloque icon={Briefcase} title="Experiencia destacada">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#2C3E50] dark:text-white">{resultado.experiencia.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </Bloque>
              ) : null}
              {resultado.educacion?.length ? (
                <Bloque icon={GraduationCap} title="Educación">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#2C3E50] dark:text-white">{resultado.educacion.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </Bloque>
              ) : null}
              {resultado.habilidades?.length ? (
                <Bloque icon={Wrench} title="Competencias y habilidades">
                  <div className="flex flex-wrap gap-1.5">
                    {resultado.habilidades.map((x, i) => <span key={i} className="text-xs bg-[#003366]/[0.06] text-[#003366] font-medium px-2.5 py-1 rounded-lg">{x}</span>)}
                  </div>
                </Bloque>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimizar PDF */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-[#E8F0FC] flex items-center justify-center"><FileText className="size-5 text-[#003366]" /></div>
            <div>
              <h2 className="font-bold text-[#2C3E50] dark:text-white">Optimiza tu CV en PDF</h2>
              <p className="text-xs text-[#7F8C8D] dark:text-slate-400">Sube tu currículum actual y la IA lo reestructura y mejora.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 border-2 border-dashed border-[#E5E7EB] dark:border-slate-800 rounded-xl px-4 py-4 cursor-pointer hover:border-[#003366]/40 transition-colors">
            <Upload className="size-5 text-[#7F8C8D] dark:text-slate-400" />
            <span className="text-sm text-[#2C3E50] dark:text-white">{archivo ? archivo.name : "Selecciona un archivo PDF"}</span>
            <input type="file" accept="application/pdf" className="hidden"
              onChange={(e) => { setArchivo(e.target.files?.[0] ?? null); setMarkdown(""); setErrorPdf(""); }} />
          </label>

          {errorPdf && (
            <div className="flex items-center gap-2 text-xs text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 flex-shrink-0" />{errorPdf}
            </div>
          )}

          <Button onClick={optimizarPdf} disabled={!archivo || loadingPdf} className="flex items-center gap-1.5">
            {loadingPdf ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Optimizar mi CV
          </Button>

          {markdown && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-[#7F8C8D] dark:text-slate-400 uppercase tracking-wide mb-2">CV optimizado</p>
                <div
                  className="rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-[#2C3E50] dark:text-white [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#003366] [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#003366] [&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:uppercase [&_h3]:font-semibold [&_h3]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1 [&_strong]:text-[#003366]"
                  dangerouslySetInnerHTML={{ __html: mdToHtml(markdown) }}
                />
              </div>
              <Button onClick={aceptarYDescargarPdfOptimizado} disabled={aceptandoPdf} className="flex items-center gap-1.5">
                {aceptandoPdf ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Aceptar y descargar PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Bloque({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 text-[#003366]" />
        <p className="text-sm font-bold text-[#2C3E50] dark:text-white">{title}</p>
      </div>
      {children}
    </div>
  );
}