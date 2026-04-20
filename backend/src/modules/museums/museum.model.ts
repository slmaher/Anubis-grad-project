import mongoose, { Document, Schema } from 'mongoose';

export interface IMuseum extends Document {
  name: string;
  description: string;
  location: string;
  city: string;
  imageUrl?: string;
  /** Google Places photo reference – when set, use GET /api/museums/:id/image to get the image from Google */
  googlePhotoReference?: string;
  openingHours?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MuseumSchema = new Schema<IMuseum>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    googlePhotoReference: { type: String, trim: true },
    openingHours: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const MuseumModel = mongoose.model<IMuseum>('Museum', MuseumSchema);
