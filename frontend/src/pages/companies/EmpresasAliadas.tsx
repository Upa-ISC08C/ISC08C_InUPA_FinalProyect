import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Building2, Globe, MapPin, Loader2 } from "lucide-react";
import { companiesService } from "../../services/companies.service";
import type { Company } from "../../services/types";

const PALETTE = ["#003366", "#E74C3C", "#9B59B6", "#E67E22", "#1ABC9C", "#34495E"];
const color = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function EmpresasAliadas() {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesService
      .list()
      .then((data) => setEmpresas(data.filter((c) => c.activa)))
      .catch(() => setEmpresas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] dark:text-white tracking-tight">Empresas aliadas</h1>
        <p className="text-sm text-[#7F8C8D] dark:text-slate-400 mt-0.5">Organizaciones que publican vacantes para la comunidad UPA</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366] dark:text-[#00A8E8]" /></div>
      ) : empresas.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 text-center">
            <Building2 className="size-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-[#7F8C8D] dark:text-slate-400">No hay empresas aliadas por el momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {empresas.map((e) => (
            <Card key={e.id} className="border-0 shadow-sm dark:bg-slate-900 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  {e.logo_url ? (
                    <img
                      src={e.logo_url}
                      alt={e.nombre}
                      draggable={false}
                      onDragStart={(ev) => ev.preventDefault()}
                      onContextMenu={(ev) => ev.preventDefault()}
                      className="size-12 rounded-xl object-contain bg-white border border-[#F5F7FA] dark:border-slate-800 flex-shrink-0 select-none"
                    />
                  ) : (
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: color(e.nombre) }}
                    >
                      {initials(e.nombre)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#2C3E50] dark:text-white truncate">{e.nombre}</h3>
                    {e.industria && <p className="text-xs font-semibold text-[#00A8E8] truncate">{e.industria}</p>}
                  </div>
                </div>

                {e.descripcion && (
                  <p className="text-xs text-[#7F8C8D] dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed">{e.descripcion}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-[#7F8C8D] dark:text-slate-400">
                  {e.ciudad && (
                    <span className="flex items-center gap-1"><MapPin className="size-3" />{e.ciudad}</span>
                  )}
                  {e.sitio_web && (
                    <a
                      href={e.sitio_web}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[#003366] dark:text-[#00A8E8] font-semibold hover:underline"
                    >
                      <Globe className="size-3" />Sitio web
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
