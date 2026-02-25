import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  user: mongoose.Types.ObjectId;
  museum: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod?: string;
  isAnonymous: boolean;
  message?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    museum: {
      type: Schema.Types.ObjectId,
      ref: 'Museum',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    currency: {
      type: String,
      required: true,
      default: 'EGP',
      uppercase: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      trim: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const DonationModel = mongoose.model<IDonation>('Donation', DonationSchema);
