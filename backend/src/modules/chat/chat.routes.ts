import { Router } from 'express';

// TODO: Implement Chat message REST endpoints (WebSocket-ready).

const chatRouter = Router();

chatRouter.get('/', (_req, res) => {
  res.json({ message: 'Chat module placeholder' });
});

export { chatRouter };

