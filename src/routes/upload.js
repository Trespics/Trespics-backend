const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const authenticateToken = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

router.post('/', authenticateToken, upload.single('file'), uploadController.upload);

module.exports = router;
