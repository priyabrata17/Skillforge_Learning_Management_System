const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminPdfController = require("../../controller/admin/AdminPdfController");

//get about create form
router.get(
  "/admin/pdf-page",
  adminAuthCheck,
  wrapAsync(AdminPdfController.pdfHome)
);

module.exports = router;
