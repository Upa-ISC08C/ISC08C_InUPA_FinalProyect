import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Building2, Briefcase, Users, ArrowRight, Loader2 } from "lucide-react";
import { jobsService } from "../../services/jobs.service";
import { companiesService } from "../../services/companies.service";
import { adminService } from "../../services/admin.service";

export function AdminDashboard() {
  const [stats, setStats] = useState({ vacantes: 0, empresas: 0, usuarios: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobsService.list({ limit: 1000 }).then((r) => r.pagination?.total ?? r.data.length).catch(() => 0),
      companiesService.list().then((c) => c.length).catch(() => 0),
      adminService.listUsers().then((u) => u.length).catch(() => 0),
    ]).then(([vacantes, empresas, usuarios]) => setStats({ vacantes, empresas, usuarios })).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Vacantes publicadas", value: stats.vacantes, icon: Briefcase, color: "#003366", to: "/admin/vacantes" },
    { label: "Empresas registradas", value: stats.empresas, icon: Building2, color: "#00A8E8", to: "/admin/empresas" },
    { label: "Usuarios registrados", value: stats.usuarios, icon: Users, color: "#9B59B6", to: "/admin/usuarios" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Panel de Control</h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">Resumen general de la plataforma InUPA</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#003366]" /></div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.label} to={c.to}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="size-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}18` }}>
                      <Icon className="size-5" style={{ color: c.color }} />
                    </div>
                    <p className="text-3xl font-bold text-[#2C3E50] mt-3">{c.value}</p>
                    <p className="text-xs text-[#7F8C8D] mt-0.5">{c.label}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { title: "Publicar vacante", desc: "Agrega una oportunidad laboral", to: "/admin/vacantes" },
          { title: "Registrar empresa", desc: "Da de alta una empresa aliada", to: "/admin/empresas" },
          { title: "Gestionar usuarios", desc: "Revisa y administra cuentas", to: "/admin/usuarios" },
        ].map((a) => (
          <Link key={a.title} to={a.to}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#2C3E50]">{a.title}</p>
                  <p className="text-xs text-[#7F8C8D] mt-0.5">{a.desc}</p>
                </div>
                <ArrowRight className="size-4 text-[#003366]" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
