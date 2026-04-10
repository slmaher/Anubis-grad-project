import { NextFunction, Response, Router } from 'express';

import { DonationModel } from './donation.model';
import { MuseumModel } from '../museums/museum.model';
import { CreateDonationDto, UpdateDonationDto } from './donation.dto';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { UserRole } from '../users/user.roles';

const donationsRouter = Router();

const donationCampaigns = [
  {
    id: 'd1',
    title: 'Artifact Restoration Fund',
    desc: 'Help restore fragile artifacts and preserve cultural heritage for future generations.',
    amount: 150,
    currency: 'EGP',
    icon: 'hammer-wrench'
  },
  {
    id: 'd2',
    title: 'Student Access Program',
    desc: 'Sponsor museum access and educational materials for students and young explorers.',
    amount: 100,
    currency: 'EGP',
    icon: 'school-outline'
  },
  {
    id: 'd3',
    title: 'Community Exhibits',
    desc: 'Support rotating exhibits and local events that bring history closer to communities.',
    amount: 200,
    currency: 'EGP',
    icon: 'image-filter-hdr'
  }
];

const campaignContributions: Array<{
  contributionId: string;
  campaignId: string;
  amount: number;
  currency: string;
  donorName?: string;
  message?: string;
  createdAt: string;
}> = [];

// GET /api/donations/campaigns - list screen campaigns (public)
donationsRouter.get('/campaigns', (_req, res: Response) => {
  return res.json({ success: true, data: donationCampaigns, total: donationCampaigns.length });
});

// POST /api/donations/campaigns/:campaignId/contribute - screen donate action (public)
donationsRouter.post('/campaigns/:campaignId/contribute', (req, res: Response) => {
  const { campaignId } = req.params;
  const campaign = donationCampaigns.find((item) => item.id === campaignId);

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const payload = req.body as {
    amount?: number;
    currency?: string;
    donorName?: string;
    message?: string;
  };

  const amount = Number(payload.amount ?? campaign.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
  }

  const contribution = {
    contributionId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    campaignId,
    amount,
    currency: (payload.currency || campaign.currency || 'EGP').toUpperCase(),
    donorName: payload.donorName,
    message: payload.message,
    createdAt: new Date().toISOString()
  };

  campaignContributions.push(contribution);

  return res.status(201).json({
    success: true,
    message: `Contribution received for ${campaign.title}`,
    data: contribution
  });
});

// GET /api/donations - list donations (users see their own, Admin sees all)
donationsRouter.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, unknown> = {};
      const museumId = req.query.museumId as string | undefined;
      const limit = Number(req.query.limit) || 50;
      const skip = Number(req.query.skip) || 0;

      // Non-admins only see their own donations
      if (req.user!.role !== UserRole.Admin) {
        filter.user = req.user!.id;
      }

      if (museumId) {
        filter.museum = museumId;
      }

      const donations = await DonationModel.find(filter)
        .populate('user', 'name email')
        .populate('museum', 'name city')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await DonationModel.countDocuments(filter);

      // Calculate total donations for filtered results
      const totalAmountResult = await DonationModel.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ]);
      const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

      return res.json({
        success: true,
        data: donations,
        pagination: { limit, skip, total },
        totalAmount: Number(totalAmount.toFixed(2))
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/donations/:id - get one donation
donationsRouter.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const donation = await DonationModel.findById(req.params.id)
        .populate('user', 'name email')
        .populate('museum', 'name description city location');

      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      // Non-admins can only view their own donations
      if (req.user!.role !== UserRole.Admin && donation.user._id.toString() !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view your own donations'
        });
      }

      return res.json({ success: true, data: donation });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/donations - create donation (authenticated users)
donationsRouter.post(
  '/',
  authenticate,
  validateBody(CreateDonationDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateDonationDto;

      // Verify museum exists
      const museum = await MuseumModel.findById(dto.museum);
      if (!museum) {
        return res.status(400).json({ success: false, message: 'Museum not found' });
      }

      const donation = await DonationModel.create({
        user: req.user!.id,
        museum: dto.museum,
        amount: dto.amount,
        currency: dto.currency || 'EGP',
        paymentMethod: dto.paymentMethod,
        isAnonymous: dto.isAnonymous || false,
        message: dto.message,
        status: 'pending'
      });

      const populated = await donation.populate([
        { path: 'user', select: 'name email' },
        { path: 'museum', select: 'name city' }
      ]);

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/donations/:id - update donation status (Admin only)
donationsRouter.patch(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(UpdateDonationDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateDonationDto;
      const donation = await DonationModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.status != null && { status: dto.status })
          }
        },
        { new: true }
      ).populate([
        { path: 'user', select: 'name email' },
        { path: 'museum', select: 'name city' }
      ]);

      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      return res.json({ success: true, data: donation });
    } catch (err) {
      next(err);
    }
  }
);

export { donationsRouter };
