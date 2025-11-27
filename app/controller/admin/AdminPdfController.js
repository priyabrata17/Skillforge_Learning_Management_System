const UserModel = require("../../model/UserModel");
const CourseModel = require("../../model/CourseModel");
const SubjectModel = require("../../model/SubjectsModel");
const EnrollmentModel = require("../../model/EnrollmentModel");
const HelpModel = require("../../model/HelpModel");
const puppeter = require("puppeteer");
const path = require("path");
const ejs = require("ejs");

class PdfController {
  async pdfHome(req, res) {
    const totalUsers = await UserModel.countDocuments();
    const noOfInstructors = await UserModel.countDocuments({ role: "teacher" });
    const noOfStudents = await UserModel.countDocuments({ role: "student" });
    const noOfCourses = await CourseModel.countDocuments();
    const noOfSubjects = await SubjectModel.countDocuments();
    const noOfEnrollments = await EnrollmentModel.countDocuments();
    const noOfPendingRequest = await HelpModel.countDocuments({
      status: "pending",
    });

    // Render EJS → HTML
    const html = await ejs.renderFile(
      path.join(process.cwd(), "views/pdfDashboard.ejs"),
      {
        totalUsers,
        noOfInstructors,
        noOfStudents,
        noOfCourses,
        noOfSubjects,
        noOfEnrollments,
        noOfPendingRequest
      }
    );

    const browser = await puppeter.launch();
    const page = await browser.newPage();

    // Load the HTML content
    await page.setContent(html);
    const pdfBuffer = await page.pdf({
        format: "A4"
    });

    await browser.close();
    res.contentType("application/pdf");
    res.send(pdfBuffer);
  }
}


module.exports = new PdfController();