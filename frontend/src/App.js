import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './containers/Login';
import Register from './containers/Register';
import Dashboard from './containers/Dashboard';
import Measurements from './containers/Measurements';
import Navigation from './components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/animations.css'; // Import new animations
import PrivateRoute from './components/PrivateRoute'; 

function App() {
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    const handler = () => setDarkMode((prev) => !prev);
    window.addEventListener('toggleDarkMode', handler);
    return () => window.removeEventListener('toggleDarkMode', handler);
  }, []);

  return (
    <div className={darkMode ? 'bg-dark text-light min-vh-100' : ''} style={{ minHeight: '100vh' }}>
      <Router>
        <Navigation darkMode={darkMode} />
        <Routes>
          <Route path="/login" element={<Login darkMode={darkMode} />} />
          <Route path="/register" element={<Register darkMode={darkMode} />} />

          {/* Chronione strony */}
          <Route path="/measurements" element={
            <PrivateRoute>
              <div className="d-flex justify-content-end p-3">
                <button
                  className={`btn btn-sm ${darkMode ? 'btn-light' : 'btn-dark'}`}
                  onClick={() => setDarkMode((prev) => !prev)}
                >
                  {darkMode ? '☀️ Tryb dzienny' : '🌙 Tryb nocny'}
                </button>
              </div>
              <Measurements darkMode={darkMode} />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <div className="d-flex justify-content-end p-3">
                <button
                  className={`btn btn-sm ${darkMode ? 'btn-light' : 'btn-dark'}`}
                  onClick={() => setDarkMode((prev) => !prev)}
                >
                  {darkMode ? '☀️ Tryb dzienny' : '🌙 Tryb nocny'}
                </button>
              </div>
              <Dashboard darkMode={darkMode} />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
