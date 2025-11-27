const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const HomepageController = require("../../controller/user/HomepageController");
const userAuthCheck = require("../../middleware/AuthenticationCheck");


//Homepage
router.get("/home", wrapAsync(HomepageController.homepage));

//Support message
router.post("/home/support", wrapAsync(HomepageController.homepageSupport));

//About
router.get("/home/about", wrapAsync(HomepageController.aboutSection));

//Courses
router.get("/home/courses", wrapAsync(HomepageController.courseSection));

//Course Details
router.get("/home/course/details/:courseId", userAuthCheck, wrapAsync(HomepageController.courseDetailsSection));

//Features
router.get("/home/features", wrapAsync(HomepageController.featureSection));

//Team
router.get("/home/team", wrapAsync(HomepageController.teamSection));

//Contact
router.get("/home/contact", wrapAsync(HomepageController.contactSection));

//Create Enrollment Page
router.get("/home/enrollment-page", wrapAsync(HomepageController.enrollmentPage));

//Create Enrollment
router.post("/home/create/enrollment", userAuthCheck, wrapAsync(HomepageController.createEnrollment));

//Classroom page
router.get("/classroom/:courseId", userAuthCheck, wrapAsync(HomepageController.classRoom));

//Classroom video
router.get("/classroom/:courseId/video/:videoId", userAuthCheck, wrapAsync(HomepageController.classRoomVideo));

module.exports = router;