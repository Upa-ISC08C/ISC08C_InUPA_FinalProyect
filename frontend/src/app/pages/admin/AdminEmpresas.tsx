import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  X,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { companiesService, type Company } from "../../../features/companies/companiesService";

const colores = [
  "#003366", "#E74C3C", "#9B59B6", "#1ABC9C",
  "#E67E22", "#2980B9", "#27AE60", "#C0392B",
];

const industrias = [
  "Tecnología", "Marketing Digital", "Análisis de Datos", "Diseño",
  "Finanzas", "Salud", "Educación", "Logística", "Manufactura",
  "Infraestructura Cloud", "E-commerce", "Consultoría",
];

const tamanos = ["1–50", "50–200", "200–500", "500–1,000", "1,000+"];

export function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [viewEmpresa, setViewEmpresa] = useState<Company | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Company>>({
    nombre: "",
    industria: "",
    descripcion: "",
    sitio_web: "",
    correo_contacto: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    tamano: "",
    activa: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const response = await companiesService.getCompanies();
      setEmpresas(response.data || []);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = empresas.filter((e) => {
    const matchSearch =
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.industria.toLowerCase().includes(search.toLowerCase()) ||
      e.ciudad.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === "todos" || e.activa === (filterEstado === "activo");
    return matchSearch && matchEstado;
  });

  const openNew = () => {
    setEditingId(null);
    setForm({
      nombre: "",
      industria: "",
      descripcion: "",
      sitio_web: "",
      correo_contacto: "",
      telefono: "",
      ciudad: "",
      direccion: "",
      tamano: "",
      activa: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (e: Company) => {
    setEditingId(e.id);
    setForm({
      nombre: e.nombre,
      industria: e.industria,
      descripcion: e.descripcion,
      sitio_web: e.sitio_web,
      correo_contacto: e.correo_contacto,
      telefono: e.telefono,
      ciudad: e.ciudad,
      direccion: e.direccion,
      tamano: e.tamano,
      activa: e.activa,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre?.trim() || !form.industria) return;
    try {
      if (editingId) {
        await companiesService.updateCompany(editingId, form);
      } else {
        await companiesService.createCompany(form);
      }
      setDialogOpen(false);
      loadEmpresas();
    } catch (error) {
      alert("Error al guardar la empresa");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await companiesService.deleteCompany(id);
      setDeleteConfirm(null);
      loadEmpresas();
    } catch (error) {
      alert("Error al eliminar la empresa");
      console.error(error);
    }
  };

  const toggleEstado = async (id: string, currentEstado: boolean) => {
    try {
      await companiesService.updateCompany(id, { activa: !currentEstado });
      loadEmpresas();
    } catch (error) {
      alert("Error al actualizar estado");
      console.error(error);
    }
  };

  const Field = ({
    label,
    children,
    required,
  }: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-[#7F8C8D] uppercase tracking-wide">
        {label}{required && <span className="text-[#E74C3C] ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-[#7F8C8D]">Cargando empresas...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Empresas</h1>
          <p className="text-sm text-[#7F8C8D] mt-0.5">
            {empresas.length} empresas registradas · {empresas.filter((e) => e.activa).length} activas
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white rounded-xl text-sm font-semibold hover:bg-[#002244] transition-colors"
        >
          <Plus className="size-4" />
          Nueva empresa
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
          <Input
            placeholder="Buscar por nombre, industria o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-[#E5E7EB] text-sm"
          />
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-40 h-10 rounded-xl border-[#E5E7EB] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activas</SelectItem>
            <SelectItem value="inactivo">Inactivas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Companies grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((empresa) => (
          <Card key={empresa.id} className="border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex gap-4">
                {/* Logo */}
                <div className="size-14 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-[#003366]">
                  {empresa.nombre.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#2C3E50]">{empresa.nombre}</h3>
                      <p className="text-xs text-[#7F8C8D]">{empresa.industria}</p>
                    </div>
                    <button
                      onClick={() => toggleEstado(empresa.id, empresa.activa)}
                      className={`
                        flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0
                        ${empresa.activa
                          ? "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]"
                          : "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]"
                        }
                      `}
                    >
                      {empresa.activa
                        ? <><CheckCircle2 className="size-2.5" />Activa</>
                        : <><XCircle className="size-2.5" />Inactiva</>
                      }
                    </button>
                  </div>

                  <p className="text-xs text-[#7F8C8D] mt-2 line-clamp-2 leading-relaxed">
                    {empresa.descripcion}
                  </p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs text-[#7F8C8D]">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="size-3 flex-shrink-0" />{empresa.ciudad}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Users className="size-3 flex-shrink-0" />{empresa.tamano} empleados
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="size-3 flex-shrink-0" />{empresa.correo_contacto}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-[#F5F7FA]">
                    <button
                      onClick={() => setViewEmpresa(empresa)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#2C3E50] font-semibold hover:bg-[#F5F7FA] transition-colors"
                    >
                      <Eye className="size-3" />Ver
                    </button>
                    <button
                      onClick={() => openEdit(empresa)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#2C3E50] font-semibold hover:bg-[#F5F7FA] transition-colors"
                    >
                      <Pencil className="size-3" />Editar
                    </button>
                    {deleteConfirm === empresa.id ? (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs text-[#7F8C8D]">¿Confirmar?</span>
                        <button
                          onClick={() => handleDelete(empresa.id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-[#E74C3C] text-white font-semibold hover:bg-[#C0392B] transition-colors"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(empresa.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#E74C3C] font-semibold hover:bg-[#FEE2E2] transition-colors ml-auto"
                      >
                        <Trash2 className="size-3" />Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="size-12 text-[#D1D5DB] mb-3" />
            <p className="text-[#2C3E50] font-semibold">No se encontraron empresas</p>
            <p className="text-sm text-[#7F8C8D] mt-1">Intenta con otra búsqueda o agrega una nueva empresa</p>
          </div>
        )}
      </div>

      {/* View empresa detail dialog */}
      <Dialog open={!!viewEmpresa} onOpenChange={() => setViewEmpresa(null)}>
        {viewEmpresa && (
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
            <DialogHeader className="p-0">
              <div className="h-20 rounded-t-2xl relative overflow-hidden bg-[#003366]">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)`, backgroundSize: "12px 12px" }} />
                <button
                  onClick={() => setViewEmpresa(null)}
                  className="absolute top-3 right-3 size-7 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="px-6 -mt-8 pb-0 flex items-end gap-4">
                <div className="size-16 rounded-2xl border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0 bg-[#003366]">
                  {viewEmpresa.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div className="pb-2 flex-1 min-w-0">
                  <DialogTitle className="text-lg font-bold text-[#2C3E50] leading-tight">{viewEmpresa.nombre}</DialogTitle>
                  <p className="text-xs text-[#7F8C8D]">{viewEmpresa.industria}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-[#7F8C8D] leading-relaxed">{viewEmpresa.descripcion}</p>

              <div>
                <p className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wide mb-2">Información de contacto</p>
                <div className="space-y-2">
                  {[
                    { icon: Mail, label: "Correo de contacto", value: viewEmpresa.correo_contacto },
                    { icon: Phone, label: "Teléfono", value: viewEmpresa.telefono },
                    { icon: Globe, label: "Sitio web", value: viewEmpresa.sitio_web },
                    { icon: MapPin, label: "Dirección", value: `${viewEmpresa.direccion}, ${viewEmpresa.ciudad}` },
                  ].filter((r) => r.value).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F5F7FA] border border-[#E5E7EB]">
                      <Icon className="size-3.5 text-[#7F8C8D] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#7F8C8D] uppercase tracking-wide font-semibold">{label}</p>
                        <p className="text-xs text-[#2C3E50] font-medium truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 pb-5 flex gap-2 border-t border-[#E5E7EB] pt-4">
              <button
                onClick={() => { setViewEmpresa(null); openEdit(viewEmpresa); }}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border-2 border-[#003366] text-[#003366] text-sm font-semibold hover:bg-[#003366]/[0.06] transition-colors"
              >
                <Pencil className="size-3.5" />Editar empresa
              </button>
              {viewEmpresa.sitio_web && (
                <a
                  href={viewEmpresa.sitio_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-xl bg-[#003366] text-white text-sm font-semibold hover:bg-[#002244] transition-colors"
                >
                  <ExternalLink className="size-3.5" />Sitio web
                </a>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-[#2C3E50]">
                {editingId !== null ? "Editar empresa" : "Nueva empresa"}
              </DialogTitle>
              <button
                onClick={() => setDialogOpen(false)}
                className="size-8 flex items-center justify-center rounded-lg text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre de la empresa" required>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. TechMéxico"
                  className="h-10 rounded-xl text-sm"
                />
              </Field>
              <Field label="Industria / Sector" required>
                <Select
                  value={form.industria}
                  onValueChange={(v) => setForm((f) => ({ ...f, industria: v }))}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {industrias.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Descripción">
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Breve descripción de la empresa..."
                rows={3}
                className="rounded-xl text-sm resize-none"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Correo de contacto" required>
                <Input
                  type="email"
                  value={form.correo_contacto}
                  onChange={(e) => setForm((f) => ({ ...f, correo_contacto: e.target.value }))}
                  placeholder="rrhh@empresa.com"
                  className="h-10 rounded-xl text-sm"
                />
              </Field>
              <Field label="Teléfono">
                <Input
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  placeholder="+52 449 000 0000"
                  className="h-10 rounded-xl text-sm"
                />
              </Field>
            </div>

            <Field label="Sitio web">
              <Input
                value={form.sitio_web}
                onChange={(e) => setForm((f) => ({ ...f, sitio_web: e.target.value }))}
                placeholder="https://empresa.com"
                className="h-10 rounded-xl text-sm"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ciudad" required>
                <Input
                  value={form.ciudad}
                  onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
                  placeholder="Ej. Aguascalientes"
                  className="h-10 rounded-xl text-sm"
                />
              </Field>
              <Field label="Tamaño de la empresa">
                <Select
                  value={form.tamano}
                  onValueChange={(v) => setForm((f) => ({ ...f, tamano: v }))}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm">
                    <SelectValue placeholder="Empleados" />
                  </SelectTrigger>
                  <SelectContent>
                    {tamanos.map((t) => (
                      <SelectItem key={t} value={t}>{t} empleados</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Dirección">
              <Input
                value={form.direccion}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                placeholder="Calle, número, colonia"
                className="h-10 rounded-xl text-sm"
              />
            </Field>

            <Field label="Estado">
              <div className="flex gap-2">
                {(["activo", "inactivo"] as const).map((estado) => (
                  <button
                    key={estado}
                    onClick={() => setForm((f) => ({ ...f, activa: estado === "activo" }))}
                    className={`
                      flex-1 h-9 rounded-xl text-sm font-semibold border-2 capitalize transition-all
                      ${(form.activa && estado === "activo") || (!form.activa && estado === "inactivo")
                        ? estado === "activo"
                          ? "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]"
                          : "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]"
                        : "border-[#E5E7EB] text-[#7F8C8D] hover:bg-[#F5F7FA]"
                      }
                    `}
                  >
                    {estado === "activo" ? "Activa" : "Inactiva"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="px-6 pb-6 flex gap-3 justify-end border-t border-[#E5E7EB] pt-4">
            <button
              onClick={() => setDialogOpen(false)}
              className="px-5 py-2 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#7F8C8D] hover:bg-[#F5F7FA] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.nombre?.trim() || !form.industria}
              className="px-5 py-2 rounded-xl bg-[#003366] text-white text-sm font-semibold hover:bg-[#002244] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingId !== null ? "Guardar cambios" : "Registrar empresa"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}