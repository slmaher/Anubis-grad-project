import { Router } from 'express';

// TODO: Implement Museums CRUD and relations.

const museumsRouter = Router();

museumsRouter.get('/', (_req, res) => {
  res.json({ message: 'Museums module placeholder' });
});

export { museumsRouter };

