const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


const postSchema = mongoose.Schema({
    year: { type: String, required: true },
    postVideoUrl: {
        type: String,
    },
    thumbnailLink: {
        type: String,
    },
    videoTitle: {
        type: String,
        default: ""
    },
    videoDescription: {
        type: String,
        default: ""
    },
    likeUserIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: {
        type: [commentSchema],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Videos', postSchema);