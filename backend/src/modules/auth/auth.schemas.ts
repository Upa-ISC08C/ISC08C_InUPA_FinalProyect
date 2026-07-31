import { z } from "zod";

const emailOrCorreo = z.object({
  email: z.string().email("Debe ser un correo electrónico válido").optional(),
  correo_institucional: z.string().email("Debe ser un correo electrónico válido").optional(),
}).refine(data => data.email || data.correo_institucional, {
  message: "El correo electrónico es requerido",
  path: ["email"],
});

export const registerSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
    email: z.string().email("Debe ser un correo electrónico válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100),
    matricula_o_rfc: z.string().min(4, "La matrícula o RFC debe tener al menos 4 caracteres"),
    carrera: z.string().optional(),
    cuatrimestre: z.union([z.string(), z.number()]).optional(),
  }),
});

export const loginSchema = z.object({
  body: emailOrCorreo.and(
    z.object({
      password: z.string().min(1, "La contraseña es requerida"),
    })
  )
});

export const requestTokenSchema = z.object({
  body: z.object({
    email: z.string().email("Debe ser un correo electrónico válido"),
  }),
});

export const verifyTokenSchema = z.object({
  body: z.object({
    email: z.string().email("Debe ser un correo electrónico válido"),
    token: z.string().min(6, "El código debe tener al menos 6 caracteres"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: emailOrCorreo
});

export const verifyResetTokenSchema = z.object({
  body: emailOrCorreo.and(
    z.object({
      token: z.string().min(6, "El código debe tener al menos 6 caracteres"),
    })
  )
});

export const resetPasswordSchema = z.object({
  body: emailOrCorreo.and(
    z.object({
      token: z.string().min(6, "El código debe tener al menos 6 caracteres"),
      password: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    })
  )
});

export const verifyEmailSchema = z.object({
  body: emailOrCorreo.and(
    z.object({
      token: z.string().min(6, "El código debe tener al menos 6 caracteres"),
    })
  )
});

export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, "El token de Google es requerido"),
  }),
});

