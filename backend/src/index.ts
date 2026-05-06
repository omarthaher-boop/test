import './config/env'; // Must be first — validates env before anything else
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { connectDb } from './config/db';
import { globalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tripRoutes from './routes/trip.routes';
import exportRoutes from './routes/export.routes';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow mobile app origin
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:8081', 'exp://'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '2mb' }));

// Global rate limiter
app.use(globalLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/export', exportRoutes);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

async function start(): Promise<void> {
  await connectDb();
  app.listen(env.PORT, () => {
    console.log(`🚀 TripTracker API running on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
  });
}

start().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

export default app;
