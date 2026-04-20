import { NextFunction, Response, Router } from "express";

import { EventModel } from "./event.model";
import { MuseumModel } from "../museums/museum.model";
import { CreateEventDto, UpdateEventDto } from "./event.dto";
import {
  authenticate,
  authorizeRoles,
  AuthenticatedRequest,
} from "../../common/middleware/auth";
import { validateBody } from "../../common/middleware/validationMiddleware";
import { UserRole } from "../users/user.roles";

const eventsRouter = Router();

// GET /api/events - list all active events (public)
eventsRouter.get("/", async (req, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    const museumId = req.query.museumId as string | undefined;

    if (museumId) {
      filter.museum = museumId;
    }

    const events = await EventModel.find(filter)
      .populate("museum", "name city location")
      .sort({ startDate: 1 });

    return res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id - get one event (public)
eventsRouter.get("/:id", async (req, res: Response, next: NextFunction) => {
  try {
    const event = await EventModel.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("museum", "name description city location openingHours");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    return res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// POST /api/events - create event (Admin only)
eventsRouter.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(CreateEventDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateEventDto;

      // Verify museum exists
      const museumExists = await MuseumModel.findById(dto.museum);
      if (!museumExists) {
        return res
          .status(400)
          .json({ success: false, message: "Museum not found" });
      }

      // Validate dates
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (startDate >= endDate) {
        return res
          .status(400)
          .json({
            success: false,
            message: "End date must be after start date",
          });
      }

      if (startDate < new Date()) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Start date must be in the future",
          });
      }

      const event = await EventModel.create({
        title: dto.title,
        description: dto.description,
        museum: dto.museum,
        startDate: startDate,
        endDate: endDate,
        location: dto.location,
        imageUrl: dto.imageUrl,
        maxAttendees: dto.maxAttendees,
      });

      const populated = await event.populate("museum", "name city location");
      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/events/:id - update event (Admin only)
eventsRouter.patch(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(UpdateEventDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateEventDto;

      // If updating museum, verify it exists
      if (dto.museum) {
        const museumExists = await MuseumModel.findById(dto.museum);
        if (!museumExists) {
          return res
            .status(400)
            .json({ success: false, message: "Museum not found" });
        }
      }

      const existingEvent = await EventModel.findById(req.params.id);
      if (!existingEvent) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      // Validate dates if updating
      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : existingEvent.startDate;
      const endDate = dto.endDate
        ? new Date(dto.endDate)
        : existingEvent.endDate;

      if (startDate >= endDate) {
        return res
          .status(400)
          .json({
            success: false,
            message: "End date must be after start date",
          });
      }

      const updateDoc: Record<string, unknown> = {
        $set: {
          ...(dto.title != null && { title: dto.title }),
          ...(dto.description != null && { description: dto.description }),
          ...(dto.museum != null && { museum: dto.museum }),
          ...(dto.startDate != null && { startDate: new Date(dto.startDate) }),
          ...(dto.endDate != null && { endDate: new Date(dto.endDate) }),
          ...(dto.location !== undefined && { location: dto.location }),
          ...(dto.maxAttendees !== undefined && {
            maxAttendees: dto.maxAttendees,
          }),
        },
      };

      if (dto.imageUrl === null) {
        updateDoc.$unset = { imageUrl: "" };
      } else if (dto.imageUrl !== undefined) {
        (updateDoc.$set as Record<string, unknown>).imageUrl = dto.imageUrl;
      }

      const updated = await EventModel.findByIdAndUpdate(
        req.params.id,
        updateDoc,
        { new: true },
      ).populate("museum", "name city location");

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/events/:id - soft delete event (Admin only)
eventsRouter.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const event = await EventModel.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true },
      ).populate("museum", "name city location");

      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      return res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  },
);

export { eventsRouter };
