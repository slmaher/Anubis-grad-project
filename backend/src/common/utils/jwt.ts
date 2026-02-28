import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserRole } from '../../modules/users/user.roles';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

