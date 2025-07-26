import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../locales/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = t('pleaseEnterName');
    }
    
    if (!formData.surname) {
      errors.surname = t('pleaseEnterSurname');
    }
    
    if (!formData.email) {
      errors.email = t('pleaseEnterEmail');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('invalidEmailFormat');
    }
    
    if (!formData.password) {
      errors.password = t('pleaseEnterPassword');
    } else if (formData.password.length < 6) {
      errors.password = t('passwordTooShort');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      sessionStorage.setItem('userName', formData.name);
      sessionStorage.setItem('userSurname', formData.surname);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(t('serverConnectionError'));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{t('appName')}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>{t('name')}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />
          {validationErrors.name && (
            <div style={{ color: '#ff4d4d', marginTop: '5px', fontSize: '0.8rem' }}>
              {validationErrors.name}
            </div>
          )}

          <label style={styles.label}>{t('surname')}</label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            style={styles.input}
          />
          {validationErrors.surname && (
            <div style={{ color: '#ff4d4d', marginTop: '5px', fontSize: '0.8rem' }}>
              {validationErrors.surname}
            </div>
          )}

          <label style={styles.label}>{t('email')}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          {validationErrors.email && (
            <div style={{ color: '#ff4d4d', marginTop: '5px', fontSize: '0.8rem' }}>
              {validationErrors.email}
            </div>
          )}

          <label style={styles.label}>{t('password')}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />
          {validationErrors.password && (
            <div style={{ color: '#ff4d4d', marginTop: '5px', fontSize: '0.8rem' }}>
              {validationErrors.password}
            </div>
          )}

          <button type="submit" style={styles.button}>{t('createAccount')}</button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.switchText}>
          {t('haveAccount')} <Link to="/login" style={styles.link}>{t('login')}</Link>
        </p>
        <div style={styles.footer}>
          {t('version')}
        </div>
        <LanguageSwitcher position="bottom-right" />
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#111',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: '30px 40px',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    color: '#ddd',
    textAlign: 'left',
    fontSize: '14px',
    marginTop: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    outline: 'none',
  },
  button: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#009dff',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: '#ff4d4d',
    marginTop: '10px',
  },
  switchText: {
    marginTop: '20px',
    color: '#ccc',
  },
  link: {
    color: '#fff',
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginLeft: '5px',
  },
  footer: {
    marginTop: '15px',
    fontSize: '12px',
    color: '#777',
  },
};

export default Register;
