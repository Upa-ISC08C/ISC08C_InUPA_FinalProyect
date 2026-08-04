import { z } from "zod";

const TIENE_ESQUEMA = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * URL opcional que también acepta cadena vacía ("") sin protocolo obligatorio.
 * z.string().url() por sí solo rechaza "" y exige "https://", lo que rompía el
 * guardado de perfil/empresa cuando el campo se dejaba en blanco o el usuario
 * pegaba un dominio sin protocolo (ej. "www.imss.gob.mx"). Si el valor ya trae
 * un esquema (http(s), data:, blob:) se respeta tal cual: las fotos subidas
 * desde el admin/perfil viajan como "data:image/..." y anteponerles
 * "https://" las hubiera dejado invalidas (y por eso no se guardaban/mostraban).
 */
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

/**
 * Correo opcional con validación estricta: una sola "@" y formato general
 * válido. Un solo .refine() (no .email() + .refine() encadenados) para que
 * un correo inválido no genere el mismo mensaje duplicado dos veces; y
 * permite "" porque el campo es opcional (igual que urlOpcional).
 */
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
