// src/models/Post.ts
import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  author: string;
  tags?: string[];
  category?: string; // For preferences
  isPublished: boolean;
  seriesId?: string; // For sequential blogs
  partNumber?: number; // For sequential blogs
  likesCount: number;
  commentsCount: number;
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  tags: [
    { type: String }
  ],
  category: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  seriesId: {
    type: String
  },
  partNumber: {
    type: Number
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Use existing model if it exists, otherwise create a new one
const Post = models.Post || model<IPost>('Post', PostSchema);

export default Post;