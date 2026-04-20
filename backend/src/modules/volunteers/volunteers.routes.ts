import { NextFunction, Response, Router } from "express";

import { VolunteerModel } from "./volunteer.model";
import { OpportunityModel } from "./opportunity.model";
import { MuseumModel } from "../museums/museum.model";
import { CreateVolunteerDto, UpdateVolunteerDto } from "./volunteer.dto";
import { CreateOpportunityDto, UpdateOpportunityDto } from "./opportunity.dto";
import {
  authenticate,
  authorizeRoles,
  AuthenticatedRequest,
} from "../../common/middleware/auth";
import { validateBody } from "../../common/middleware/validationMiddleware";
import { UserRole } from "../users/user.roles";

const volunteersRouter = Router();

// --- OPPORTUNITIES (Public / Admin) ---

// GET /api/volunteers/opportunities - list all active opportunities (public)
volunteersRouter.get(
  "/opportunities",
  async (_req, res: Response, next: NextFunction) => {
    try {
      const opportunities = await OpportunityModel.find({
        isActive: true,
      }).sort({ createdAt: -1 });
      return res.json({
        success: true,
        data: opportunities,
        total: opportunities.length,
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/volunteers/opportunities - Create a new opportunity (Admin only)
volunteersRouter.post(
  "/opportunities",
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(CreateOpportunityDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateOpportunityDto;
      console.log('Creating opportunity with data:', dto);
      const opportunity = await OpportunityModel.create(dto);
      return res.status(201).json({ success: true, data: opportunity });
    } catch (err) {
      console.error('Error creating opportunity:', err);
      next(err);
    }
  },
);

// PATCH /api/volunteers/opportunities/:id - Update an opportunity (Admin only)
volunteersRouter.patch(
  "/opportunities/:id",
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(UpdateOpportunityDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const opportunity = await OpportunityModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true },
      );
      if (!opportunity) {
        return res
          .status(404)
          .json({ success: false, message: "Opportunity not found" });
      }
      return res.json({ success: true, data: opportunity });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/volunteers/opportunities/:id - Delete an opportunity (Admin only)
volunteersRouter.delete(
  "/opportunities/:id",
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const opportunity = await OpportunityModel.findByIdAndDelete(
        req.params.id,
      );
      if (!opportunity) {
        return res
          .status(404)
          .json({ success: false, message: "Opportunity not found" });
      }
      return res.json({ success: true, message: "Opportunity deleted" });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/volunteers/opportunities/:id/signup - sign up for an opportunity (authenticated users)
volunteersRouter.post(
  "/opportunities/:id/signup",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const opportunity = await OpportunityModel.findById(req.params.id);
      if (!opportunity || !opportunity.isActive) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found",
        });
      }

      const existingApplication = await VolunteerModel.findOne({
        user: req.user!.id,
        notes: {
          $regex: new RegExp(`^Opportunity: ${opportunity.title}$`, "i"),
        },
        status: { $in: ["pending", "active"] },
      });

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: "You have already signed up for this opportunity",
        });
      }

      const museum = await MuseumModel.findOne({ isActive: true }).sort({
        createdAt: -1,
      });

      if (!museum) {
        return res.status(400).json({
          success: false,
          message: "No museum is available to attach this signup",
        });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);

      const volunteer = await VolunteerModel.create({
        user: req.user!.id,
        museum: museum._id,
        startDate,
        role: opportunity.title,
        notes: `Opportunity: ${opportunity.title}\nLocation: ${opportunity.location}\nDuration: ${opportunity.duration}`,
        status: "pending",
      });

      const populated = await volunteer.populate([
        { path: "user", select: "name email" },
        { path: "museum", select: "name city location" },
      ]);

      return res.status(201).json({
        success: true,
        data: populated,
        message: "Signed up successfully",
      });
    } catch (err) {
      next(err);
    }
  },
);

// --- VOLUNTEER APPLICATIONS (Authenticated / Admin) ---

// GET /api/volunteers - list volunteers (users see their own, Admin/Guide see all)
volunteersRouter.get(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, unknown> = {};
      const museumId = req.query.museumId as string | undefined;
      const status = req.query.status as string | undefined;
      const limit = Number(req.query.limit) || 50;
      const skip = Number(req.query.skip) || 0;

      // Non-admins/guides only see their own volunteer records
      if (
        req.user!.role !== UserRole.Admin &&
        req.user!.role !== UserRole.Guide
      ) {
        filter.user = req.user!.id;
      }

      if (museumId) {
        filter.museum = museumId;
      }

      if (status) {
        filter.status = status;
      }

      const volunteers = await VolunteerModel.find(filter)
        .populate("user", "name email")
        .populate("museum", "name city location")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await VolunteerModel.countDocuments(filter);

      return res.json({
        success: true,
        data: volunteers,
        pagination: { limit, skip, total },
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/volunteers/:id - get one volunteer record
volunteersRouter.get(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const volunteer = await VolunteerModel.findById(req.params.id)
        .populate("user", "name email")
        .populate("museum", "name description city location");

      if (!volunteer) {
        return res
          .status(404)
          .json({ success: false, message: "Volunteer record not found" });
      }

      // Non-admins/guides can only view their own records
      const isOwner = volunteer.user._id.toString() === req.user!.id;
      const isAdminOrGuide =
        req.user!.role === UserRole.Admin || req.user!.role === UserRole.Guide;

      if (!isAdminOrGuide && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only view your own volunteer records",
        });
      }

      return res.json({ success: true, data: volunteer });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/volunteers - create volunteer application (authenticated users)
volunteersRouter.post(
  "/",
  authenticate,
  validateBody(CreateVolunteerDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateVolunteerDto;

      // Verify museum exists
      const museum = await MuseumModel.findById(dto.museum);
      if (!museum) {
        return res
          .status(400)
          .json({ success: false, message: "Museum not found" });
      }

      // Validate dates
      const startDate = new Date(dto.startDate);
      if (startDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Start date must be in the future",
        });
      }

      if (dto.endDate) {
        const endDate = new Date(dto.endDate);
        if (endDate <= startDate) {
          return res.status(400).json({
            success: false,
            message: "End date must be after start date",
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
        status: "pending",
      });

      const populated = await volunteer.populate([
        { path: "user", select: "name email" },
        { path: "museum", select: "name city location" },
      ]);

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/volunteers/:id - update volunteer record (owner or Admin/Guide)
volunteersRouter.patch(
  "/:id",
  authenticate,
  validateBody(UpdateVolunteerDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateVolunteerDto;
      const volunteer = await VolunteerModel.findById(req.params.id);

      if (!volunteer) {
        return res
          .status(404)
          .json({ success: false, message: "Volunteer record not found" });
      }

      const isOwner = volunteer.user.toString() === req.user!.id;
      const isAdminOrGuide =
        req.user!.role === UserRole.Admin || req.user!.role === UserRole.Guide;

      // Only owner can update basic info, Admin/Guide can update status
      if (!isAdminOrGuide && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only update your own volunteer records",
        });
      }

      // Non-admins/guides can't change status
      if (!isAdminOrGuide && dto.status) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: Only admins and guides can change volunteer status",
        });
      }

      // Validate dates if updating
      if (dto.startDate || dto.endDate) {
        const startDate = dto.startDate
          ? new Date(dto.startDate)
          : volunteer.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : volunteer.endDate;

        if (endDate && endDate <= startDate) {
          return res.status(400).json({
            success: false,
            message: "End date must be after start date",
          });
        }
      }

      const updated = await VolunteerModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.startDate != null && {
              startDate: new Date(dto.startDate),
            }),
            ...(dto.endDate !== undefined && {
              endDate: dto.endDate ? new Date(dto.endDate) : null,
            }),
            ...(dto.role !== undefined && { role: dto.role }),
            ...(dto.notes !== undefined && { notes: dto.notes }),
            ...(dto.status != null && { status: dto.status }),
          },
        },
        { new: true },
      ).populate([
        { path: "user", select: "name email" },
        { path: "museum", select: "name city location" },
      ]);

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/volunteers/:id - cancel volunteer application (owner or Admin)
volunteersRouter.delete(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const volunteer = await VolunteerModel.findById(req.params.id);

      if (!volunteer) {
        return res
          .status(404)
          .json({ success: false, message: "Volunteer record not found" });
      }

      const isOwner = volunteer.user.toString() === req.user!.id;
      const isAdmin = req.user!.role === UserRole.Admin;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You can only cancel your own volunteer applications",
        });
      }

      // Soft delete: set status to cancelled
      const cancelled = await VolunteerModel.findByIdAndUpdate(
        req.params.id,
        { $set: { status: "cancelled" } },
        { new: true },
      ).populate([
        { path: "user", select: "name email" },
        { path: "museum", select: "name city location" },
      ]);

      return res.json({
        success: true,
        data: cancelled,
        message: "Volunteer application cancelled",
      });
    } catch (err) {
      next(err);
    }
  },
);

export { volunteersRouter };
