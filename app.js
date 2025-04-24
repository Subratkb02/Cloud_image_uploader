require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { s3Upload, handleUploadError } = require('./middleware/upload');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static('public'));


app.post('/upload', s3Upload.single('file'), handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            fileUrl: req.file.location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing upload',
            error: error.message
        });
    }
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
