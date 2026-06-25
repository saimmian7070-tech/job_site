import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  externalId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  rawHash?: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  jobType: string;
  applyUrl: string;
  salary?: string;
  source: string;
  isActive: boolean;
  isFeatured?: boolean;
  category?: string;
  expiresAt?: Date;
  score?: number;
  postedAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema({
  externalId: { type: String, unique: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  content: { type: String },
  rawHash: { type: String, default: "" },
  company: {
    name: { type: String },
    logo: { type: String },
  },
  location: { type: String },
  jobType: { type: String },
  applyUrl: { type: String },
  salary: { type: String, default: "" },
  source: { type: String, default: "imported" },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  category: { type: String },
  expiresAt: { type: Date },
  score: { type: Number, default: 0 },
  postedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
});

JobSchema.index({ isActive: 1, postedAt: -1 });
JobSchema.index({ isActive: 1, category: 1 });
JobSchema.index({ isActive: 1, jobType: 1 });

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;