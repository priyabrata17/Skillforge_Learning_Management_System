const jwt = require("jsonwebtoken");
const TokenModel = require("../model/TokenModel");

const adminAuthCheck = async (req, res, next) => {
  try {
    // only check adminAccessToken
    const accessToken =
      req.cookies.adminAccessToken ||
      req.headers["x-admin-token"] ||
      req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      req.flash("errorMsg", "Admin login required");
      return res.redirect("/admin/login-page");
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    // role check
    if (decoded.role !== "admin") {
      req.flash("errorMsg", "Access Denied (Admins Only)");
      return res.redirect("/admin/login-page");
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    // access token expired → check refresh token
    if (error.name === "TokenExpiredError") {
      const refreshToken = req.cookies.adminRefreshToken;
      if (!refreshToken) {
        req.flash("errorMsg", "Session expired. Please login again");
        return res.redirect("/admin/login-page");
      }

      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_SECRET_KEY
        );

        if (decoded.role !== "admin") {
          req.flash("errorMsg", "Invalid admin session");
          return res.redirect("/admin/login-page");
        }

        // check refresh token in DB
        const existingToken = await TokenModel.findOne({ token: refreshToken });
        if (!existingToken) {
          req.flash("errorMsg", "Invalid token. Please login again.");
          return res.redirect("/admin/login-page");
        }

        // create new access token
        const payload = {
          _id: decoded._id,
          email: decoded.email,
          role: decoded.role,
        };

        const newToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "15m",
        });

        res.cookie("adminAccessToken", newToken, {
          httpOnly: true,
        });

        req.admin = payload;
        return next();
      } catch (err) {
        req.flash("errorMsg", "Session expired. Please login again.");
        return res.redirect("/admin/login-page");
      }
    }

    req.flash("errorMsg", "Unauthorized. Please login again.");
    return res.redirect("/admin/login-page");
  }
};

module.exports = adminAuthCheck;
