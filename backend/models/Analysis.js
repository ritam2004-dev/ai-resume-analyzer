const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    default: ''
  },
  result: {
    overall_score: Number,
    score_label: String,
    score_summary: String,
    strengths: [String],
    improvements: [String],
    skills_found: [String],
    skills_matching: [String],
    ats_score: Number,
    ats_tips: [String],
    impact_score: Number,
    impact_tips: [String],
    format_score: Number,
    format_tips: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
