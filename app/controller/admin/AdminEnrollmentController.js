const EnrollmentModel = require("../../model/EnrollmentModel");
const { cloudinary } = require("../../helper/cloudFileUpload");

class EnrollmentController {
  //get all enrollment
  async allEnrollmentAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-enrollment");
    }

    const enrollments = await EnrollmentModel.aggregate([
      {
        $match: {},
      },
      {
        $sort: {
            enrolledOn: -1
        }
      },
      {
        $lookup: {
          from: "courses", // collection name in MongoDB
          localField: "courseId", // field in enrollment schema
          foreignField: "_id", // field in course schema
          as: "courseDetails",
        },
      },
      {
        $unwind: {
          path: "$courseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users", // collection for students
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $unwind: {
          path: "$studentDetails",
          preserveNullAndEmptyArrays: true,
        },
      }
    ]);

    return res.render("adminPanel/enrollments", { enrollments });
  }

  //Update enrollment
  async updateEnrollmentAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-enrollment");
    }

    const existingEnrollment = await EnrollmentModel.findById(
      req.params.enrollmentId
    );
    if (!existingEnrollment) {
      req.flash("errorMsg", "Enrollment does not exists");
      return res.redirect("/admin/all-enrollment");
    }

    existingEnrollment.status =
      existingEnrollment.status === "pending" ? "approved" : "pending";

    await existingEnrollment.save();
    req.flash(
      "successMsg",
      `Enrollment status updated to ${existingEnrollment.status.toUpperCase()}`
    );
    return res.redirect("/admin/all-enrollment");
  }

  //delete enrollment
  async deleteEnrollmentAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-enrollment");
    }

    const existingEnrollment = await EnrollmentModel.findById(
      req.params.enrollmentId
    );
    if (!existingEnrollment) {
      req.flash("errorMsg", "Enrollment does not exists");
      return res.redirect("/admin/all-enrollment");
    }

    await EnrollmentModel.findByIdAndDelete(req.params.enrollmentId);
    req.flash("successMsg", "Enrollment deleted successfully");
    return res.redirect("/admin/all-enrollment");
  }
}

module.exports = new EnrollmentController();
