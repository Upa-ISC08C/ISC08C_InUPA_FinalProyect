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
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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
// Nota: el modulo de IA (/api/ai) se deja SIN montar intencionalmente:
// la funcionalidad de inteligencia artificial aun no forma parte de esta entrega.

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
});
