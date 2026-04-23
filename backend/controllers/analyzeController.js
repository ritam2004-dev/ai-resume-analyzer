const pdf = require('pdf-parse');
const axios = require('axios');
const Analysis = require('../models/Analysis');

// Custom scoring layer on top of Gemini response
const computeCustomScore = (geminiResult, resumeText) => {
  let bonus = 0;

  // Bonus: quantified achievements (numbers in text)
  const numbers = (resumeText.match(/\d+%|\d+\+|\$\d+|\d+ (users|clients|projects|teams)/gi) || []).length;
  if (numbers >= 5) bonus += 5;
  else if (numbers >= 2) bonus += 2;

  // Bonus: action verbs
  const actionVerbs = ['developed', 'built', 'designed', 'implemented', 'led', 'improved', 'achieved', 'managed', 'created', 'engineered'];
  const verbCount = actionVerbs.filter(v => resumeText.toLowerCase().includes(v)).length;
  if (verbCount >= 6) bonus += 5;
  else if (verbCount >= 3) bonus += 2;

  // Bonus: has GitHub/LinkedIn/portfolio
  if (/github\.com|linkedin\.com|portfolio/i.test(resumeText)) bonus += 3;

  // Bonus: has contact info
  if (/\d{10}|\+\d{2}|\@gmail|\@yahoo/i.test(resumeText)) bonus += 2;

  return Math.min(100, (geminiResult.overall_score || 0) + bonus);
};

// @desc    Analyze resume
// @route   POST /api/analyze
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file' });
    }

    // Parse PDF on server side
    let resumeText = '';
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      resumeText = data.text;
    } else {
      resumeText = req.file.buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from resume. Try a text-based PDF.' });
    }

    const jd = req.body.jobDescription || '';

    // Build prompt for Gemini
    const prompt = `You are an expert resume reviewer and career coach. Analyze this resume${jd ? ' against the provided job description' : ''} and return ONLY a valid JSON object with no markdown or backticks.

Resume Text:
${resumeText.slice(0, 4000)}

${jd ? `Job Description:\n${jd.slice(0, 1500)}` : ''}

Return exactly this JSON structure:
{
  "overall_score": <number 0-100>,
  "score_label": "<Excellent|Good|Average|Needs Work>",
  "score_summary": "<one sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "skills_found": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>", "<skill6>"],
  ${jd ? '"skills_matching": ["<skill matching JD>"],' : '"skills_matching": [],'}
  "ats_score": <number 0-100>,
  "ats_tips": ["<tip1>", "<tip2>"],
  "impact_score": <number 0-100>,
  "impact_tips": ["<tip1>", "<tip2>"],
  "format_score": <number 0-100>,
  "format_tips": ["<tip1>", "<tip2>"]
}`;

    // Call Gemini API (server-side — API key is secure in .env)
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const rawText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    const geminiResult = JSON.parse(cleanText);

    // Apply custom scoring layer on top of Gemini
    geminiResult.overall_score = computeCustomScore(geminiResult, resumeText);

    // Save analysis to MongoDB
    const analysis = await Analysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      jobDescription: jd,
      result: geminiResult
    });

    res.json({
      success: true,
      analysisId: analysis._id,
      result: geminiResult
    });

  } catch (error) {
    if (error.name === 'SyntaxError') {
      return res.status(500).json({ success: false, message: 'Failed to parse AI response. Please try again.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeResume };
