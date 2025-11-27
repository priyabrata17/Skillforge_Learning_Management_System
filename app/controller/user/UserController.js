const UserModel = require("../../model/UserModel");
const { userSchemaValidator } = require("../../middleware/SchemaValidator");
const { cloudinary } = require("../../helper/cloudFileUpload");
const bcrypt = require("bcryptjs");
const generateTokens = require("../../helper/generateTokens");
const TokenModel = require("../../model/TokenModel");
const jwt = require("jsonwebtoken");
const transporter = require("../../config/EmailConfig");
const ejs = require("ejs");
const path = require("path");

class UserController {
  //Get signup form
  async signupForm(req, res) {
    return res.render("register", { errors: [], oldInput: {} });
  }

  //Signup User
  async signup(req, res) {
    //checking JOI error
    const { error } = userSchemaValidator.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.render("register", {
        errors: error.details,
        oldInput: req.body,
      });
    }

    //creating new user
    const { fullName, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash(
        "errorMsg",
        "Email is already registered to another account, please login"
      );
      return res.status(409).redirect("/auth/login-form");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      fullName,
      email,
      password: hashedPassword,
    });

    if (req.file) {
      newUser.image = {
        url: req.file.path,
        imageId: req.file.filename,
      };
    }
    await newUser.save();

    req.flash(
      "successMsg",
      "You have successfully registered to our website,please login to enjoy the services"
    );
    return res.status(201).redirect("/auth/login-form");
  }

  //Get login form
  async loginForm(req, res) {
    return res.render("login");
  }

  //Login User
  async login(req, res) {
    //creating new user
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/auth/login-form");
    }
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      req.flash("errorMsg", "No user found");
      return res.redirect("/auth/login-form");
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      req.flash("errorMsg", "Incorrect Password !");
      return res.redirect("/auth/login-form");
    }

    const { refreshToken, accessToken, rememberMeFlag } = await generateTokens(
      existingUser,
      rememberMe
    );

    const accessTokenMaxAge = rememberMeFlag ? 15 * 60 * 1000 : undefined;
    const refreshTokenMaxAge = rememberMeFlag
      ? 30 * 24 * 60 * 60 * 1000
      : undefined;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenMaxAge,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: accessTokenMaxAge,
    });

    //Assigning curr user to session object
    const sessionUser = {
      _id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    };
    req.session.user = sessionUser; // when user logs in successfully

    //Setup session cookie expiry according to user preference
    if (["yes", "true", "on", "1"].includes(String(rememberMe).toLowerCase())) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = null;
    }
    req.flash("successMsg", "Welcome, Login successful");
    return res.redirect("/home");
  }

  //Logout
  async logout(req, res) {
    const { refreshToken } = req.cookies;
    await TokenModel.findOneAndDelete({
      token: refreshToken,
    });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    if (req.session && req.session.user) {
      // destroy ONLY user session
      req.session.user = null;
    }

    req.flash("successMsg", "Logged out successfully");
    return res.redirect("/auth/login-form");
  }

  //Reset password Email form
  async forgetPasswordForm(req, res) {
    return res.render("forgetPassword");
  }

  //Reset Password Link
  async forgetPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      req.flash("errorMsg", "Email is required");
      return res.redirect("/account/forget-password-form");
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      req.flash("errorMsg", "No User found");
      return res.redirect("/account/forget-password-form");
    }

    // Generate token for password reset
    const secret = existingUser._id + process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ _id: existingUser._id }, secret, {
      expiresIn: "20m",
    });

    // Frontend reset link
    const frontendURL = process.env.FRONTEND_HOST;
    const resetLink = `${frontendURL}/account/reset-password-link/${existingUser._id}/${token}`;

    // 1. Get template path
    const templatePath = path.join(process.cwd(),"views","emailTemplate.ejs");

    // 2. Render EJS → HTML
    const htmlContent = await ejs.renderFile(templatePath, {
      existingUser,
      resetLink,
    });

    // Send password reset email via nodemailer
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: existingUser.email,
      subject: "Password Reset Link",
      html: htmlContent
    });

    // Send success response
    req.flash("successMsg", "A Password reset link sent to your email.");
    res.redirect("/account/forget-password-form");
  }

  //get password reset form
  async resetPasswordForm(req, res) {
    const { userId, token } = req.params;
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      req.flash("errorMsg", "No User found");
      return res.redirect("/account/forget-password-form");
    }
    const secret = existingUser._id + process.env.JWT_SECRET_KEY;
    jwt.verify(token, secret);

    return res.render("resetPassword", { userId, token });
  }

  //Reset password
  async resetPassword(req, res) {
    const { password, confirmPassword } = req.body;
    const { userId, token } = req.params;

    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      req.flash("errorMsg", "No user found");
      return res.redirect("/account/forget-password-form");
    }

    const new_secret = existingUser._id + process.env.JWT_SECRET_KEY;
    jwt.verify(token, new_secret);

    if (!password || !confirmPassword) {
      req.flash(
        "errorMsg",
        "Password and confirm password fields are required"
      );
      return res.redirect(`/account/reset-password-link/${userId}/${token}`);
    }

    if (password !== confirmPassword) {
      req.flash("errorMsg", "Password and confirm password should be same");
      return res.redirect(`/account/reset-password-link/${userId}/${token}`);
    }

    const newHashPassword = await bcrypt.hash(password, 10);

    await UserModel.findByIdAndUpdate(existingUser._id, {
      $set: { password: newHashPassword },
    });

    req.flash(
      "successMsg",
      "Password reset successfully. Please login with your new password"
    );
    return res.redirect(`/auth/login-form`);
  }

  //Refresh Accesss Token
  async refreshAccessToken(req, res) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(404).json({
        message: "No token found",
      });
    }

    const existingToken = await TokenModel.findOne({ token: refreshToken });
    if (!existingToken) {
      return res.status(404).json({
        message: "No token found",
      });
    }

    const verifiedToken = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    const payload = {
      _id: verifiedToken._id,
      email: verifiedToken.email,
      role: verifiedToken.role,
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m",
    });
    const accessTokenMaxAge = existingToken.rememberMe
      ? 15 * 60 * 1000
      : undefined;
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: accessTokenMaxAge,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
    });
  }
}

module.exports = new UserController();
