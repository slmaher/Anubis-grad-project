import mongoose, { Document, Schema } from 'mongoose';

export interface IVolunteer extends Document {
  user: mongoose.Types.ObjectId;
  museum: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  role?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>(
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
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    role: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

export const VolunteerModel = mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);
