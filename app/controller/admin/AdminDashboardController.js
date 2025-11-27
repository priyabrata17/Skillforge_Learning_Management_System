const UserModel = require("../../model/UserModel");
const CourseModel = require("../../model/CourseModel");
const SubjectModel = require("../../model/SubjectsModel");
const EnrollmentModel = require("../../model/EnrollmentModel");
const HelpModel = require("../../model/HelpModel");
const { cloudinary } = require("../../helper/cloudFileUpload");
const bcrypt = require("bcryptjs");
const generateTokens = require("../../helper/generateTokens");
const TokenModel = require("../../model/TokenModel");

// ***Make sure to use req.admin not req.user when working with admin panel things or controllers.

class AdminController {
  //Get login form
  async adminLoginForm(req, res) {
    return res.render("adminPanel/adminLogin");
  }

  //Login User
  async adminLogin(req, res) {
    //creating new user
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/admin/login-page");
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      req.flash("errorMsg", "No user found");
      return res.redirect("/admin/login-page");
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      req.flash("errorMsg", "Incorrect Password !");
      return res.redirect("/admin/login-page");
    }

    const { refreshToken, accessToken, rememberMeFlag } = await generateTokens(
      existingUser,
      rememberMe
    );

    const accessTokenMaxAge = rememberMeFlag ? 15 * 60 * 1000 : undefined;
    const refreshTokenMaxAge = rememberMeFlag
      ? 30 * 24 * 60 * 60 * 1000
      : undefined;

    res.cookie("adminRefreshToken", refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenMaxAge,
    });
    res.cookie("adminAccessToken", accessToken, {
      httpOnly: true,
      maxAge: accessTokenMaxAge,
    });

    //Assigning curr user to session object
    const sessionAdmin = {
      _id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      image: existingUser.image.url,
      fullName: existingUser.fullName,
    };
    req.session.admin = sessionAdmin; // when admin logs in successfully

    //Setup session cookie expiry according to user preference
    if (["yes", "true", "on", "1"].includes(String(rememberMe).toLowerCase())) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = null;
    }
    req.flash("successMsg", "Welcome, Login successful");
    return res.redirect("/admin/dashboard");
  }

  //Logout
  async adminLogout(req, res) {
    const { adminRefreshToken } = req.cookies;

    if (adminRefreshToken) {
      await TokenModel.findOneAndDelete({ token: adminRefreshToken });
    }

    // clear correct cookies
    res.clearCookie("adminAccessToken");
    res.clearCookie("adminRefreshToken");

    // destroy ONLY admin session
    if (req.session && req.session.admin) {
      req.session.admin = null;
    }

    req.flash("successMsg", "Logged out successfully");
    return res.redirect("/admin/login-page");
  }

  //Dashboard
  async dashboard(req, res) {
    const totalUsers = await UserModel.countDocuments();
    const noOfInstructors = await UserModel.countDocuments({ role: "teacher" });
    const noOfStudents = await UserModel.countDocuments({ role: "student" });
    const noOfCourses = await CourseModel.countDocuments();
    const noOfSubjects = await SubjectModel.countDocuments();
    const noOfEnrollments = await EnrollmentModel.countDocuments();
    const noOfPendingRequest = await HelpModel.countDocuments({
      status: "pending",
    });
    return res.render("adminpanel/dashboard", {
      totalUsers,
      noOfInstructors,
      noOfStudents,
      noOfCourses,
      noOfSubjects,
      noOfEnrollments,
      noOfPendingRequest,
    });
  }

  //View all User
  async adminAllUser(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/dashboard");
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const options = {
      page,
      limit,
    };

    const result = await UserModel.aggregatePaginate(
      UserModel.aggregate([
        {
          $match: {},
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: {
            password: 0,
          },
        },
      ]),
      options
    );

    return res.render("adminPanel/users", {
      allUsers: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage
    });
  }

  //Update User Form
  async adminUpdateUserPage(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-user");
    }
    const existingUser = await UserModel.findById(req.params.userId, {
      password: 0,
    });
    return res.render("adminPanel/editUser", { existingUser });
  }

  //Update User
  async adminUpdateUser(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-user");
    }
    const existingUser = await UserModel.findById(req.params.userId, {
      password: 0,
    });
    const { role, roleDescription } = req.body;
    if (!role || !roleDescription) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect(`/admin/update/user-page/${existingUser._id}`);
    }
    Object.assign(existingUser, {
      role,
      roleDescription,
    });
    await existingUser.save();
    return res.redirect("/admin/all-user");
  }

  //Delete User
  async AdminDeleteUser(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-user");
    }
    const existingUser = await UserModel.findById(req.params.userId, {
      password: 0,
    });
    if (!existingUser) {
      req.flash("errorMsg", "No User Found");
      return res.redirect("/admin/all-user");
    }

    await cloudinary.uploader.destroy(existingUser.image.imageId);
    await UserModel.findByIdAndDelete(req.params.userId);

    req.flash("successMsg", "User removed successfully");
    return res.redirect("/admin/all-user");
  }
}

module.exports = new AdminController();
