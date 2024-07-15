const mongoose = require('mongoose');

const boolSchema = mongoose.Schema({
    isVoteOn: { type: Boolean, default: false },
    isWinnerOn: { type: Boolean, default: false }
});

module.exports = mongoose.model('Bool', boolSchema);
