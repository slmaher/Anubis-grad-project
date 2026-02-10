import { Router } from 'express';

// TODO: Implement Volunteers CRUD (user + museum relations).

const volunteersRouter = Router();

volunteersRouter.get('/', (_req, res) => {
  res.json({ message: 'Volunteers module placeholder' });
});

export { volunteersRouter };

