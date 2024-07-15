const userModel = require('../models/usersModel');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const usersModel = require('../models/usersModel.js');
const { uploadOnImgbb } = require('../middleware/imgbb.js');

passport.use(
    new localStrategy({
        usernameField: "enrollment",
        passwordField: "password"
    },
        userModel.authenticate())
);


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
        case "2020":
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
                    req.flash('success', 'Registration successful. You are now logged in.');
                    res.redirect('/');
                });
            })
            .catch((err) => {
                console.log('Error in Register!! ', err.message);
                req.flash('error', err.message);
                res.redirect('/register');
            });
        console.log("2 shuuuuuuuu")
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
            result = await uploadOnImgbb(req.file.path);
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





exports.postLogin = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
});


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

// exports.postEditProfile = async function (req, res) {
//     const {username, email, fullname, bio, userOldDp} = req.body;
//     try {
//         const existingEmailUser = await userModel.findOne({ email, _id: { $ne: req.user._id } });
//         const existingEnrollmentUser = await userModel.findOne({ username, _id: { $ne: req.user._id } });
//         if (existingEmailUser) {
//             req.flash('error', 'Email is already used');
//             return res.redirect('/profile');
//         }
//         if (existingEnrollmentUser) {
//             req.flash('error', 'Username is already used');
//             return res.redirect('/profile');
//         }
//         const userdp = req.file ? req.file.filename : userOldDp;
//         let updatedUserData = await userModel.findByIdAndUpdate(req.user._id, {
// enrollment,
// name,
// email,
// mobile,
// dob
// // userDp: userdp
//         })
//         console.log(updatedUserData);
//         res.redirect('/profile');
//     } catch (err) {
//         console.error('Error in editing profile:', err.message);
//         res.status(500).send('Internal Server Error');
//     }
// };