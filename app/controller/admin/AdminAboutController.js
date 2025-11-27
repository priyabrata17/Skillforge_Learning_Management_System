const AboutModel = require("../../model/AboutModel");
const { cloudinary } = require("../../helper/cloudFileUpload");

class AboutController {
  // create about form
  async createAboutformAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-about");
    }

    return res.render("adminPanel/createAbout");
  }

  //create about
  async createAboutAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      if(req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-about");
    }

    const { title, description } = req.body;
    if (!title || !description) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/admin/create-about-page");
    }

    const newAbout = new AboutModel({
      title,
      description,
    });

    if (req.file) {
      newAbout.image = {
        url: req.file.path,
        imageId: req.file.filename,
      };
    }

    await newAbout.save();
    req.flash("successrMsg", "A new about created successfully");
    return res.redirect("/admin/all-about");
  }

  //get all about
  async allAboutAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-about");
    }

    const abouts = await AboutModel.aggregate([
      {
        $match: {},
      },
    ]);
    return res.render("adminPanel/abouts", { abouts });
  }

  // updatee about form
  async updateAboutformAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-about");
    }

    const existingAbout = await AboutModel.findById(req.params.aboutId);
    if (!existingAbout) {
      req.flash("errorMsg", "About does not exists");
      return res.redirect("/admin/all-about");
    }
    return res.render("adminPanel/updateAbout", { existingAbout });
  }

  //Update about
  async updateAboutAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      if(req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-about");
    }

    const { title, description } = req.body;
    if (!title || !description) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/admin/create-about-page");
    }

    const existingAbout = await AboutModel.findById(req.params.aboutId);
    if (!existingAbout) {
      req.flash("errorMsg", "About does not exists");
      return res.redirect("/admin/all-about");
    }
    Object.assign(existingAbout, {
        title,
        description
    });

    if (req.file) {
      if(existingAbout.image) {
        await cloudinary.uploader.destroy(existingAbout.image.imageId);
      }
      existingAbout.image = {
        url: req.file.path,
        imageId: req.file.filename
      }
    }

    await existingAbout.save();
    req.flash("successMsg", "Your about section updated successfully");
    return res.redirect("/admin/all-about");
  }

  //delete about
  async deleteAboutAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-about");
    }

    const existingAbout = await AboutModel.findById(req.params.aboutId);
    if (!existingAbout) {
      req.flash("errorMsg", "About does not exists");
      return res.redirect("/admin/all-about");
    }

    if (existingAbout.image) {
      await cloudinary.uploader.destroy(existingAbout.image.imageId);
    }

    await AboutModel.findByIdAndDelete(req.params.aboutId);
    req.flash("successMsg", "Your about section deleted successfully");
    return res.redirect("/admin/all-about");
  }
}

module.exports = new AboutController();