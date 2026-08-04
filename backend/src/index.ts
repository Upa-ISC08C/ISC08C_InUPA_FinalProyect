import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import usersRoutes from './modules/users/users.routes';
import userStatsRoutes from './modules/users/user.routes';
import profileRoutes from './modules/profile/profile.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import connectionsRoutes from './modules/connections/connections.routes';
import companiesRoutes from './modules/companies/companies.routes';
import aiRoutes from './modules/ai/ai.routes';
import { authenticateToken } from './middlewares/auth.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { verificarMailer } from './utils/mailer';
import { iniciarTareasProgramadas } from './utils/scheduler';
import carrerasRoutes from './modules/carreras/carreras.routes';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/user', userStatsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/companies', companiesRoutes);
// Modulo de IA (OpenRouter): optimizacion de CV. Requiere sesion iniciada.
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/carreras', carrerasRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'InUPA Backend is running' });
});

// 404 para rutas no registradas (va despues de todas las rutas)
app.use(notFoundHandler);

// Manejador central de errores: SIEMPRE debe ir al final
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // Comprobamos el SMTP al arrancar: si las credenciales fallan queda claro en
  // los logs, en vez de descubrirlo cuando un usuario no recibe su código.
  void verificarMailer();
  iniciarTareasProgramadas();
});