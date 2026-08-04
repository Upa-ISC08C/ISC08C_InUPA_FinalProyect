import { z } from "zod";
import { urlOpcional } from "../../shared/zodHelpers";

// formato AAAA-MM-DD (columnas DATE), no el datetime completo que exige z.string().datetime()
const fechaSimple = (mensaje = "Debe ser una fecha válida (AAAA-MM-DD)") =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, mensaje);

export const addExperienciaSchema = z.object({
  body: z.object({
    puesto: z.string().min(2, "El puesto debe tener al menos 2 caracteres").max(100),
    empresa_nombre: z.string().max(100).optional().nullable(),
    fecha_inicio: fechaSimple(),
    fecha_fin: fechaSimple().optional().nullable(),
    actual: z.boolean().optional(),
    descripcion: z.string().max(1000).optional().nullable(),
    actividades: z.array(z.object({
      actividad: z.string(),
      descripcion: z.string().optional()
    })).optional().nullable(),
    tipo_contrato: z.string().max(50).optional().nullable(),
    tecnologias_usadas: z.array(z.string()).optional().nullable(),
  }),
});

export const updateExperienciaSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de experiencia debe ser un UUID válido"),
  }),
  body: z.object({
    puesto: z.string().min(2).max(100).optional(),
    empresa_nombre: z.string().max(100).optional().nullable(),
    fecha_inicio: fechaSimple().optional(),
    fecha_fin: fechaSimple().optional().nullable(),
    actual: z.boolean().optional(),
    descripcion: z.string().max(1000).optional().nullable(),
    actividades: z.array(z.object({
      actividad: z.string(),
      descripcion: z.string().optional()
    })).optional().nullable(),
    tipo_contrato: z.string().max(50).optional().nullable(),
    tecnologias_usadas: z.array(z.string()).optional().nullable(),
  }),
});

export const addEducacionSchema = z.object({
  body: z.object({
    institucion: z.string().min(2, "La institución debe tener al menos 2 caracteres").max(100),
    carrera_o_grado: z.string().min(2).max(100),
    nivel_estudios: z.string().max(50).optional().nullable(),
    fecha_inicio: fechaSimple(),
    fecha_fin: fechaSimple().optional().nullable(),
    graduado: z.boolean().optional(),
    promedio: z.number().min(0).max(100).optional().nullable(),
  }),
});

export const updateEducacionSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de educación debe ser un UUID válido"),
  }),
  body: z.object({
    institucion: z.string().min(2).max(100).optional(),
    carrera_o_grado: z.string().min(2).max(100).optional(),
    nivel_estudios: z.string().max(50).optional().nullable(),
    fecha_inicio: fechaSimple().optional(),
    fecha_fin: fechaSimple().optional().nullable(),
    graduado: z.boolean().optional(),
    promedio: z.number().min(0).max(100).optional().nullable(),
  }),
});

export const addProyectoSchema = z.object({
  body: z.object({
    nombre_proyecto: z.string().min(2, "El nombre del proyecto es obligatorio").max(100),
    descripcion: z.string().max(1000).optional().nullable(),
    url_repositorio: urlOpcional(),
    url_despliegue: urlOpcional(),
    fecha_realizacion: fechaSimple().optional().nullable(),
    tecnologias: z.array(z.string()).optional().nullable(),
    rol_en_proyecto: z.string().max(100).optional().nullable(),
  }),
});

export const updateProyectoSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de proyecto debe ser un UUID válido"),
  }),
  body: z.object({
    nombre_proyecto: z.string().min(2).max(100).optional(),
    descripcion: z.string().max(1000).optional().nullable(),
    url_repositorio: urlOpcional(),
    url_despliegue: urlOpcional(),
    fecha_realizacion: fechaSimple().optional().nullable(),
    tecnologias: z.array(z.string()).optional().nullable(),
    rol_en_proyecto: z.string().max(100).optional().nullable(),
  }),
});

export const addHabilidadSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, "El nombre de la habilidad es obligatorio").max(50),
    nivel: z.string().max(50).optional().nullable(),
    anos_experiencia: z.number().min(0).max(50).optional().nullable(),
  }),
});

export const idParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});
