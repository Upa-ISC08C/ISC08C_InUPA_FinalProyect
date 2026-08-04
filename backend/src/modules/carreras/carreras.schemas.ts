import { z } from "zod";

const NOMBRE_CARRERA_REGEX = /^[\p{L}\s.]+$/u;
const nombreCarrera = z
  .string()
  .min(3, "El nombre de la carrera debe tener al menos 3 caracteres")
  .max(150)
  .refine((v) => NOMBRE_CARRERA_REGEX.test(v.trim()), 'El nombre solo puede contener letras y espacios (ej. "Ingeniería en Sistemas Computacionales")');

export const createCarreraSchema = z.object({
  body: z.object({
    nombre: nombreCarrera,
  }),
});

export const updateCarreraSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de la carrera debe ser un UUID válido"),
  }),
  body: z.object({
    nombre: nombreCarrera,
  }),
});

export const carreraIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});
