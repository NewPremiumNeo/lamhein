var express = require('express');
var router = express.Router();
const photoModel = require('../models/photoModel.js');
const multer = require('../middleware/multer.js');
const { isAdminLoggedIn } = require('../middleware/authMiddleware.js');
// const photosController = require('../controllers/photosController.js')
const adminController = require('../controllers/adminController.js');
const usersModel = require('../models/usersModel.js');
const videoModel = require('../models/videoModel.js');
const voteModel = require('../models/voteModel');
const voteController = require('../controllers/voteController.js');
const boolModel = require('../models/boolModel.js');


router.use(express.urlencoded({ extended: false }));

/* GET home page. */
router.get('/', isAdminLoggedIn, async function (req, res, next) {
    const users = await usersModel.find();
    const photos = await photoModel.find();
    const videos = await videoModel.find();
    res.render('admin', { users, photos, videos });
});

router.get('/login', function (req, res, next) {
    res.render('adminLogin', { messages: req.flash('error') });
});

router.post('/login', adminController.postAdminLogin, function (req, res) { })

router.get('/logout', adminController.adminGetLogout)


router.get('/photos', isAdminLoggedIn, async function (req, res, next) {
    try {
        const allPhotos2k21 = await photoModel.find({ year: "2k21" });
        const allPhotos2k22 = await photoModel.find({ year: "2k22" });
        const allPhotos2k23 = await photoModel.find({ year: "2k23" });
        res.render('adminPhotos', {allPhotos2k21, allPhotos2k22, allPhotos2k23, messages: req.flash('success') });
    }
    catch (err) {
        console.error('Error in geting Post Data:- ', err.message);
        next(err);
    }
});

//Photo delete
router.post('/photo/:photo__id/delete', isAdminLoggedIn, async function (req, res, next) {
    const del = await photoModel.findByIdAndDelete(req.params.photo__id)
    if (del) {
        req.flash('success', "Photo Deleted!!");
    }
    res.redirect('/admin/photos');
});

// Route for uploading photos
// router.post('/upload', multer.uploadImg.single('image'), photosController.handleUpload);
router.get('/photos/upload/', isAdminLoggedIn, function (req, res, next) {
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    res.render('adminPhotoUpload', { errorMessage, successMessage });
});

router.post('/photos/upload/', isAdminLoggedIn, multer.upload.single('photos'), voteController.photoUploadPost);

router.get('/photo/:photoId/liked', isAdminLoggedIn, async function (req, res, next) {
    try {
        const userLiked = await photoModel.findOne({ '_id': req.params.photoId }).populate('likeUserIds');
        res.status(200).json(userLiked);
    } catch (error) {
        console.error('Error occurred while fetching liked photo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Admin Vote
router.get('/vote', isAdminLoggedIn, async function (req, res, next) {
    const { search } = req.query;
    if (search) {
        try {
            let allVotes = await voteModel.find().populate('user');
            allVotes = allVotes.filter(vote => {
                return (
                    vote.user.username.toLowerCase().includes(search.toLowerCase()) ||
                    vote.user.name.toLowerCase().includes(search.toLowerCase()) ||
                    vote.votedMember.toLowerCase().includes(search.toLowerCase()) ||
                    vote.name.toLowerCase().includes(search.toLowerCase())
                );
            });
            res.json(allVotes);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        try {
            const { voteCounts, winners, message, error } = await voteController.calculateWinners();
            if (error) {
                return res.status(500).json({ error });
            }
            let allVotes = await voteModel.find().populate('user');
            res.render('adminVote', { allVotes, messages: req.flash('success'), voteCounts, winners, message });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    }
});

router.post('/vote/:idToDelete/delete', isAdminLoggedIn, async function (req, res, next) {
    try {
        const del = await voteModel.findByIdAndDelete(req.params.idToDelete)
        if (del) {
            req.flash('success', "Vote Deleted!!");
        }
        res.redirect('/admin/vote');
    } catch (error) {
        console.error("Error deleting vote:", error);
        res.status(500).send("Internal Server Error");
    }
});


// GET route to render admin users page
router.get('/users', isAdminLoggedIn, async (req, res) => {
    const { search } = req.query;
    if (search) {
        try {
            const users = await usersModel.find({
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ]
            }, 'username name email mobile dob');

            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        try {
            let users = await usersModel.find({}, 'username name email mobile dob').populate('likePhotoIds');

            const errorMessage = req.flash('error');
            const successMessage = req.flash('success');
            res.render('adminUsers', { users, successMessage, errorMessage });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    }
});

//User delete
router.delete('/users/:user__id/delete', isAdminLoggedIn, async function (req, res, next) {
    const del = await usersModel.findByIdAndDelete(req.params.user__id)
    if (del) {
        req.flash('success', "User Account Deleted!!");
    } else {
        req.flash('error', "User Not Found!!");
    }
    res.redirect('/admin/users');
});


// POST route to update user details
router.post('/users/:userId', isAdminLoggedIn, async (req, res) => {
    const { username, name, email, mobile, dob, newPassword } = req.body;
    const { userId } = req.params;
    try {
        const user = await usersModel.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (!username || !name || !email || !mobile) {
            req.flash('error', 'Some Important Credintial Missing');
            return res.redirect('/admin/users');
        }
        user.username = username;
        user.name = name;
        user.email = email;
        user.mobile = mobile;
        user.dob = dob;

        // Update user's password if a new password is provided
        if (newPassword) {
            await user.setPassword(newPassword);
        }
        await user.save();

        req.flash('success', 'User details updated successfully');
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to update user details');
        res.redirect('/admin/users');
    }
});


// Assuming this is inside an Express route handler
router.get('/votestatus', isAdminLoggedIn, async (req, res) => {
    try {
        // Fetch the latest values from the database
        const boolValues = await boolModel.findOne();
        // If boolValues is null (no document found), set default values
        const isVoteOn = boolValues ? boolValues.isVoteOn : false;
        const isWinnerOn = boolValues ? boolValues.isWinnerOn : false;

        const { voteCounts } = await voteController.calculateWinners();
        console.log(voteCounts)
        // Render the admin panel with actual values from the database
        res.render('adminPageAccess', { isVoteOn, isWinnerOn, voteCounts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to update boolean values
router.post('/votestatus/update', isAdminLoggedIn, async (req, res) => {
    try {
        // Extract values from the request body
        const { isVoteOn, isWinnerOn } = req.body;
        // Update the values in the database
        var updatedBool = await boolModel.findOneAndUpdate(
            {},
            { isVoteOn, isWinnerOn },
            { new: true, upsert: true } // Create the document if it doesn't exist
        );
        // Send a success message or redirect to admin panel
        res.redirect('/admin/votestatus');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;