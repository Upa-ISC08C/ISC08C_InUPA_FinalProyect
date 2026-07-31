import { z } from "zod";

export const createCompanySchema = z.object({
  body: z.object({
    nombre: z.string().min(3, "El nombre de la empresa debe tener al menos 3 caracteres").max(100),
    industria: z.string().max(100).optional().nullable(),
    descripcion: z.string().max(1000).optional().nullable(),
    sitio_web: z.string().url("Debe ser una URL válida").optional().nullable(),
    logo_url: z.string().url("Debe ser una URL válida").optional().nullable(),
    correo_contacto: z.string().email("Debe ser un correo electrónico válido").optional().nullable(),
    telefono: z.string().min(10).max(20).optional().nullable(),
    ciudad: z.string().max(100).optional().nullable(),
    direccion: z.string().max(255).optional().nullable(),
    tamano: z.string().max(50).optional().nullable(),
    activa: z.boolean().optional(),
  }),
});

export const updateCompanySchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID de la empresa debe ser un UUID válido"),
  }),
  body: z.object({
    nombre: z.string().min(3).max(100).optional(),
    industria: z.string().max(100).optional().nullable(),
    descripcion: z.string().max(1000).optional().nullable(),
    sitio_web: z.string().url().optional().nullable(),
    logo_url: z.string().url().optional().nullable(),
    correo_contacto: z.string().email().optional().nullable(),
    telefono: z.string().min(10).max(20).optional().nullable(),
    ciudad: z.string().max(100).optional().nullable(),
    direccion: z.string().max(255).optional().nullable(),
    tamano: z.string().max(50).optional().nullable(),
    activa: z.boolean().optional(),
  }),
});

export const companyIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});

