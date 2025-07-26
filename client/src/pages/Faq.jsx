import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../locales/LanguageContext';

const Faq = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>{t('back')}</button>
        </div>
        <h2 style={styles.heading}>{t('howToCreateEvent')}</h2>
        <ol style={styles.list}>
          <li>{t('howToCreateEventStep1')}</li>
          <li>{t('howToCreateEventStep2')}</li>
          <li>{t('howToCreateEventStep3')}</li>
        </ol>
        <h2 style={styles.heading}>{t('howToJoinEvent')}</h2>
        <ol style={styles.list}>
          <li>{t('howToJoinEventStep1')}</li>
          <li>{t('howToJoinEventStep2')}</li>
          <li>{t('howToJoinEventStep3')}</li>
        </ol>
        <h2 style={styles.heading}>{t('howDateSelectionWorks')}</h2>
        <p style={styles.text}>{t('dateSelectionExplanation')}</p>
        
        <h2 style={styles.heading}>{t('howToFillAvailability')}</h2>
        <ol style={styles.list}>
          <li>{t('howToFillAvailabilityStep1')}</li>
          <li>{t('howToFillAvailabilityStep2')}</li>
          <li>{t('howToFillAvailabilityStep3')}</li>
          <li>{t('howToFillAvailabilityStep4')}</li>
          <li>{t('howToFillAvailabilityStep5')}</li>
        </ol>
        
        <h2 style={styles.heading}>{t('whatDoDesignationsMean')}</h2>
        <ul style={styles.list}>
          <li><span style={{color: '#FF6B6B', fontWeight: 'bold'}}>{language === 'pl' ? '(T)' : '(C)'}</span> - {t('designationCreatorShort')}</li>
          <li><span style={{color: '#FFD700', fontWeight: 'bold'}}>{language === 'pl' ? '(TY)' : '(YOU)'}</span> - {t('designationYouShort')}</li>
        </ul>
        <h2 style={styles.heading}>{t('canIDeleteEvent')}</h2>
        <p style={styles.text}>{t('deleteEventExplanation')}</p>
        <ol style={styles.list}>
          <li>{t('deleteEventStep1')}</li>
          <li>{t('deleteEventStep2')}</li>
        </ol>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#111',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#222',
    padding: '2rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    textAlign: 'left',
    color: '#fff',
  },
  backBtn: {
    marginBottom: '1rem',
    background: '#009dff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '0.5rem 1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  heading: {
    color: '#fff',
    marginTop: '1.2rem',
    marginBottom: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  list: {
    marginLeft: '1.2rem',
    color: '#ccc',
    marginBottom: '0.7rem',
  },
  text: {
    color: '#ccc',
    marginBottom: '0.7rem',
  },
};

export default Faq; 