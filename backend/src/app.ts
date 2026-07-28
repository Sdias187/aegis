import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/v1', routes);

// Health check (simple)
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime(), lastCheck: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export default app;
