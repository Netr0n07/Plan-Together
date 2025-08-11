import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../locales/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [modal, setModal] = useState({ open: false, message: '' });
  const [events, setEvents] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveEventId, setLeaveEventId] = useState(null);
  const [leaveEventTitle, setLeaveEventTitle] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [joinError, setJoinError] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
    
        const text = await res.text();
        console.log('ODPOWIEDŹ BACKENDU:', text);
    
        if (!res.ok) {
          throw new Error(text || t('errorFetchingEvents'));
        }
    
        const data = JSON.parse(text);
        setEvents(data);
      } catch (err) {
        console.error('Błąd pobierania wydarzeń:', err.message);
        setEvents([]);
      }
    };    
  
    fetchEvents();
  }, [token, navigate, t]);  

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleHelp = () => navigate('/faq');
  const handleCreateEvent = () => navigate('/create-event');

  const handleJoinEvent = () => {
    setShowJoinModal(true);
    setJoinLink('');
    setJoinError('');
  };

  const showLeaveConfirmModal = (id, title) => {
    setLeaveEventId(id);
    setLeaveEventTitle(title);
    setShowLeaveConfirm(true);
  };

  const handleLeaveEvent = async () => {
    try {
      await fetch(`/api/events/${leaveEventId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove schedule from sessionStorage
      const userEmail = sessionStorage.getItem('userEmail');
      const savedKey = `schedule_${leaveEventId}_${userEmail}`;
      sessionStorage.removeItem(savedKey);
      
      setEvents(prev => prev.filter(ev => ev._id !== leaveEventId));
      setShowLeaveConfirm(false);
      
      // Show success notification
      setModal({ open: true, message: `✓ ${t('eventLeft', { title: leaveEventTitle })}` });
      
    } catch (err) {
      console.error('Błąd opuszczania wydarzenia:', err);
      setModal({ open: true, message: `✗ ${t('errorLeavingEvent')}` });
    }
  };

  const closeModal = () => setModal({ open: false, message: '' });
  const closeJoinModal = () => {
    setShowJoinModal(false);
    setJoinLink('');
    setJoinError('');
  };

  const filterEvents = (events, filter) => {
    if (!filter.trim()) return events;
    return events.filter(event => {
      const title = (event.title || '').toLowerCase();
      const description = (event.description || '').toLowerCase();
      const searchTerm = filter.toLowerCase();
      return title.includes(searchTerm) || description.includes(searchTerm);
    });
  };

  const translateBackendMessage = (message) => {
    const messageMap = {
      'Jesteś twórcą wydarzenia': t('youAreEventCreator'),
      'Już jesteś uczestnikiem tego wydarzenia': t('alreadyParticipant'),
      'Nie znaleziono wydarzenia': t('eventNotFound'),
      'Twórca nie może opuścić własnego wydarzenia': t('creatorCannotLeave'),
      'Nie jesteś uczestnikiem tego wydarzenia': t('notParticipant'),
      'Opuściłeś wydarzenie': t('leftEvent'),
      'Tylko twórca wydarzenia może usuwać uczestników': t('onlyCreatorCanRemove'),
      'Ten użytkownik nie jest uczestnikiem wydarzenia': t('userNotParticipant'),
      'Uczestnik został usunięty': t('participantRemoved'),
      'Dostępność zapisana': t('availabilitySaved'),
      'Błąd dołączania do wydarzenia': t('errorJoiningEvent'),
      'Błąd opuszczania wydarzenia': t('errorLeavingEvent'),
      'Błąd usuwania uczestnika': t('errorRemovingParticipant'),
      'Błąd zapisu dostępności': t('errorSavingAvailability')
    };
    return messageMap[message] || message;
  };

  const handleJoinSubmit = async () => {
    setJoinError('');
    const match = joinLink.match(/plantogether\.app\/(\w+)/);
    if (!joinLink || !match) {
      setJoinError(t('incorrectEventLink'));
      return;
    }
    const eventId = match[1];

    try {
      const res = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('errorJoiningEvent'));

      setEvents(prev => [...prev, data.event]);
      setShowJoinModal(false);
    } catch (err) {
      console.error('Błąd dołączania do wydarzenia:', err);
      setJoinError(translateBackendMessage(err.message) || t('serverError'));
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <button onClick={handleCreateEvent} style={styles.createBtn}>+ {t('createEvent')}</button>
        <button onClick={handleJoinEvent} style={styles.joinBtn}>&gt; {t('joinEvent')}</button>

        <div style={styles.eventsHeader}>
          <h3 style={styles.heading}>{t('yourEvents')}</h3>
          {events.length > 0 && (
            <input
              type="text"
              placeholder={t('searchEvents')}
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={styles.filterInput}
            />
          )}
        </div>

        <div style={styles.eventBox}>
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ccc' }}>{t('noEvents')}</p>
          ) : (
            <>
              <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0 }}>
                {filterEvents(events, eventFilter).map(ev => (
                  <li key={ev._id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{ev.title}</span>
                    <span>
                      <button
                        style={{ background: '#3ad1c6', color: '#222', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 'bold', cursor: 'pointer', marginRight: ev.creator !== getMyId() ? 6 : 0 }}
                        onClick={() => navigate(`/event/${ev._id}`)}
                      >
                        {t('edit')}
                      </button>
                      {ev.creator !== getMyId() && (
                        <button
                          style={{ background: '#e36b6b', color: '#222', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => showLeaveConfirmModal(ev._id, ev.title)}
                        >
                          {t('leave')}
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {filterEvents(events, eventFilter).length === 0 && events.length > 0 && (
                <p style={{ textAlign: 'center', color: '#ccc', fontStyle: 'italic' }}>{t('noEventsFound')}</p>
              )}
            </>
          )}
        </div>

        <div style={styles.bottomButtons}>
          <button onClick={handleEditProfile} style={styles.iconBtn}>⚙️ {t('editProfile')}</button>
          <button onClick={handleHelp} style={styles.iconBtnRed}>❓ {t('help')}</button>
        </div>
        
        <LanguageSwitcher position="bottom-center" />
      </div>

      {modal.open && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <p>{modal.message}</p>
            <button style={modalStyles.button} onClick={closeModal}>{t('ok')}</button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{t('pasteEventLink')}</div>
            <input
              type="text"
              value={joinLink}
              onChange={e => setJoinLink(e.target.value)}
              style={modalStyles.input}
              placeholder={t('eventLinkPlaceholder')}
            />
            {joinError && <div style={modalStyles.error}>{joinError}</div>}
            <div style={modalStyles.buttonsRow}>
                              <button onClick={handleJoinSubmit} style={modalStyles.confirmBtn}>✓</button>
              <button onClick={closeJoinModal} style={modalStyles.cancelBtn}>✗</button>
            </div>
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>
              {t('confirmLeaveEvent', { title: leaveEventTitle })}
            </div>
            <div style={modalStyles.buttonsRow}>
              <button onClick={handleLeaveEvent} style={modalStyles.confirmBtn}>{t('yes')}</button>
              <button onClick={() => setShowLeaveConfirm(false)} style={modalStyles.cancelBtn}>{t('noButton')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getMyId = () => sessionStorage.getItem('userId');

  // Styles at the end
const styles = {
  wrapper: { minHeight: '100vh', background: '#111', color: 'white', padding: '2rem' },
  container: { maxWidth: 700, margin: '0 auto', background: '#222', padding: '2rem', borderRadius: 16 },
  createBtn: { background: '#4be36b', color: '#222', padding: '1rem 2rem', fontSize: 18, border: 'none', borderRadius: 10, fontWeight: 'bold', marginBottom: 10, cursor: 'pointer', display: 'block', width: '100%' },
  joinBtn: { background: '#a16be3', color: '#222', padding: '1rem 2rem', fontSize: 18, border: 'none', borderRadius: 10, fontWeight: 'bold', marginBottom: 20, cursor: 'pointer', display: 'block', width: '100%' },
  heading: { fontSize: 22, marginBottom: 10 },
  eventBox: { background: '#333', padding: 20, borderRadius: 10, minHeight: 100, maxHeight: 400, overflowY: 'auto' },
  bottomButtons: { display: 'flex', justifyContent: 'space-between', marginTop: 20 },
  iconBtn: { background: '#eee', color: '#111', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer' },
  iconBtnRed: { background: '#e36b6b', color: '#111', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer' },
  filterInput: {
    width: '200px',
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #444',
    fontSize: 14,
    background: '#333',
    color: '#fff',
  },
  eventsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: '#a16be3', padding: '2rem', borderRadius: 16, minWidth: 300,
    textAlign: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.2)', position: 'relative'
  },
  input: {
    width: '100%', marginBottom: 10, padding: 8, borderRadius: 6,
    border: '1px solid #aaa', fontSize: 15, background: '#fff', textAlign: 'center'
  },
  error: { color: 'red', marginBottom: 10 },
  buttonsRow: { display: 'flex', justifyContent: 'space-between', marginTop: 10 },
  confirmBtn: {
    background: '#4be36b', color: '#222', border: 'none', borderRadius: 6,
    padding: '0.5rem 1.5rem', fontWeight: 'bold', fontSize: 20, cursor: 'pointer'
  },
  cancelBtn: {
    background: '#e36b6b', color: '#222', border: 'none', borderRadius: 6,
    padding: '0.5rem 1.5rem', fontWeight: 'bold', fontSize: 20, cursor: 'pointer'
  },
  button: {
    background: '#fff', color: '#222', border: 'none', borderRadius: 6,
    padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer'
  }
};

export default Dashboard;
