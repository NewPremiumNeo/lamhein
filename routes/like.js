const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware.js');
const usersModel = require('../models/usersModel.js');
const photoModel = require('../models/photoModel.js');

let io;

function initialize(socketIoInstance) {
    io = socketIoInstance;

    router.put('/photo/like', isLoggedIn, async (req, res) => {
        try {
            const userId = req.user._id; // Assuming you have user ID available after authentication
            const photoId = req.body.photoId;
            const photo = await photoModel.findById(photoId);

            if (!photo) {
                return res.status(404).json({ error: 'Photo not found' });
            }
            const userLiked = photo.likeUserIds.includes(userId);

            if (userLiked) {
                // If user already liked the photo, remove the like
                await photoModel.findByIdAndUpdate(photoId, {
                    $pull: { likeUserIds: userId }
                });
                await usersModel.findByIdAndUpdate(userId, {
                    $pull: { likePhotoIds: photoId }
                });
            } else {
                // If user hasn't liked the photo, add the like
                await photoModel.findByIdAndUpdate(photoId, {
                    $push: { likeUserIds: userId }
                });
                await usersModel.findByIdAndUpdate(userId, {
                    $push: { likePhotoIds: photoId }
                });
            }

            const updatedPhoto = await photoModel.findById(photoId);

            io.emit('like', { photoId: photoId, totalLikes: updatedPhoto.likeUserIds.length });

            return res.json({ liked: !userLiked, totalLikes: updatedPhoto.likeUserIds.length });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });


    router.get('/photo/:photoId/isliked', isLoggedIn, async function (req, res, next) {
        try {
            const photo = await photoModel.findById(req.params.photoId);
            if (!photo) {
                return res.status(404).json({ error: 'Photo not found' });
            }
            const userLiked = photo.likeUserIds.includes(req.user._id);
            return res.json({ liked: userLiked, totalLikes: photo.likeUserIds.length });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });

}

// Express routes

module.exports = { router, initialize };
