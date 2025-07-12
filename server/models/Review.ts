import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  swapRequestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema({
  swapRequestId: {
    type: String,
    required: true,
    ref: 'SwapRequest'
  },
  reviewerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  revieweeId: {
    type: String,
    required: true,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);