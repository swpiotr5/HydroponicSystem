import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/navigation.css';

const Navigation = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Don't show navigation on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} shadow-sm`}>
      <div className="container-fluid">        <span className="navbar-brand">
          <img src={require('../assets/logo.png')} alt="HydroponicSystem" height="64" />
        </span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">            <li className="nav-item">
              <span 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
                style={{ cursor: 'pointer' }}
              >
                🏠 Dashboard
              </span>
            </li>
            <li className="nav-item">
              <span 
                className={`nav-link ${location.pathname === '/measurements' ? 'active' : ''}`}
                onClick={() => navigate('/measurements')}
                style={{ cursor: 'pointer' }}
              >
                📊 Pomiary
              </span>
            </li>
          </ul>
          {isAuthenticated && (
            <ul className="navbar-nav">
              <li className="nav-item">
                <span
                  className="nav-link"
                  onClick={handleLogout}
                  style={{ cursor: 'pointer' }}
                >
                  🚪 Wyloguj
                </span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
