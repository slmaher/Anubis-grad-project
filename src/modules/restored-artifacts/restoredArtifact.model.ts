import mongoose, { Document, Schema } from 'mongoose';

export interface IRestoredArtifact extends Document {
  user: mongoose.Types.ObjectId;
  artifact: mongoose.Types.ObjectId;
  originalImageUrl: string;
  restoredImageUrl: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const RestoredArtifactSchema = new Schema<IRestoredArtifact>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    artifact: {
      type: Schema.Types.ObjectId,
      ref: 'Artifact',
      required: true
    },
    originalImageUrl: {
      type: String,
      required: true,
      trim: true
    },
    restoredImageUrl: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

export const RestoredArtifactModel = mongoose.model<IRestoredArtifact>(
  'RestoredArtifact',
  RestoredArtifactSchema
);
