import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  museum: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  recommend?: boolean;
  easeRating?: number;
  facilitiesRating?: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true,
      maxlength: 140
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    recommend: {
      type: Boolean,
      default: false
    },
    easeRating: {
      type: Number,
      min: 1,
      max: 5
    },
    facilitiesRating: {
      type: Number,
      min: 1,
      max: 5
    },
    images: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews: one user can only review a museum once
ReviewSchema.index({ user: 1, museum: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
