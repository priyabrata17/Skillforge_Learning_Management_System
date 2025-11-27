const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminEnrollmentController = require("../../controller/admin/AdminEnrollmentController");

//get all enrollments
router.get(
  "/admin/all-enrollment",
  adminAuthCheck,
  wrapAsync(AdminEnrollmentController.allEnrollmentAdmin)
);

//update enrollment
router.patch(
  "/admin/update/enrollment/:enrollmentId",
  adminAuthCheck,
  wrapAsync(AdminEnrollmentController.updateEnrollmentAdmin)
);

//delete delete
router.delete(
  "/admin/delete/enrollment/:enrollmentId",
  adminAuthCheck,
  wrapAsync(AdminEnrollmentController.deleteEnrollmentAdmin)
);

module.exports = router;
