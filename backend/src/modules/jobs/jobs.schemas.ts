import { z } from "zod";
import { urlOpcional, textoLibreOpcional } from "../../shared/zodHelpers";

export const createVacanteSchema = z.object({
  body: z.object({
    titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    requisitos: z.string().min(5, "Los requisitos son obligatorios"),
    empresa_id: z.string().uuid("El ID de la empresa debe ser un UUID válido"),
    url_origen: urlOpcional(),
    salario_min: z.number().min(0, "El salario mínimo no puede ser negativo").optional().nullable(),
    salario_max: z.number().min(0, "El salario máximo no puede ser negativo").optional().nullable(),
    modalidad: z.string().optional(),
    tipo_contrato: z.string().optional(),
    nivel_experiencia: z.string().optional(),
    ubicacion: textoLibreOpcional(100, "La ubicación contiene caracteres no permitidos"),
    carreras: z.array(z.string()).optional(),
    cuatrimestre: z.number().min(1).max(10).optional().nullable(),
    fecha_limite: z.string().min(1, "La fecha límite es obligatoria").refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
    imagen_url: urlOpcional(),
    habilidades_ids: z.array(z.string().uuid()).optional(),
  }).refine(
    (data) => {
      if (data.salario_min != null && data.salario_max != null) {
        return data.salario_max >= data.salario_min;
      }
      return true;
    },
    {
      message: "El salario máximo no puede ser menor al salario mínimo",
      path: ["salario_max"],
    }
  )
});

export const updateVacanteSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de la vacante debe ser un UUID válido"),
  }),
  body: z.object({
    titulo: z.string().min(3).optional(),
    descripcion: z.string().min(10).optional(),
    requisitos: z.string().min(5).optional(),
    url_origen: urlOpcional(),
    salario_min: z.number().min(0).optional().nullable(),
    salario_max: z.number().min(0).optional().nullable(),
    modalidad: z.string().optional(),
    tipo_contrato: z.string().optional(),
    nivel_experiencia: z.string().optional(),
    ubicacion: textoLibreOpcional(100, "La ubicación contiene caracteres no permitidos"),
    carreras: z.array(z.string()).optional(),
    cuatrimestre: z.number().min(1).max(10).optional().nullable(),
    fecha_limite: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha inválida").optional().nullable(),
    imagen_url: urlOpcional(),
    activa: z.boolean().optional(),
    habilidades_ids: z.array(z.string().uuid()).optional(),
  }).refine(
    (data) => {
      if (data.salario_min != null && data.salario_max != null) {
        return data.salario_max >= data.salario_min;
      }
      return true;
    },
    {
      message: "El salario máximo no puede ser menor al salario mínimo",
      path: ["salario_max"],
    }
  )
});

export const vacanteParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});

export const vacanteFiltersSchema = z.object({
  query: z.object({
    activa: z.enum(["true", "false", "all"]).optional(),
    modalidad: z.string().optional(),
    tipo_contrato: z.string().optional(),
    nivel_experiencia: z.string().optional(),
    ubicacion: z.string().optional(),
    salario_min: z.string().regex(/^\d+$/).transform(Number).optional(),
    salario_max: z.string().regex(/^\d+$/).transform(Number).optional(),
    carrera: z.string().optional(),
    cuatrimestre: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

