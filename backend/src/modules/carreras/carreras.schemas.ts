import { z } from "zod";

export const createCarreraSchema = z.object({
  body: z.object({
    nombre: z.string().min(3, "El nombre de la carrera debe tener al menos 3 caracteres").max(150),
  }),
});

export const updateCarreraSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de la carrera debe ser un UUID válido"),
  }),
  body: z.object({
    nombre: z.string().min(3).max(150),
  }),
});

export const carreraIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});

