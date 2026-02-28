import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketAuth } from '../../common/middleware/socketAuth';

export class SocketService {
  private static instance: SocketService;
  private io: Server;

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Adjust as needed for security
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupEvents();
  }

  public static getInstance(server?: HttpServer): SocketService {
    if (!SocketService.instance) {
      if (!server) {
        throw new Error('SocketService must be initialized with an HTTP server');
      }
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  private setupMiddleware() {
    this.io.use(socketAuth);
  }

  private setupEvents() {
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user;
      console.log(`User connected to Socket.io: ${user.id} (Socket ID: ${socket.id})`);

      // Join a personal room for the user to receive private messages
      socket.join(user.id);

      socket.on('disconnect', () => {
        console.log(`User disconnected from Socket.io: ${user.id} (Socket ID: ${socket.id})`);
      });
    });
  }

  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(userId).emit(event, data);
  }

  public getIO(): Server {
    return this.io;
  }
}
