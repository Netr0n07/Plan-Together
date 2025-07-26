import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../locales/LanguageContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', description: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.name) {
      errors.name = t('pleaseEnterEventName');
    }
    
    if (!form.description) {
      errors.description = t('pleaseEnterDescription');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      alert(t('noToken'));
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/events',
        {
          title: form.name,
          description: form.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Błąd tworzenia wydarzenia:', error);
      alert(t('errorCreatingEvent'));
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ background: '#222', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '2rem', fontWeight: 'bold', textAlign: 'center' }}>{t('newEvent')}</h2>
        <label style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>{t('eventName')}</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 20, padding: 8, borderRadius: 6, border: '1px solid #aaa', fontSize: 16, background: '#eee' }}
        />
        {validationErrors.name && (
          <div style={{ color: '#ff4d4d', marginTop: '-15px', marginBottom: '15px', fontSize: '0.8rem', textAlign: 'center' }}>
            {validationErrors.name}
          </div>
        )}
        <label style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>{t('description')}</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={7}
          style={{ width: '100%', marginBottom: 24, padding: 8, borderRadius: 6, border: '1px solid #aaa', fontSize: 16, background: '#999', resize: 'none' }}
        />
        {validationErrors.description && (
          <div style={{ color: '#ff4d4d', marginTop: '-15px', marginBottom: '15px', fontSize: '0.8rem', textAlign: 'center' }}>
            {validationErrors.description}
          </div>
        )}
        <button type="submit" style={{ width: '100%', background: '#6be39b', color: '#222', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', marginBottom: 12, fontSize: 16, cursor: 'pointer' }}>
          {t('createEventButton')}
        </button>
        <button type="button" onClick={handleCancel} style={{ width: '100%', background: '#e36b6b', color: '#222', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', fontSize: 16, cursor: 'pointer' }}>
          {t('cancel')}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
