import { Router } from 'express';

// TODO: Implement Tickets CRUD (user + museum relations).

const ticketsRouter = Router();

ticketsRouter.get('/', (_req, res) => {
  res.json({ message: 'Tickets module placeholder' });
});

export { ticketsRouter };

