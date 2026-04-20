import { NextFunction, Response, Router } from 'express';
import bcrypt from 'bcryptjs';

import { UserModel } from './user.model';
import { UserRole } from './user.roles';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { CreateUserDto, UpdateUserDto } from './user.dto';

const usersRouter = Router();

// GET /api/users/me - current user profile
usersRouter.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = await UserModel.findById(req.user!.id).select('-password');
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: currentUser });
  } catch (err) {
    next(err);
  }
}
);

// PATCH /api/users/me - update current user profile
usersRouter.patch(
  '/me',
  authenticate,
  validateBody(UpdateUserDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateUserDto;
      const userId = req.user!.id;

      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(dto.name && { name: dto.name }),
            ...(dto.avatar && { avatar: dto.avatar })
          }
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/users/profile/:id - view user profile
usersRouter.get(
  '/profile/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// ADMIN: list all users
usersRouter.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const users = await UserModel.find().select('-password');
      return res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }
);

// ADMIN: create a user (e.g., create a Guide or Admin)
usersRouter.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(CreateUserDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const adminUserId = req.user?.id;
      if (!adminUserId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const dto = req.body as CreateUserDto;

      const existing = await UserModel.findOne({ email: dto.email });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: 'User with this email already exists' });
      }

      const hashed = await bcrypt.hash(dto.password, 10);

      const user = await UserModel.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role ?? UserRole.Visitor,
        createdBy: adminUserId,
        updatedBy: adminUserId
      });

      const plain = user.toObject();
      delete (plain as any).password;

      return res.status(201).json({ success: true, data: plain });
    } catch (err) {
      next(err);
    }
  }
);

// ADMIN: get user by id
usersRouter.get(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// ADMIN: update user (name/role)
usersRouter.patch(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(UpdateUserDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const adminUserId = req.user?.id;
      if (!adminUserId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const dto = req.body as UpdateUserDto;

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.name && { name: dto.name }),
            ...(dto.role && { role: dto.role }),
            updatedBy: adminUserId
          }
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// ADMIN: soft delete / deactivate user
usersRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const adminUserId = req.user?.id;
      if (!adminUserId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false, updatedBy: adminUserId } },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

export { usersRouter };

