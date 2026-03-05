import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: { type: String }, // optional image URL
    likes: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const PostModel = mongoose.model<IPost>('Post', PostSchema);
