const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminHelpController = require("../../controller/admin/AdminHelpController");

//get all help
router.get(
  "/admin/all-help",
  adminAuthCheck,
  wrapAsync(AdminHelpController.getAllHelpAdmin)
);

//update help
router.patch(
  "/admin/update/help/:helpId",
  adminAuthCheck,
  wrapAsync(AdminHelpController.updateHelpAdmin)
);

//delete help
router.delete(
  "/admin/delete/help/:helpId",
  adminAuthCheck,
  wrapAsync(AdminHelpController.deleteHelpAdmin)
);

module.exports = router;