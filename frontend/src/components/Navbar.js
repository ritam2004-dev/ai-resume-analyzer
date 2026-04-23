import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/" className="nav-brand">Resume Analyzer</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/"        className="nav-link">Analyze</Link>
            <Link to="/history" className="nav-link">History</Link>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{user.name}</span>
            <button className="nav-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
