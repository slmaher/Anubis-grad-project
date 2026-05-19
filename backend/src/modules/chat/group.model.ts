import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  },
  { timestamps: true },
);

GroupSchema.index({ owner: 1 });

export const GroupModel = mongoose.model<IGroup>('Group', GroupSchema);
