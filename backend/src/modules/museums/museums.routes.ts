import { NextFunction, Response, Router } from 'express';

import { MuseumModel } from './museum.model';
import { CreateMuseumDto, UpdateMuseumDto } from './museum.dto';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { UserRole } from '../users/user.roles';

const museumsRouter = Router();

// GET /api/museums - list all museums (public)
museumsRouter.get(
  '/',
  async (_req, res: Response, next: NextFunction) => {
    try {
      const museums = await MuseumModel.find({ isActive: true }).sort({ createdAt: -1 });
      return res.json({ success: true, data: museums });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/museums/:id - get one museum (public)
museumsRouter.get(
  '/:id',
  async (req, res: Response, next: NextFunction) => {
    try {
      const museum = await MuseumModel.findOne({
        _id: req.params.id,
        isActive: true
      });
      if (!museum) {
        return res.status(404).json({ success: false, message: 'Museum not found' });
      }
      return res.json({ success: true, data: museum });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/museums - create museum (Admin only)
museumsRouter.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(CreateMuseumDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateMuseumDto;
      const museum = await MuseumModel.create({
        name: dto.name,
        description: dto.description,
        location: dto.location,
        city: dto.city,
        imageUrl: dto.imageUrl,
        openingHours: dto.openingHours
      });
      return res.status(201).json({ success: true, data: museum });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/museums/:id - update museum (Admin only)
museumsRouter.patch(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(UpdateMuseumDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateMuseumDto;
      const updateDoc: Record<string, unknown> = {
        $set: {
          ...(dto.name != null && { name: dto.name }),
          ...(dto.description != null && { description: dto.description }),
          ...(dto.location != null && { location: dto.location }),
          ...(dto.city != null && { city: dto.city }),
          ...(dto.openingHours !== undefined && { openingHours: dto.openingHours })
        }
      };

      if (dto.imageUrl === null) {
        updateDoc.$unset = { imageUrl: "" };
      } else if (dto.imageUrl !== undefined) {
        (updateDoc.$set as Record<string, unknown>).imageUrl = dto.imageUrl;
      }

      const museum = await MuseumModel.findByIdAndUpdate(
        req.params.id,
        updateDoc,
        { new: true }
      );
      if (!museum) {
        return res.status(404).json({ success: false, message: 'Museum not found' });
      }
      return res.json({ success: true, data: museum });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/museums/:id - soft delete (Admin only)
museumsRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const museum = await MuseumModel.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true }
      );
      if (!museum) {
        return res.status(404).json({ success: false, message: 'Museum not found' });
      }
      return res.json({ success: true, data: museum });
    } catch (err) {
      next(err);
    }
  }
);

export { museumsRouter };
