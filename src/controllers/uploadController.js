const { uploadFile } = require('../services/storageService');

const upload = async (req, res, next) => {
  try {
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    console.log('Uploading file:', req.file.originalname);
    const result = await uploadFile(req.file);
    console.log('Upload successful:', result.url);
    res.status(200).json(result);
  } catch (error) {
    console.error('Upload controller error:', error);
    next(error);
  }
};

module.exports = {
  upload
};
