const CourseModel = require("../../model/CourseModel");
const UserModel = require("../../model/UserModel");
const AboutModel = require("../../model/AboutModel");
const SubjectModel = require("../../model/SubjectsModel");
const FeatureModel = require("../../model/FeaturesModel");
const HelpModel = require("../../model/HelpModel");
const EnrollmentModel = require("../../model/EnrollmentModel");

class HomepageController {
  async homepage(req, res) {
    const noOfInstructors = await UserModel.countDocuments({ role: "teacher" });
    const noOfStudents = await UserModel.countDocuments({ role: "student" });
    const noOfCourses = await CourseModel.countDocuments();
    const noOfSubjects = await SubjectModel.countDocuments();
    const allInstructors = await UserModel.find(
      { role: "teacher" },
      { image: 1, fullName: 1, role: 1, roleDescription: 1 }
    );
    const allAbouts = await AboutModel.find({});
    const allFeature = await FeatureModel.find({});
    const allCourses = await CourseModel.find({}).populate(
      "instructor",
      "fullName"
    );

    return res.render("index", {
      noOfCourses,
      noOfInstructors,
      noOfStudents,
      noOfSubjects,
      allInstructors,
      allAbouts,
      allFeature,
      allCourses,
    });
  }

  //create a help support
  async homepageSupport(req, res) {
    const { fullName, email, subject, message } = req.body;
    if (!fullName || !email || !subject || !message) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/home");
    }
    await new HelpModel({
      fullName,
      email,
      subject,
      message,
    }).save();

    req.flash("successMsg", "Support message successfully sent to admin");
    return res.redirect("/home");
  }

  //About Section
  async aboutSection(req, res) {
    const noOfInstructors = await UserModel.countDocuments({ role: "teacher" });
    const noOfStudents = await UserModel.countDocuments({ role: "student" });
    const noOfCourses = await CourseModel.countDocuments();
    const noOfSubjects = await SubjectModel.countDocuments();
    const allAbouts = await AboutModel.find({});
    return res.render("about", {
      noOfCourses,
      noOfInstructors,
      noOfStudents,
      noOfSubjects,
      allAbouts,
    });
  }

  //Course Section
  async courseSection(req, res) {
    //paginate
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const options = {
      page,
      limit,
    };
    const result = await CourseModel.aggregatePaginate(
      CourseModel.aggregate([
        { $match: {} },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorData",
          },
        },

        // Convert array → object
        {
          $unwind: {
            path: "$instructorData",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Select course + instructor fields
        {
          $project: {
            title: 1,
            description: 1,
            skillLevel: 1,
            certificate: 1,
            image: 1,

            // Instructor fields
            instructorId: "$instructorData._id",
            instructorName: "$instructorData.fullName",
            instructorImage: "$instructorData.image",
          },
        },
      ]),
      options
    );

    return res.render("courses", {
      allCourses: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
    });

    // const allCourses = await CourseModel.find({}).populate(
    //   "instructor",
    //   "fullName"
    // );
    // return res.render("courses", {
    //   allCourses,
    // });
  }

  //Course Details Section
  async courseDetailsSection(req, res) {
    const existingCourse = await CourseModel.findById(
      req.params.courseId
    ).populate("instructor", "fullName image");
    if (!existingCourse) {
      req.flash("errorMsg", "Course doesnot exists");
      return res.redirect("/home");
    }

    let isEnrolled = await EnrollmentModel.findOne({
      courseId: req.params.courseId,
      studentId: req.user._id,
    });

    return res.render("courseDetails", {
      existingCourse,
      isEnrolled,
    });
  }

  //My Courses
  async myCourses(req, res) {
    const myCourses = await EnrollmentModel.find({
      studentId: req.user._id,
    }).populate({
      path: "courseId",
      populate: {
        path: "instructor",
      },
    });

    return res.render("myCourses", { myCourses });
  }

  //Feature Section
  async featureSection(req, res) {
    const allFeatures = await FeatureModel.find({});
    return res.render("features", {
      allFeatures,
    });
  }

  //Team Section
  async teamSection(req, res) {
    const allInstructors = await UserModel.find({ role: "teacher" });
    return res.render("team", {
      allInstructors,
    });
  }

  //Contact Section
  async contactSection(req, res) {
    return res.render("contact");
  }

  //Enrollement Form Page
  async enrollmentPage(req, res) {
    const allCourses = await CourseModel.find();
    return res.render("createEnrollment", { allCourses });
  }

  //Create Enrollment
  async createEnrollment(req, res) {
    if (!req.user || req.user?.role !== "student") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/home");
    }

    const { courseId, fullName, email } = req.body;
    if (!fullName || !email || !courseId) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/home/enrollment-page");
    }

    const enrolledStudent = await EnrollmentModel.findOne({
      studentId: req.user._id,
      courseId: courseId,
    });
    if (enrolledStudent) {
      if (enrolledStudent.status === "pending") {
        req.flash(
          "errorMsg",
          "You have already enrolled on this course,Please wait for approval"
        );
        return res.redirect("/home/enrollment-page");
      }
      req.flash("errorMsg", "You have already enrolled on this course");
      return res.redirect("/home/enrollment-page");
    }

    await new EnrollmentModel({
      studentId: req.user._id,
      courseId,
      fullName,
      email,
    }).save();

    req.flash(
      "successMsg",
      "You have successfully enrolled on the course.Please wait for approval"
    );
    return res.redirect("/home");
  }

  //Classroom
  async classRoom(req, res) {
    const allSubjects = await SubjectModel.find({
      courseId: req.params.courseId,
    })
      .sort({ order: 1 })
      .populate("courseId", "title description image");

    return res.render("classRoom", { allSubjects });
  }

  // Load classroom with a selected video
  async classRoomVideo(req, res) {
    const allSubjects = await SubjectModel.find({
      courseId: req.params.courseId,
    })
      .sort({ order: 1 })
      .populate("courseId", "title description image");

    const selectedVideo = await SubjectModel.findById(req.params.videoId);

    return res.render("classRoom", { allSubjects, selectedVideo });
  }
}

module.exports = new HomepageController();
