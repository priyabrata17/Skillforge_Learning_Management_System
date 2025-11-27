const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const { uploadImage } = require("../../helper/fileUpload");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminFeatureController = require("../../controller/admin/AdminFeaturesController");
//get about create form
router.get(
  "/admin/create-feature-page",
  adminAuthCheck,
  wrapAsync(AdminFeatureController.createFeatureformAdmin)
);

//create Feature
router.post(
  "/admin/create/feature",
  adminAuthCheck,
  uploadImage.single("image"),
  wrapAsync(AdminFeatureController.createFeatureAdmin)
);

//get all Features
router.get(
  "/admin/all-feature",
  adminAuthCheck,
  wrapAsync(AdminFeatureController.allFeatureAdmin)
);

//get update Feature form
router.get(
  "/admin/update-feature-page/:featureId",
  adminAuthCheck,
  wrapAsync(AdminFeatureController.updateFeatureformAdmin)
);

//update Feature
router.patch(
  "/admin/update/feature/:featureId",
  adminAuthCheck,
  uploadImage.single("image"),
  wrapAsync(AdminFeatureController.updateFeatureAdmin)
);

//delete Feature
router.delete(
  "/admin/delete/feature/:featureId",
  adminAuthCheck,
  wrapAsync(AdminFeatureController.deleteFeatureAdmin)
);

module.exports = router;
