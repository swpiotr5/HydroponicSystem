// File: components/login/LoginForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/login/', {
        email,
        password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      if (onLogin) onLogin(token);
      navigate('/dashboard'); // przekierowanie po udanym logowaniu
    } catch (err) {
      setError('Nieprawidłowy email lub hasło.');
    }
  };

  return (
    <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: 400 }}>
      <div className="text-center mb-4">
        <img src={require('../../assets/logo.png')} alt="Logo" style={{ height: 64 }} className="mb-2" />
        <h2 className="fw-bold">Zaloguj się</h2>
        <p className="text-muted small">Dostęp do systemu Hydroponic</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Hasło"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <label htmlFor="password">Hasło</label>
        </div>
        {error && <div className="alert alert-danger text-center py-2 small">{error}</div>}
        <button type="submit" className="btn btn-success w-100 py-2 fw-semibold">
          Zaloguj się
        </button>
      </form>
      <div className="text-center mt-3">
        Nie masz konta? <a href="/register">Załóż konto</a>
      </div>
    </div>
  );
};

export default LoginForm;
