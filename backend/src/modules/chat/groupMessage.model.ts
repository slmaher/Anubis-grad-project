import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupMessage extends Document {
  group: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMessageSchema = new Schema<IGroupMessage>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true },
);

GroupMessageSchema.index({ group: 1, createdAt: -1 });

export const GroupMessageModel = mongoose.model<IGroupMessage>('GroupMessage', GroupMessageSchema);
