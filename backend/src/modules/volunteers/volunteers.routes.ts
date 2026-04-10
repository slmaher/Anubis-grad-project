import { NextFunction, Response, Router } from 'express';

import { VolunteerModel } from './volunteer.model';
import { MuseumModel } from '../museums/museum.model';
import { CreateVolunteerDto, UpdateVolunteerDto } from './volunteer.dto';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { UserRole } from '../users/user.roles';

const volunteersRouter = Router();

const volunteerOpportunities = [
  {
    id: 'v1',
    title: 'Museum Tour Guide',
    desc: 'Help visitors discover artifacts and share Egyptian stories through guided tours.',
    location: 'National Museum',
    schedule: 'Weekends',
    duration: '4 hrs/week',
    icon: 'account-tie-outline'
  },
  {
    id: 'v2',
    title: 'Heritage Garden Care',
    desc: 'Maintain heritage gardens and learn about native Egyptian botanical traditions.',
    location: 'Botanical Gardens',
    schedule: 'Flexible',
    duration: '3 hrs/week',
    icon: 'sprout-outline'
  },
  {
    id: 'v3',
    title: 'Art Workshop Assistant',
    desc: 'Support children in hands-on art and craft workshops inspired by Egyptian culture.',
    location: 'Cultural Center',
    schedule: 'Saturdays',
    duration: '2 hrs/week',
    icon: 'palette-outline'
  }
];

const opportunitySignups: Array<{
  signupId: string;
  opportunityId: string;
  applicantName?: string;
  applicantEmail?: string;
  createdAt: string;
}> = [];

// GET /api/volunteers/opportunities - list screen opportunities (public)
volunteersRouter.get('/opportunities', (_req, res: Response) => {
  return res.json({
    success: true,
    data: volunteerOpportunities,
    total: volunteerOpportunities.length
  });
});

// POST /api/volunteers/opportunities/:opportunityId/signup - screen sign up action (public)
volunteersRouter.post('/opportunities/:opportunityId/signup', (req, res: Response) => {
  const { opportunityId } = req.params;
  const { applicantName, applicantEmail } = req.body as {
    applicantName?: string;
    applicantEmail?: string;
  };

  const opportunity = volunteerOpportunities.find((item) => item.id === opportunityId);
  if (!opportunity) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  if (applicantEmail) {
    const alreadyJoined = opportunitySignups.some(
      (entry) =>
        entry.opportunityId === opportunityId &&
        entry.applicantEmail?.toLowerCase() === applicantEmail.toLowerCase()
    );

    if (alreadyJoined) {
      return res.status(409).json({ success: false, message: 'You already signed up for this opportunity' });
    }
  }

  const signup = {
    signupId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    opportunityId,
    applicantName,
    applicantEmail,
    createdAt: new Date().toISOString()
  };

  opportunitySignups.push(signup);

  return res.status(201).json({
    success: true,
    message: `Signed up for ${opportunity.title}`,
    data: signup
  });
});

// GET /api/volunteers - list volunteers (users see their own, Admin/Guide see all)
volunteersRouter.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, unknown> = {};
      const museumId = req.query.museumId as string | undefined;
      const status = req.query.status as string | undefined;
      const limit = Number(req.query.limit) || 50;
      const skip = Number(req.query.skip) || 0;

      // Non-admins/guides only see their own volunteer records
      if (req.user!.role !== UserRole.Admin && req.user!.role !== UserRole.Guide) {
        filter.user = req.user!.id;
      }

      if (museumId) {
        filter.museum = museumId;
      }

      if (status) {
        filter.status = status;
      }

      const volunteers = await VolunteerModel.find(filter)
        .populate('user', 'name email')
        .populate('museum', 'name city location')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await VolunteerModel.countDocuments(filter);

      return res.json({
        success: true,
        data: volunteers,
        pagination: { limit, skip, total }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/volunteers/:id - get one volunteer record
volunteersRouter.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const volunteer = await VolunteerModel.findById(req.params.id)
        .populate('user', 'name email')
        .populate('museum', 'name description city location');

      if (!volunteer) {
        return res.status(404).json({ success: false, message: 'Volunteer record not found' });
      }

      // Non-admins/guides can only view their own records
      const isOwner = volunteer.user._id.toString() === req.user!.id;
      const isAdminOrGuide =
        req.user!.role === UserRole.Admin || req.user!.role === UserRole.Guide;

      if (!isAdminOrGuide && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view your own volunteer records'
        });
      }

      return res.json({ success: true, data: volunteer });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/volunteers - create volunteer application (authenticated users)
volunteersRouter.post(
  '/',
  authenticate,
  validateBody(CreateVolunteerDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateVolunteerDto;

      // Verify museum exists
      const museum = await MuseumModel.findById(dto.museum);
      if (!museum) {
        return res.status(400).json({ success: false, message: 'Museum not found' });
      }

      // Validate dates
      const startDate = new Date(dto.startDate);
      if (startDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be in the future'
        });
      }

      if (dto.endDate) {
        const endDate = new Date(dto.endDate);
        if (endDate <= startDate) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
          });
        }
      }

      const volunteer = await VolunteerModel.create({
        user: req.user!.id,
        museum: dto.museum,
        startDate: startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        role: dto.role,
        notes: dto.notes,
        status: 'pending'
      });

      const populated = await volunteer.populate([
        { path: 'user', select: 'name email' },
        { path: 'museum', select: 'name city location' }
      ]);

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/volunteers/:id - update volunteer record (owner or Admin/Guide)
volunteersRouter.patch(
  '/:id',
  authenticate,
  validateBody(UpdateVolunteerDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateVolunteerDto;
      const volunteer = await VolunteerModel.findById(req.params.id);

      if (!volunteer) {
        return res.status(404).json({ success: false, message: 'Volunteer record not found' });
      }

      const isOwner = volunteer.user.toString() === req.user!.id;
      const isAdminOrGuide =
        req.user!.role === UserRole.Admin || req.user!.role === UserRole.Guide;

      // Only owner can update basic info, Admin/Guide can update status
      if (!isAdminOrGuide && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update your own volunteer records'
        });
      }

      // Non-admins/guides can't change status
      if (!isAdminOrGuide && dto.status) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only admins and guides can change volunteer status'
        });
      }

      // Validate dates if updating
      if (dto.startDate || dto.endDate) {
        const startDate = dto.startDate ? new Date(dto.startDate) : volunteer.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : volunteer.endDate;

        if (endDate && endDate <= startDate) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
          });
        }
      }

      const updated = await VolunteerModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.startDate != null && { startDate: new Date(dto.startDate) }),
            ...(dto.endDate !== undefined && {
              endDate: dto.endDate ? new Date(dto.endDate) : null
            }),
            ...(dto.role !== undefined && { role: dto.role }),
            ...(dto.notes !== undefined && { notes: dto.notes }),
            ...(dto.status != null && { status: dto.status })
          }
        },
        { new: true }
      ).populate([
        { path: 'user', select: 'name email' },
        { path: 'museum', select: 'name city location' }
      ]);

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/volunteers/:id - cancel volunteer application (owner or Admin)
volunteersRouter.delete(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const volunteer = await VolunteerModel.findById(req.params.id);

      if (!volunteer) {
        return res.status(404).json({ success: false, message: 'Volunteer record not found' });
      }

      const isOwner = volunteer.user.toString() === req.user!.id;
      const isAdmin = req.user!.role === UserRole.Admin;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only cancel your own volunteer applications'
        });
      }

      // Soft delete: set status to cancelled
      const cancelled = await VolunteerModel.findByIdAndUpdate(
        req.params.id,
        { $set: { status: 'cancelled' } },
        { new: true }
      ).populate([
        { path: 'user', select: 'name email' },
        { path: 'museum', select: 'name city location' }
      ]);

      return res.json({ success: true, data: cancelled, message: 'Volunteer application cancelled' });
    } catch (err) {
      next(err);
    }
  }
);

export { volunteersRouter };
