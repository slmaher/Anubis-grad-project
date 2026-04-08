import mongoose, { Document, Schema } from 'mongoose';

export interface IPostComment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  comments: IPostComment[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: { type: String }, // optional image URL
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const PostModel = mongoose.model<IPost>('Post', PostSchema);
