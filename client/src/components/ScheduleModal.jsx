import React, { useState, useEffect } from 'react';

const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pią', 'Sob', 'Niedz'];

const ScheduleModal = ({ onSave, onCancel, onClear, existingSchedule }) => {
  const userEmail = localStorage.getItem('userEmail');
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

  // Walidacja: każdy dzień musi mieć albo zakres godzin albo zaznaczone "cała wolna"/"cała zajęta"
  const isValid = Object.values(schedule).every(day =>
    day.fullFree || day.fullBusy || (day.from && day.to)
  );

  useEffect(() => {
    const savedKey = `schedule_${eventId}_${userEmail}`;
    const fallback = localStorage.getItem(savedKey);
    const base = fallback ? JSON.parse(fallback) : {};
  
    const fullSchedule = days.reduce((acc, day) => {
      acc[day] = base[day] || {
        fullFree: false,
        fullBusy: false,
        from: '',
        to: ''
      };
      return acc;
    }, {});
  
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
    onSave(schedule);
  };

  const handleClear = () => {
    setSchedule(initialState);
    if (onClear) onClear();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1c1c1c', padding: '2rem', borderRadius: 12,
        width: 350, color: '#fff'
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Podaj swoją dostępność:</h3>

        {days.map(day => (
          <div key={day} style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 4 }}>{day}:</div>
            <label style={{ marginRight: 12 }}>
              <input
                type="checkbox"
                checked={schedule[day].fullFree}
                onChange={() => handleCheckboxChange(day, 'fullFree')}
              /> cała wolna
            </label>
            <label>
              <input
                type="checkbox"
                checked={schedule[day].fullBusy}
                onChange={() => handleCheckboxChange(day, 'fullBusy')}
              /> cała zajęta
            </label>
            <div style={{ marginTop: 4 }}>
              <input
                type="time"
                value={schedule[day].from}
                onChange={(e) => handleTimeChange(day, 'from', e.target.value)}
                disabled={schedule[day].fullFree || schedule[day].fullBusy}
                style={{ marginRight: 6 }}
              />
              do
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
              background: isValid ? '#227db5' : '#444',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem',
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
          >
            ZAPISZ
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: '#b52222',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            ANULUJ
          </button>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              background: '#555',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            WYCZYŚĆ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
