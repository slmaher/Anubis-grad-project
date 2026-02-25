import mongoose, { Document, Schema } from 'mongoose';

export interface ITourGuide extends Document {
  user: mongoose.Types.ObjectId;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  availability?: {
    days: string[];
    timeSlots: string[];
  };
  rating?: number;
  totalTours?: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TourGuideSchema = new Schema<ITourGuide>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One-to-one relationship
      index: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    specialties: [
      {
        type: String,
        trim: true
      }
    ],
    languages: [
      {
        type: String,
        trim: true
      }
    ],
    experienceYears: {
      type: Number,
      min: 0
    },
    hourlyRate: {
      type: Number,
      min: 0
    },
    availability: {
      days: [String],
      timeSlots: [String]
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalTours: {
      type: Number,
      min: 0,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const TourGuideModel = mongoose.model<ITourGuide>('TourGuide', TourGuideSchema);
