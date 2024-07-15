const voteModel = require('../models/voteModel');
const { uploadOnCloudinary } = require('../middleware/cloudinary.js');
const { uploadOnImgbb } = require('../middleware/imgbb.js');
const photoModel = require('../models/photoModel.js');


exports.photoUploadPost = async (req, res) => {
    const { postTitle, postDescription, year, service } = req.body;

    console.log(service)
    if (!req.file) {
        console.log("File not found");
        return res.status(400).send('No files uploaded.');
    }
    const uploadedPhoto = { imageUrl: req.file.path };
    try {
        var result = null
        if(service == 'cloudinary'){
            result = await uploadOnCloudinary(uploadedPhoto.imageUrl);
        }
        else {
            result = await uploadOnImgbb(uploadedPhoto.imageUrl);
        }

        if (result) {
            const newPhoto = new photoModel({
                postImageUrl: result,
                imageTitle: postTitle,
                imageDescription: postDescription,
                year: year,
                ownerIds: req.user._id
            });
            // Save the new photo document to MongoDB
            const savedPhoto = await newPhoto.save();
            console.log(savedPhoto);
            res.json(savedPhoto.postImageUrl);
        } else {
            res.status(500).send('Failed to upload photo.');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to upload photo');
        res.redirect('/photos/upload/');
    }
}


exports.calculateWinners = async () => {
    try {
        const voteCounts = await voteModel.aggregate([
            {
                $group: {
                    _id: "$votedMember",
                    name: { $first: "$name" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        if (voteCounts.length > 0) {
            const highestVoteCount = voteCounts[0].count;
            const winners = voteCounts.filter(vote => vote.count === highestVoteCount);
            return { voteCounts, winners };
        } else {
            return { message: "No votes recorded yet." };
        }
    } catch (error) {
        console.error(error);
        return { error: "Internal Server Error" };
    }
};
