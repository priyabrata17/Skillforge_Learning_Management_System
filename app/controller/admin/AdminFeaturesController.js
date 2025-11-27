const FeatureModel = require("../../model/FeaturesModel");
const { cloudinary } = require("../../helper/cloudFileUpload");

class FeatureController {
  // create feature form
  async createFeatureformAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-feature");
    }

    return res.render("adminPanel/createFeature");
  }

  //create feature
  async createFeatureAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-feature");
    }

    const {
      titleOne,
      descriptionOne,
      titleTwo,
      descriptionTwo,
      titleThree,
      descriptionThree,
      titleFour,
      descriptionFour,
    } = req.body;
    if (
      !titleOne ||
      !descriptionOne ||
      !titleTwo ||
      !descriptionTwo ||
      !titleThree ||
      !descriptionThree ||
      !titleFour ||
      !descriptionFour
    ) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/admin/create-feature-page");
    }

    const newFeature = new FeatureModel({
      titleOne,
      descriptionOne,
      titleTwo,
      descriptionTwo,
      titleThree,
      descriptionThree,
      titleFour,
      descriptionFour,
    });

    if (req.file) {
      newFeature.image = {
        url: req.file.path,
        imageId: req.file.filename,
      };
    }

    await newFeature.save();
    req.flash("successrMsg", "A new feature created successfully");
    return res.redirect("/admin/all-feature");
  }

  //get all feature
  async allFeatureAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-feature");
    }

    const features = await FeatureModel.aggregate([
      {
        $match: {},
      },
      {
        $sort: {
          createdAt: -1,
        }
      },
    ]);
    return res.render("adminPanel/features", { features });
  }

  // updatee feature form
  async updateFeatureformAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-feature");
    }

    const existingFeature = await FeatureModel.findById(req.params.featureId);
    if (!existingFeature) {
      req.flash("errorMsg", "Feature does not exists");
      return res.redirect("/admin/all-feature");
    }
    return res.render("adminPanel/updateFeature", { existingFeature });
  }

  //Update feature
  async updateFeatureAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-feature");
    }

    const {
      titleOne,
      descriptionOne,
      titleTwo,
      descriptionTwo,
      titleThree,
      descriptionThree,
      titleFour,
      descriptionFour,
    } = req.body;
    if (
      !titleOne ||
      !descriptionOne ||
      !titleTwo ||
      !descriptionTwo ||
      !titleThree ||
      !descriptionThree ||
      !titleFour ||
      !descriptionFour
    ) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/admin/create-feature-page");
    }

    const existingFeature = await FeatureModel.findById(req.params.featureId);
    if (!existingFeature) {
      req.flash("errorMsg", "Feature does not exists");
      return res.redirect("/admin/all-feature");
    }
    Object.assign(existingFeature, {
      titleOne,
      descriptionOne,
      titleTwo,
      descriptionTwo,
      titleThree,
      descriptionThree,
      titleFour,
      descriptionFour,
    });

    if (req.file) {
      if (existingFeature.image) {
        await cloudinary.uploader.destroy(existingFeature.image.imageId);
      }
      existingFeature.image = {
        url: req.file.path,
        imageId: req.file.filename,
      };
    }

    await existingFeature.save();
    req.flash("successMsg", "Your feature updated successfully");
    return res.redirect("/admin/all-feature");
  }

  //delete feature
  async deleteFeatureAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-feature");
    }

    const existingFeature = await FeatureModel.findById(req.params.featureId);
    if (!existingFeature) {
      req.flash("errorMsg", "Feature does not exists");
      return res.redirect("/admin/all-feature");
    }

    if (existingFeature.image) {
      await cloudinary.uploader.destroy(existingFeature.image.imageId);
    }

    await FeatureModel.findByIdAndDelete(req.params.featureId);
    req.flash("successMsg", "Your feature section deleted successfully");
    return res.redirect("/admin/all-feature");
  }
}

module.exports = new FeatureController();
