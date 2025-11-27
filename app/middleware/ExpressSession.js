const session = require("express-session");

const expressSession = session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
});

module.exports = expressSession;
