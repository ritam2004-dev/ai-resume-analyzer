const express = require('express');
const { getHistory, getAnalysisById, deleteAnalysis } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getHistory);
router.get('/:id', protect, getAnalysisById);
router.delete('/:id', protect, deleteAnalysis);

module.exports = router;
