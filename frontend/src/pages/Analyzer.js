import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { ResultsView } from '../components/ScoreCard';

export default function Analyzer() {
  const [file, setFile]         = useState(null);
  const [jd, setJd]             = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setResult(null); setError(''); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) { setError('Please upload your resume first.'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jd);

      const res = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(''); setJd(''); };

  return (
    <div>
      <h1 className="page-title">Resume Analyzer</h1>
      <p className="page-sub">Upload your resume and get instant AI-powered feedback</p>

      {!result ? (
        <>
          <div className="card">
            <label>Upload Resume (PDF or TXT, max 5MB)</label>
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="upload-icon">📄</div>
              <div className="upload-text">
                <strong>Click to upload</strong> or drag & drop
              </div>
              <div className="upload-text" style={{ fontSize: 12, marginTop: 4 }}>
                PDF, TXT supported
              </div>
            </div>
            {file && (
              <div className="file-badge">✓ {file.name}</div>
            )}
          </div>

          <div className="card">
            <label>
              Job Description{' '}
              <span style={{ color: 'var(--text-tertiary)' }}>(optional — for keyword matching)</span>
            </label>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the job description here to get tailored skill gap analysis..."
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary" onClick={handleAnalyze} disabled={loading || !file}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Analyzing with Gemini AI...
              </span>
            ) : 'Analyze Resume →'}
          </button>
        </>
      ) : (
        <>
          <ResultsView result={result} hasJD={!!jd} />
          <button className="btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }} onClick={reset}>
            ← Analyze another resume
          </button>
        </>
      )}
    </div>
  );
}
