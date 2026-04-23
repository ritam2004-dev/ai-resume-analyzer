const Analysis = require('../models/Analysis');

// @desc    Get user's analysis history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .select('fileName result.overall_score result.score_label createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, count: analyses.length, data: analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single analysis by ID
// @route   GET /api/history/:id
// @access  Private
const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // Make sure user owns this analysis
    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete analysis
// @route   DELETE /api/history/:id
// @access  Private
const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await analysis.deleteOne();
    res.json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHistory, getAnalysisById, deleteAnalysis };
