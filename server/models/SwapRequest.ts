import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapRequest extends Document {
  _id: string;
  requesterId: string;
  targetId: string;
  offeredSkillId: string;
  wantedSkillId: string;
  message?: string;
  preferredSchedule?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const SwapRequestSchema = new Schema({
  requesterId: {
    type: String,
    required: true,
    ref: 'User'
  },
  targetId: {
    type: String,
    required: true,
    ref: 'User'
  },
  offeredSkillId: {
    type: String,
    required: true,
    ref: 'Skill'
  },
  wantedSkillId: {
    type: String,
    required: true,
    ref: 'Skill'
  },
  message: {
    type: String,
    maxlength: 500
  },
  preferredSchedule: {
    type: String,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const SwapRequest = mongoose.model<ISwapRequest>('SwapRequest', SwapRequestSchema);