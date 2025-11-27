const CourseModel = require("../../model/CourseModel");
const UserModel = require("../../model/UserModel");
const { courseSchemaValidation } = require("../../middleware/SchemaValidator");
const { cloudinary } = require("../../helper/cloudFileUpload");

class CourseController {
  // create course form
  async createCourseformAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-course");
    }

    const allInstructors = await UserModel.find(
      { role: "teacher" },
      { fullName: 1, roleDescription: 1 }
    );
    return res.render("adminPanel/createCourse", {
      oldInput: {},
      errors: [],
      allInstructors,
    });
  }

  //Create Course
  async createCourseAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-course");
    }

    const { error } = courseSchemaValidation.validate(req.body, {
      abortEarly: false,
    });

    //if erros
    if (error) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      const allInstructors = await UserModel.find(
        { role: "teacher" },
        { fullName: 1, roleDescription: 1 }
      );
      return res.render("adminPanel/createCourse", {
        errors: error.details,
        oldInput: req.body,
        allInstructors,
      });
    }

    // create course
    const { instructor, title, description, skillLevel, certificate } =
      req.body;
    const existingCourse = await CourseModel.findOne({ title: title });
    if (existingCourse) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash(
        "errorMsg",
        "Course title already exists, please try different title"
      );
      return res.redirect("/admin/create-course-page");
    }

    const newCourse = new CourseModel({
      instructor,
      title,
      description,
      skillLevel,
      certificate,
    });

    if (req.file) {
      newCourse.image = {
        url: req.file.path,
        imageId: req.file.filename,
      };
      await newCourse.save();
    }

    req.flash("successMsg", "Course created successfully");
    return res.redirect("/admin/all-course");
  }

  //View All courses for admin
  async viewCourseAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/dashboard");
    }

    //paginate
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
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

    return res.render("adminPanel/courses", {
      courses: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage
    });
  }

  //Update course form
  async updateCoursePageAdmin(req, res) {
    const allInstructors = await UserModel.find(
      { role: "teacher" },
      { fullName: 1, image: 1, roleDescription: 1 }
    );
    const existingCourse = await CourseModel.findById(req.params.courseId);
    return res.render("adminPanel/updateCourse", {
      allInstructors,
      existingCourse,
    });
  }

  //update course
  async updateCourseAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-course");
    }
    const { title, description, skillLevel, certificate, instructor } =
      req.body;

    if (!title || !description || !skillLevel || !certificate || !instructor) {
      return res.redirect(`/admin/update-course-page/${req.params.courseId}`);
    }

    const existingCourse = await CourseModel.findById(req.params.courseId);

    Object.assign(existingCourse, {
      title,
      description,
      skillLevel,
      certificate,
      instructor,
    });

    if (req.file) {
      if (existingCourse.image) {
        await cloudinary.uploader.destroy(existingCourse.image.imageId); // delete old image
      }
      existingCourse.image.url = req.file.path;
      existingCourse.image.imageId = req.file.filename;
    }
    await existingCourse.save();
    req.flash("successMsg", "Course Updated Successfully");
    return res.redirect("/admin/all-course");
  }

  // //delete course
  async deleteCourseAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-course");
    }
    const existingCourse = await CourseModel.findById(req.params.courseId);

    if (existingCourse.image) {
      await cloudinary.uploader.destroy(existingCourse.image.imageId); // delete old image
    }
    await CourseModel.findByIdAndDelete(req.params.courseId);

    req.flash("successMsg", "Course deleted successfully");
    return res.redirect("/admin/all-course");
  }
}

module.exports = new CourseController();
