import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../locales/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: 'black',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      position: 'relative'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center',
        width: '250px',
        position: 'relative'
      }}>
        <h2 style={{ marginBottom: '30px' }}>{t('appName')}</h2>

        <p>{t('easyPlanning')}</p>
        <p>{t('inviteFriends')}</p>
        <p>{t('findPerfectTime')}</p>

        <button onClick={handleStart} style={{
          marginTop: '25px',
          padding: '10px 20px',
          backgroundColor: '#61dafb',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '1px 2px 3px rgba(0, 0, 0, 0.4)'
        }}>
          {t('letsStart')}
        </button>

        <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>
          {t('version')}
        </p>
        
        <LanguageSwitcher position="bottom-right" />
      </div>
    </div>
  );
};

export default Onboarding;
