import React from 'react';
import { useLanguage } from '../locales/LanguageContext';

const LanguageSwitcher = ({ position = 'bottom-right' }) => {
  const { language, changeLanguage, t } = useLanguage();

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return {
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'flex-end'
        };
      case 'bottom-center':
        return {
          marginTop: '10px',
          textAlign: 'center'
        };
      default:
        return {};
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.8rem',
      color: '#666',
      ...getPositionStyles()
    }}>
      <span>{t('language')}:</span>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          background: 'transparent',
          border: '1px solid #666',
          borderRadius: '4px',
          padding: '2px 6px',
          color: '#666',
          fontSize: '0.8rem',
          cursor: 'pointer'
        }}
      >
        <option value="en">English</option>
        <option value="pl">Polski</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher; 