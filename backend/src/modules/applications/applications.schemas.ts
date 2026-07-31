import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    vacante_id: z.string().uuid("El ID de la vacante debe ser un UUID válido"),
    cv_adaptado_id: z.string().uuid("El ID del CV debe ser un UUID válido").optional().nullable(),
    carta_presentacion: z.string().max(2000).optional().nullable(),
  }),
});

export const updateApplicationSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de la aplicación debe ser un UUID válido"),
  }),
  body: z.object({
    estado: z.enum(["pendiente", "revisada", "aceptada", "rechazada"]),
  }),
});

export const applicationFiltersSchema = z.object({
  query: z.object({
    vacante_id: z.string().uuid().optional(),
    estado: z.enum(["pendiente", "revisada", "aceptada", "rechazada"]).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const applicationIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});

