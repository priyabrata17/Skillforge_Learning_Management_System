const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminSubjectsController = require("../../controller/admin/AdminSubjectsController");

//get all subject
router.get(
  "/admin/all-subject",
  adminAuthCheck,
  wrapAsync(AdminSubjectsController.viewSubjectAdmin)
);

//get subject create form
router.get(
  "/admin/create-subject-page",
  adminAuthCheck,
  wrapAsync(AdminSubjectsController.createSubjectformAdmin)
);

//subject create
router.post(
  "/admin/create/subject",
  adminAuthCheck,
  wrapAsync(AdminSubjectsController.createSubjectAdmin)
);

//update subject page
router.get(
  "/admin/update-subject-page/:subjectId",
  adminAuthCheck,
  wrapAsync(AdminSubjectsController.updateSubjectPageAdmin)
);

//update subject
router.patch(
  "/admin/update/subject/:subjectId",
  adminAuthCheck,
  wrapAsync(AdminSubjectsController.updateSubjectAdmin)
);

//delete subject
router.delete(
  "/admin/delete/subject/:subjectId",
  adminAuthCheck,
  wrapAsync(AdminSubjectsController.deleteSubjectAdmin)
);

module.exports = router;
