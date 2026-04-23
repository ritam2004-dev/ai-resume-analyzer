import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyzer from './pages/Analyzer';
import History from './pages/History';
import AnalysisDetail from './pages/AnalysisDetail';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Analyzer /></PrivateRoute>} />
            <Route path="/history"  element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/history/:id" element={<PrivateRoute><AnalysisDetail /></PrivateRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
