import { NextFunction, Response, Router } from 'express';

import { MessageModel } from './message.model';
import { UserModel } from '../users/user.model';
import { CreateMessageDto, MarkAsReadDto } from './message.dto';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { SocketService } from './socket.service';

const chatRouter = Router();

// POST /api/chat/messages - send a message
chatRouter.post(
  '/messages',
  authenticate,
  validateBody(CreateMessageDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateMessageDto;
      const senderId = req.user!.id;

      // Verify receiver exists
      const receiver = await UserModel.findById(dto.receiver);
      if (!receiver) {
        return res.status(400).json({ success: false, message: 'Receiver not found' });
      }

      // Prevent users from messaging themselves
      if (senderId === dto.receiver) {
        return res.status(400).json({ success: false, message: 'Cannot send message to yourself' });
      }

      const message = await MessageModel.create({
        sender: senderId,
        receiver: dto.receiver,
        content: dto.content
      });

      const populated = await message.populate([
        { path: 'sender', select: 'name email' },
        { path: 'receiver', select: 'name email' }
      ]);

      // Emit real-time update
      try {
        const socketService = SocketService.getInstance();
        socketService.emitToUser(dto.receiver, 'new_message', populated);
      } catch (err) {
        console.error('Failed to emit socket event:', err);
      }

      return res.status(201).json({
        success: true,
        data: populated
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/chat/messages - get all messages for the authenticated user
chatRouter.get(
  '/messages',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { conversationWith, limit = '50', skip = '0' } = req.query;

      let filter: Record<string, unknown> = {
        $or: [{ sender: userId }, { receiver: userId }]
      };

      // If conversationWith is provided, get messages between current user and that user
      if (conversationWith) {
        filter = {
          $or: [
            { sender: userId, receiver: conversationWith },
            { sender: conversationWith, receiver: userId }
          ]
        };
      }

      const messages = await MessageModel.find(filter)
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip));

      return res.json({
        success: true,
        data: messages,
        pagination: {
          limit: Number(limit),
          skip: Number(skip),
          total: await MessageModel.countDocuments(filter)
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/chat/messages/:id - get a specific message
chatRouter.get(
  '/messages/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const message = await MessageModel.findById(req.params.id)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      // Users can only view messages they sent or received
      const isSender = message.sender._id.toString() === userId;
      const isReceiver = message.receiver._id.toString() === userId;

      if (!isSender && !isReceiver) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view your own messages'
        });
      }

      return res.json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/chat/conversations - get list of conversations (unique users you've messaged with)
chatRouter.get(
  '/conversations',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get distinct users the current user has conversations with
      const sentMessages = await MessageModel.distinct('receiver', { sender: userId });
      const receivedMessages = await MessageModel.distinct('sender', { receiver: userId });
      const allUserIds = [...new Set([...sentMessages, ...receivedMessages].map(id => id.toString()))];

      // Get last message for each conversation
      const conversations = await Promise.all(
        allUserIds.map(async (otherUserId) => {
          const lastMessage = await MessageModel.findOne({
            $or: [
              { sender: userId, receiver: otherUserId },
              { sender: otherUserId, receiver: userId }
            ]
          })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 })
            .limit(1);

          const unreadCount = await MessageModel.countDocuments({
            sender: otherUserId,
            receiver: userId,
            isRead: false
          });

          const otherUser = await UserModel.findById(otherUserId).select('name email');

          return {
            user: otherUser,
            lastMessage: lastMessage,
            unreadCount: unreadCount
          };
        })
      );

      return res.json({ success: true, data: conversations });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/chat/messages/:id/read - mark a message as read
chatRouter.patch(
  '/messages/:id/read',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const message = await MessageModel.findById(req.params.id);

      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      // Only receiver can mark as read
      if (message.receiver.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only the receiver can mark messages as read'
        });
      }

      const updated = await MessageModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        },
        { new: true }
      ).populate([
        { path: 'sender', select: 'name email' },
        { path: 'receiver', select: 'name email' }
      ]);

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/chat/conversations/:userId/read-all - mark all messages from a user as read
chatRouter.patch(
  '/conversations/:userId/read-all',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user!.id;
      const otherUserId = req.params.userId;

      // Verify other user exists
      const otherUser = await UserModel.findById(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const result = await MessageModel.updateMany(
        {
          sender: otherUserId,
          receiver: currentUserId,
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      return res.json({
        success: true,
        message: `Marked ${result.modifiedCount} messages as read`,
        data: { modifiedCount: result.modifiedCount }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/chat/unread-count - get count of unread messages
chatRouter.get(
  '/unread-count',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const unreadCount = await MessageModel.countDocuments({
        receiver: userId,
        isRead: false
      });

      return res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (err) {
      next(err);
    }
  }
);

export { chatRouter };
