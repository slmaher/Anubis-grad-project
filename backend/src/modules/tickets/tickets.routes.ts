import { NextFunction, Response, Router } from 'express';

import { TicketModel } from './ticket.model';
import { MuseumModel } from '../museums/museum.model';
import { CreateTicketDto, UpdateTicketDto } from './ticket.dto';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { UserRole } from '../users/user.roles';

const ticketsRouter = Router();

// GET /api/tickets - list tickets (users see their own, Admin sees all)
ticketsRouter.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, unknown> = {};
      
      // Non-admins only see their own tickets
      if (req.user!.role !== UserRole.Admin) {
        filter.user = req.user!.id;
      }

      const tickets = await TicketModel.find(filter)
        .populate('user', 'name email')
        .populate('museum', 'name city location')
        .sort({ createdAt: -1 });
      
      return res.json({ success: true, data: tickets });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/tickets/:id - get one ticket
ticketsRouter.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ticket = await TicketModel.findById(req.params.id)
        .populate('user', 'name email')
        .populate('museum', 'name description city location openingHours');
      
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      // Non-admins can only view their own tickets
      if (req.user!.role !== UserRole.Admin && ticket.user._id.toString() !== req.user!.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own tickets' });
      }

      return res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/tickets - create ticket (authenticated users)
ticketsRouter.post(
  '/',
  authenticate,
  validateBody(CreateTicketDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateTicketDto;
      
      // Verify museum exists
      const museumExists = await MuseumModel.findById(dto.museum);
      if (!museumExists) {
        return res.status(400).json({ success: false, message: 'Museum not found' });
      }

      // Verify visit date is in the future
      const visitDate = new Date(dto.visitDate);
      if (visitDate < new Date()) {
        return res.status(400).json({ success: false, message: 'Visit date must be in the future' });
      }

      const ticket = await TicketModel.create({
        user: req.user!.id,
        museum: dto.museum,
        visitDate: visitDate,
        numberOfGuests: dto.numberOfGuests,
        totalPrice: dto.totalPrice,
        status: dto.status || 'pending'
      });

      const populated = await ticket.populate([
        { path: 'user', select: 'name email' },
        { path: 'museum', select: 'name city location' }
      ]);

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/tickets/:id - update ticket (Admin only, or user can cancel their own)
ticketsRouter.patch(
  '/:id',
  authenticate,
  validateBody(UpdateTicketDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateTicketDto;
      const ticket = await TicketModel.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      // Users can only cancel their own tickets, Admin can do anything
      const isOwner = ticket.user.toString() === req.user!.id;
      const isAdmin = req.user!.role === UserRole.Admin;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own tickets' });
      }

      // Non-admins can only cancel (set status to cancelled)
      if (!isAdmin && dto.status && dto.status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'You can only cancel your own tickets' });
      }

      // If updating museum, verify it exists
      if (dto.museum) {
        const museumExists = await MuseumModel.findById(dto.museum);
        if (!museumExists) {
          return res.status(400).json({ success: false, message: 'Museum not found' });
        }
      }

      // If updating visit date, verify it's in the future
      if (dto.visitDate) {
        const visitDate = new Date(dto.visitDate);
        if (visitDate < new Date()) {
          return res.status(400).json({ success: false, message: 'Visit date must be in the future' });
        }
      }

      const updated = await TicketModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.museum != null && { museum: dto.museum }),
            ...(dto.visitDate != null && { visitDate: new Date(dto.visitDate) }),
            ...(dto.numberOfGuests != null && { numberOfGuests: dto.numberOfGuests }),
            ...(dto.totalPrice != null && { totalPrice: dto.totalPrice }),
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

// DELETE /api/tickets/:id - cancel/delete ticket (Admin or owner)
ticketsRouter.delete(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ticket = await TicketModel.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      const isOwner = ticket.user.toString() === req.user!.id;
      const isAdmin = req.user!.role === UserRole.Admin;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own tickets' });
      }

      // Soft delete: set status to cancelled
      const cancelled = await TicketModel.findByIdAndUpdate(
        req.params.id,
        { $set: { status: 'cancelled' } },
        { new: true }
      ).populate([
        { path: 'user', select: 'name email' },
        { path: 'museum', select: 'name city location' }
      ]);

      return res.json({ success: true, data: cancelled, message: 'Ticket cancelled' });
    } catch (err) {
      next(err);
    }
  }
);

export { ticketsRouter };
