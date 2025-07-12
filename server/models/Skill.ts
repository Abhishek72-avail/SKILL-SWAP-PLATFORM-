import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  _id: string;
  userId: string;
  name: string;
  type: 'offered' | 'wanted';
  description?: string;
  category?: string;
  level?: string;
  priority?: string;
  createdAt: Date;
}

const SkillSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['offered', 'wanted']
  },
  description: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema);