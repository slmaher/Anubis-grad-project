import { NextFunction, Response, Router } from "express";

import {
  authenticate,
  AuthenticatedRequest,
} from "../../common/middleware/auth";
import { validateBody } from "../../common/middleware/validationMiddleware";
import { UserModel } from "../users/user.model";
import { CreateFriendRequestDto } from "./friendRequest.dto";
import { FriendRequestModel, FriendRequestStatus } from "./friendRequest.model";

const friendsRouter = Router();

function isFriendId(
  list: Array<{ toString(): string }> | undefined,
  id: string,
) {
  return Boolean(list?.some((friendId) => friendId.toString() === id));
}

// GET /api/friends - list current user's accepted friends
friendsRouter.get(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.user!.id).populate(
        "friends",
        "name email avatar role isActive",
      );

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const friends = Array.isArray(user.friends)
        ? user.friends.map((friend: any) => ({
            id: friend._id || friend.id,
            name: friend.name,
            email: friend.email,
            avatar: friend.avatar,
            role: friend.role,
            isActive: friend.isActive,
          }))
        : [];

      return res.json({ success: true, data: friends });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/friends/requests/incoming - pending friend requests for current user
friendsRouter.get(
  "/requests/incoming",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const requests = await FriendRequestModel.find({
        receiver: req.user!.id,
        status: FriendRequestStatus.Pending,
      })
        .populate("sender", "name email avatar role")
        .sort({ createdAt: -1 });

      const data = requests.map((request) => ({
        id: request.id,
        senderId:
          request.sender && typeof request.sender === "object"
            ? request.sender._id
            : request.sender,
        senderName:
          request.sender && typeof request.sender === "object"
            ? (request.sender as any).name
            : undefined,
        senderAvatar:
          request.sender && typeof request.sender === "object"
            ? (request.sender as any).avatar
            : undefined,
        status: request.status,
        createdAt: request.createdAt,
      }));

      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/friends/requests/status/:receiverId - current relationship state with a user
friendsRouter.get(
  "/requests/status/:receiverId",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.id;
      const receiverId = req.params.receiverId;

      if (senderId === receiverId) {
        return res.json({
          success: true,
          data: { relationship: "self" },
        });
      }

      const [sender, receiver] = await Promise.all([
        UserModel.findById(senderId).select("friends"),
        UserModel.findById(receiverId).select("friends"),
      ]);

      if (!receiver) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (isFriendId(sender?.friends, receiverId)) {
        return res.json({
          success: true,
          data: { relationship: "friends" },
        });
      }

      const outgoingRequest = await FriendRequestModel.findOne({
        sender: senderId,
        receiver: receiverId,
        status: FriendRequestStatus.Pending,
      });

      if (outgoingRequest) {
        return res.json({
          success: true,
          data: {
            relationship: "pending_outgoing",
            requestId: outgoingRequest.id,
            status: outgoingRequest.status,
          },
        });
      }

      const incomingRequest = await FriendRequestModel.findOne({
        sender: receiverId,
        receiver: senderId,
        status: FriendRequestStatus.Pending,
      });

      if (incomingRequest) {
        return res.json({
          success: true,
          data: {
            relationship: "pending_incoming",
            requestId: incomingRequest.id,
            status: incomingRequest.status,
          },
        });
      }

      return res.json({
        success: true,
        data: { relationship: "none" },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/friends/requests - send a friend request
friendsRouter.post(
  "/requests",
  authenticate,
  validateBody(CreateFriendRequestDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { receiverId } = req.body as CreateFriendRequestDto;
      const senderId = req.user!.id;

      if (senderId === receiverId) {
        return res.status(400).json({
          success: false,
          message: "You cannot send a friend request to yourself",
        });
      }

      const [sender, receiver] = await Promise.all([
        UserModel.findById(senderId).select("friends"),
        UserModel.findById(receiverId).select("friends"),
      ]);

      if (!sender || !receiver) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (
        isFriendId(sender.friends, receiverId) ||
        isFriendId(receiver.friends, senderId)
      ) {
        return res
          .status(409)
          .json({ success: false, message: "You are already friends" });
      }

      const existingRequest = await FriendRequestModel.findOne({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
        status: FriendRequestStatus.Pending,
      });

      if (existingRequest) {
        return res.status(409).json({
          success: false,
          message: "A pending friend request already exists",
        });
      }

      const request = await FriendRequestModel.create({
        sender: senderId,
        receiver: receiverId,
      });

      const populated = await request.populate(
        "sender receiver",
        "name email avatar role",
      );

      return res.status(201).json({
        success: true,
        data: {
          id: populated.id,
          senderId: (populated.sender as any)._id,
          senderName: (populated.sender as any).name,
          senderAvatar: (populated.sender as any).avatar,
          receiverId: (populated.receiver as any)._id,
          receiverName: (populated.receiver as any).name,
          receiverAvatar: (populated.receiver as any).avatar,
          status: populated.status,
          createdAt: populated.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/friends/requests/:requestId/accept - accept a pending request
friendsRouter.post(
  "/requests/:requestId/accept",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const request = await FriendRequestModel.findOne({
        _id: req.params.requestId,
        receiver: req.user!.id,
        status: FriendRequestStatus.Pending,
      });

      if (!request) {
        return res
          .status(404)
          .json({ success: false, message: "Friend request not found" });
      }

      const senderId = request.sender.toString();
      const receiverId = request.receiver.toString();

      await Promise.all([
        UserModel.findByIdAndUpdate(senderId, {
          $addToSet: { friends: receiverId },
        }),
        UserModel.findByIdAndUpdate(receiverId, {
          $addToSet: { friends: senderId },
        }),
        FriendRequestModel.findByIdAndUpdate(request.id, {
          $set: {
            status: FriendRequestStatus.Accepted,
            respondedAt: new Date(),
          },
        }),
      ]);

      const updatedRequest = await FriendRequestModel.findById(
        request.id,
      ).populate("sender receiver", "name email avatar role");

      return res.json({
        success: true,
        data: {
          id: updatedRequest!.id,
          senderId: (updatedRequest!.sender as any)._id,
          senderName: (updatedRequest!.sender as any).name,
          senderAvatar: (updatedRequest!.sender as any).avatar,
          receiverId: (updatedRequest!.receiver as any)._id,
          receiverName: (updatedRequest!.receiver as any).name,
          receiverAvatar: (updatedRequest!.receiver as any).avatar,
          status: updatedRequest!.status,
          respondedAt: updatedRequest!.respondedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/friends/requests/:requestId/reject - reject a pending request
friendsRouter.post(
  "/requests/:requestId/reject",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const request = await FriendRequestModel.findOne({
        _id: req.params.requestId,
        receiver: req.user!.id,
        status: FriendRequestStatus.Pending,
      });

      if (!request) {
        return res
          .status(404)
          .json({ success: false, message: "Friend request not found" });
      }

      await FriendRequestModel.findByIdAndUpdate(request.id, {
        $set: {
          status: FriendRequestStatus.Rejected,
          respondedAt: new Date(),
        },
      });

      return res.json({
        success: true,
        data: { id: request.id, status: FriendRequestStatus.Rejected },
      });
    } catch (err) {
      next(err);
    }
  },
);

export { friendsRouter };
