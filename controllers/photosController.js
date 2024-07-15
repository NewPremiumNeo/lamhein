const multerConfig = require('../middleware/multer');
const Photo = require('../models/postsModel');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

const storage = new Storage();
const bucket = storage.bucket('your-bucket-name');

exports.handleUpload = async (req, res) => {
    try {
        // Use your uploadImg middleware for initial upload
        await new Promise((resolve, reject) => { // Wrapping in a Promise 
            multerConfig.uploadImg.single('image')(req, res, (err) => {
                if (err) reject(err); 
                else resolve();
            });
        });

        const file = req.file;
        if (!file) {
            throw new Error('Please select a file to upload.');
        }

        const gcsFilename = file.filename; 
        const blob = bucket.file(gcsFilename);
        const blobStream = blob.createWriteStream();

        // GCS Error Handling
        blobStream.on('error', err => {
            console.error('Error uploading to GCS:', err);
            fs.unlinkSync(file.path); 
            res.status(500).send('Error uploading to Google Cloud Storage'); 
        });

        // Success, Save to DB
        blobStream.on('finish', async () => { 
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            const newPhoto = new Photo({ postImageUrl: publicUrl });

            try {
                await newPhoto.save(); 
                fs.unlinkSync(file.path); 
                res.redirect('/photos'); 
            } catch (err) {
                console.error('Error saving photo data:', err);
                res.status(500).send('Error saving photo data to database');
            }
        });

        blobStream.end(file.buffer); 

    } catch (err) {
        // Handle general errors 
        console.error('Error handling upload:', err); 
        if (req.file) {
            fs.unlinkSync(req.file.path); // Delete file on error
        }
        res.status(500).send('Error processing upload'); 
    }
};

exports.displayPhotos = async (req, res) => {
    try {
        const photos = await Photo.find();
        res.render('photos', { photos });
    } catch (err) {
        console.error('Error fetching photos:', err);
        res.status(500).send('Error fetching photos');
    }
};
