import mongoose, { Document, Schema } from "mongoose";

export enum FriendRequestStatus {
  Pending = "pending",
  Accepted = "accepted",
  Rejected = "rejected",
}

export interface IFriendRequest extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: FriendRequestStatus;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.Pending,
    },
    respondedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export const FriendRequestModel = mongoose.model<IFriendRequest>(
  "FriendRequest",
  FriendRequestSchema,
);
