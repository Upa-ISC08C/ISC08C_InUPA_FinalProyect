import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Sparkles, Loader2, FileText, Upload, User, Briefcase, GraduationCap, Wrench, AlertCircle } from "lucide-react";
import { aiService, type PerfilOptimizado } from "../../services/ai.service";
import { profileService } from "../../services/profile.service";

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
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Constructor de CV con IA</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">Genera y optimiza tu currículum con inteligencia artificial</p>
      </div>

      {/* Generar desde texto */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-[#FEF9C3] flex items-center justify-center"><Sparkles className="size-5 text-[#CA8A04]" /></div>
            <div>
              <h2 className="font-bold text-[#2C3E50]">Genera tu perfil profesional</h2>
              <p className="text-xs text-[#7F8C8D]">Describe lo que haces en lenguaje cotidiano y la IA lo redacta profesionalmente.</p>
            </div>
          </div>

          <Textarea rows={5} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej. Soy estudiante de sistemas, hice una app con React y una base de datos, también trabajé haciendo reportes en Excel…"
            className="rounded-xl border-[#E5E7EB] text-sm" />

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
                  <p className="text-sm text-[#2C3E50] leading-relaxed">{resultado.perfil}</p>
                </Bloque>
              )}
              {resultado.experiencia?.length ? (
                <Bloque icon={Briefcase} title="Experiencia destacada">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#2C3E50]">{resultado.experiencia.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </Bloque>
              ) : null}
              {resultado.educacion?.length ? (
                <Bloque icon={GraduationCap} title="Educación">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#2C3E50]">{resultado.educacion.map((x, i) => <li key={i}>{x}</li>)}</ul>
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
              <h2 className="font-bold text-[#2C3E50]">Optimiza tu CV en PDF</h2>
              <p className="text-xs text-[#7F8C8D]">Sube tu currículum actual y la IA lo reestructura y mejora.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 border-2 border-dashed border-[#E5E7EB] rounded-xl px-4 py-4 cursor-pointer hover:border-[#003366]/40 transition-colors">
            <Upload className="size-5 text-[#7F8C8D]" />
            <span className="text-sm text-[#2C3E50]">{archivo ? archivo.name : "Selecciona un archivo PDF"}</span>
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
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">CV optimizado</p>
              <pre className="text-sm text-[#2C3E50] whitespace-pre-wrap font-[Poppins,sans-serif] leading-relaxed">{markdown}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Bloque({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 text-[#003366]" />
        <p className="text-sm font-bold text-[#2C3E50]">{title}</p>
      </div>
      {children}
    </div>
  );
}
