import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { notFoundHandler } from './common/middleware/notFound';
import { errorHandler } from './common/middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { museumsRouter } from './modules/museums/museums.routes';
import { artifactsRouter } from './modules/artifacts/artifacts.routes';
import { ticketsRouter } from './modules/tickets/tickets.routes';
import { eventsRouter } from './modules/events/events.routes';
import { restoredArtifactsRouter } from './modules/restored-artifacts/restoredArtifacts.routes';
// Future module routers:
// import { reviewsRouter } from './modules/reviews/reviews.routes';
// import { donationsRouter } from './modules/donations/donations.routes';
// import { volunteersRouter } from './modules/volunteers/volunteers.routes';
// import { tourGuidesRouter } from './modules/tour-guides/tourGuides.routes';
// import { chatRouter } from './modules/chat/chat.routes';

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Revive Egypt API' });
});

// Module routers
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/museums', museumsRouter);
app.use('/api/artifacts', artifactsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/restored-artifacts', restoredArtifactsRouter);
// app.use('/api/reviews', reviewsRouter);
// app.use('/api/donations', donationsRouter);
// app.use('/api/volunteers', volunteersRouter);
// app.use('/api/tour-guides', tourGuidesRouter);
// app.use('/api/chat', chatRouter);

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export { app };

