
const flashMessage = (req, res, next) => {
    res.locals.successMsg = req.flash("successMsg");
    res.locals.errorMsg = req.flash("errorMsg");

    // Separate locals for user and admin
    res.locals.currUser = req.session.user || null;
    res.locals.currAdmin = req.session.admin || null;

    next();
};

module.exports = flashMessage;
