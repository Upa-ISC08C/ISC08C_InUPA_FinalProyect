import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Search,
  UserPlus,
  MessageSquare,
  Building2,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Briefcase,
  Check,
} from "lucide-react";
import {
  connectionsService,
  type Connection,
} from "../../features/connections/connectionsService";
import { useAuthStore } from "../../store/authStore";

// Mock de sugerencias (hasta que tengamos el endpoint de sugerencias)
const suggestedConnections = [
  {
    id: "mock-1",
    name: "Carlos Ruiz",
    role: "Gerente de TI",
    company: "TechMéxico",
    location: "CDMX",
    mutual: 12,
    tags: ["React", "Node.js"],
    color: "#003366",
  },
  {
    id: "mock-2",
    name: "Laura Martínez",
    role: "Diseñadora UX",
    company: "CreativeLab",
    location: "Monterrey",
    mutual: 8,
    tags: ["Figma", "UI/UX"],
    color: "#E74C3C",
  },
  {
    id: "mock-3",
    name: "Miguel Ángel Torres",
    role: "Estudiante de Ingeniería",
    company: "UPA",
    location: "Aguascalientes",
    mutual: 15,
    tags: ["Python", "IA"],
    color: "#9B59B6",
  },
];

export function Networking() {
  const { user } = useAuthStore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadConnections();
    }
  }, [user?.id]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      // Obtenemos las conexiones donde el usuario actual es follower o following
      const response = await connectionsService.getConnections(user?.id);
      setConnections(response.data || []);
    } catch (error) {
      console.error("Error cargando conexiones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user?.id) return;
    try {
      setConnecting(targetUserId);
      await connectionsService.createConnection({
        follower_id: user.id,
        following_id: targetUserId,
      });
      alert("¡Solicitud de conexión enviada!");
      loadConnections(); // Recargar lista para actualizar estado
    } catch (error: any) {
      alert(
        error.response?.data?.error ||
          "Error al conectar. Es posible que ya estén conectados.",
      );
    } finally {
      setConnecting(null);
    }
  };

  // Verifica si ya estamos conectados con alguien (por ID de perfil)
  const isConnected = (targetProfileId: string) => {
    return connections.some(
      (c) =>
        c.follower.id === targetProfileId || c.following.id === targetProfileId,
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">
          Red Profesional
        </h1>
        <p className="text-sm text-[#7F8C8D] mt-0.5">
          Conecta con profesionales, empresas y compañeros universitarios
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Conexiones",
            value: connections.length,
            sub: "Conexiones activas",
            icon: Users,
            color: "#003366",
          },
          {
            label: "Perfil visto",
            value: "48",
            sub: "Últimos 7 días",
            icon: TrendingUp,
            color: "#00A8E8",
          },
          {
            label: "Empresas",
            value: "4",
            sub: "Siguiendo",
            icon: Building2,
            color: "#27AE60",
          },
          {
            label: "Eventos",
            value: "3",
            sub: "Próximos registros",
            icon: Calendar,
            color: "#FFD700",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-[#7F8C8D] font-medium">{label}</p>
                <div
                  className="size-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="size-4" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#2C3E50]">{value}</p>
              <p className="text-xs text-[#7F8C8D] mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="people">
        <TabsList className="h-11 bg-[#F5F7FA] rounded-xl p-1 w-full grid grid-cols-3">
          <TabsTrigger
            value="people"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#003366] data-[state=active]:shadow-sm"
          >
            Personas
          </TabsTrigger>
          <TabsTrigger
            value="companies"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#003366] data-[state=active]:shadow-sm"
          >
            Empresas
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#003366] data-[state=active]:shadow-sm"
          >
            Eventos
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA PERSONAS (FUNCIONAL CON BACKEND) */}
        <TabsContent value="people" className="mt-5">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
              <Input
                placeholder="Buscar por nombre, empresa o habilidades..."
                className="pl-10 h-11 rounded-xl border-[#E5E7EB] text-sm"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#2C3E50] mb-3">
                Personas que podrías conocer
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-center py-8 text-[#7F8C8D]">
                    Cargando red profesional...
                  </p>
                ) : (
                  suggestedConnections.map((person) => {
                    // Simulamos que el ID del mock coincide con el ID de perfil para la demo
                    const connected = isConnected(person.id);
                    return (
                      <Card
                        key={person.id}
                        className="border-0 shadow-sm hover:shadow-md transition-all"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Avatar className="size-12 flex-shrink-0">
                              <AvatarFallback
                                className="text-white font-bold text-sm"
                                style={{ backgroundColor: person.color }}
                              >
                                {person.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-[#2C3E50] text-sm">
                                    {person.name}
                                  </h3>
                                  <p className="text-xs text-[#7F8C8D]">
                                    {person.role}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-[#7F8C8D]">
                                    <span className="flex items-center gap-1">
                                      <Building2 className="size-2.5" />
                                      {person.company}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="size-2.5" />
                                      {person.location}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-[#7F8C8D] whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                                  <Users className="size-3" />
                                  {person.mutual} en común
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {person.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-[#F5F7FA] text-[#2C3E50] px-2 py-0.5 rounded-full border border-[#E5E7EB] font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="flex gap-2 mt-3">
                                {connected ? (
                                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#27AE60]/40 text-[#27AE60] font-semibold hover:bg-[#27AE60]/10 transition-colors">
                                    <Check className="size-3" />
                                    Conectado
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleConnect(person.id)}
                                    disabled={connecting === person.id}
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#003366] text-white font-semibold hover:bg-[#002244] transition-colors disabled:opacity-50"
                                  >
                                    <UserPlus className="size-3" />
                                    {connecting === person.id
                                      ? "Enviando..."
                                      : "Conectar"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* PESTAÑA EMPRESAS (MOCK VISUAL) */}
        <TabsContent value="companies" className="mt-5">
          <h2 className="text-base font-bold text-[#2C3E50] mb-4">
            Empresas destacadas
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "TechMéxico",
              "Innovación Digital",
              "DataLab México",
              "CloudTech",
            ].map((name, i) => (
              <Card
                key={i}
                className="border-0 shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="size-14 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-[#003366]">
                      {name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#2C3E50] text-base">
                        {name}
                      </h3>
                      <p className="text-xs text-[#7F8C8D]">
                        Tecnología · 500–1,000 empleados
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#7F8C8D] mt-3 leading-relaxed">
                    Empresa líder en desarrollo de software en México, enfocada
                    en soluciones cloud y móviles.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 h-9 rounded-xl text-sm font-semibold bg-[#003366] text-white hover:bg-[#002244]">
                      Seguir
                    </button>
                    <button className="h-9 px-4 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#2C3E50] hover:bg-[#F5F7FA]">
                      Ver empleos
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PESTAÑA EVENTOS (MOCK VISUAL) */}
        <TabsContent value="events" className="mt-5">
          <h2 className="text-base font-bold text-[#2C3E50] mb-4">
            Próximos eventos
          </h2>
          <div className="space-y-3">
            {[
              {
                title: "Tech Meetup CDMX",
                date: "15",
                month: "Jul",
                time: "18:00 hrs",
                location: "Ciudad de México",
                type: "Presencial",
              },
              {
                title: "Webinar: CVs que Destacan",
                date: "20",
                month: "Jul",
                time: "16:00 hrs",
                location: "Online",
                type: "Virtual",
              },
              {
                title: "Feria de Empleo Universitaria",
                date: "28",
                month: "Jul",
                time: "10:00 hrs",
                location: "Monterrey",
                type: "Presencial",
              },
            ].map((event, i) => (
              <Card
                key={i}
                className="border-0 shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#003366] text-white rounded-xl size-16">
                      <span className="text-2xl font-bold leading-none">
                        {event.date}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#FFD700] mt-0.5">
                        {event.month}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#2C3E50] text-base">
                          {event.title}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5F7FA] text-[#2C3E50] border border-[#E5E7EB] flex-shrink-0">
                          {event.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[#7F8C8D]">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {event.location}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#003366] text-white font-semibold hover:bg-[#002244] transition-all">
                          Registrarme
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
