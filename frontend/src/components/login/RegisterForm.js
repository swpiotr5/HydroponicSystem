import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:8000/register/', {
        email,
        password,
      });
      setSuccess('Rejestracja zakończona sukcesem! Możesz się zalogować.');
      setEmail('');
      setPassword('');
      if (onRegister) onRegister();
    } catch (err) {
      setError('Nieprawidłowe dane lub użytkownik już istnieje.');
    }
  };

  return (
    <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: 400 }}>
      <div className="text-center mb-4">
        <img src={require('../../assets/logo.png')} alt="Logo" style={{ height: 64 }} className="mb-2" />
        <h2 className="fw-bold">Rejestracja</h2>
        <p className="text-muted small">Załóż konto w Hydroponic System</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="register-email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label htmlFor="register-email">Email</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="register-password"
            placeholder="Hasło"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <label htmlFor="register-password">Hasło</label>
        </div>
        {error && <div className="alert alert-danger text-center py-2 small">{error}</div>}
        {success && <div className="alert alert-success text-center py-2 small">{success}</div>}
        <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
          Zarejestruj się
        </button>
        <div className="text-center mt-3">
          Masz już konto? <a href="/login">Zaloguj się</a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
