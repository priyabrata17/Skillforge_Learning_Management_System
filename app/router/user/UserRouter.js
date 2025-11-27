
const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const { uploadImage } = require("../../helper/fileUpload");
const authenticationCheck = require("../../middleware/AuthenticationCheck");
const UserController = require("../../controller/user/UserController");

// //All User
// router.get(
//     "/auth/all-user",
//     authenticationCheck,
//     wrapAsync(UserController.allUser)
// );

//Register form
router.get("/auth/registration-form", wrapAsync(UserController.signupForm));

//Register User
router.post(
    "/auth/register",
    uploadImage.single("image"), 
    wrapAsync(UserController.signup)
);

//Login form
router.get("/auth/login-form", wrapAsync(UserController.loginForm));

//Login User
router.post(
    "/auth/login", 
    wrapAsync(UserController.login)
);

//Logout
router.get(
    "/auth/logout", 
    authenticationCheck, 
    wrapAsync(UserController.logout)
);

// //Dashboard
// router.get("/auth/dashboard", authenticationCheck, wrapAsync(UserController.dashboard));

// //Profile
// router.get("/dashboard/profile", authenticationCheck, wrapAsync(UserController.profilePage));

// //Update profile pic
// router.patch(
//     "/auth/update/profile-pic/:userId", 
//     authenticationCheck, 
//     uploadImage.single("image"), 
//     wrapAsync(UserController.updateProfilePic)
// );

// //Delete User
// router.delete("/auth/delete/:userId", authenticationCheck, wrapAsync(UserController.deleteUser));

//Reset Password Email Form
router.get(
    "/account/forget-password-form", 
    wrapAsync(UserController.forgetPasswordForm)
);

//Reset Password Link
router.post(
    "/account/forget-password", 
    wrapAsync(UserController.forgetPassword)
);

//Reset Password Link Page
router.get(
    "/account/reset-password-link/:userId/:token",
    wrapAsync(UserController.resetPasswordForm)
);

//Reset Password
router.post(
    "/account/reset-password/:userId/:token",
    wrapAsync(UserController.resetPassword)
);

//Refresh AccessToken
router.post(
    "/auth/refresh-token",
    authenticationCheck,
    wrapAsync(UserController.refreshAccessToken)
);


module.exports = router;