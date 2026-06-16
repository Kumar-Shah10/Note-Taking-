const express = require('express');
const multer = require('multer');
const { uploadAvatar } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/upload/avatar
router.post('/avatar', auth, upload.single('file'), uploadAvatar);

module.exports = router;