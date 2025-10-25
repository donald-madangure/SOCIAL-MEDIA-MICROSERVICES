const logger = require('../utils/logger');
const {uploadMediaToCloudinary} = require('../utils/cloudinary');
const Media = require('../models/Media');

// Media upload handler


const uploadMedia = async (req, res) => {
    logger.info('Starting media upload ...');
    try{
        if(!req.file){
            logger.warn('No file provided. Please add a file and try again!');
            return res.status(400).json({ 
                success: false,
                message: 'No file provided. Please add a file and try again!',
            });
        }

        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.userId;

        logger.info(`File details: name=${originalname}, type=${mimetype}`);
        logger.info(`Uploading media to cloudinary starting ...`);

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(`Media uploaded to Cloudinary successfully: Public Id - ${cloudinaryUploadResult.public_id}`);

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            userId,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url
        });

        await newlyCreatedMedia.save();
        
        res.status(201).json({
            success: true,
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
            message: 'Media uploaded successfully',            
        });

    }catch(e){
        logger.error(`Error uploading media: ${e.message}`);
        return res.status(500).json({ 
            success: false,
            message: 'error in uploading media' 
        });
    }
}

module.exports = {
    uploadMedia
};