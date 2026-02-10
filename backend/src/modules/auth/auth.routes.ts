import { NextFunction, Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';

import { UserModel } from '../users/user.model';
import { UserRole } from '../users/user.roles';
import { RegisterDto, LoginDto } from './auth.dto';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { signJwt } from '../../common/utils/jwt';

const authRouter = Router();

// POST /api/auth/register
authRouter.post(
  '/register',
  validateBody(RegisterDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body as RegisterDto;

      const existing = await UserModel.findOne({ email });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: 'User with this email already exists' });
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        name,
        email,
        password: hashed,
        // For safety, default to Visitor if role is not explicitly allowed
        role: role && Object.values(UserRole).includes(role) ? role : UserRole.Visitor
      });

      const token = signJwt({ sub: user.id, role: user.role });

      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          accessToken: token
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
authRouter.post(
  '/login',
  validateBody(LoginDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as LoginDto;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'User is inactive' });
      }

      const token = signJwt({ sub: user.id, role: user.role });

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          accessToken: token
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

export { authRouter };

