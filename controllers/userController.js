const userModel = require('../models/usersModel');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const usersModel = require('../models/usersModel.js');
const { uploadOnImgbb } = require('../middleware/imgbb.js');
const { uploadOnCloudinary } = require('../middleware/cloudinary.js');
const CryptoJS = require("crypto-js");


passport.use(new localStrategy({
    usernameField: "enrollment",
    passwordField: "password"
},
    async function (enrollment, password, done) {
        try {
            const user = await userModel.findOne({
                $or: [
                    { email: enrollment },
                    { username: enrollment }
                ]
            });

            if (!user) {
                return done(null, false, { message: 'Incorrect username or email.' });
            }

            const isAuthenticated = await user.authenticate(password);
            if (!isAuthenticated) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));


// Encryption function
function encryptData(data) {
    return CryptoJS.AES.encrypt(data, 'secret_key').toString();
}

// Decryption function
function decryptData(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
    return bytes.toString(CryptoJS.enc.Utf8);
}

function validateEnrollment(enrollment) {
    const AAAA = enrollment.slice(0, 4);
    const YYYY = enrollment.slice(4, 8);
    const BBBB = enrollment.slice(8, 12);
    const XXXX = enrollment.slice(12);

    // Special condition for 6-letter enrollments
    if (enrollment.length === 6 && AAAA === 'MGCU') {
        const year = parseInt(enrollment.slice(4, 6));
        if (year >= 1 && year <= 18) {
            return true;
        }
    }

    if (!(AAAA == 'MGCU' && BBBB == 'CSIT')) {
        return false;
    }

    switch (YYYY) {
        case "2019":
            if (XXXX >= 6001 && XXXX <= 6010) {
                return true;
            }
            break;
        case "2020":
            if (XXXX >= 6001 && XXXX <= 6010) {
                return true;
            }
            if (!(XXXX >= 3001 && XXXX <= 3033)) {
                return false;
            }
            break;
        case "2021":
            if (!(XXXX >= 3001 && XXXX <= 3039) || XXXX == 3013 || XXXX == 3024 || XXXX == 3029) {
                return false;
            }
            break;
        case "2022":
            if (!((XXXX >= 3001 && XXXX <= 3025) || (XXXX >= 4001 && XXXX <= 4009) && !(XXXX == 4003 || XXXX == 4004 || XXXX == 4007) || XXXX == 3005 || XXXX == 3007 || XXXX == 3019 || XXXX == 3022)) {
                return false;
            }
            break;
        case "2023":
            if (!((XXXX >= 3001 && XXXX <= 3030) || (XXXX >= 4002 && XXXX <= 4020) && !(XXXX == 4013))) {
                return false;
            }
            break;
        default:
            return false;
    }

    return true;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


exports.postRegister = async (req, res) => {
    try {
        const { enrollment, email, name, mobile, password } = req.body;

        const requiredFields = ['enrollment', 'email', 'name', 'mobile', 'password'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                req.flash('error', `${capitalizeFirstLetter(field)} is required.`);
                return res.redirect('/register');
            }
        }

        // Validate mobile number length
        if (mobile.length !== 10) {
            req.flash('error', 'Mobile Number is incorrect.');
            return res.redirect('/register');
        }

        // Check if email is already used or not provided
        const existingEmailUser = await userModel.findOne({ email });
        if (existingEmailUser || !email) {
            req.flash('error', 'Email is already used');
            return res.redirect('/register');
        }

        // Check if enrollment number is already used
        const existingEnrollmentUser = await userModel.findOne({ username: enrollment });
        if (existingEnrollmentUser) {
            req.flash('error', 'Enrollment is already used');
            return res.redirect('/register');
        }

        // Validate enrollment number format
        if (!validateEnrollment(enrollment.toUpperCase())) {
            req.flash('error', 'Invalid Enrollment Number');
            return res.redirect('/register');
        }


        // Create new user data
        const userData = {
            username: enrollment,
            name,
            email,
            mobile,
        };

        // Register the user
        await userModel.register(userData, password)
            .then(() => {
                passport.authenticate('local')(req, res, () => {
                    res.cookie('enrollment', encryptData(enrollment), { maxAge: 604800000 });
                    res.cookie('password', encryptData(password), { maxAge: 604800000 });
                    req.flash('success', 'Registration Successful');
                    res.redirect('/');
                });
            })
            .catch((err) => {
                console.log('Error in Register!! ', err.message);
                req.flash('error', err.message);
                res.redirect('/register');
            });
    } catch (err) {
        console.error('Error in registerUser:', err.message);
        req.flash('error', err.message);
        res.redirect('/register');
    }
};



exports.postProfileEdit = async (req, res) => {
    const { name, email, mobile, dob } = req.body;
    try {
        const requiredFields = ['email', 'name', 'mobile'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                req.flash('error', `${capitalizeFirstLetter(field)} is required.`);
                return res.redirect('/profile');
            }
        }
        // Validate mobile number length
        if (mobile.length !== 10) {
            req.flash('error', 'Mobile Number is incorrect.');
            return res.redirect('/register');
        }

        const existingEmailUser = await usersModel.findOne({ email, _id: { $ne: req.user._id } });
        const existingNumberUser = await usersModel.findOne({ mobile, _id: { $ne: req.user._id } });
        if (existingEmailUser) {
            req.flash('error', 'Email is already used');
            return res.redirect('/profile');
        }
        if (existingNumberUser) {
            req.flash('error', 'Number is already used');
            return res.redirect('/profile');
        }

        const user = await usersModel.findById(req.user._id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        let result = null;
        if (req.file) {
            result = await uploadOnCloudinary(req.file.path);
        }

        user.name = name;
        user.email = email;
        user.mobile = mobile;
        user.dob = dob;
        if (result) {
            user.userDp = result;
        }
        await user.save();

        req.flash('success', 'Your details updated successfully');
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to update your details');
        res.redirect('/profile');
    }
}


exports.getLogin = function (req, res) {
    let enrollment, password;
    if (req.cookies.enrollment && req.cookies.password) {
        // Decrypt enrollment and password cookies if they exist
        enrollment = decryptData(req.cookies.enrollment).toUpperCase();
        password = decryptData(req.cookies.password);
    }
    res.render('login', { messages: req.flash('error'), enrollment, password });
}


exports.postLogin = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash('error', 'Incorrect');
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            res.cookie('enrollment', encryptData(req.body.enrollment), { maxAge: 604800000 }); // 7 days
            res.cookie('password', encryptData(req.body.password), { maxAge: 604800000 }); // 7 days
            req.flash('success', 'Login Successful');
            return res.redirect('/');
        });
    })(req, res, next);
};


exports.getLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
};

exports.updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        req.user.changePassword(oldPassword, newPassword, (err, user) => {
            if (err) {
                if (err.name === 'IncorrectPasswordError') {
                    req.flash('error', 'Incorrect old password');
                    return res.redirect('/changepassword'); // Redirect to change password page
                }
                console.error(err);
                req.flash('error', 'Failed to update password');
                return res.redirect('/changepassword'); // Redirect to change password page
            }
            req.flash('success', 'Password updated successfully');
            return res.redirect('/login'); // Redirect to login page
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('/changepassword'); // Redirect to change password page
    }
};
