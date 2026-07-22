import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import usersRoutes from './modules/users/users.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'InUPA Backend is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
