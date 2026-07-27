// Catálogos compartidos (carreras, cuatrimestres, tipos de contrato, etc.)

export const CARRERAS_UPA = [
  "Ingeniería en Sistemas Computacionales",
  "Ingeniería en Sistemas Estratégicos de Información",
  "Ingeniería en Tecnologías de la Información",
  "Ingeniería en Mecatrónica",
  "Ingeniería en Robótica",
  "Ingeniería en Logística",
  "Ingeniería en Nanotecnología",
  "Ingeniería Financiera",
  "Ingeniería en Biotecnología",
  "Licenciatura en Administración y Gestión Empresarial",
];

// La UPA es cuatrimestral: normalmente 1–11
export const CUATRIMESTRES = Array.from({ length: 11 }, (_, i) => i + 1);

export const TIPOS_CONTRATO = [
  "Tiempo completo",
  "Medio tiempo",
  "Práctica profesional",
  "Por periodo",
];

export const MODALIDADES = ["Presencial", "Remoto", "Híbrido"];
