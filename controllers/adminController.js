const userModel = require('../models/usersModel');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

passport.use(
    new localStrategy({
        usernameField: "enrollment",
        passwordField: "password"
    },
        userModel.authenticate())
);

exports.postAdminLogin = (req, res, next) => {
    const adminEnrollments = ["MGCU2022CSIT3001", "MGCU2022CSIT3004", "MGCU2022CSIT3013"];
    if (adminEnrollments.includes(req.body.enrollment)) {
        passport.authenticate('local', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/admin/login');
            }
            req.flash('success', 'Logged in as admin');
            return req.login(user, (err) => {
                if (err) { return next(err); }
                req.session.isAdmin = true;
                return  res.redirect('/admin');
            });
        })(req, res, next);
    } else {
        req.flash('error', 'Invalid username or password');
        res.redirect('/admin/login');
    }

};

exports.adminGetLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/admin/login');
    });
};
