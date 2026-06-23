import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  model: { type: String, default: "llama-3.3-70b-versatile" },
  modelIndex: { type: Number, default: 0 },
  paused: { type: Boolean, default: false },
  pausedReason: { type: String, default: "" },
  pausedAt: { type: Date, default: null },
  lastCompanyIndex: { type: Number, default: 0 },
});

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);