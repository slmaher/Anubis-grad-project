import http from 'http';
import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { SocketService } from './modules/chat/socket.service';

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);

  // Initialize Socket.io
  SocketService.getInstance(server);

  server.listen(env.port, '0.0.0.0', () => {
    console.log(`Revive Egypt API running on port ${env.port}`);
  });
}





bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
})   ;