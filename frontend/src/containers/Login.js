// File: containers/Login.js
import React from 'react';
import LoginForm from '../components/login/LoginForm';
import LoginSidePanel from '../components/login/LoginSidePanel';

const Login = ({ onLogin, darkMode }) => {
  return (
    <div className={`container-fluid min-vh-100 d-flex flex-column flex-md-row align-items-stretch p-0${darkMode ? ' bg-dark text-light' : ''}`} style={{ position: 'relative' }}>
      <button
        className={`btn btn-sm position-fixed${darkMode ? ' btn-light' : ' btn-dark'}`}
        style={{ top: 24, right: 24, zIndex: 1050 }}
        onClick={() => window.dispatchEvent(new CustomEvent('toggleDarkMode'))}
      >
        {darkMode ? '☀️ Tryb dzienny' : '🌙 Tryb nocny'}
      </button>
      <div className={`d-flex align-items-center justify-content-center w-100 w-md-50 p-4${darkMode ? ' bg-dark text-light' : ' bg-white'}`} style={{ minHeight: '100vh' }}>
        <LoginForm onLogin={onLogin} />
      </div>
      <div className={`d-none d-md-flex flex-column align-items-center justify-content-center w-50 position-relative${darkMode ? ' bg-secondary text-light' : ' bg-success bg-gradient text-white'}`} style={{ minHeight: '100vh' }}>
        <LoginSidePanel />
      </div>
    </div>
  );
};

export default Login;
