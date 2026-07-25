import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Sparkles, FileText, ArrowRight } from "lucide-react";

export function CVBuilder() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Constructor de CV</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">Optimiza tu currículum con ayuda de inteligencia artificial</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-10 text-center">
          <div className="size-14 rounded-2xl bg-[#FEF9C3] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="size-7 text-[#CA8A04]" />
          </div>
          <h2 className="text-lg font-bold text-[#2C3E50]">Optimización con IA — Próximamente</h2>
          <p className="text-sm text-[#7F8C8D] mt-2 max-w-md mx-auto leading-relaxed">
            Muy pronto podrás generar y adaptar tu CV automáticamente para cada vacante con inteligencia artificial.
            Mientras tanto, completa tu información profesional en tu perfil.
          </p>
          <Link to="/dashboard/perfil"
            className="inline-flex items-center gap-2 mt-5 px-5 h-11 rounded-xl bg-[#003366] text-white text-sm font-semibold hover:bg-[#002244] transition-colors">
            <FileText className="size-4" /> Ir a mi perfil <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
