import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto' }}>
      <h1 className="page-title">Create account</h1>
      <p className="page-sub">Start analyzing your resume with AI</p>

      <div className="card">
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ritam Khatua" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="min. 6 characters" />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account...' : 'Register →'}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--text)' }}>Login here</Link>
      </p>
    </div>
  );
}
