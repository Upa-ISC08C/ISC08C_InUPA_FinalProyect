import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  Briefcase,
  X,
  ChevronsUpDown,
  Check,
  ImagePlus,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { jobsService } from "../../../services/jobs.service";
import {
  companiesService,
  type Company,
} from "../../../services/companies.service";
import {
  CARRERAS_UPA,
  CUATRIMESTRES,
  TIPOS_CONTRATO,
  MODALIDADES,
} from "../../../utils/catalogos";
import { fileToDataUrl } from "../../../utils/image";
import type { Vacante } from "../../../services/types";

const fmtFecha = (s: string | null) =>
  s
    ? new Date(s).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

export function AdminVacantes() {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Vacante | "new" | null>(null);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todas" | "activas" | "inactivas">(
    "todas",
  );
  const [vista, setVista] = useState<"lista" | "cuadricula">(
    () => (localStorage.getItem("inupa_vacantes_view") as any) || "lista",
  );

  // Estados para confirmaciones
  const [confirm, setConfirm] = useState<{
    id: string;
    titulo: string;
    activa: boolean;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    titulo: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    localStorage.setItem("inupa_vacantes_view", vista);
  }, [vista]);

  const cargar = () => {
    setLoading(true);
    jobsService
      .list({ limit: 100, activa: "all" })
      .then((r) => setVacantes(r.data || []))
      .catch(() => setVacantes([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    cargar();
    companiesService
      .list()
      .then(setEmpresas)
      .catch(() => {});
  }, []);

  const filtradas = useMemo(() => {
    const list = vacantes.filter((v) => {
      const t = (v.titulo + (v.empresa?.nombre || "") + (v.ubicacion || ""))
        .toLowerCase()
        .includes(q.toLowerCase());
      const s =
        estado === "todas" || (estado === "activas" ? v.activa : !v.activa);
      return t && s;
    });
    return list.sort((a, b) => (a.activa === b.activa ? 0 : a.activa ? -1 : 1));
  }, [vacantes, q, estado]);

  const sel = "h-10 rounded-xl border border-border bg-background px-3 text-sm";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Gestión de Vacantes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vacantes.length} vacantes publicadas
          </p>
        </div>
        <Button
          onClick={() => setEdit("new")}
          className="flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Nueva vacante
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, empresa o ubicación..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-10 rounded-xl text-sm"
          />
        </div>
        <select
          className={sel}
          value={estado}
          onChange={(e) => setEstado(e.target.value as any)}
        >
          <option value="todas">Todas</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>
        <div className="ml-auto flex items-center rounded-xl border border-border p-0.5">
          <button
            onClick={() => setVista("lista")}
            title="Vista de lista"
            className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "lista" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => setVista("cuadricula")}
            title="Vista de cuadrícula"
            className={`size-8 flex items-center justify-center rounded-lg transition-colors ${vista === "cuadricula" ? "bg-[#003366] text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-[#003366]" />
        </div>
      ) : filtradas.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 text-center text-muted-foreground">
            <Briefcase className="size-6 mx-auto mb-2" />
            No hay vacantes que coincidan.
          </CardContent>
        </Card>
      ) : vista === "cuadricula" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((v) => (
            <Card
              key={v.id}
              className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="h-28 bg-[#F5F7FA] flex items-center justify-center overflow-hidden">
                {v.imagen_url ? (
                  <img
                    src={v.imagen_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Briefcase className="size-8 text-[#B0B8C1]" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {v.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {v.empresa?.nombre}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none ${v.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}
                  >
                    {v.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {v.modalidad || "—"} · {v.ubicacion || "—"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {v.carreras && v.carreras.length > 0 ? (
                    v.carreras.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#003366]/[0.07] text-[#003366]"
                      >
                        {abreviaCarrera(c)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      Todas las carreras
                    </span>
                  )}
                  {v.cuatrimestre ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {v.cuatrimestre}º+
                    </span>
                  ) : null}
                </div>
                {fmtFecha(v.fecha_limite) && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Cierra el {fmtFecha(v.fecha_limite)}
                  </p>
                )}

                {/* BOTONES DE ACCIÓN: Editar, Desactivar/Activar, Eliminar */}
                <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setEdit(v)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#003366] hover:bg-muted px-2.5 py-1.5 rounded-lg"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      setConfirm({
                        id: v.id,
                        titulo: v.titulo,
                        activa: v.activa,
                      })
                    }
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${v.activa ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}
                  >
                    {v.activa ? (
                      <>
                        <Ban className="size-3.5" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        Activar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDelete({ id: v.id, titulo: v.titulo })
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-[#E74C3C] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded-lg"
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="px-5 py-3 font-semibold">Vacante</th>
                    <th className="px-5 py-3 font-semibold">Empresa</th>
                    <th className="px-5 py-3 font-semibold">Carreras</th>
                    <th className="px-5 py-3 font-semibold">Cuatri</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                    <th className="px-5 py-3 font-semibold text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center flex-none">
                            {v.imagen_url ? (
                              <img
                                src={v.imagen_url}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <Briefcase className="size-4 text-[#B0B8C1]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {v.titulo}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.modalidad || "—"} · {v.ubicacion || "—"}
                              {fmtFecha(v.fecha_limite)
                                ? ` · Cierra ${fmtFecha(v.fecha_limite)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {v.empresa?.nombre}
                      </td>
                      <td className="px-5 py-3">
                        {v.carreras && v.carreras.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {v.carreras.map((c) => (
                              <span
                                key={c}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#003366]/[0.1] text-[#003366]"
                              >
                                {abreviaCarrera(c)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Todas
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {v.cuatrimestre ? `${v.cuatrimestre}º+` : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.activa ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}
                        >
                          {v.activa ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setEdit(v)}
                            className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-[#003366]"
                            title="Editar"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({
                                id: v.id,
                                titulo: v.titulo,
                                activa: v.activa,
                              })
                            }
                            className={`size-8 flex items-center justify-center rounded-lg transition-colors ${v.activa ? "text-[#E74C3C] hover:bg-[#FEE2E2]" : "text-[#16A34A] hover:bg-[#DCFCE7]"}`}
                            title={v.activa ? "Desactivar" : "Activar"}
                          >
                            {v.activa ? (
                              <Ban className="size-4" />
                            ) : (
                              <CheckCircle2 className="size-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({ id: v.id, titulo: v.titulo })
                            }
                            className="size-8 flex items-center justify-center rounded-lg text-[#E74C3C] hover:bg-[#FEE2E2] hover:text-[#E74C3C] transition-colors"
                            title="Eliminar permanentemente"
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
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmación de Desactivar/Activar */}
      {confirm && (
        <Dialog open onOpenChange={() => setConfirm(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 ${confirm.activa ? "bg-[#E74C3C]" : "bg-[#16A34A]"}`}
            >
              <AlertTriangle className="size-5 text-white" />
              <span className="font-extrabold text-sm uppercase tracking-wider">
                {confirm.activa ? "¿Desactivar Vacante?" : "¿Activar Vacante?"}
              </span>
            </div>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                {confirm.activa ? (
                  <>
                    ¿Estás seguro de que deseas desactivar la vacante{" "}
                    <strong>{confirm.titulo}</strong>? Los alumnos ya no podrán
                    postularse a ella.
                  </>
                ) : (
                  <>
                    ¿Deseas activar la vacante <strong>{confirm.titulo}</strong>{" "}
                    para que los alumnos puedan volver a postularse?
                  </>
                )}
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setConfirm(null)}
                  className="rounded-xl h-10 px-4 active:scale-95 transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    const id = confirm.id;
                    const nuevoEstado = !confirm.activa;
                    setConfirm(null);
                    setVacantes((prev) =>
                      prev.map((x) =>
                        x.id === id ? { ...x, activa: nuevoEstado } : x,
                      ),
                    );
                    try {
                      await jobsService.update(id, { activa: nuevoEstado });
                      cargar();
                    } catch {
                      setVacantes((prev) =>
                        prev.map((x) =>
                          x.id === id ? { ...x, activa: confirm.activa } : x,
                        ),
                      );
                    }
                  }}
                  className={`rounded-xl h-10 px-4 text-white active:scale-95 transition-all ${confirm.activa ? "bg-[#E74C3C] hover:bg-[#C0392B]" : "bg-[#16A34A] hover:bg-[#15803d]"}`}
                >
                  {confirm.activa ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmación de ELIMINACIÓN REAL (Hard Delete) */}
      {confirmDelete && (
        <Dialog
          open
          onOpenChange={() => {
            setConfirmDelete(null);
            setDeleteError("");
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
            <div className="text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14 bg-[#E74C3C]">
              <AlertTriangle className="size-5 text-white" />
              <span className="font-extrabold text-sm uppercase tracking-wider">
                ¿Eliminar permanentemente?
              </span>
            </div>
            <div className="space-y-4 mt-4">
              {deleteError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" /> {deleteError}
                </div>
              )}
              <p className="text-sm text-foreground leading-relaxed">
                ¿Estás seguro de que deseas eliminar la vacante{" "}
                <strong>{confirmDelete.titulo}</strong>? Esta acción no se puede
                deshacer.
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmDelete(null);
                    setDeleteError("");
                  }}
                  className="rounded-xl h-10 px-4 active:scale-95 transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await jobsService.remove(confirmDelete.id);
                      setConfirmDelete(null);
                      setDeleteError("");
                      cargar();
                    } catch (e: any) {
                      setDeleteError(
                        e?.response?.data?.error ||
                          "No se pudo eliminar la vacante.",
                      );
                    }
                  }}
                  className="rounded-xl h-10 px-4 text-white bg-[#E74C3C] hover:bg-[#C0392B] active:scale-95 transition-all"
                >
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {edit && (
        <VacanteDialog
          item={edit === "new" ? null : edit}
          empresas={empresas}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

// Abrevia el nombre de la carrera para las etiquetas (ISC, Mecatrónica, ...).
function abreviaCarrera(c: string): string {
  if (c.includes("Sistemas Computacionales")) return "ISC";
  if (c.includes("Sistemas Estratégicos")) return "ISEI";
  if (c.includes("Tecnologías")) return "ITI";
  if (c.includes("Administración")) return "LAGE";
  return c.replace(/^Ingeniería en |^Ingeniería |^Licenciatura en /, "");
}

// ---------------------------------------------------------------------------
// Combobox de empresa con búsqueda.
// ---------------------------------------------------------------------------
function EmpresaCombo({
  empresas,
  value,
  onChange,
  invalid,
}: {
  empresas: Company[];
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const seleccionada = empresas.find((e) => e.id === value);
  const filtradas = empresas.filter((e) =>
    e.nombre.toLowerCase().includes(q.toLowerCase()),
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-10 rounded-xl border px-3 text-sm bg-white flex items-center justify-between text-left ${invalid ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20" : "border-[#D1D5DB]"}`}
      >
        <span className={seleccionada ? "text-[#2C3E50]" : "text-[#9CA3AF]"}>
          {seleccionada?.nombre || "Selecciona empresa…"}
        </span>
        <ChevronsUpDown className="size-4 text-[#7F8C8D] shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          <div className="p-2 border-b border-[#F5F7FA]">
            <Input
              autoFocus
              placeholder="Buscar empresa…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtradas.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  onChange(e.id);
                  setOpen(false);
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F7FA] flex items-center justify-between"
              >
                <span className="text-[#2C3E50]">{e.nombre}</span>
                {e.id === value && <Check className="size-4 text-[#003366]" />}
              </button>
            ))}
            {filtradas.length === 0 && (
              <p className="px-3 py-3 text-xs text-[#7F8C8D] text-center">
                Sin resultados.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function VacanteDialog({
  item,
  empresas,
  onClose,
  onSaved,
}: {
  item: Vacante | null;
  empresas: Company[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState(1);
  const [noEspecificarSalario, setNoEspecificarSalario] = useState(
    !item?.salario_min && !item?.salario_max,
  );
  const [form, setForm] = useState({
    titulo: item?.titulo || "",
    descripcion: item?.descripcion || "",
    empresa_id: item?.empresa_id || "",
    salario_min: item?.salario_min?.toString() || "",
    salario_max: item?.salario_max?.toString() || "",
    modalidad: item?.modalidad || "Presencial",
    tipo_contrato: item?.tipo_contrato || TIPOS_CONTRATO[0],
    nivel_experiencia: item?.nivel_experiencia || "Junior",
    ubicacion: item?.ubicacion || "",
    activa: item?.activa ?? true,
    cuatrimestre: item?.cuatrimestre ? String(item.cuatrimestre) : "",
    fecha_limite: item?.fecha_limite ? item.fecha_limite.slice(0, 10) : "",
  });
  const [imagen, setImagen] = useState<string>(item?.imagen_url || "");
  const [imgError, setImgError] = useState("");
  const [requisitos, setRequisitos] = useState<string[]>(() =>
    (item?.requisitos || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const [reqInput, setReqInput] = useState("");
  const [carreras, setCarreras] = useState<string[]>(item?.carreras || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const set = (k: string, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (v) {
      setFieldErrors((errs) => {
        const next = { ...errs };
        delete next[k];
        return next;
      });
    }
  };

  const subirImagen = async (file?: File) => {
    if (!file) return;
    setImgError("");
    if (file.size > 50 * 1024 * 1024) {
      setImgError(
        "La imagen supera el límite de tamaño permitido (máximo 50MB).",
      );
      return;
    }
    try {
      setImagen(await fileToDataUrl(file, 900, 0.82));
    } catch {
      setImgError("No se pudo procesar la imagen.");
    }
  };
  const addReq = () => {
    const t = reqInput.trim();
    if (t && !requisitos.includes(t)) {
      setRequisitos((r) => [...r, t]);
      setFieldErrors((errs) => {
        const next = { ...errs };
        delete next.requisitos;
        return next;
      });
    }
    setReqInput("");
  };
  const removeReq = (r: string) => {
    setRequisitos((rs) => {
      const next = rs.filter((x) => x !== r);
      if (next.length === 0) {
        setFieldErrors((errs) => ({ ...errs, requisitos: true }));
      }
      return next;
    });
  };
  const toggleCarrera = (c: string) =>
    setCarreras((cs) =>
      cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c],
    );

  const irAPaso = (p: number) => {
    setError("");
    if (p > step) {
      const errs: Record<string, boolean> = {};
      if (step === 1) {
        if (!form.titulo.trim()) errs.titulo = true;
        if (!form.empresa_id) errs.empresa_id = true;
        if (Object.keys(errs).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...errs }));
          setError(
            "Por favor completa los campos requeridos marcados en rojo.",
          );
          return;
        }
      }
      if (step === 2) {
        if (!form.descripcion.trim()) errs.descripcion = true;
        if (requisitos.length === 0) errs.requisitos = true;
        if (Object.keys(errs).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...errs }));
          if (errs.requisitos && !errs.descripcion) {
            setError("Por favor agrega al menos un requisito.");
          } else {
            setError(
              "Por favor completa los campos requeridos marcados en rojo.",
            );
          }
          return;
        }
      }
    }
    setStep(p);
  };

  const nextStep = () => {
    setError("");
    const errs: Record<string, boolean> = {};
    if (step === 1) {
      if (!form.titulo.trim()) errs.titulo = true;
      if (!form.empresa_id) errs.empresa_id = true;
      if (Object.keys(errs).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errs }));
        setError("Por favor completa los campos requeridos marcados en rojo.");
        return;
      }
    }
    if (step === 2) {
      if (!form.descripcion.trim()) errs.descripcion = true;
      if (requisitos.length === 0) errs.requisitos = true;
      if (Object.keys(errs).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errs }));
        if (errs.requisitos && !errs.descripcion) {
          setError("Por favor agrega al menos un requisito.");
        } else {
          setError(
            "Por favor completa los campos requeridos marcados en rojo.",
          );
        }
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const guardar = async () => {
    const errs: Record<string, boolean> = {};
    if (!form.titulo.trim()) errs.titulo = true;
    if (!form.empresa_id) errs.empresa_id = true;
    if (!form.descripcion.trim()) errs.descripcion = true;
    if (requisitos.length === 0) errs.requisitos = true;

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.requisitos && Object.keys(errs).length === 1) {
        setError("Por favor agrega al menos un requisito.");
      } else {
        setError("Por favor completa los campos requeridos marcados en rojo.");
      }
      if (errs.titulo || errs.empresa_id) setStep(1);
      else if (errs.descripcion || errs.requisitos) setStep(2);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload: any = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        requisitos: requisitos.join("\n"),
        empresa_id: form.empresa_id,
        salario_min: noEspecificarSalario
          ? null
          : form.salario_min
            ? Number(form.salario_min)
            : undefined,
        salario_max: noEspecificarSalario
          ? null
          : form.salario_max
            ? Number(form.salario_max)
            : undefined,
        modalidad: form.modalidad,
        tipo_contrato: form.tipo_contrato,
        nivel_experiencia: form.nivel_experiencia,
        ubicacion: form.ubicacion,
        carreras,
        cuatrimestre: form.cuatrimestre ? Number(form.cuatrimestre) : null,
        fecha_limite: form.fecha_limite || null,
        imagen_url: imagen || null,
      };
      if (item)
        await jobsService.update(item.id, { ...payload, activa: form.activa });
      else await jobsService.create(payload);
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.error || "Ha ocurrido un error, por favor contacta a un administrador");
    } finally {
      setSaving(false);
    }
  };

  const sel =
    "w-full h-10 rounded-xl border border-border px-3 text-sm bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] transition-all";
  const nivelesExperiencia = [
    "Sin experiencia",
    "Prácticas / Estadías",
    "Junior",
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border-0 shadow-2xl p-6 bg-background animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#001A33] text-white px-6 py-4 rounded-t-2xl flex items-center gap-2 -mx-6 -mt-6 border-b border-white/10 h-14">
          <Briefcase className="size-5 text-[#00A8E8]" />
          <span className="font-extrabold text-sm uppercase tracking-wider">
            {item ? "Editar Vacante" : "Nueva Vacante"}
          </span>
        </div>

        <div className="flex border-b border-border -mx-6 px-6 bg-muted/10 select-none">
          {[
            { step: 1, label: "Datos Básicos" },
            { step: 2, label: "Descripción y Requisitos" },
            { step: 3, label: "Filtros y Salario" },
          ].map((t) => {
            const active = step === t.step;
            return (
              <button
                key={t.step}
                type="button"
                onClick={() => irAPaso(t.step)}
                className={`py-3.5 px-4 text-xs font-bold transition-all relative border-b-2 -mb-px outline-none ${active ? "text-[#003366] border-[#FFD700]" : "text-muted-foreground hover:text-foreground border-transparent"}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-5 mt-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <F label="Título de la vacante *" invalid={fieldErrors.titulo}>
                <Input
                  value={form.titulo}
                  onChange={(e) => set("titulo", e.target.value)}
                  className={`rounded-xl h-10 bg-muted/20 focus-visible:ring-[#003366] ${fieldErrors.titulo ? "border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0" : "border-border"}`}
                  placeholder="Ej. Desarrollador Frontend React"
                />
              </F>
              <F label="Empresa convocante *" invalid={fieldErrors.empresa_id}>
                <EmpresaCombo
                  empresas={empresas}
                  value={form.empresa_id}
                  onChange={(id) => set("empresa_id", id)}
                  invalid={fieldErrors.empresa_id}
                />
              </F>
              <div className="grid grid-cols-2 gap-4">
                <F label="Modalidad">
                  <div className="flex gap-2">
                    {["Presencial", "Remoto", "Híbrido"].map((mod) => {
                      const active = form.modalidad === mod;
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => {
                            set("modalidad", mod);
                            if (mod === "Remoto") {
                              set("ubicacion", "Remoto");
                            } else if (form.ubicacion === "Remoto") {
                              set("ubicacion", "");
                            }
                          }}
                          className={`flex-1 h-10 rounded-xl text-xs font-bold border transition-all active:scale-95 ${active ? "bg-[#003366] text-white border-[#003366] shadow" : "bg-background text-muted-foreground border-border hover:border-[#003366] hover:text-[#003366]"}`}
                        >
                          {mod}
                        </button>
                      );
                    })}
                  </div>
                </F>
                <F label="Tipo de contrato">
                  <select
                    className={sel}
                    value={form.tipo_contrato}
                    onChange={(e) => set("tipo_contrato", e.target.value)}
                  >
                    {TIPOS_CONTRATO.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </F>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Experiencia requerida *">
                  <div className="flex gap-2">
                    {nivelesExperiencia.map((lvl) => {
                      const active = form.nivel_experiencia === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => set("nivel_experiencia", lvl)}
                          className={`flex-1 h-10 rounded-xl text-[10px] font-bold border transition-all active:scale-95 leading-tight p-1 ${active ? "bg-[#003366] text-white border-[#003366] shadow" : "bg-background text-muted-foreground border-border hover:border-[#003366] hover:text-[#003366]"}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </F>
                <F label="Ubicación (Ciudad o Remoto)">
                  <Input
                    value={form.ubicacion}
                    onChange={(e) => set("ubicacion", e.target.value)}
                    className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]"
                    placeholder="Ej. Aguascalientes, Ags. o Remoto"
                  />
                </F>
              </div>
              <F label="Imagen o Banner de la vacante">
                <div className="rounded-2xl border-2 border-dashed border-border p-4 bg-muted/10 transition-all hover:bg-muted/20">
                  {imagen ? (
                    <div className="relative rounded-xl overflow-hidden group shadow-sm">
                      <img
                        src={imagen}
                        alt="Vista previa"
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImagen("")}
                        className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 py-4 cursor-pointer text-muted-foreground hover:text-[#003366] transition-colors select-none">
                      <div className="size-9 rounded-full bg-muted flex items-center justify-center">
                        <ImagePlus className="size-5 text-[#00A8E8]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                        Subir Banner de Vacante
                      </span>
                      <span className="text-[9px] text-muted-foreground/70 mt-0.5">
                        Máximo 50MB (PNG, JPG)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => subirImagen(e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
                {imgError && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1.5">
                    {imgError}
                  </p>
                )}
              </F>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <F
                label="Descripción del puesto *"
                invalid={fieldErrors.descripcion}
              >
                <Textarea
                  rows={5}
                  value={form.descripcion}
                  onChange={(e) => set("descripcion", e.target.value)}
                  className={`rounded-xl bg-muted/20 focus-visible:ring-[#003366] resize-none ${fieldErrors.descripcion ? "border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0" : "border-border"}`}
                  placeholder="Describe el rol, responsabilidades y lo que ofrece la empresa..."
                />
              </F>
              <F label="Requisitos *" invalid={fieldErrors.requisitos}>
                <div className="flex gap-2">
                  <Input
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addReq();
                      }
                    }}
                    placeholder="Escribe un requisito y presiona Enter"
                    className={`rounded-xl h-10 bg-muted/20 focus-visible:ring-[#003366] ${fieldErrors.requisitos ? "border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0" : "border-border"}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addReq}
                    className="shrink-0 rounded-xl h-10 px-3"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                {requisitos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {requisitos.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted border border-border"
                      >
                        {r}
                        <button type="button" onClick={() => removeReq(r)}>
                          <X className="size-3.5 text-muted-foreground hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </F>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-4">
                <F label="Salario mínimo ($ MXN)">
                  <Input
                    type="number"
                    disabled={noEspecificarSalario}
                    value={form.salario_min}
                    onChange={(e) => set("salario_min", e.target.value)}
                    className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366] disabled:opacity-50"
                  />
                </F>
                <F label="Salario máximo ($ MXN)">
                  <Input
                    type="number"
                    disabled={noEspecificarSalario}
                    value={form.salario_max}
                    onChange={(e) => set("salario_max", e.target.value)}
                    className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366] disabled:opacity-50"
                  />
                </F>
              </div>
              <label className="flex items-center gap-2.5 text-xs text-[#2C3E50] cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={noEspecificarSalario}
                  onChange={(e) => setNoEspecificarSalario(e.target.checked)}
                  className="size-4 rounded border-border text-[#003366] focus:ring-[#003366]"
                />{" "}
                Sueldo a convenir
              </label>
              <div className="grid grid-cols-2 gap-4">
                <F label="Cuatrimestre mínimo">
                  <select
                    className={sel}
                    value={form.cuatrimestre}
                    onChange={(e) => set("cuatrimestre", e.target.value)}
                  >
                    <option value="">Cualquiera</option>
                    {CUATRIMESTRES.map((n) => (
                      <option key={n} value={n}>
                        {n}º en adelante
                      </option>
                    ))}
                  </select>
                </F>
                <F label="Fecha límite">
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.fecha_limite}
                    onChange={(e) => set("fecha_limite", e.target.value)}
                    className="rounded-xl h-10 border-border bg-muted/20 focus-visible:ring-[#003366]"
                  />
                </F>
              </div>
              <F label="Carreras dirigidas">
                <div className="flex flex-wrap gap-2 rounded-2xl border border-border p-3 bg-muted/10">
                  {CARRERAS_UPA.map((c) => {
                    const on = carreras.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCarrera(c)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${on ? "bg-[#003366] text-white border-[#003366]" : "bg-background text-muted-foreground border-border hover:border-[#003366]"}`}
                      >
                        {abreviaCarrera(c)}
                      </button>
                    );
                  })}
                </div>
              </F>
              {item && (
                <label className="flex items-center gap-2.5 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.activa}
                    onChange={(e) => set("activa", e.target.checked)}
                    className="size-4"
                  />{" "}
                  Vacante activa
                </label>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center gap-3 mt-6 pt-3 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-10 font-bold text-xs"
          >
            Cancelar
          </Button>
          {step < 3 ? (
            <Button
              onClick={nextStep}
              className="bg-[#003366] text-white rounded-xl h-10 px-5 font-bold text-xs"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={guardar}
              disabled={saving}
              className="bg-[#003366] text-white rounded-xl h-10 px-5 font-bold text-xs"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}{" "}
              Guardar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children, invalid }: any) {
  return (
    <div className="space-y-1.5">
      <Label
        className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${invalid ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
