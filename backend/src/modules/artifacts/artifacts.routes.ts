import { NextFunction, Response, Router } from 'express';
import mongoose from 'mongoose';

import { ArtifactModel } from './artifact.model';
import { MuseumModel } from '../museums/museum.model';
import { CreateArtifactDto, UpdateArtifactDto } from './artifact.dto';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { UserRole } from '../users/user.roles';

const artifactsRouter = Router();

// GET /api/artifacts - list artifacts, optional ?museumId= (public)
artifactsRouter.get(
  '/',
  async (req, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, unknown> = { isActive: true };
      const museumId = req.query.museumId as string | undefined;
      if (museumId && mongoose.isValidObjectId(museumId)) {
        filter.museum = new mongoose.Types.ObjectId(museumId);
      }
      const artifacts = await ArtifactModel.find(filter)
        .populate('museum', 'name city location')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: artifacts });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/artifacts/:id - get one artifact with museum (public)
artifactsRouter.get(
  '/:id',
  async (req, res: Response, next: NextFunction) => {
    try {
      const artifact = await ArtifactModel.findOne({
        _id: req.params.id,
        isActive: true
      }).populate('museum', 'name description city location openingHours');
      if (!artifact) {
        return res.status(404).json({ success: false, message: 'Artifact not found' });
      }
      return res.json({ success: true, data: artifact });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/artifacts - create artifact (Admin only)
artifactsRouter.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(CreateArtifactDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateArtifactDto;
      const museumExists = await MuseumModel.findById(dto.museum);
      if (!museumExists) {
        return res.status(400).json({ success: false, message: 'Museum not found' });
      }
      const artifact = await ArtifactModel.create({
        name: dto.name,
        description: dto.description,
        museum: dto.museum,
        era: dto.era,
        imageUrl: dto.imageUrl
      });
      const populated = await artifact.populate('museum', 'name city');
      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/artifacts/:id - update artifact (Admin only)
artifactsRouter.patch(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(UpdateArtifactDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateArtifactDto;
      if (dto.museum) {
        const museumExists = await MuseumModel.findById(dto.museum);
        if (!museumExists) {
          return res.status(400).json({ success: false, message: 'Museum not found' });
        }
      }
      const artifact = await ArtifactModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.name != null && { name: dto.name }),
            ...(dto.description != null && { description: dto.description }),
            ...(dto.museum != null && { museum: dto.museum }),
            ...(dto.era !== undefined && { era: dto.era }),
            ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl })
          }
        },
        { new: true }
      ).populate('museum', 'name city');
      if (!artifact) {
        return res.status(404).json({ success: false, message: 'Artifact not found' });
      }
      return res.json({ success: true, data: artifact });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/artifacts/:id - soft delete (Admin only)
artifactsRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const artifact = await ArtifactModel.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true }
      ).populate('museum', 'name city');
      if (!artifact) {
        return res.status(404).json({ success: false, message: 'Artifact not found' });
      }
      return res.json({ success: true, data: artifact });
    } catch (err) {
      next(err);
    }
  }
);

export { artifactsRouter };
