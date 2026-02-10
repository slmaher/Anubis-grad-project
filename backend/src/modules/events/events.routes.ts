import { Router } from 'express';

// TODO: Implement Events CRUD (museum relation).

const eventsRouter = Router();

eventsRouter.get('/', (_req, res) => {
  res.json({ message: 'Events module placeholder' });
});

export { eventsRouter };

