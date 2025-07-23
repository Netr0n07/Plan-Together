import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState({ open: false, message: '' });
  const [events, setEvents] = useState([]);
  const userEmail = localStorage.getItem('userEmail');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!userEmail) {
      setEvents([]);
      return;
    }
    const eventsKey = `events_${userEmail}`;
    const stored = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    setEvents(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleHelp = () => {
    navigate('/faq');
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleJoinEvent = () => {
    setShowJoinModal(true);
    setJoinLink('');
    setJoinError('');
  };

  const handleLeaveEvent = (id) => {
    if (!userEmail) return;
    const eventsKey = `events_${userEmail}`;
    const updated = events.filter(ev => ev.id !== id);
    setEvents(updated);
    localStorage.setItem(eventsKey, JSON.stringify(updated));
  };

  const closeModal = () => setModal({ open: false, message: '' });

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setJoinLink('');
    setJoinError('');
  };

  const handleJoinSubmit = () => {
    setJoinError('');
    // Prosta walidacja linku
    const match = joinLink.match(/plantogether\.app\/(\d+)/);
    if (!joinLink || !match) {
      setJoinError('Niepoprawny link do wydarzenia.');
      return;
    }
    const eventId = match[1];
    // Szukamy wydarzenia w bazie twórcy (symulacja: szukamy po wszystkich localStorage)
    let foundEvent = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('events_')) {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const ev = arr.find(e => String(e.id) === eventId);
        if (ev) {
          foundEvent = ev;
          break;
        }
      }
    }
    if (!foundEvent) {
      setJoinError('Nie znaleziono wydarzenia o podanym linku.');
      return;
    }
    if (foundEvent.creator === userEmail) {
      setJoinError('Jesteś twórcą tego wydarzenia.');
      return;
    }
    // Sprawdź, czy już dołączono
    const eventsKey = `events_${userEmail}`;
    const myEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    if (myEvents.some(e => String(e.id) === eventId)) {
      setJoinError('Już dołączyłeś do tego wydarzenia.');
      return;
    }
    // Dodaj wydarzenie do listy użytkownika i zaktualizuj joinedUsers u twórcy
    const userName = localStorage.getItem('userName');
    const userSurname = localStorage.getItem('userSurname');
    // 1. Zaktualizuj joinedUsers u twórcy
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('events_')) {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = arr.findIndex(e => String(e.id) === eventId);
        if (idx !== -1) {
          // Dodaj joinedUsers jeśli nie istnieje
          if (!arr[idx].joinedUsers) arr[idx].joinedUsers = [];
          // Sprawdź, czy już jest na liście
          if (!arr[idx].joinedUsers.some(u => u.email === userEmail)) {
            arr[idx].joinedUsers.push({ email: userEmail, name: userName, surname: userSurname });
            localStorage.setItem(key, JSON.stringify(arr));
          }
        }
      }
    }
    // 2. Dodaj wydarzenie do listy użytkownika (z joinedUsers)
    const updatedEvent = { ...foundEvent };
    if (!updatedEvent.joinedUsers) updatedEvent.joinedUsers = [];
    if (!updatedEvent.joinedUsers.some(u => u.email === userEmail)) {
      updatedEvent.joinedUsers.push({ email: userEmail, name: userName, surname: userSurname });
    }
    localStorage.setItem(eventsKey, JSON.stringify([...myEvents, updatedEvent]));
    setEvents([...myEvents, updatedEvent]);
    setShowJoinModal(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <button onClick={handleCreateEvent} style={styles.createBtn}>+ UTWÓRZ WYDARZENIE</button>
        <button onClick={handleJoinEvent} style={styles.joinBtn}>&gt; DOŁĄCZ DO WYDARZENIA</button>

        <h3 style={styles.heading}>Twoje wydarzenia:</h3>

        <div style={styles.eventBox}>
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ccc' }}>(Brak wydarzeń)</p>
          ) : (
            <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0 }}>
              {events.map(ev => (
                <li key={ev.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{ev.name}</span>
                  <span>
                    <button
                      style={{ background: '#3ad1c6', color: '#222', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 'bold', cursor: 'pointer', marginRight: ev.creator !== userEmail ? 6 : 0 }}
                      onClick={() => navigate(`/event/${ev.id}`)}
                    >
                      Edytuj
                    </button>
                    {ev.creator !== userEmail && (
                      <button style={{ background: '#e36b6b', color: '#222', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleLeaveEvent(ev.id)}>Opuść</button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.bottomButtons}>
          <button onClick={handleLogout} style={styles.iconBtn}>⚙️ Wyloguj się</button>
          <button onClick={handleHelp} style={styles.iconBtnRed}>❓ Pomoc</button>
        </div>
      </div>
      {modal.open && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <p>{modal.message}</p>
            <button style={modalStyles.button} onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
      {showJoinModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#a16be3', padding: '2rem', borderRadius: 16, minWidth: 300, textAlign: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.2)', position: 'relative' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Wklej Link do wydarzenia</div>
            <input
              type="text"
              value={joinLink}
              onChange={e => setJoinLink(e.target.value)}
              style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #aaa', fontSize: 15, background: '#fff', textAlign: 'center' }}
              placeholder="https://plantogether.app/123456"
            />
            {joinError && <div style={{ color: 'red', marginBottom: 10 }}>{joinError}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <button onClick={handleJoinSubmit} style={{ background: '#4be36b', color: '#222', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 'bold', fontSize: 20, cursor: 'pointer' }}>✔️</button>
              <button onClick={closeJoinModal} style={{ background: '#e36b6b', color: '#222', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 'bold', fontSize: 20, cursor: 'pointer' }}>❌</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '6px',
    width: '320px',
    textAlign: 'center'
  },
  createBtn: {
    backgroundColor: '#90ee90',
    padding: '0.5rem',
    width: '100%',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  joinBtn: {
    backgroundColor: '#ee82ee',
    padding: '0.5rem',
    width: '100%',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  heading: {
    textAlign: 'left',
    marginBottom: '0.5rem'
  },
  eventBox: {
    backgroundColor: '#999',
    borderRadius: '4px',
    minHeight: '250px',
    padding: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'left'
  },
  bottomButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem'
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#000',
    cursor: 'pointer'
  },
  iconBtnRed: {
    background: 'none',
    border: 'none',
    color: 'red',
    cursor: 'pointer'
  }
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    minWidth: '250px',
    textAlign: 'center',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
  },
  button: {
    marginTop: '1rem',
    padding: '0.5rem 1.5rem',
    background: '#009dff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Dashboard;
