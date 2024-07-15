const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    votedMember: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    votedMemberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);
