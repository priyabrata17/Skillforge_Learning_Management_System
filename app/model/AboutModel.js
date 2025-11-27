const mongoose = require("mongoose");

const AboutSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
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

module.exports = mongoose.model("About", AboutSchema);
