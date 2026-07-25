import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Users, UserPlus, Loader2, MapPin } from "lucide-react";
import { connectionsService } from "../../services/connections.service";
import { useAuthStore } from "../../store/authStore";

export function Networking() {
  const { user } = useAuthStore();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    connectionsService.list(user?.id).then(setConnections).catch(() => setConnections([])).finally(() => setLoading(false));
  }, [user?.id]);

  const stats = [
    { label: "Conexiones", value: connections.length, color: "#003366" },
    { label: "Empresas siguiendo", value: 0, color: "#00A8E8" },
    { label: "Eventos próximos", value: 0, color: "#9B59B6" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Red Profesional</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">Conecta con profesionales, empresas y compañeros universitarios</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm"><CardContent className="p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#7F8C8D] mt-0.5">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#2C3E50] mb-3">Mis conexiones</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
        ) : connections.length === 0 ? (
          <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center">
            <div className="size-12 rounded-2xl bg-[#F5F7FA] flex items-center justify-center mx-auto mb-3"><Users className="size-5 text-[#7F8C8D]" /></div>
            <p className="text-sm text-[#7F8C8D]">Aún no tienes conexiones. Empieza a construir tu red profesional.</p>
          </CardContent></Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((c) => (
              <Card key={c.id} className="border-0 shadow-sm"><CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-[#003366] flex items-center justify-center text-white font-bold overflow-hidden">
                    {c.following?.url_foto ? <img src={c.following.url_foto} alt="" className="size-full object-cover" /> : (c.following?.titular_profesional || "U").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2C3E50] truncate">{c.following?.titular_profesional || "Usuario"}</p>
                    <p className="text-xs text-[#7F8C8D] flex items-center gap-1"><MapPin className="size-3" />UPA</p>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#003366] to-[#00509E]">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="text-white">
            <p className="font-bold flex items-center gap-2"><UserPlus className="size-5 text-[#FFD700]" />Amplía tu red</p>
            <p className="text-white/70 text-sm mt-1">Conecta con más estudiantes y profesionales de la comunidad UPA.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
