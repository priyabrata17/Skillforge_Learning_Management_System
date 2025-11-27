
const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const CourseSchema = mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: {
        url: {
          type: String,
          required: [true, "Image is required"],
        },
        imageId: {
          type: String,
          required: [true, "Image is required"]
        },
      },
      required: [true, "Image is required"]
    },
    title: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },
    skillLevel: {
      type: String,
    },
    certificate: {
      type: String,
    }
  },
  { timestamps: true }
);

CourseSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Course", CourseSchema);
