import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  files: Object,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", ProjectSchema);