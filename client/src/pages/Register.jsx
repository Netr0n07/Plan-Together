import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      sessionStorage.setItem('userName', formData.name);
      sessionStorage.setItem('userSurname', formData.surname);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Błąd połączenia z serwerem');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>PLAN TOGETHER</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Imię:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <label style={styles.label}>Nazwisko:</label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <label style={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <label style={styles.label}>Hasło:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>ZAREJESTRUJ SIĘ</button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.switchText}>
          Masz już konto? <Link to="/login" style={styles.link}>Zaloguj się</Link>
        </p>
        <p style={styles.footer}>Wersja 1.0 • © 2025 PlanTogether</p>
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
    marginTop: '20px',
    fontSize: '12px',
    color: '#777',
  },
};

export default Register;
