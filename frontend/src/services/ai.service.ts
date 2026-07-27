import { api } from "./api";

export interface PerfilOptimizado {
  perfil?: string;
  experiencia?: string[];
  educacion?: string[];
  habilidades?: string[];
  error?: string;
}

export const aiService = {
  // Texto informal -> perfil profesional estructurado (JSON)
  optimizarTexto(texto: string) {
    return api.post<PerfilOptimizado>("/ai/optimizar", { texto }).then((r) => r.data);
  },

  // Texto del perfil -> CV en markdown (generador de CV con IA)
  generarCV(texto: string) {
    return api.post<{ markdown: string }>("/ai/cv-markdown", { texto }).then((r) => r.data.markdown);
  },

  // PDF de CV -> markdown optimizado
  pdfAMarkdown(file: File) {
    const fd = new FormData();
    fd.append("curriculum", file);
    return api
      .post<{ mensaje: string; markdown: string }>("/ai/pdf-a-markdown", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
