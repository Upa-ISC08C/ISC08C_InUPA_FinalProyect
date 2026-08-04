import pdfParse from 'pdf-extraction';
import { ValidationError } from '../../shared/errors';

// ==========================================
// PROMPTS MAESTROS Y CONFIGURACIÓN
// ==========================================
const ROL_MAESTRO = `Eres un Consultor de Adquisición de Talento Senior y Experto en Redacción Curricular. Tu objetivo es ayudar a estudiantes y profesionales de cualquier disciplina (ingeniería, medicina, negocios, artes, etc.) a destacar su perfil. 

Reglas Estrictas de Validación:
1. CERO ALUCINACIONES: Tienes estrictamente prohibido inventar experiencias, herramientas, fechas, títulos académicos o habilidades que el usuario no haya mencionado explícitamente.
2. ADAPTACIÓN DE SECTOR: Detecta el área profesional del texto y utiliza la jerga técnica adecuada para esa industria específica.
3. FILTRO DE BASURA: Si el texto recibido es incomprensible, contiene insultos, o no tiene ninguna relación con un contexto profesional o académico, debes devolver estrictamente el siguiente JSON de error: {"error": "Texto no válido para perfil profesional"}.
4. TONO: Tu redacción debe ser formal, persuasiva, orientada a logros y utilizando verbos de acción de alto impacto.`;

const INSTRUCCION_CREAR = `Tarea: Transformación de Borrador Informal a Estructura Profesional.
El usuario proporcionará una descripción informal de sus actividades, proyectos o tareas recientes. Debes traducir este lenguaje cotidiano a un formato corporativo altamente profesional.

Reglas de Salida:
- Extrae y deduce las habilidades implícitas en sus tareas (ej. si menciona "hice un excel", la habilidad es "Análisis de datos en Microsoft Excel").
- Si el usuario no menciona educación o algún otro rubro, deja el campo vacío. NO lo inventes.
- DEBES devolver el resultado ESTRICTAMENTE en formato JSON válido con la siguiente estructura, sin texto adicional:
{
  "perfil": "Resumen profesional de 2-3 líneas basándote en la información dada.",
  "experiencia": ["Logro profesional 1", "Logro profesional 2"],
  "educacion": ["Dato educativo si se menciona"],
  "habilidades": ["Habilidad técnica o blanda deducida 1", "Habilidad 2"]
}`;

const INSTRUCCION_MEJORAR = `Tarea: Optimización y Reestructuración de Currículum Existente.
El usuario proporcionará el texto extraído de su currículum actual. Tu trabajo es identificar la información más valiosa, eliminar la redundancia, mejorar la redacción de sus logros y darle una estructura impecable.

Reglas de Salida:
- Identifica y resalta sus mayores logros, utilizando métricas si el documento las incluye.
- Organiza la información lógicamente, priorizando la experiencia relevante y las habilidades clave.
- DEBES devolver el resultado ESTRICTAMENTE en formato Markdown limpio y estructurado. 
- Utiliza la siguiente jerarquía de encabezados: ## Perfil Profesional, ## Experiencia Destacada, ## Educación, ## Competencias y Habilidades.
- Utiliza listas con viñetas (-) para facilitar la lectura. NO devuelvas JSON.`;


// ==========================================
// LÓGICA DEL SERVICIO
// ==========================================
class AIService {

    /** Detecta el {"error": "..."} que el modelo devuelve cuando rechaza el texto, sea JSON o Markdown la tarea. */
    private rechazoDeIA(contenidoCrudo: string): string | null {
        const limpio = contenidoCrudo.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
            const parsed = JSON.parse(limpio);
            if (parsed && typeof parsed === 'object' && typeof parsed.error === 'string') {
                return parsed.error;
            }
        } catch {
            // contenido normal, no JSON de rechazo
        }
        return null;
    }

    private getOpenRouterConfig() {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("Falta la API Key de OpenRouter en el entorno.");
        
        return {
            url: "https://openrouter.ai/api/v1/chat/completions",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        };
    }

    public async procesarTextoAJSON(texto: string) {
        const config = this.getOpenRouterConfig();
        // Unimos el rol maestro con la instrucción de crear
        const systemPrompt = `${ROL_MAESTRO}\n\n${INSTRUCCION_CREAR}`;

        const response = await fetch(config.url, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: texto }
                ],
                temperature: 0.1 
            })
        });

        if (!response.ok) throw new Error(`Error en OpenRouter: ${response.statusText}`);

        const data = await response.json();
        const contenido_ia = data.choices[0].message.content;

        const rechazo = this.rechazoDeIA(contenido_ia);
        if (rechazo) {
            throw new ValidationError(
                'No se pudo generar el contenido: el texto es muy corto o no se pudo interpretar como un perfil profesional. Agrega más detalle sobre tus estudios, proyectos o actividades e intenta de nuevo.'
            );
        }

        // Limpiamos las etiquetas de markdown y parseamos
        const textoLimpio = contenido_ia.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(textoLimpio);
        } catch {
            throw new ValidationError('La IA no devolvió un formato válido. Intenta de nuevo.');
        }
    }

    public async procesarPDFAMarkdown(pdfBuffer: Buffer) {
        // Extraemos el texto del PDF usando la librería moderna
        const dataPDF = await pdfParse(pdfBuffer);
        const textoExtraido = dataPDF.text;

        if (!textoExtraido || textoExtraido.trim() === "") {
            throw new Error("El PDF está vacío o es una imagen sin texto (escaneado).");
        }

        const config = this.getOpenRouterConfig();
        // Unimos el rol maestro con la instrucción de mejorar PDF
        const systemPrompt = `${ROL_MAESTRO}\n\n${INSTRUCCION_MEJORAR}`;

        const response = await fetch(config.url, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: textoExtraido }
                ],
                temperature: 0.2 
            })
        });

        if (!response.ok) throw new Error(`Error en OpenRouter: ${response.statusText}`);

        const data = await response.json();
        const contenido_ia = data.choices[0].message.content;

        const rechazo = this.rechazoDeIA(contenido_ia);
        if (rechazo) {
            throw new ValidationError(
                'No se pudo optimizar el CV: el contenido del PDF no se pudo interpretar como un perfil profesional. Verifica que el archivo tenga texto legible e intenta de nuevo.'
            );
        }

        return contenido_ia; // Retornamos el markdown limpio
    }

    /**
     * Genera un CV en Markdown a partir del texto del perfil (sin PDF de por medio).
     * Se usa para el generador de CV con IA a partir de la informacion del perfil.
     */
    public async procesarTextoAMarkdown(texto: string) {
        if (!texto || texto.trim() === "") {
            throw new ValidationError("No hay informacion de perfil para generar el CV.");
        }
        const config = this.getOpenRouterConfig();
        const systemPrompt = `${ROL_MAESTRO}\n\n${INSTRUCCION_MEJORAR}`;

        const response = await fetch(config.url, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: texto }
                ],
                temperature: 0.2
            })
        });

        if (!response.ok) throw new Error(`Error en OpenRouter: ${response.statusText}`);
        const data = await response.json();
        const contenido_ia = data.choices[0].message.content;

        const rechazo = this.rechazoDeIA(contenido_ia);
        if (rechazo) {
            throw new ValidationError(
                'No se pudo generar el CV: la información de tu perfil es muy corta o no se pudo interpretar. Completa más secciones de tu perfil (biografía, experiencia, proyectos) e intenta de nuevo.'
            );
        }

        return contenido_ia;
    }
}

export const aiService = new AIService();