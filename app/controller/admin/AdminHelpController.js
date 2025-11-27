
const HelpModel = require("../../model/HelpModel");

class HelpController {
  // get all helps
  async getAllHelpAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/dashboard");
    }

    const allHelps = await HelpModel.aggregate([
      {
        $match: {},
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    return res.render("adminPanel/helps", { allHelps });
  }

  //update help
  async updateHelpAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-help");
    }

    const existingHelp = await HelpModel.findById(req.params.helpId);
    if (!existingHelp) {
      req.flash("errorMsg", "Help document is not exists");
      return res.redirect("/admin/all-help");
    }
    existingHelp.status = (existingHelp.status === "pending") ? "resolved" : "pending";
    await existingHelp.save();
    req.flash("successMsg", `Help status updated to ${existingHelp.status.toUpperCase()}`);
    return res.redirect("/admin/all-help");
  }

  //delete help
  async deleteHelpAdmin(req, res) {
    if (req.admin?.role !== "admin") {
      req.flash("errorMsg", "You are not permitted to perform this operation");
      return res.redirect("/admin/all-help");
    }

    const existingHelp = await HelpModel.findById(req.params.helpId);
    if (!existingHelp) {
      req.flash("errorMsg", "Help document is not exists");
      return res.redirect("/admin/all-help");
    }
    await HelpModel.findByIdAndDelete(req.params.helpId);
    req.flash("successMsg", `Help document deleted successfully`);
    return res.redirect("/admin/all-help");
  }
}

module.exports = new HelpController();