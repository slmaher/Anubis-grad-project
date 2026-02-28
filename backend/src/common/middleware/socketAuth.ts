import { Socket } from 'socket.io';
import { verifyJwt } from '../utils/jwt';
import { UserModel } from '../../modules/users/user.model';

export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const payload = verifyJwt(token);
    const user = await UserModel.findById(payload.sub);

    if (!user || !user.isActive) {
      return next(new Error('Authentication error: User not found or inactive'));
    }

    // Attach user info to socket
    (socket as any).user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
