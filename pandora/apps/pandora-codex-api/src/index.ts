import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'node:http';
import { devicesRouter } from './routes/devices';
import { diagnosticsRouter } from './routes/diagnostics';
import { deploymentRouter } from './routes/deployment';
import { chainsRouter } from './routes/chains';

// New Phase C imports
import './db/sqlite'; // init DB
import { jobsRouter } from './routes/jobs';
import { devicesRouter2 } from './routes/devices2';
import { diagnosticsRouter2 } from './routes/diagnostics2';
import { deployRouter } from './routes/deploy';
import { reportsRouter } from './routes/reports';
import { attachWs } from './ws/server';

// Load environment variables
dotenv.config();

const app: express.Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// API routes (existing)
app.use('/api/devices', devicesRouter);
app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/deployment', deploymentRouter);
app.use('/api/chains', chainsRouter);

// New Phase C routes
app.use('/api/jobs', jobsRouter);
app.use('/api/devices2', devicesRouter2);
app.use('/api/diagnostics2', diagnosticsRouter2);
app.use('/api/deploy', deployRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Start server with WebSocket support
const server = http.createServer(app);
attachWs(server);

server.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           PANDORA CODEX BACKEND API                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('\nAvailable endpoints:');
  console.log('  GET  /api/devices/connected');
  console.log('  POST /api/diagnostics/run');
  console.log('  POST /api/deployment/start');
  console.log('  GET  /api/deployment/status/:id');
  console.log('  POST /api/chains/phoenix/start');
  console.log('  GET  /api/chains/phoenix/:id');
  console.log('  POST /api/chains/overseer/start');
  console.log('  GET  /api/chains/overseer/:id');
  console.log('  POST /api/chains/arsenal/start');
  console.log('  GET  /api/chains/arsenal/:id');
  console.log('\nPhase C endpoints:');
  console.log('  GET  /api/jobs');
  console.log('  GET  /api/devices2');
  console.log('  POST /api/diagnostics2/android/logcat');
  console.log('  POST /api/deploy/plan');
  console.log('  POST /api/deploy/execute');
  console.log('  GET  /api/reports');
  console.log('  WS   /ws');
  console.log('');
});

export default app;
