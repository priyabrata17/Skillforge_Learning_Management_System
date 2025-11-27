//++++++++++++++++++++  Importing required Files  ++++++++++++++++++++++++++
require("dotenv").config();
const express = require("express");
const dbCon = require("./app/config/dbConnection");
const path = require("path");
const cookieParser = require("cookie-parser");
const expressSession = require("./app/middleware/ExpressSession");
const flash = require("connect-flash");
const flashMessage = require("./app/middleware/FlashMessage");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


//++++++++++++++++++++++++  Executing required functions  +++++++++++++++++++++++++++
const app = express();
dbCon();

//Set view engine to EJS
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));


//+++++++++++++++++++++  Parsing data ++++++++++++++++++++++++++++++
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(expressSession);
app.use(flash());
app.use(flashMessage);


//++++++++++++++++++++++  Serve Static Files  +++++++++++++++++++++++++++
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));


//+++++++++++++++++++++++  Using routes  ++++++++++++++++++++++++++

//------------------------- General Routes -----------------------
//Homepage
const HomeRouter = require("./app/router/user/HomepageRouter");
app.use(HomeRouter);

//UserRouter
const UserRouter = require("./app/router/user/UserRouter");
app.use(UserRouter);


//------------------------- Admin Routes -----------------------
const AdminDashboardRouter = require("./app/router/admin/AdminDashboardRouter");
app.use(AdminDashboardRouter);

const AdminCourseRouter = require("./app/router/admin/AdminCourseRouter");
app.use(AdminCourseRouter);

const AdminSubjectRouter = require("./app/router/admin/AdminSubjectsRouter");
app.use(AdminSubjectRouter);

const AdminAboutRouter = require("./app/router/admin/AdminAboutRouter");
app.use(AdminAboutRouter);

const AdminFeaturesRouter = require("./app/router/admin/AdminFeaturesRouter");
app.use(AdminFeaturesRouter);

const AdminHelpRouter = require("./app/router/admin/AdminHelpRouter");
app.use(AdminHelpRouter);

const AdminEnrollmentRouter = require("./app/router/admin/AdminEnrollmentRouter");
app.use(AdminEnrollmentRouter);

const PdfRouter = require("./app/router/admin/PdfRouter");
app.use(PdfRouter);

//If no page found
app.use((req, res, next) => {
    next({ status: 404, message: "Page Not Found" });
});

//++++++++++++++++++++++++  Basic error handling  ++++++++++++++++++++++++++

// Debug error logger
app.use((err, req, res, next) => {
  console.error("🔥🔥🔥 FULL ERROR 🔥🔥🔥:");
  console.error(err);
  console.error(err.stack);
  next(err);
});

const handlingErrors = require("./app/middleware/HandlingErrors");
app.use(handlingErrors);

//+++++++++++++++++  Creating Server  ++++++++++++++++++++++
const port = 8080;
app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
