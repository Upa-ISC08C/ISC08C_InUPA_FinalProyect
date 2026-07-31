import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Plus, Pencil, Trash2, GraduationCap, AlertTriangle, Loader2, Save } from "lucide-react";
import { adminService } from "../../services/admin.service";

export function AdminCarreras() {
  const [carreras, setCarreras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | "new" | null>(null);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nombre: string } | null>(null);

  const cargar = (silent = false) => {
    if (!silent) setLoading(true);
    adminService.getCarreras()
      .then(setCarreras)
      .catch(() => setCarreras([]))
      .finally(() => { if (!silent) setLoading(false); });
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!nombre.trim()) {
      setError("El nombre de la carrera es obligatorio.");
      return;
    }
    if (nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    
    setSaving(true);
    setError("");
    try {
      if (edit === "new") {
        await adminService.createCarrera({ nombre: nombre.trim() });
      } else {
        await adminService.updateCarrera(edit.id, { nombre: nombre.trim() });
      }
      setEdit(null);
      setNombre("");
      cargar(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Error al guardar. Es posible que el nombre ya exista.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Gestión de Carreras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{carreras.length} carreras registradas en el sistema</p>
        </div>
        <Button onClick={() => { setEdit("new"); setNombre(""); setError(""); }} className="flex items-center gap-1.5">
          <Plus className="size-4" /> Nueva carrera
        </Button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" />{error}</div>}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Nombre de la Carrera</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="px-5 py-8 text-center text-muted-foreground"><Loader2 className="size-5 animate-spin mx-auto" /></td></tr>
                ) : carreras.length === 0 ? (
                  <tr><td colSpan={2} className="px-5 py-8 text-center text-muted-foreground">No hay carreras registradas.</td></tr>
                ) : (
                  carreras.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground flex items-center gap-2">
                        <GraduationCap className="size-4 text-[#003366]" /> {c.nombre}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setEdit(c); setNombre(c.nombre); setError(""); }} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#003366] hover:bg-[#003366]/[0.08] transition-colors">
                            <Pencil className="size-3.5" /> Editar
                          </button>
                          <button onClick={() => setConfirmDelete({ id: c.id, nombre: c.nombre })} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#E74C3C] hover:bg-[#FEE2E2] transition-colors">
                            <Trash2 className="size-3.5" /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Agregar/Editar */}
      {edit && (
        <Dialog open onOpenChange={() => { setEdit(null); setError(""); }}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <DialogHeader>
              <DialogTitle>{edit === "new" ? "Nueva Carrera" : "Editar Carrera"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">{error}</div>}
              <Input 
                autoFocus
                placeholder="Ej. Ingeniería en Sistemas Computacionales" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                className="h-10 rounded-xl border-border"
                onKeyDown={(e) => { if (e.key === "Enter") guardar(); }}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setEdit(null); setError(""); }}>Cancelar</Button>
                <Button onClick={guardar} disabled={saving || !nombre.trim()} className="bg-[#003366] hover:bg-[#002244]">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {confirmDelete && (
        <Dialog open onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <div className="text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 bg-[#E74C3C]">
              <AlertTriangle className="size-5 text-white" />
              <span className="font-extrabold text-sm uppercase tracking-wider">¿Eliminar Carrera?</span>
            </div>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                ¿Estás seguro de que deseas eliminar <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => setConfirmDelete(null)} className="rounded-xl h-10 px-4 active:scale-95 transition-all">Cancelar</Button>
                <Button onClick={async () => {
                  try {
                    await adminService.removeCarrera(confirmDelete.id);
                    setConfirmDelete(null);
                    cargar(true);
                  } catch {
                    setError("No se pudo eliminar. Es posible que esté siendo utilizada por usuarios o vacantes.");
                  }
                }} className="rounded-xl h-10 px-4 text-white bg-[#E74C3C] hover:bg-[#C0392B] active:scale-95 transition-all">
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}