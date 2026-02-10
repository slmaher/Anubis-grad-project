import { Router } from 'express';

// TODO: Implement Reviews CRUD (user + museum relations).

const reviewsRouter = Router();

reviewsRouter.get('/', (_req, res) => {
  res.json({ message: 'Reviews module placeholder' });
});

export { reviewsRouter };

