import { Router } from 'express';
import multer from 'multer';
import { aiController } from './ai.controller';

const router = Router();

// Configurar multer para manejar el PDF en la memoria RAM
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================
// Definición de las Rutas de IA
// ==========================================

// Ruta para optimizar texto crudo a JSON
router.post('/optimizar', aiController.optimizarTexto);

// Ruta para procesar un PDF y devolver Markdown
router.post('/pdf-a-markdown', upload.single('curriculum'), aiController.optimizarPDF);

export default router;