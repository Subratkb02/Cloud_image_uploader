const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('../config/s3client');
const express = require('express');
const app = express();


const s3Upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const fileName = `${Date.now()}-${file.originalname}`;
            cb(null, `uploads/${fileName}`);
        }
    }),
    limits: { 
        fileSize: 5 * 1024 * 1024 
    }, 
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.match('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});


const uploadFile = async (file) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: file.filename,
            Body: file.content,
            ACL: 'public-read'
        };

        const result = await s3Client.upload(params).promise();
        return result.Location; 
    } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};


const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: 'Error processing file',
            error: err.message
        });
    }
    next();
};

module.exports = {
    s3Upload,
    uploadFile,
    handleUploadError
};


app.post('/upload', s3Upload.single('file'), async (req, res) => {
  try {
    
    res.json({ success: true, fileUrl: uploadedFileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading file', 
      error: error.message 
    });
  }
});