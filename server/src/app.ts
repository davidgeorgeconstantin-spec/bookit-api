import cors from 'cors';
import express from 'express';
import { openapi, swaggerHtml } from './docs/openapi.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import type { BookingRepository } from './repositories/types.js';
import { bookingsRouter } from './routes/bookings.js';
import { servicesRouter } from './routes/services.js';

/** Builds the Express app. The repository is passed in ("dependency injection"), which makes testing easy. */
export function createApp(repo: BookingRepository, corsOrigin = '*') {
  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });
  app.get('/api/openapi.json', (_req, res) => {
    res.json(openapi);
  });
  app.get('/docs', (_req, res) => {
    res.type('html').send(swaggerHtml);
  });

  app.use('/api', servicesRouter(repo));
  app.use('/api/bookings', bookingsRouter(repo));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
