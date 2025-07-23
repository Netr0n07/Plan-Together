import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();

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
      height: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center',
        width: '250px',
      }}>
        <h2 style={{ marginBottom: '30px' }}>PLAN TOGETHER</h2>

        <p>📅 Łatwe planowanie</p>
        <p>👥 Zapraszaj znajomych</p>
        <p>✅ Znajdź idealny termin</p>

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
          ZACZYNAMY
        </button>

        <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#666' }}>
          Wersja 1.0 • © 2025 PlanTogether
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
