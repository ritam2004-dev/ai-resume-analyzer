import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ResultsView } from '../components/ScoreCard';

export default function AnalysisDetail() {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/history/${id}`);
        setAnalysis(res.data.data);
      } catch (err) {
        setError('Analysis not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error)   return <div className="error-msg">{error}</div>;

  return (
    <div>
      <button className="btn-ghost" style={{ marginBottom: '1rem' }} onClick={() => navigate('/history')}>
        ← Back to History
      </button>

      <h1 className="page-title">{analysis.fileName}</h1>
      <p className="page-sub">
        Analyzed on {new Date(analysis.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      </p>

      <ResultsView result={analysis.result} hasJD={!!analysis.jobDescription} />
    </div>
  );
}
