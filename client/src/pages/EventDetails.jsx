import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScheduleModal from '../components/ScheduleModal';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userSchedule, setUserSchedule] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!userEmail || !id) return;

    // Szukamy wydarzenia: najpierw u twórcy, potem u siebie
    const allPossibleCreators = [userEmail, ...(JSON.parse(localStorage.getItem('allUsers') || '[]'))];
    let foundEvent = null;
    for (const creator of allPossibleCreators) {
      const creatorEvents = JSON.parse(localStorage.getItem(`events_${creator}`) || '[]');
      const match = creatorEvents.find(ev => String(ev.id) === String(id));
      if (match) {
        foundEvent = match;
        break;
      }
    }

    if (!foundEvent) return;

    setEvent(foundEvent);

    // Pobierz grafik użytkownika
    const saved = localStorage.getItem(`schedule_${id}_${userEmail}`);
    if (saved) setUserSchedule(JSON.parse(saved));

    // Zbierz unikalnych uczestników
    const all = [
      { email: foundEvent.creator, name: foundEvent.creatorName || '', surname: foundEvent.creatorSurname || '' },
      ...(foundEvent.joinedUsers || [])
    ];

    const unique = all.filter((u, idx, arr) =>
      arr.findIndex(v => v.email === u.email) === idx
    );

    const parts = unique.map(u => ({
      ...u,
      display: `${u.name || ''} ${u.surname || ''}`.trim(),
      declared: !!localStorage.getItem(`schedule_${id}_${u.email}`),
      isMe: u.email === userEmail,
      isCreator: u.email === foundEvent.creator
    }));

    setParticipants(parts);
  }, [id, userEmail]);

  const updateSchedule = (data) => {
    localStorage.setItem(`schedule_${id}_${userEmail}`, JSON.stringify(data));
    setUserSchedule(data);
    setShowScheduleModal(false);
  };

  const clearSchedule = () => {
    localStorage.removeItem(`schedule_${id}_${userEmail}`);
    setUserSchedule({});
    setShowScheduleModal(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://plantogether.app/${id}`);
    setCopyMsg('Skopiowano link!');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  const confirmDelete = () => {
    const events = JSON.parse(localStorage.getItem(`events_${userEmail}`) || '[]');
    const updated = events.filter(ev => String(ev.id) !== String(id));
    localStorage.setItem(`events_${userEmail}`, JSON.stringify(updated));
    localStorage.removeItem(`schedule_${id}_${userEmail}`);
    setShowDeleteModal(false);
    navigate('/dashboard');
  };

  const handleLeave = () => {
    const allCreators = [userEmail, ...(JSON.parse(localStorage.getItem('allUsers') || '[]'))];
    let creator = null;
    let updatedEvent = null;

    for (const c of allCreators) {
      const events = JSON.parse(localStorage.getItem(`events_${c}`) || '[]');
      const match = events.find(ev => String(ev.id) === String(id));
      if (match) {
        creator = c;
        updatedEvent = { ...match };
        updatedEvent.joinedUsers = (updatedEvent.joinedUsers || []).filter(u => u.email !== userEmail);
        const updatedList = events.map(ev => String(ev.id) === String(id) ? updatedEvent : ev);
        localStorage.setItem(`events_${creator}`, JSON.stringify(updatedList));
        break;
      }
    }

    localStorage.removeItem(`schedule_${id}_${userEmail}`);
    navigate('/dashboard');
  };

  const findBestTime = () => {
    const counter = {};
    const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pią', 'Sob', 'Niedz'];
    days.forEach(day => {
      for (let h = 0; h < 24; h++) {
        counter[`${day}-${h}`] = 0;
      }
    });

    let hasAny = false;

    participants.forEach(p => {
      const sched = localStorage.getItem(`schedule_${id}_${p.email}`);
      if (!sched) return;

      const parsed = JSON.parse(sched);
      hasAny = true;

      days.forEach(day => {
        const entry = parsed[day];
        if (!entry) return;

        if (entry.fullFree) {
          for (let h = 0; h < 24; h++) counter[`${day}-${h}`]++;
        } else if (!entry.fullBusy && entry.from && entry.to) {
          const start = parseInt(entry.from.split(':')[0]);
          const end = parseInt(entry.to.split(':')[0]);
          for (let h = start; h < end; h++) counter[`${day}-${h}`]++;
        }
      });
    });

    if (!hasAny) return null;

    const max = Math.max(...Object.values(counter));
    const best = Object.keys(counter).find(k => counter[k] === max);
    if (!best) return null;

    const [day, hour] = best.split('-');
    const range = `${String(hour).padStart(2, '0')}:00–${String(Number(hour) + 1).padStart(2, '0')}:00`;
    return { day, range };
  };

  const bestTime = findBestTime();

  if (!event) {
    return (
      <div style={{ padding: 40, color: '#fff', textAlign: 'center' }}>
        Nie znaleziono wydarzenia.
      </div>
    );
  }

  const declared = participants.filter(p => p.declared);
  const undeclared = participants.filter(p => !p.declared);

  return (
    <div style={{ background: '#222', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#000', padding: '2rem', borderRadius: '8px', width: 400, textAlign: 'center', position: 'relative' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: 18, color: '#fff' }}>[{event.name}]</h2>

        <div style={{ marginBottom: 10, fontWeight: 'bold', color: '#fff' }}>Link do wydarzenia:</div>
        <input
          type="text"
          value={`https://plantogether.app/${event.id}`}
          readOnly
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 6, border: '1px solid #aaa', fontSize: 15, background: '#eee', textAlign: 'center' }}
        />
        <button onClick={handleCopy} style={{ width: '100%', background: '#444', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', marginBottom: 12, fontSize: 16, cursor: 'pointer' }}>
          Kopiuj link
        </button>
        {copyMsg && <div style={{ color: 'green', marginBottom: 10, fontWeight: 'bold' }}>{copyMsg}</div>}

        {event.creator === userEmail ? (
          <button onClick={() => setShowDeleteModal(true)} style={{ width: '100%', background: '#b32323', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', marginBottom: 16, fontSize: 16, cursor: 'pointer' }}>
            USUŃ WYDARZENIE
          </button>
        ) : (
          <button onClick={handleLeave} style={{ width: '100%', background: '#555', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', marginBottom: 16, fontSize: 16, cursor: 'pointer' }}>
            OPUŚĆ WYDARZENIE
          </button>
        )}

        <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: 6 }}>Opis wydarzenia:</div>
        <div style={{ marginBottom: 16, color: '#ccc' }}>{event.description || '(brak)'}</div>

        <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#fff' }}>Uczestnicy ({participants.length}):</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, background: '#444', borderRadius: 6, padding: 10 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#fff' }}>Zadeklarowani:</div>
            {declared.map((p, i) => (
              <div key={i} style={{ fontSize: 14, color: '#ddd' }}>• {p.isMe ? 'Ty' : p.isCreator ? 'Twórca' : p.display} <span style={{ color: '#aaa', fontSize: 12 }}>({p.display})</span></div>
            ))}
          </div>
          <div style={{ flex: 1, background: '#555', borderRadius: 6, padding: 10 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#fff' }}>Niezadeklarowani:</div>
            {undeclared.map((p, i) => (
              <div key={i} style={{ fontSize: 14, color: '#ccc' }}>• {p.isMe ? 'Ty' : p.isCreator ? 'Twórca' : p.display} <span style={{ color: '#aaa', fontSize: 12 }}>({p.display})</span></div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 8, color: '#fff' }}>
          Najlepszy czas na wydarzenie to:<br />
          {bestTime ? (
            <span style={{ fontWeight: 'bold', color: '#9f0' }}>
              {bestTime.day}, {bestTime.range}
            </span>
          ) : (
            <span style={{ color: '#ccc', fontStyle: 'italic' }}>Nikt nie wypełnił jeszcze grafiku</span>
          )}
        </div>

        <button onClick={() => setShowScheduleModal(true)} style={{ width: '100%', background: '#a1a416', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', marginBottom: 12, fontSize: 16, cursor: 'pointer' }}>
          MOJA DOSTĘPNOŚĆ
        </button>
        <button onClick={() => navigate('/dashboard')} style={{ width: '100%', background: '#1f7ba6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', fontSize: 16, cursor: 'pointer' }}>
          POWRÓT
        </button>

        {showDeleteModal && (
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: 8, minWidth: 250, textAlign: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}>
              <p style={{ marginBottom: 20 }}>Na pewno usunąć to wydarzenie?</p>
              <button onClick={confirmDelete} style={{ marginRight: 10, background: '#e36b6b', color: '#222', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Usuń</button>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: '#6bc1e3', color: '#222', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Anuluj</button>
            </div>
          </div>
        )}

        {showScheduleModal && (
          <ScheduleModal
            onSave={updateSchedule}
            onCancel={() => setShowScheduleModal(false)}
            onClear={clearSchedule}
            existingSchedule={userSchedule}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetails;
