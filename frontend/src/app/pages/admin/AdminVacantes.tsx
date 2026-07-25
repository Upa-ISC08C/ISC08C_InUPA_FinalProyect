import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Search, Plus, Trash2, Edit, Briefcase, MapPin, Clock } from "lucide-react";
import { jobsService, type Job, type CreateVacanteDTO } from "../../../features/jobs/jobsService";

export function AdminVacantes() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal de creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState<Partial<CreateVacanteDTO>>({
    titulo: "",
    descripcion: "",
    requisitos: "",
    empresa_id: "1", // Mock: en el futuro sería un select de empresas
    modalidad: "Remoto",
    tipo_contrato: "Tiempo completo",
    salario_min: 0,
    salario_max: 0,
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsService.getJobs({ limit: 100 });
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error cargando vacantes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta vacante?")) return;
    try {
      await jobsService.deleteVacante(id); // Ojo: tu backend usa soft delete (activa = false)
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (error) {
      alert("Error al eliminar la vacante");
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await jobsService.createVacante(newJob as CreateVacanteDTO);
      setIsModalOpen(false);
      setNewJob({ titulo: "", descripcion: "", requisitos: "", empresa_id: "1", modalidad: "Remoto", tipo_contrato: "Tiempo completo", salario_min: 0, salario_max: 0 });
      loadJobs();
      alert("Vacante creada exitosamente");
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al crear la vacante");
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.empresa?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E50]">Gestión de Vacantes</h1>
          <p className="text-sm text-[#7F8C8D] mt-1">Administra las oportunidades laborales publicadas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-11 px-6">
          <Plus className="size-4 mr-2" /> Nueva Vacante
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
        <Input
          placeholder="Buscar por título o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 rounded-xl border-[#E5E7EB] text-sm"
        />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#7F8C8D]">Cargando vacantes...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-[#7F8C8D]">No se encontraron vacantes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#7F8C8D] font-semibold">
                <tr>
                  <th className="px-6 py-4">Vacante</th>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Modalidad</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {job.empresa?.nombre?.substring(0, 2).toUpperCase() || "VA"}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C3E50]">{job.titulo}</p>
                          <p className="text-xs text-[#7F8C8D] flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3" /> {job.ubicacion || "No especificada"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#2C3E50]">{job.empresa?.nombre || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E0F2FE] text-[#00A8E8]">
                        {job.modalidad || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#7F8C8D] flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(job.fecha_publicacion).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-[#003366] hover:bg-[#E0F2FE] rounded-lg transition-colors" title="Editar">
                          <Edit className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(job.id)}
                          className="p-2 text-[#E74C3C] hover:bg-[#FEE2E2] rounded-lg transition-colors" 
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Crear Vacante */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
              <Briefcase className="size-5 text-[#003366]" />
              Publicar Nueva Vacante
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Título del puesto</Label>
                <Input required value={newJob.titulo} onChange={(e) => setNewJob({...newJob, titulo: e.target.value})} placeholder="Ej. Desarrollador Frontend Jr." />
              </div>
              <div className="space-y-1.5">
                <Label>ID de Empresa (Mock)</Label>
                <Input required value={newJob.empresa_id} onChange={(e) => setNewJob({...newJob, empresa_id: e.target.value})} placeholder="1" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <textarea 
                required 
                rows={3}
                className="w-full rounded-xl border border-[#D1D5DB] p-3 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none resize-none"
                value={newJob.descripcion}
                onChange={(e) => setNewJob({...newJob, descripcion: e.target.value})}
                placeholder="Describe las responsabilidades del puesto..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Requisitos</Label>
              <textarea 
                required 
                rows={3}
                className="w-full rounded-xl border border-[#D1D5DB] p-3 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none resize-none"
                value={newJob.requisitos}
                onChange={(e) => setNewJob({...newJob, requisitos: e.target.value})}
                placeholder="Ej. React, TypeScript, Git..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Modalidad</Label>
                <select 
                  className="w-full h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm focus:border-[#003366] outline-none bg-white"
                  value={newJob.modalidad}
                  onChange={(e) => setNewJob({...newJob, modalidad: e.target.value})}
                >
                  <option value="Remoto">Remoto</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Salario Mínimo</Label>
                <Input type="number" value={newJob.salario_min} onChange={(e) => setNewJob({...newJob, salario_min: Number(e.target.value)})} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Salario Máximo</Label>
                <Input type="number" value={newJob.salario_max} onChange={(e) => setNewJob({...newJob, salario_max: Number(e.target.value)})} placeholder="0" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Publicar Vacante</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}