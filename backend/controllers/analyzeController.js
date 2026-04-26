const pdf = require('pdf-parse');
const axios = require('axios');
const Analysis = require('../models/Analysis');

const computeCustomScore = (geminiResult, resumeText) => {
  let bonus = 0;
  const numbers = (resumeText.match(/\d+%|\d+\+|\$\d+|\d+ (users|clients|projects|teams)/gi) || []).length;
  if (numbers >= 5) bonus += 5;
  else if (numbers >= 2) bonus += 2;
  const actionVerbs = ['developed', 'built', 'designed', 'implemented', 'led', 'improved', 'achieved', 'managed', 'created', 'engineered'];
  const verbCount = actionVerbs.filter(v => resumeText.toLowerCase().includes(v)).length;
  if (verbCount >= 6) bonus += 5;
  else if (verbCount >= 3) bonus += 2;
  if (/github\.com|linkedin\.com|portfolio/i.test(resumeText)) bonus += 3;
  if (/\d{10}|\+\d{2}|\@gmail|\@yahoo/i.test(resumeText)) bonus += 2;
  return Math.min(100, (geminiResult.overall_score || 0) + bonus);
};

const analyzeResume = async (req, res) => {
  try {
    console.log('Analyze request received');
    console.log('File:', req.file ? req.file.originalname : 'NO FILE');
    console.log('User:', req.user ? req.user._id : 'NO USER');

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file' });
    }

    // Parse PDF
    let resumeText = '';
    try {
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdf(req.file.buffer);
        resumeText = data.text;
        console.log('PDF parsed, text length:', resumeText.length);
      } else {
        resumeText = req.file.buffer.toString('utf-8');
        console.log('TXT parsed, text length:', resumeText.length);
      }
    } catch (pdfErr) {
      console.error('PDF parse error:', pdfErr.message);
      return res.status(400).json({ success: false, message: 'Could not parse PDF. Try a different file.' });
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Could not extract text from resume.' });
    }

    const jd = req.body.jobDescription || '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API key not configured' });
    }

    const prompt = `You are an expert resume reviewer. Analyze this resume and return ONLY valid JSON with no markdown or backticks.

Resume:
${resumeText.slice(0, 3000)}

${jd ? `Job Description:\n${jd.slice(0, 1000)}` : ''}

Return exactly this JSON:
{
  "overall_score": 75,
  "score_label": "Good",
  "score_summary": "One sentence summary here",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "skills_found": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "skills_matching": [],
  "ats_score": 70,
  "ats_tips": ["tip1", "tip2"],
  "impact_score": 65,
  "impact_tips": ["tip1", "tip2"],
  "format_score": 80,
  "format_tips": ["tip1", "tip2"]
}`;

    console.log('Calling Gemini API...');

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    console.log('Gemini response received');

    const rawText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Raw Gemini text:', rawText.slice(0, 200));

    const cleanText = rawText.replace(/```json|```/g, '').trim();
    const geminiResult = JSON.parse(cleanText);
    geminiResult.overall_score = computeCustomScore(geminiResult, resumeText);

    const analysis = await Analysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      jobDescription: jd,
      result: geminiResult
    });

    console.log('Analysis saved, id:', analysis._id);

    res.json({ success: true, analysisId: analysis._id, result: geminiResult });

  } catch (error) {
    console.error('ANALYZE ERROR:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeResume };