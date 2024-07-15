const os = require('os');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const sharp = require('sharp');
require('dotenv').config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadOnCloudinary = async (localFilePath) => {
    try {
        // console.log("locla", localFilePath)
        if (!localFilePath) return null

        let fileBuffer = fs.readFileSync(localFilePath);
        const stats = fs.statSync(localFilePath);
        const fileSizeInBytes = stats.size;

        if (fileSizeInBytes > 8 * 1024 * 1024) {
            // Compress the image using Sharp
            fileBuffer = await sharp(fileBuffer)
                .resize({ width: 1920, withoutEnlargement: true }) 
                .toBuffer();
        }
        console.log(fileBuffer)

        // Generate temporary file path with original file extension
        const fileExtension = path.extname(localFilePath);
        const tempFilePath = path.join(os.tmpdir(), `temp_image_${Date.now()}${fileExtension}`);
        fs.writeFileSync(tempFilePath, fileBuffer);
        console.log("temp ", tempFilePath)
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "auto"
        })

        // const response = await cloudinary.uploader.upload(localFilePath, {
        //     resource_type: "auto"
        // })

        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        fs.unlinkSync(tempFilePath);
        return response;

    } catch (error) {
        // remove the locally saved temporary file as the upload operation got failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}