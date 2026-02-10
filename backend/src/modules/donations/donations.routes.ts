import { Router } from 'express';

// TODO: Implement Donations CRUD (user + museum relations).

const donationsRouter = Router();

donationsRouter.get('/', (_req, res) => {
  res.json({ message: 'Donations module placeholder' });
});

export { donationsRouter };

