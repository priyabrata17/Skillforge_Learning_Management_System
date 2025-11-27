
const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0, // helps show videos in correct order
  }
}, { timestamps: true });

module.exports = mongoose.model("Subject", SubjectSchema);
