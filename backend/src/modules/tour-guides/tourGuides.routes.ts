import { Router } from 'express';

// TODO: Implement Tour Guides CRUD and one-to-one user relation.

const tourGuidesRouter = Router();

tourGuidesRouter.get('/', (_req, res) => {
  res.json({ message: 'Tour Guides module placeholder' });
});

export { tourGuidesRouter };

