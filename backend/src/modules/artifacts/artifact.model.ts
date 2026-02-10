import mongoose, { Document, Schema } from 'mongoose';

export interface IArtifact extends Document {
  name: string;
  description: string;
  museum: mongoose.Types.ObjectId;
  era?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArtifactSchema = new Schema<IArtifact>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    museum: {
      type: Schema.Types.ObjectId,
      ref: 'Museum',
      required: true
    },
    era: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ArtifactModel = mongoose.model<IArtifact>('Artifact', ArtifactSchema);
