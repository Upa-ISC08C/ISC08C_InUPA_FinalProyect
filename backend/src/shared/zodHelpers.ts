import { z } from "zod";

const TIENE_ESQUEMA = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/** URL opcional: acepta vacío, antepone https:// si falta y respeta esquemas ya presentes (data:, blob:, etc). */
export const urlOpcional = (mensaje = "Debe ser una URL válida") =>
  z
    .string()
    .trim()
    .transform((valor) => {
      if (valor === "") return "";
      if (TIENE_ESQUEMA.test(valor)) return valor;
      return `https://${valor}`;
    })
    .refine((valor) => {
      if (valor === "") return true;
      if (/^data:image\//i.test(valor)) return true;
      return /^https?:\/\/.+\..+/i.test(valor);
    }, mensaje)
    .optional()
    .nullable();

export const telefonoOpcional = (mensaje = "El teléfono no tiene un formato válido") =>
  z
    .string()
    .trim()
    .refine((valor) => valor === "" || /^[\d+\-\s()]{7,20}$/.test(valor), mensaje)
    .optional()
    .nullable();

/** Texto libre (descripciones, direcciones) sin caracteres especiales peligrosos/ilimitados. */
const TEXTO_LIBRE_REGEX = /^[\p{L}\p{N}\s.,;:¡!¿?()'"°%#\-\/&]*$/u;

export const textoLibreOpcional = (max: number, mensaje = "Contiene caracteres no permitidos") =>
  z
    .string()
    .max(max)
    .refine((valor) => TEXTO_LIBRE_REGEX.test(valor), mensaje)
    .optional()
    .nullable();

/** Correo opcional con validación estricta: una sola "@" y formato general válido. */
export const correoEstricto = (mensaje = "Debe ser un correo electrónico válido") =>
  z
    .string()
    .refine((valor) => {
      if (valor === "") return true;
      if (valor.split("@").length !== 2) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    }, mensaje)
    .optional()
    .nullable();

/** "Número de empleados": un entero, un rango (ej. "50-200") o "500+". */
export const tamanoEmpresaOpcional = (mensaje = 'Debe ser un número o rango (ej. "50-200" o "500+")') =>
  z
    .string()
    .refine((valor) => valor === "" || /^\d{1,6}(\s*-\s*\d{1,6}|\+)?$/.test(valor.trim()), mensaje)
    .optional()
    .nullable();
