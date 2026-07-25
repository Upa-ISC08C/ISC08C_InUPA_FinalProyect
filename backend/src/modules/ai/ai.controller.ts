import { Request, Response } from 'express';
import { aiService } from './ai.service';

class AIController {
    
    public async optimizarTexto(req: Request, res: Response) {
        try {
            const { texto } = req.body;
            
            if (!texto) {
                return res.status(400).json({ error: "El campo 'texto' es requerido." });
            }

            // Le pasamos la chamba al servicio
            const resultadoJSON = await aiService.procesarTextoAJSON(texto);
            
            // Devolvemos el resultado al cliente
            res.json(resultadoJSON);

        } catch (error: any) {
            console.error("Error en optimizarTexto:", error);
            res.status(500).json({ error: "Ocurrió un error al procesar el CV.", detalle: error.message });
        }
    }

    public async optimizarPDF(req: Request, res: Response) {
        try {
            if (!req.file || !req.file.buffer) {
                return res.status(400).json({ error: "No se encontró ningún archivo PDF en la petición." });
            }

            // Le pasamos el buffer del PDF al servicio
            const markdownListo = await aiService.procesarPDFAMarkdown(req.file.buffer);
            
            res.json({
                mensaje: "CV procesado exitosamente",
                markdown: markdownListo
            });

        } catch (error: any) {
            console.error("Error en optimizarPDF:", error);
            res.status(500).json({ error: "Ocurrió un error al procesar el PDF.", detalle: error.message });
        }
    }
}

export const aiController = new AIController();