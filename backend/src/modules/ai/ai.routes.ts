import { Router } from 'express';
import multer from 'multer';
import { aiController } from './ai.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/error.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { textPromptSchema } from './ai.schemas';

const router = Router();

// Configurar multer para manejar el PDF en la memoria RAM
const upload = multer({ storage: multer.memoryStorage() });

// Todas las rutas requieren sesión iniciada
router.use(authenticateToken);

// ==========================================
// Definición de las Rutas de IA
// ==========================================

// Ruta para optimizar texto crudo a JSON
router.post('/optimizar', validate(textPromptSchema), asyncHandler(aiController.optimizarTexto));

// Ruta para generar un CV en Markdown a partir del texto del perfil
router.post('/cv-markdown', validate(textPromptSchema), asyncHandler(aiController.generarCV));

// Ruta para procesar un PDF y devolver Markdown
router.post('/pdf-a-markdown', upload.single('curriculum'), asyncHandler(aiController.optimizarPDF));

export default router;