import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(false);
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', form);
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('userEmail', form.email);      
      // Get user data
      const userRes = await axios.get('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${res.data.token}` } });
      sessionStorage.setItem('userId', userRes.data._id);
      sessionStorage.setItem('userName', userRes.data.name);
      sessionStorage.setItem('userSurname', userRes.data.surname);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(true);
    }
  };

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          background-color: #121212;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .login-form {
          background-color: #1e1e1e;
          padding: 2rem;
          border-radius: 10px;
          width: 100%;
          max-width: 400px;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-form h2 {
          text-align: center;
          color: #fff;
          margin-bottom: 1rem;
        }

        .login-form label {
          margin-bottom: -0.5rem;
        }

        .login-form input {
          padding: 0.6rem;
          border: none;
          border-radius: 5px;
          background-color: #2c2c2c;
          color: #fff;
        }

        .login-form button {
          background-color: #007bff;
          border: none;
          padding: 0.7rem;
          border-radius: 5px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .login-form button:hover {
          background-color: #0056b3;
        }

        .login-form p {
          text-align: center;
          font-size: 0.95rem;
        }

        .login-form a {
          color: #fff;
          text-decoration: underline;
        }

        .login-form footer {
          text-align: center;
          font-size: 0.8rem;
          color: #aaa;
          margin-top: 1rem;
        }
      `}</style>

      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>PLAN TOGETHER</h2>

          <label>Email:</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />

          <label>Hasło:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
          {loginError && (
            <div style={{ color: 'orange', margin: '8px 0', textAlign: 'center' }}>
              Nieprawidłowe dane
            </div>
          )}
          <button type="submit">ZALOGUJ SIĘ</button>

          <p>
            Nie masz konta? <Link to="/register"><strong>Zarejestruj się</strong></Link>
          </p>

          <footer>Wersja 1.0 • © 2025 PlanTogether</footer>
        </form>
      </div>
    </>
  );
};

export default Login;
