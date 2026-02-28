import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap() {
  await connectDatabase();

app.listen(env.port, '0.0.0.0', () => {
  console.log(`Revive Egypt API running on port ${env.port}`);
});
}





bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
})   ;