
const express = require("express");
const router = express.Router();
const wrapAsync = require("../../helper/wrapAsync");
const authenticationCheck = require("../../middleware/AuthenticationCheck");
const SocketController = require("../controller/SocketController");

//All User
router.get("/main", authenticationCheck, wrapAsync(SocketController.main));



module.exports = router;