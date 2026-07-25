import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Briefcase, Users, FileText, TrendingUp } from "lucide-react";
import { jobsService } from "../../../features/jobs/jobsService";
import { applicationsService } from "../../../features/applications/applicationsService";

export function AdminDashboard() {
  const [stats, setStats] = useState({ jobs: 0, applications: 0, users: 120 }); // Users mock por ahora

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          jobsService.getJobs({ limit: 1000 }), // Obtenemos todas para contar
          applicationsService.getMyApplications(), // En un futuro, un endpoint de admin para todas las apps
        ]);
        setStats({
          jobs: jobsRes.data?.length || 0,
          applications: appsRes.data?.length || 0, // Esto cuenta las del usuario, ajustar a endpoint global de admin después
          users: 120, // Mock hasta tener endpoint de usuarios
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    { title: "Vacantes Activas", value: stats.jobs, icon: Briefcase, color: "#003366", bg: "#DBEAFE" },
    { title: "Postulaciones Totales", value: stats.applications, icon: FileText, color: "#27AE60", bg: "#DCFCE7" },
    { title: "Estudiantes Registrados", value: stats.users, icon: Users, color: "#FFD700", bg: "#FEF9C3" },
    { title: "Tasa de Éxito", value: "85%", icon: TrendingUp, color: "#00A8E8", bg: "#E0F2FE" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50]">Panel de Control</h1>
        <p className="text-sm text-[#7F8C8D] mt-1">Resumen general de la plataforma InUPA</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#7F8C8D]">{stat.title}</p>
                    <p className="text-3xl font-bold text-[#2C3E50] mt-2">{stat.value}</p>
                  </div>
                  <div className="size-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                    <Icon className="size-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <button className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#003366] hover:bg-[#F0F6FF] transition-all text-left">
            <Briefcase className="size-6 text-[#003366] mb-2" />
            <p className="font-semibold text-[#2C3E50]">Publicar Nueva Vacante</p>
            <p className="text-xs text-[#7F8C8D] mt-1">Agregar una oportunidad laboral para los estudiantes</p>
          </button>
          <button className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#003366] hover:bg-[#F0F6FF] transition-all text-left">
            <Users className="size-6 text-[#003366] mb-2" />
            <p className="font-semibold text-[#2C3E50]">Gestionar Usuarios</p>
            <p className="text-xs text-[#7F8C8D] mt-1">Revisar cuentas de estudiantes y administradores</p>
          </button>
          <button className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#003366] hover:bg-[#F0F6FF] transition-all text-left">
            <FileText className="size-6 text-[#003366] mb-2" />
            <p className="font-semibold text-[#2C3E50]">Reportes</p>
            <p className="text-xs text-[#7F8C8D] mt-1">Descargar estadísticas de la plataforma en PDF</p>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}