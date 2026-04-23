const express = require('express');
const multer = require('multer');
const { analyzeResume } = require('../controllers/analyzeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer config — store in memory, max 5MB, only PDF/TXT
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'), false);
    }
  }
});

router.post('/', protect, upload.single('resume'), analyzeResume);

module.exports = router;
