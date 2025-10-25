const express = require('express');
const multer = require('multer');
const {uploadMedia} = require('../controllers/media-controller');
const { authenticateRequest } = require('../middleware/auth-middleware');
const logger = require('../utils/logger');

const router = express.Router();
const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB limit
        }        
    }).single('file')

// Route to handle media upload
router.post('/upload', authenticateRequest, (req, res, next) => {
    upload(req, res, (err) => {
        if(err instanceof multer.MulterError){
            logger.error(`Multer error during file upload: ${err.message}`);
            return res.status(400).json({
                success: false,
                message: 'Multer error while uploading file',
                error: err.message,
                stack: err.stack
            });        
        }else if(err){
            logger.error(`Unknown error occurred while file upload: ${err.message}`);
            return res.status(500).json({
                success: false,
                message: 'Unknown error occurred while file upload',
                error: err.message,
                stack: err.stack
            });             
        }
        if(!req.file){
             return res.status(400).json({
                success: false,
                message: 'No file found!',
            }); 
        }
        next();    
    })
},uploadMedia);

module.exports = router;


