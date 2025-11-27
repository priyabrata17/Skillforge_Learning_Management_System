const CourseModel = require("../../model/CourseModel");
const SubjectModel = require("../../model/SubjectsModel");

class SubjectController {
  // create course form
  async createSubjectformAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-subject");
    }

    const allCourses = await CourseModel.find({}, { title: 1 });
    return res.render("adminPanel/createSubject", {
      allCourses,
    });
  }

  //Create Course
  async createSubjectAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-subject");
    }

    // create subject
    const { courseId, title, description, videoUrl, order } = req.body;
    const existingCourse = await CourseModel.findOne({ _id: courseId });

    if (!courseId || !title || !description || !videoUrl || !order) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect("/admin/create-subject-page");
    }
    if (!existingCourse) {
      req.flash("errorMsg", "No course found");
      return res.redirect("/admin/create-subject-page");
    }

    await new SubjectModel({
      courseId,
      title,
      description,
      videoUrl,
      order,
    }).save();

    req.flash("successMsg", "Subject created successfully");
    return res.redirect("/admin/all-subject");
  }

  //View All subjects
  async viewSubjectAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-subject");
    }

    const subjects = await SubjectModel.aggregate([
      { $match: {} },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "courseData",
        },
      },

      // Convert array → object
      {
        $unwind: {
          path: "$courseData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Select course + instructor fields
      {
        $project: {
          title: 1,
          description: 1,
          videoUrl: 1,
          order: 1,
          // course fields
          courseId: "$courseData._id",
          courseTitle: "$courseData.title",
          courseImage: "$courseData.image",
        },
      },
    ]);

    return res.render("adminPanel/subjects", { subjects });
  }

  //Update subject form
  async updateSubjectPageAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-subject");
    }
    const allCourses = await CourseModel.find({}, { title: 1 });
    const existingSubject = await SubjectModel.findById(req.params.subjectId);
    if (!existingSubject) {
      req.flash("errorMsg", "No subject found");
      return res.redirect("/admin/all-subject");
    }
    return res.render("adminPanel/updateSubject", {
      allCourses,
      existingSubject,
    });
  }

  //update subject
  async updateSubjectAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-course");
    }
    const { courseId, title, description, videoUrl, order } = req.body;

    if (!title || !description || !videoUrl || !order || !courseId) {
      req.flash("errorMsg", "All fields are required");
      return res.redirect(`/admin/update-course-page/${req.params.subjectId}`);
    }

    const existingSubject = await SubjectModel.findById(req.params.subjectId);

    Object.assign(existingSubject, {
      title,
      description,
      videoUrl,
      order,
      courseId,
    });

    await existingSubject.save();
    req.flash("successMsg", "Subject Updated Successfully");
    return res.redirect("/admin/all-subject");
  }

  // //delete Subject
  async deleteSubjectAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-subject");
    }
    const existingSubject = await SubjectModel.findById(req.params.subjectId);
    await SubjectModel.findByIdAndDelete(req.params.subjectId);

    req.flash("successMsg", "Subject deleted successfully");
    return res.redirect("/admin/all-subject");
  }
}

module.exports = new SubjectController();
