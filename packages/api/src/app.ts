import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { inventoryRoutes } from './routes/inventory';
import { voiceRoutes } from './routes/voice';
import { syncRoutes } from './routes/sync';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from '@artisan/db';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/voice', voiceRoutes);
app.use('/sync', syncRoutes);

app.use(errorHandler);

initializeDatabase();

app.listen(config.port, () => {
  console.log(`Artisan API running on port ${config.port}`);
});

export default app;
