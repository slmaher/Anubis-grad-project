import { Router } from 'express';

// TODO: Implement Artifacts CRUD and museum relation.

const artifactsRouter = Router();

artifactsRouter.get('/', (_req, res) => {
  res.json({ message: 'Artifacts module placeholder' });
});

export { artifactsRouter };

