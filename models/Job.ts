import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  category: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  company: {
  name: string;
};
  location: string;
  postedAt: Date;
  jobType: string;
requirements: string[];
applyUrl: string;
isActive: boolean;
}

const JobSchema: Schema<IJob> = new Schema({
  jobType: { type: String },
requirements: [{ type: String }],
applyUrl: { type: String },
isActive: { type: Boolean },
  title: { type: String, required: true },
  category: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: {
  type: String,
},
  company: {
  name: { type: String, required: true },
},
  location: { type: String },
  postedAt: { type: Date, default: Date.now },
});


const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;