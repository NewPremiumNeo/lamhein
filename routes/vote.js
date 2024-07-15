const express = require('express');
const router = express.Router();
const { checkVoted, checkWinnerStatus, checkVoteStatus, checkWinnerDeclared} = require('../middleware/checkVoted');
const voteModel = require('../models/voteModel');
const { isLoggedIn } = require('../middleware/authMiddleware.js');
const usersModel = require('../models/usersModel.js');
const voteController = require('../controllers/voteController.js')


router.get('/', isLoggedIn, checkVoteStatus, checkWinnerDeclared, checkVoted,  async (req, res) => {
    res.render('vote');
});

router.get('/voted', isLoggedIn, checkVoteStatus, checkWinnerDeclared, checkVoted, async (req, res) => {
    const votedMemberId = await voteModel.findOne({ "user": req.user._id })
    res.render('voted', { votedMemberId });
});



router.post('/', isLoggedIn, checkVoteStatus, checkWinnerDeclared, checkVoted, async (req, res) => {
    try {
        names = ['Aditya Kumar', 'Akanksha', 'Aakash Harsh', 'Amitesh Sharma', 'Anoushka Amit', 'Arti Choudhary', 'Aryan Raj', 'Bhagyashree', 'Hemant Raaz', 'Kumar Utkarsh', 'Kunal Kumar', 'Madhuri Singh', 'MD. Kaif', 'Mukul Anand', 'Muskan Raj', 'Oshin Arya', 'Priya Kumari', 'Rahul Kumar', 'Ramanand Kumar', 'Raunak Kumar', 'Ravikant Kumar', 'Rishab Raj', 'Rishita Srivastava', 'Rumi Kumari', 'Shahnawaz Alam', 'Shashank Kumar', 'Shikha Kumari', 'Shilpi Rani', 'Shweta Kumari', 'Soniya Prasad', 'Sujeet Kumar', 'Supriya Kumari', 'Vivek Kumar']

        const votedMember = req.body.votedMember;
        const userId = req.user._id;
        const votedMemberDocument = await usersModel.findOne({ "username": votedMember });

        const name = names[parseInt(votedMember.slice(-2)) - 1];
        let vote = ""
        if (votedMemberDocument) {
            vote = new voteModel({
                user: userId,
                votedMember: votedMember,
                name: name,
                votedMemberId: votedMemberDocument._id
            });
        }else{
            vote = new voteModel({
                user: userId,
                votedMember: votedMember,
                name: name,
            });
        }

        await vote.save();

        console.log("Vote saved successfully");
        res.redirect('/vote/voted');
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/winner', isLoggedIn, checkWinnerStatus, async (req, res) => {
    try {
        const { winners, message } = await voteController.calculateWinners();
        res.render('winner', { winners, message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;
