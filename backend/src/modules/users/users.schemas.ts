import { z } from "zod";
import { urlOpcional, telefonoOpcional } from "../../shared/zodHelpers";

// Estudiantes: UP + 6 dígitos (ej. UP230253). Admins: ADMIN + 3 a 6 dígitos
// (ej. ADMIN001) — antes se aceptaba cualquier texto como "ADMIN1".
const MATRICULA_ESTUDIANTE = /^UP\d{6}$/;
const MATRICULA_ADMIN = /^ADMIN\d{3,6}$/;

export const validarFormatoMatricula = (matricula: string, rol?: string): boolean => {
  if (rol === "admin") return MATRICULA_ADMIN.test(matricula);
  if (rol === "estudiante" || rol === undefined) return MATRICULA_ESTUDIANTE.test(matricula);
  return matricula.trim().length >= 4;
};

export const updateUserProfileSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3).max(100).optional(),
    carrera: z.string().optional().nullable(),
    cuatrimestre: z.number().min(1).max(12).optional().nullable(),
    titular_profesional: z.string().max(100).optional().nullable(),
    biografia: z.string().max(500).optional().nullable(),
    url_foto: urlOpcional("La foto debe ser una URL válida"),
    github_url: urlOpcional(),
    linkedin_url: urlOpcional(),
    telefono: telefonoOpcional(),
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
    // Opcional: si se deja en blanco, el servidor genera una matrícula
    // válida automáticamente (ver UsersService.adminCreate).
    matricula_o_rfc: z.string().optional(),
    rol: z.enum(["admin", "empresa", "estudiante"]).optional(),
    carrera: z.string().optional().nullable(),
    cuatrimestre: z.number().min(1).max(12).optional().nullable(),
  }).superRefine((data, ctx) => {
    if (data.matricula_o_rfc && !validarFormatoMatricula(data.matricula_o_rfc, data.rol)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matricula_o_rfc"],
        message: data.rol === "admin"
          ? "La matrícula de administrador debe tener el formato ADMIN seguido de 3 a 6 dígitos (ej. ADMIN001)"
          : "La matrícula debe tener el formato UP seguido de 6 dígitos (ej. UP230253)",
      });
    }
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
    matricula_o_rfc: z.string().min(4, "La matrícula o RFC es obligatorio").optional(),
    carrera: z.string().optional().nullable(),
    cuatrimestre: z.number().min(1).max(12).optional().nullable(),
    // Mas los campos del perfil
    titular_profesional: z.string().max(100).optional().nullable(),
    biografia: z.string().max(500).optional().nullable(),
    url_foto: urlOpcional("La foto debe ser una URL válida"),
    github_url: urlOpcional(),
    linkedin_url: urlOpcional(),
    telefono: telefonoOpcional(),
    ubicacion: z.string().max(100).optional().nullable(),
    disponibilidad: z.boolean().optional(),
    buscando_empleo: z.boolean().optional(),
    nivel_experiencia: z.string().optional().nullable(),
  }).superRefine((data, ctx) => {
    if (data.matricula_o_rfc !== undefined && !validarFormatoMatricula(data.matricula_o_rfc, data.rol)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matricula_o_rfc"],
        message: data.rol === "admin"
          ? "La matrícula de administrador debe tener el formato ADMIN seguido de 3 a 6 dígitos (ej. ADMIN001)"
          : "La matrícula debe tener el formato UP seguido de 6 dígitos (ej. UP230253)",
      });
    }
  }),
});

export const userIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});
