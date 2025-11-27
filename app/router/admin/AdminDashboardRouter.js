
const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const adminAuthCheck = require("../../middleware/AuthCheckAdmin");
const AdminDashboardController = require("../../controller/admin/AdminDashboardController");


//Login form
router.get("/admin/login-page", wrapAsync(AdminDashboardController.adminLoginForm));

//Login User
router.post(
    "/admin/login", 
    wrapAsync(AdminDashboardController.adminLogin)
);

//Logout
router.get(
    "/admin/logout", 
    adminAuthCheck, 
    wrapAsync(AdminDashboardController.adminLogout)
);

//Dashboard
router.get("/admin/dashboard", adminAuthCheck, wrapAsync(AdminDashboardController.dashboard));

//All User
router.get(
    "/admin/all-user",
    adminAuthCheck,
    wrapAsync(AdminDashboardController.adminAllUser)
);

//Update User Page
router.get(
    "/admin/update/user-page/:userId",
    adminAuthCheck,
    wrapAsync(AdminDashboardController.adminUpdateUserPage)
);

//Update User
router.patch(
    "/admin/update/user/:userId",
    adminAuthCheck,
    wrapAsync(AdminDashboardController.adminUpdateUser)
);

//Delete User
router.delete("/admin/delete/user/:userId", adminAuthCheck, wrapAsync(AdminDashboardController.AdminDeleteUser));


module.exports = router;