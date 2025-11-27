const mongoose = require("mongoose");

const FeatureSchema = mongoose.Schema({
  titleOne: {
    type: String,
    required: true,
  },
  descriptionOne: {
    type: String,
    required: true,
  },
  titleTwo: {
    type: String,
    required: true,
  },
  descriptionTwo: {
    type: String,
    required: true,
  },
  titleThree: {
    type: String,
    required: true,
  },
  descriptionThree: {
    type: String,
    required: true,
  },
  titleFour: {
    type: String,
    required: true,
  },
  descriptionFour: {
    type: String,
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
        required: [true, "Image is required"],
      },
    },
    required: [true, "Image is required"],
  }
});

module.exports = mongoose.model("Feature", FeatureSchema);
