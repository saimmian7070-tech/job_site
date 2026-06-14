import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  externalId: string;
  title: string;
  slug: string;
  description: string;
  content: string;

  company: {
    name: string;
    logo?: string;
  };

  location: string;
  jobType: string;
  applyUrl: string;

  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };

  source: string;

  isActive: boolean;
  isFeatured?: boolean;
  category?: string;
  expiresAt?: Date;

  postedAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema({
  externalId: { type: String, unique: true, index: true },

  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  description: { type: String },
  content: { type: String },

  company: {
    name: { type: String },
    logo: { type: String },
  },

  location: { type: String },
  jobType: { type: String },
  applyUrl: { type: String },

  salary: {
    min: Number,
    max: Number,
    currency: String,
  },

  source: { type: String, default: "jsearch" },

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  category: { type: String },
  expiresAt: { type: Date },

  postedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;