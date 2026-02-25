import mongoose, { Document, Schema } from 'mongoose';

export interface IMuseum extends Document {
  name: string;
  description: string;
  location: string;
  city: string;
  imageUrl?: string;
  openingHours?: string;
  isActive: boolean;
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
    openingHours: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const MuseumModel = mongoose.model<IMuseum>('Museum', MuseumSchema);
