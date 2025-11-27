const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const { uploadImage } = require("../../helper/fileUpload");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminCourseController = require("../../controller/admin/AdminCourseController");

//get all course
router.get(
  "/admin/all-course",
  adminAuthCheck,
  wrapAsync(AdminCourseController.viewCourseAdmin)
);

//get course create form
router.get(
  "/admin/create-course-page",
  adminAuthCheck,
  wrapAsync(AdminCourseController.createCourseformAdmin)
);

//course create
router.post(
  "/admin/create/course",
  adminAuthCheck,
  uploadImage.single("image"),
  wrapAsync(AdminCourseController.createCourseAdmin)
);

//update course page
router.get(
  "/admin/update-course-page/:courseId",
  adminAuthCheck,
  wrapAsync(AdminCourseController.updateCoursePageAdmin)
);

//update course
router.patch(
  "/admin/update/course/:courseId",
  adminAuthCheck,
  uploadImage.single("image"),
  wrapAsync(AdminCourseController.updateCourseAdmin)
);

//delete course
router.delete(
  "/admin/delete/course/:courseId",
  adminAuthCheck,
  wrapAsync(AdminCourseController.deleteCourseAdmin)
);

module.exports = router;
