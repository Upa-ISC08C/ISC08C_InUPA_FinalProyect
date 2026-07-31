import { z } from "zod";

export const updateUserProfileSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3).max(100).optional(),
    carrera: z.string().optional().nullable(),
    cuatrimestre: z.number().min(1).max(12).optional().nullable(),
    titular_profesional: z.string().max(100).optional().nullable(),
    biografia: z.string().max(500).optional().nullable(),
    url_foto: z.string().url().optional().nullable(),
    github_url: z.string().url().optional().nullable(),
    linkedin_url: z.string().url().optional().nullable(),
    telefono: z.string().min(10).max(20).optional().nullable(),
    ubicacion: z.string().max(100).optional().nullable(),
    disponibilidad: z.boolean().optional(),
    buscando_empleo: z.boolean().optional(),
    nivel_experiencia: z.string().optional().nullable(),
  }),
});

export const adminCreateUserSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
    email: z.string().email("Debe ser un correo electrónico válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100),
    matricula_o_rfc: z.string().min(4, "La matrícula o RFC es obligatorio"),
    rol: z.enum(["admin", "empresa", "estudiante"]).optional(),
    carrera: z.string().optional().nullable(),
    cuatrimestre: z.number().min(1).max(12).optional().nullable(),
  }),
});

export const adminUpdateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
  body: z.object({
    nombre_completo: z.string().min(3).max(100).optional(),
    activo: z.boolean().optional(),
    rol: z.enum(["admin", "empresa", "estudiante"]).optional(),
    carrera: z.string().optional().nullable(),
    cuatrimestre: z.number().min(1).max(12).optional().nullable(),
    // Mas los campos del perfil
    titular_profesional: z.string().max(100).optional().nullable(),
    biografia: z.string().max(500).optional().nullable(),
    url_foto: z.string().url().optional().nullable(),
    github_url: z.string().url().optional().nullable(),
    linkedin_url: z.string().url().optional().nullable(),
    telefono: z.string().min(10).max(20).optional().nullable(),
    ubicacion: z.string().max(100).optional().nullable(),
    disponibilidad: z.boolean().optional(),
    buscando_empleo: z.boolean().optional(),
    nivel_experiencia: z.string().optional().nullable(),
  }),
});

export const userIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});

