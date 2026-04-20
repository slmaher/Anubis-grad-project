import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  imageUrl?: string;
  icon?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    goalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    imageUrl: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      default: 'heart-outline'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const CampaignModel = mongoose.model<ICampaign>('Campaign', CampaignSchema);
