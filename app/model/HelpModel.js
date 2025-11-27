const mongoose = require("mongoose");

const HelpSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
  }
);

module.exports = mongoose.model("Help", HelpSchema);
