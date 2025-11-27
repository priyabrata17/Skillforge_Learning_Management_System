const jwt = require("jsonwebtoken");
const TokenModel = require("../model/TokenModel");

const authCheck = async (req, res, next) => {
  try {
    let accessToken =
      req.cookies?.accessToken ||
      req.headers["x-access-token"] ||
      req.headers["authorization"]?.split(" ")[1];

    //if no token
    if (!accessToken) {
      req.flash("errorMsg", "Please login to continue.");
      return res.redirect("/auth/login-form");
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        req.flash("errorMsg", "Session expired. Please log in again.");
        return res.redirect("/auth/login-form");
      }

      //new aceess from refreshToken
      try {
        const decodedToken = jwt.verify(
          refreshToken,
          process.env.JWT_SECRET_KEY
        );
        const existingToken = await TokenModel.findOne({ token: refreshToken });
        if (!existingToken) {
          req.flash("errorMsg", "No Token Found, Please login");
          return res.redirect("/auth/login-form");
        }

        const payload = {
          _id: decodedToken._id,
          email: decodedToken.email,
          role: decodedToken.role,
        };
        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "15m",
        });
        // Set new token in cookies
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
        });
        return next();
      } catch (error) {
        req.flash("errorMsg", "Session expired. Please log in again.");
        return res.redirect("/auth/login-form");
      }
    }
    // Other token errors
    req.flash("errorMsg", "Unauthorized access. Please login again.");
    return res.redirect("/auth/login-form");
  }
};

module.exports = authCheck;
