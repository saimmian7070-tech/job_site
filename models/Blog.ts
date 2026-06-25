import mongoose, { Schema, model, models } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    content: String,
    coverImage: String,
    category: String,
  },
  { timestamps: true }
);

BlogSchema.index({ createdAt: -1 });

const Blog = models.Blog || model("Blog", BlogSchema);

export default Blog;