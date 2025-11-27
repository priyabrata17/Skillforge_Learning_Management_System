const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const { uploadImage } = require("../../helper/fileUpload");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminAboutController = require("../../controller/admin/AdminAboutController");

//get about create form
router.get(
  "/admin/create-about-page",
  adminAuthCheck,
  wrapAsync(AdminAboutController.createAboutformAdmin)
);

//create about
router.post(
  "/admin/create/about",
  adminAuthCheck,
  uploadImage.single("image"),
  wrapAsync(AdminAboutController.createAboutAdmin)
);

//get all abouts
router.get(
  "/admin/all-about",
  adminAuthCheck,
  wrapAsync(AdminAboutController.allAboutAdmin)
);

//get update about form
router.get(
  "/admin/update-about-page/:aboutId",
  adminAuthCheck,
  wrapAsync(AdminAboutController.updateAboutformAdmin)
);

//update about
router.patch(
  "/admin/update/about/:aboutId",
  adminAuthCheck,
  uploadImage.single("image"),
  wrapAsync(AdminAboutController.updateAboutAdmin)
);

//delete about
router.delete(
  "/admin/delete/about/:aboutId",
  adminAuthCheck,
  wrapAsync(AdminAboutController.deleteAboutAdmin)
);

module.exports = router;
