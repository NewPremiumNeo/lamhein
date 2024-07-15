const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware.js');
const usersModel = require('../models/usersModel.js');
const photoModel = require('../models/photoModel.js');
const videoModel = require('../models/videoModel.js');


router.put('/photo/save', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have user ID available after authentication
        const photoId = req.body.photoId;
        const photo = await photoModel.findById(photoId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const user = await usersModel.findById(userId);
        var userSaved = user.savedPhotos.includes(photoId);

        if (userSaved) {
            // If user already Saved the photo, remove it
            await usersModel.findByIdAndUpdate(userId, {
                $pull: { savedPhotos: photoId }
            });
        } else {
            // If user hasn't Saved the photo, save it
            await usersModel.findByIdAndUpdate(userId, {
                $push: { savedPhotos: photoId }
            });
        }

        return res.json({ saved: !userSaved });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});


router.get('/photo/:photoId/issaved', isLoggedIn, async function (req, res, next) {
    try {
        const user = await usersModel.findById(req.user._id);
        const userSaved = user.savedPhotos.includes(req.params.photoId);
        return res.json({ saved: userSaved });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.put('/video/save', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have user ID available after authentication
        const videoId = req.body.videoId;
        const video = await photoModel.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const user = await usersModel.findById(userId);
        var userSaved = user.savedVideos.includes(videoId);

        if (userSaved) {
            // If user already Saved the photo, remove it
            await usersModel.findByIdAndUpdate(userId, {
                $pull: { savedVideos: videoId }
            });
        } else {
            // If user hasn't Saved the photo, save it
            await usersModel.findByIdAndUpdate(userId, {
                $push: { savedVideos: videoId }
            });
        }
        return res.json({ saved: !userSaved });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});


router.get('/video/:videoId/issaved', isLoggedIn, async function (req, res, next) {
    try {
        const user = await usersModel.findById(req.user._id);
        const userSaved = user.savedVideos.includes(req.params.videoId);
        return res.json({ saved: userSaved });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});



module.exports = { router };
