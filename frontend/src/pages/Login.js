import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto' }}>
      <h1 className="page-title">Welcome back</h1>
      <p className="page-sub">Login to analyze your resume</p>

      <div className="card">
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in...' : 'Login →'}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: '1rem' }}>
        No account?{' '}
        <Link to="/register" style={{ color: 'var(--text)' }}>Register here</Link>
      </p>
    </div>
  );
}
