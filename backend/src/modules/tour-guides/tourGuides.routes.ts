import { NextFunction, Response, Router } from 'express';

import { TourGuideModel } from './tourGuide.model';
import { UserModel } from '../users/user.model';
import { CreateTourGuideDto, UpdateTourGuideDto } from './tourGuide.dto';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { UserRole } from '../users/user.roles';

const tourGuidesRouter = Router();

// GET /api/tour-guides - list all tour guides (public)
tourGuidesRouter.get(
  '/',
  async (req, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, unknown> = { isAvailable: true };
      const limit = Number(req.query.limit) || 50;
      const skip = Number(req.query.skip) || 0;

      const tourGuides = await TourGuideModel.find(filter)
        .populate('user', 'name email')
        .sort({ rating: -1, totalTours: -1 })
        .limit(limit)
        .skip(skip);

      const total = await TourGuideModel.countDocuments(filter);

      return res.json({
        success: true,
        data: tourGuides,
        pagination: { limit, skip, total }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/tour-guides/:id - get one tour guide (public)
tourGuidesRouter.get(
  '/:id',
  async (req, res: Response, next: NextFunction) => {
    try {
      const tourGuide = await TourGuideModel.findById(req.params.id).populate(
        'user',
        'name email'
      );

      if (!tourGuide) {
        return res.status(404).json({ success: false, message: 'Tour guide not found' });
      }

      return res.json({ success: true, data: tourGuide });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/tour-guides/user/:userId - get tour guide by user ID (public)
tourGuidesRouter.get(
  '/user/:userId',
  async (req, res: Response, next: NextFunction) => {
    try {
      const tourGuide = await TourGuideModel.findOne({ user: req.params.userId }).populate(
        'user',
        'name email'
      );

      if (!tourGuide) {
        return res.status(404).json({ success: false, message: 'Tour guide profile not found' });
      }

      return res.json({ success: true, data: tourGuide });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/tour-guides/me/profile - get current user's tour guide profile
tourGuidesRouter.get(
  '/me/profile',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tourGuide = await TourGuideModel.findOne({ user: req.user!.id }).populate(
        'user',
        'name email'
      );

      if (!tourGuide) {
        return res.status(404).json({
          success: false,
          message: 'Tour guide profile not found. Create one first.'
        });
      }

      return res.json({ success: true, data: tourGuide });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/tour-guides - create tour guide profile (Guide role or Admin)
tourGuidesRouter.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.Guide, UserRole.Admin),
  validateBody(CreateTourGuideDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateTourGuideDto;
      const userId = req.user!.id;

      // Check if user already has a tour guide profile
      const existing = await TourGuideModel.findOne({ user: userId });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Tour guide profile already exists. Use PATCH to update.'
        });
      }

      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const tourGuide = await TourGuideModel.create({
        user: userId,
        bio: dto.bio,
        specialties: dto.specialties,
        languages: dto.languages,
        experienceYears: dto.experienceYears,
        hourlyRate: dto.hourlyRate,
        isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true
      });

      const populated = await tourGuide.populate('user', 'name email');

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/tour-guides/me/profile - update own tour guide profile
tourGuidesRouter.patch(
  '/me/profile',
  authenticate,
  authorizeRoles(UserRole.Guide, UserRole.Admin),
  validateBody(UpdateTourGuideDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateTourGuideDto;
      const userId = req.user!.id;

      const tourGuide = await TourGuideModel.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            ...(dto.bio !== undefined && { bio: dto.bio }),
            ...(dto.specialties !== undefined && { specialties: dto.specialties }),
            ...(dto.languages !== undefined && { languages: dto.languages }),
            ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
            ...(dto.hourlyRate !== undefined && { hourlyRate: dto.hourlyRate }),
            ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
            ...(dto.rating !== undefined && { rating: dto.rating })
          }
        },
        { new: true }
      ).populate('user', 'name email');

      if (!tourGuide) {
        return res.status(404).json({
          success: false,
          message: 'Tour guide profile not found. Create one first.'
        });
      }

      return res.json({ success: true, data: tourGuide });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/tour-guides/:id - update tour guide (Admin only, or own profile)
tourGuidesRouter.patch(
  '/:id',
  authenticate,
  validateBody(UpdateTourGuideDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateTourGuideDto;
      const tourGuide = await TourGuideModel.findById(req.params.id);

      if (!tourGuide) {
        return res.status(404).json({ success: false, message: 'Tour guide not found' });
      }

      const isOwner = tourGuide.user.toString() === req.user!.id;
      const isAdmin = req.user!.role === UserRole.Admin;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update your own tour guide profile'
        });
      }

      // Only admin can update rating
      if (!isAdmin && dto.rating !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only admins can update rating'
        });
      }

      const updated = await TourGuideModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.bio !== undefined && { bio: dto.bio }),
            ...(dto.specialties !== undefined && { specialties: dto.specialties }),
            ...(dto.languages !== undefined && { languages: dto.languages }),
            ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
            ...(dto.hourlyRate !== undefined && { hourlyRate: dto.hourlyRate }),
            ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
            ...(dto.rating !== undefined && { rating: dto.rating })
          }
        },
        { new: true }
      ).populate('user', 'name email');

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/tour-guides/me/profile - delete own tour guide profile
tourGuidesRouter.delete(
  '/me/profile',
  authenticate,
  authorizeRoles(UserRole.Guide, UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tourGuide = await TourGuideModel.findOneAndDelete({ user: req.user!.id });

      if (!tourGuide) {
        return res.status(404).json({ success: false, message: 'Tour guide profile not found' });
      }

      return res.json({ success: true, message: 'Tour guide profile deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export { tourGuidesRouter };
