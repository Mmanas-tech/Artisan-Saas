import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { inventoryRoutes } from './routes/inventory';
import { ledgerRoutes } from './routes/ledger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/ledger', ledgerRoutes);

app.use(errorHandler);

export default app;
