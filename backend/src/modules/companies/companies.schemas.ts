import { z } from "zod";
import { urlOpcional, telefonoOpcional, textoLibreOpcional, correoEstricto, tamanoEmpresaOpcional, soloLetrasOpcional } from "../../shared/zodHelpers";

export const createCompanySchema = z.object({
  body: z.object({
    nombre: z.string().min(3, "El nombre de la empresa debe tener al menos 3 caracteres").max(100),
    industria: z.string().max(100).optional().nullable(),
    descripcion: textoLibreOpcional(1000, "La descripción contiene caracteres no permitidos"),
    sitio_web: urlOpcional("El sitio web debe ser una URL válida"),
    logo_url: urlOpcional("El logo debe ser una URL válida"),
    correo_contacto: correoEstricto(),
    telefono: telefonoOpcional(),
    ciudad: soloLetrasOpcional(100, "La ciudad solo puede contener letras"),
    direccion: textoLibreOpcional(255, "La dirección contiene caracteres no permitidos"),
    tamano: tamanoEmpresaOpcional(),
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
    descripcion: textoLibreOpcional(1000, "La descripción contiene caracteres no permitidos"),
    sitio_web: urlOpcional("El sitio web debe ser una URL válida"),
    logo_url: urlOpcional("El logo debe ser una URL válida"),
    correo_contacto: correoEstricto(),
    telefono: telefonoOpcional(),
    ciudad: soloLetrasOpcional(100, "La ciudad solo puede contener letras"),
    direccion: textoLibreOpcional(255, "La dirección contiene caracteres no permitidos"),
    tamano: tamanoEmpresaOpcional(),
    activa: z.boolean().optional(),
  }),
});

export const companyIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});
