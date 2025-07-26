import React, { useState, useEffect } from 'react';
import { useLanguage } from '../locales/LanguageContext';

const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pią', 'Sob', 'Niedz'];

const ScheduleModal = ({ onSave, onCancel, onClear, existingSchedule }) => {
  const { t } = useLanguage();
  const userEmail = sessionStorage.getItem('userEmail');
  const eventId = window.location.pathname.split('/').pop();

  const initialState = days.reduce((acc, day) => {
    acc[day] = {
      fullFree: false,
      fullBusy: false,
      from: '',
      to: ''
    };
    return acc;
  }, {});

  const [schedule, setSchedule] = useState(initialState);

  // Validation: each day must have either time range or "all free"/"all busy" checked
  const isValid = Object.values(schedule).every(day =>
    day.fullFree || day.fullBusy || (day.from && day.to)
  );

  useEffect(() => {
    console.log('ScheduleModal useEffect - userEmail:', userEmail);
    console.log('ScheduleModal useEffect - existingSchedule:', existingSchedule);
    
    const savedKey = `schedule_${eventId}_${userEmail}`;
    const fallback = sessionStorage.getItem(savedKey);
    console.log('ScheduleModal useEffect - savedKey:', savedKey);
    console.log('ScheduleModal useEffect - fallback:', fallback);
    
    // Check if user is event participant
    const isParticipant = existingSchedule && existingSchedule.participants && 
      existingSchedule.participants.some(p => p.user && p.user.email === userEmail);
    console.log('ScheduleModal useEffect - isParticipant:', isParticipant);
    
    // Find current user's availability from the database
    let dbSchedule = {};
    if (existingSchedule && existingSchedule.participants) {
      const currentUser = existingSchedule.participants.find(p => p.user && p.user.email === userEmail);
      console.log('ScheduleModal useEffect - currentUser:', currentUser);
      if (currentUser && currentUser.availability && currentUser.availability.length > 0) {
        dbSchedule = currentUser.availability[0];
        console.log('ScheduleModal useEffect - found user availability in DB:', dbSchedule);
      }
    }
    
    // Priority: database > sessionStorage > default (changed priority to load from DB first)
    const base = dbSchedule || (fallback && isParticipant ? JSON.parse(fallback) : {});
    console.log('ScheduleModal useEffect - base:', base);
  
    const fullSchedule = days.reduce((acc, day) => {
      acc[day] = base[day] || {
        fullFree: false,
        fullBusy: false,
        from: '',
        to: ''
      };
      return acc;
    }, {});
  
    console.log('ScheduleModal useEffect - fullSchedule:', fullSchedule);
    setSchedule(fullSchedule);
  }, [existingSchedule, eventId, userEmail]);  

  const handleCheckboxChange = (day, type) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        fullFree: type === 'fullFree' ? !prev[day].fullFree : false,
        fullBusy: type === 'fullBusy' ? !prev[day].fullBusy : false,
        from: '',
        to: ''
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
        fullFree: false,
        fullBusy: false
      }
    }));
  };

  const handleSave = () => {
    if (!isValid) return;
    
    // Don't save to sessionStorage here - let the parent component handle it
    // after successful save to database
    console.log('ScheduleModal handleSave - calling onSave with schedule:', schedule);
    
    onSave(schedule);
  };

  const handleClear = () => {
    setSchedule(initialState);
    
    // Remove schedule from sessionStorage
    const savedKey = `schedule_${eventId}_${userEmail}`;
    sessionStorage.removeItem(savedKey);
    console.log('ScheduleModal handleClear - removed from sessionStorage:', savedKey);
    
    if (onClear) onClear();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#222', padding: '2rem', borderRadius: 16,
        width: 350, color: '#fff'
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>{t('provideYourAvailability')}</h3>

        {days.map(day => (
          <div key={day} style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 4 }}>{day}:</div>
            <label style={{ marginRight: 12 }}>
              <input
                type="checkbox"
                checked={schedule[day].fullFree}
                onChange={() => handleCheckboxChange(day, 'fullFree')}
              /> {t('allFree')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={schedule[day].fullBusy}
                onChange={() => handleCheckboxChange(day, 'fullBusy')}
              /> {t('allBusy')}
            </label>
            <div style={{ marginTop: 4 }}>
              <input
                type="time"
                value={schedule[day].from}
                onChange={(e) => handleTimeChange(day, 'from', e.target.value)}
                disabled={schedule[day].fullFree || schedule[day].fullBusy}
                style={{ marginRight: 6 }}
              />
              {t('to')}
              <input
                type="time"
                value={schedule[day].to}
                onChange={(e) => handleTimeChange(day, 'to', e.target.value)}
                disabled={schedule[day].fullFree || schedule[day].fullBusy}
                style={{ marginLeft: 6 }}
              />
            </div>
          </div>
        ))}

        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{
              flex: 1,
              background: isValid ? '#4be36b' : '#444',
              color: isValid ? '#222' : '#fff',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
                      >
            {t('save')}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: '#e36b6b',
              color: '#222',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              background: '#a16be3',
              color: '#222',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: 'pointer'
            }}
                      >
            {t('clear')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
