import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../locales/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.email) {
      errors.email = t('pleaseEnterEmail');
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = t('invalidEmailFormat');
    }
    
    if (!form.password) {
      errors.password = t('pleaseEnterPassword');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(false);
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
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
          position: relative;
        }
      `}</style>

      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>{t('appName')}</h2>

          <label>{t('email')}</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} />
          {validationErrors.email && (
            <div style={{ color: 'orange', margin: '4px 0', textAlign: 'center', fontSize: '0.8rem' }}>
              {validationErrors.email}
            </div>
          )}

          <label>{t('password')}</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} />
          {validationErrors.password && (
            <div style={{ color: 'orange', margin: '4px 0', textAlign: 'center', fontSize: '0.8rem' }}>
              {validationErrors.password}
            </div>
          )}
          {loginError && (
            <div style={{ color: 'orange', margin: '8px 0', textAlign: 'center' }}>
              {t('invalidCredentials')}
            </div>
          )}
          <button type="submit">{t('login')}</button>

          <p>
            {t('noAccount')} <Link to="/register"><strong>{t('register')}</strong></Link>
          </p>

          <footer>
            {t('version')}
          </footer>
          <LanguageSwitcher position="bottom-right" />
        </form>
      </div>
    </>
  );
};

export default Login;
