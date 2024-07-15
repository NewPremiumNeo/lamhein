const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const os = require('os');
require('dotenv').config();

exports.uploadOnImgbb = async function uploadImage(localFilePath) {
    try {
        console.log("local ", localFilePath)
        if (!localFilePath) return null;

        let fileBuffer = fs.readFileSync(localFilePath);
        const stats = fs.statSync(localFilePath);
        const fileSizeInBytes = stats.size;

        if (fileSizeInBytes > 31 * 1024 * 1024) {
            // Compress the image using Sharp
            fileBuffer = await sharp(fileBuffer)
                .resize({ width: 1920, withoutEnlargement: true })
                .toBuffer();
        }

        // Generate temporary file path with original file extension
        const fileExtension = path.extname(localFilePath);
        const tempFilePath = path.join(os.tmpdir(), `neofiesta_image_${Date.now()}${fileExtension}`);
        fs.writeFileSync(tempFilePath, fileBuffer);

        const formData = new FormData();
        formData.append('image', fs.createReadStream(tempFilePath));

        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
            params: {
                key: process.env.IMGBB_API_KEY,
            },
            headers: {
                ...formData.getHeaders()
            }
        });

        // Delete temporary files
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            } else {
                console.log('File not found:', localFilePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
        fs.unlinkSync(tempFilePath);

        const responseData = response.data;
        if (response.status === 200 && responseData.success) {
            console.log("File is uploaded on Imgbb:", responseData.data.url);
            return responseData.data.url;
        } else {
            throw new Error(`Error ${response.status}: ${responseData.error.message}`);
        }
    } catch (error) {
        throw new Error(`Error uploading image: ${error.message}`);
    }
}
