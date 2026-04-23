import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/history');
        setAnalyses(res.data.data);
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    try {
      await axios.delete(`/api/history/${id}`);
      setAnalyses(prev => prev.filter(a => a._id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--text-success)';
    if (score >= 50) return 'var(--text-warning)';
    return 'var(--text-danger)';
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Analysis History</h1>
      <p className="page-sub">Your past resume analyses</p>

      {error && <div className="error-msg">{error}</div>}

      {analyses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No analyses yet.</p>
          <Link to="/" style={{ fontSize: 13, color: 'var(--text)', marginTop: 8, display: 'inline-block' }}>
            Analyze your first resume →
          </Link>
        </div>
      ) : (
        analyses.map(a => (
          <Link to={`/history/${a._id}`} className="history-item" key={a._id}>
            <div>
              <div className="history-file">{a.fileName}</div>
              <div className="history-date">{formatDate(a.createdAt)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: getScoreColor(a.result.overall_score) }}>
                {a.result.overall_score}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{a.result.score_label}</span>
              <button
                className="btn-ghost"
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={e => handleDelete(e, a._id)}
              >
                Delete
              </button>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
