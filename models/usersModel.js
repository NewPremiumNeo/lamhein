const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        index: true,
        unique: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    dob: {
        type: String,
        trim: true,
        default: ""
    },
    password: {
        type: String,
    },
    userDp: {
        type: String,
    },
    likePhotoIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photos',
        default: []
    }],
    savedPhotos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photos',
        default: []
    }],
    likeVideoIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Videos',
        default: []
    }],
    savedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Videos',
        default: []
    }],
    postIds: {
        type: [{
            _id: false,
            type: { type: String, enum: ['Photos', 'Videos'], required: true },
            postId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'postIds.type' }
        }],
        default: []
    },

}, { timestamps: true });

userSchema.plugin(plm, { usernameQueryFields: ["email", "username"] });

module.exports = mongoose.model('User', userSchema);