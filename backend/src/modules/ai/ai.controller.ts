import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { AppError } from '../../shared/errors';

class AIController {
    
    public async optimizarTexto(req: Request, res: Response) {
        const { texto } = req.body;
        const resultadoJSON = await aiService.procesarTextoAJSON(texto);
        res.json(resultadoJSON);
    }

    public async generarCV(req: Request, res: Response) {
        const { texto } = req.body;
        const markdown = await aiService.procesarTextoAMarkdown(texto);
        res.json({ markdown });
    }

    public async optimizarPDF(req: Request, res: Response) {
        if (!req.file || !req.file.buffer) {
            throw new AppError("No se encontró ningún archivo PDF en la petición.", 400);
        }

        const markdownListo = await aiService.procesarPDFAMarkdown(req.file.buffer);
        
        res.json({
            mensaje: "CV procesado exitosamente",
            markdown: markdownListo
        });
    }
}

export const aiController = new AIController();