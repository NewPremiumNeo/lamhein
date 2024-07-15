const Vote = require('../models/voteModel');
const boolModel = require('../models/boolModel.js');


exports.checkVoted = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const existingVote = await Vote.findOne({ user: userId });
        if (req.originalUrl == "/vote" || req.originalUrl == "/vote/" || req.originalUrl == "/vote//") {
            if (existingVote) {
                return res.redirect('/vote/voted');
            }
            next();
        } else {
            if (!existingVote) {
                return res.redirect('/vote');
            }
            next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Middleware function to check if winner announcement is Declared
exports.checkWinnerDeclared = async (req, res, next) => {
    try {
        const bool = await boolModel.findOne({}).exec();
        if (!(bool && bool.isWinnerOn)) {
            next();
        } else {
            res.redirect('/vote/winner');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

// Middleware function to check if voting is enabled
exports.checkVoteStatus = async (req, res, next) => {
    try {
        const bool = await boolModel.findOne({}).exec();
        if (bool && bool.isVoteOn) {
            next();
        } else {
            req.flash('error', 'Voting is Disable');
            res.redirect('/');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

// Middleware function to check if winner announcement is enabled
exports.checkWinnerStatus = async (req, res, next) => {
    try {
        const bool = await boolModel.findOne({}).exec();
        if (bool && bool.isWinnerOn) {
            next();
        } else {
            res.redirect('/vote');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};