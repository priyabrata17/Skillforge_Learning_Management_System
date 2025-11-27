
const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: ["student","teacher","admin"],
      required: true,
      default: "student"
    },
    roleDescription: {
      type: String,
      required: true,
      default: "Student"
    },
    image: {
      type: {
        url: {
          type: String,
          required: [true, "Image is required"],
        },
        imageId: {
          type: String,
          required: [true, "Image is required"],
        },
      },
      required: [true, "Image is required"]
    }
  },
  { timestamps: true }
);

UserSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("User", UserSchema);
