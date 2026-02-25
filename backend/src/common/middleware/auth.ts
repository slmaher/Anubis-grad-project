import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import { UserModel } from '../../modules/users/user.model';
import { UserRole } from '../../modules/users/user.roles';

export interface AuthenticatedRequest extends Request {
  // Populated by authenticate middleware
  user?: {
    id: string;
    role: UserRole;
  };
  // Ensure TypeScript knows these exist even with stricter generics
  body: any;
  params: any;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyJwt(token);
    const user = await UserModel.findById(payload.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function authorizeRoles(...allowed: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }

    next();
  };
}

