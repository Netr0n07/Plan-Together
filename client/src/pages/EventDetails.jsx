import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../locales/LanguageContext';
import ScheduleModal from '../components/ScheduleModal';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const token = sessionStorage.getItem('token');
  const userId = sessionStorage.getItem('userId');

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyMsg, setCopyMsg] = useState('');
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [participantFilter, setParticipantFilter] = useState('');
  const [showRemoveParticipantModal, setShowRemoveParticipantModal] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    fetch(`/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setEvent)
      .catch(err => {
        console.error('Błąd pobierania wydarzenia:', err);
        setError('Nie znaleziono wydarzenia');
      })
      .finally(() => setLoading(false));
  }, [id, token, userId, navigate]);

  const handleDelete = async () => {
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Błąd usuwania wydarzenia:', err);
    }
  };





  const filterParticipants = (participants, filter) => {
    if (!filter.trim()) return participants;
    return participants.filter(p => {
      const fullName = `${p.user?.name || ''} ${p.user?.surname || ''}`.trim().toLowerCase();
      return fullName.includes(filter.toLowerCase());
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://plantogether.app/${id}`);
    setCopyMsg(t('linkCopied'));
    setTimeout(() => setCopyMsg(''), 2000);
  };

  const handleSaveSchedule = async (schedule) => {
    try {
      const response = await fetch(`/api/events/${id}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability: schedule })
      });

      if (!response.ok) {
        throw new Error(t('errorSavingSchedule'));
      }

      // Refresh event data after saving schedule
      const updatedEvent = await fetch(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json());
      
      setEvent(updatedEvent);
      setShowScheduleModal(false);
      console.log('Harmonogram został zapisany pomyślnie');
      console.log('Updated event data:', updatedEvent);
      
      // Also update sessionStorage with the saved schedule
      const userEmail = sessionStorage.getItem('userEmail');
      const savedKey = `schedule_${id}_${userEmail}`;
      sessionStorage.setItem(savedKey, JSON.stringify(schedule));
      console.log('Updated sessionStorage with saved schedule:', savedKey);
      
      // Show internal success notification
      setNotification({ show: true, message: `✓ ${t('scheduleSavedSuccessfully')}`, type: 'success' });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Błąd zapisywania harmonogramu:', error);
      setNotification({ show: true, message: `✗ ${t('errorSavingScheduleTryAgain')}`, type: 'error' });
      
      // Hide notification after 5 seconds for errors
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    }
  };

  const handleRemoveParticipant = async () => {
    try {
      const response = await fetch(`/api/events/${id}/kick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantId: participantToRemove._id })
      });

      if (!response.ok) {
        throw new Error(t('errorRemovingParticipant'));
      }

      // Refresh event data after removing participant
      const updatedEvent = await fetch(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json());
      
      setEvent(updatedEvent);
      setShowRemoveParticipantModal(false);
      setParticipantToRemove(null);
      
      // Show success notification
      setNotification({ show: true, message: `✓ ${t('participantRemovedSuccess')}`, type: 'success' });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Błąd usuwania uczestnika:', error);
      setNotification({ show: true, message: `✗ ${t('errorRemovingParticipant')}`, type: 'error' });
      
      // Hide notification after 5 seconds for errors
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    }
  };

  if (loading) return <div style={styles.center}>Ładowanie...</div>;
  if (!event || error) return <div style={styles.center}>Nie znaleziono wydarzenia.</div>;

  console.log('Event data:', event);
  console.log('Event participants:', event.participants);
  console.log('Current userId:', userId);

  const isCreator = event.creator?._id === userId || event.creator === userId;
  const participants = event.participants || [];
  const declared = participants.filter(p => p.availability && Object.keys(p.availability).length > 0);
  const undeclared = participants.filter(p => !p.availability || Object.keys(p.availability).length === 0);
  const participantIds = participants.map(p => p.user?._id);
  const isParticipant = participantIds.includes(userId);

  return (
    <div style={styles.wrapper}>
              <div style={styles.header}>{t('eventInformation')}</div>
      <div style={styles.box}>
        <h2 style={styles.title}>{event.title}</h2>

        <div style={styles.label}>{t('eventLink')}</div>
        <input
          type="text"
          value={`https://plantogether.app/${id}`}
          readOnly
          style={styles.input}
        />
                  <button onClick={handleCopy} style={styles.copyButton}>{t('copyLink')}</button>

        {isCreator && (
          <button onClick={() => setShowConfirmDelete(true)} style={styles.deleteBtn}>
            {t('deleteEvent')}
          </button>
        )}



        <div style={styles.label}>{t('eventDescription')}</div>
        <div style={styles.description}>{event.description || t('noDescription')}</div>

        <div style={styles.label}>{t('participants')} ({participants.length}):</div>
        <div style={styles.participantsContainer}>
          {participants.length === 0 ? (
            <div style={styles.noParticipants}>{t('noParticipants')}</div>
          ) : (
            <>
              <div style={styles.filterContainer}>
                <input
                  type="text"
                  placeholder={t('searchParticipants')}
                  value={participantFilter}
                  onChange={(e) => setParticipantFilter(e.target.value)}
                  style={styles.filterInput}
                />
              </div>
              <div style={styles.columns}>
                <div style={styles.column}>
                  <strong>{t('declared')}</strong>
                  {declared.length === 0 && <div style={styles.noParticipants}>{t('no')}</div>}
                  <div style={{
                    ...styles.participantsList,
                    maxHeight: declared.length > 3 ? '200px' : 'auto',
                    overflowY: declared.length > 3 ? 'auto' : 'visible',
                    paddingRight: declared.length > 3 ? '5px' : '0'
                  }}>
                    {filterParticipants(declared, participantFilter).map((p, i) => (
                      <div key={i} style={styles.person}>
                        • {formatName(p.user, userId, event.creator, t, language)}
                        {isCreator && p.user._id !== userId && (
                          <button
                            onClick={() => {
                              setParticipantToRemove(p.user);
                              setShowRemoveParticipantModal(true);
                            }}
                            style={styles.removeButton}
                          >
                            {t('removeParticipant')}
                          </button>
                        )}
                      </div>
                    ))}
                    {filterParticipants(declared, participantFilter).length === 0 && declared.length > 0 && (
                      <div style={styles.noParticipants}>{t('noParticipantsFound')}</div>
                    )}
                  </div>
                </div>
                <div style={styles.column}>
                  <strong>{t('undeclared')}</strong>
                  {undeclared.length === 0 && <div style={styles.noParticipants}>{t('no')}</div>}
                  <div style={{
                    ...styles.participantsList,
                    maxHeight: undeclared.length > 3 ? '200px' : 'auto',
                    overflowY: undeclared.length > 3 ? 'auto' : 'visible',
                    paddingRight: undeclared.length > 3 ? '5px' : '0'
                  }}>
                    {filterParticipants(undeclared, participantFilter).map((p, i) => (
                      <div key={i} style={styles.person}>
                        • {formatName(p.user, userId, event.creator, t, language)}
                        {isCreator && p.user._id !== userId && (
                          <button
                            onClick={() => {
                              setParticipantToRemove(p.user);
                              setShowRemoveParticipantModal(true);
                            }}
                            style={styles.removeButton}
                          >
                            {t('removeParticipant')}
                          </button>
                        )}
                      </div>
                    ))}
                    {filterParticipants(undeclared, participantFilter).length === 0 && undeclared.length > 0 && (
                      <div style={styles.noParticipants}>{t('noParticipantsFound')}</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={styles.label}>{t('bestTimeForEvent')}</div>
        <div style={styles.bestTime}>
          {calculateBestTime(participants, t)}
        </div>

        {(isCreator || isParticipant) && (
          <button onClick={() => {
            console.log('Opening schedule modal with event data:', event);
            setShowScheduleModal(true);
          }} style={styles.availabilityBtn}>
            {t('myAvailability')}
          </button>
        )}

        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          {t('back')}
        </button>
      </div>

      {showConfirmDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p>{t('areYouSureDeleteEvent')}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleDelete} style={styles.modalDeleteBtn}>{t('delete')}</button>
              <button onClick={() => setShowConfirmDelete(false)} style={styles.modalCancelBtn}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <ScheduleModal
          key={`schedule-modal-${event?._id}-${JSON.stringify(event?.participants?.map(p => p.availability))}`} // Force re-render when availability data changes
          onSave={handleSaveSchedule}
          onCancel={() => setShowScheduleModal(false)}
          onClear={() => {
            // Schedule clearing logic
            setShowScheduleModal(false);
          }}
          existingSchedule={event}
        />
      )}

      {showRemoveParticipantModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p>{t('confirmRemoveParticipant').replace('{name}', `${participantToRemove?.name} ${participantToRemove?.surname || ''}`.trim())}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleRemoveParticipant} style={styles.modalDeleteBtn}>{t('removeParticipant')}</button>
              <button onClick={() => {
                setShowRemoveParticipantModal(false);
                setParticipantToRemove(null);
              }} style={styles.modalCancelBtn}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Wewnętrzne powiadomienie */}
      {notification.show && (
        <div style={styles.notification}>
          <div style={{
            ...styles.notificationContent,
            background: notification.type === 'success' ? '#4be36b' : '#e36b6b',
            color: '#222'
          }}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Powiadomienie o skopiowaniu linka */}
      {copyMsg && (
        <div style={styles.copyNotification}>
          {copyMsg}
        </div>
      )}
    </div>
  );
};

const formatName = (user, currentUserId, creator, t, language) => {
  if (!user) return t('missing');
  const fullName = `${user.name} ${user.surname || ''}`.trim();
  
  // Check if this is the event creator
  const isCreator = creator?._id === user._id || creator === user._id;
  // Check if this is the current user
  const isCurrentUser = user._id === currentUserId;
  let creatorMark = language === 'pl' ? 'T' : 'C';
  let youMark = language === 'pl' ? 'TY' : 'YOU';
  
  return (
    <span>
      {fullName}
      {isCreator && <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}> ({creatorMark})</span>}
      {isCurrentUser && <span style={{ color: '#FFD700', fontWeight: 'bold' }}> ({youMark})</span>}
    </span>
  );
};

// Function to calculate the best time for the event
const calculateBestTime = (participants, t) => {
  const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pią', 'Sob', 'Niedz'];
  const dayNames = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];
  
  console.log('calculateBestTime - participants:', JSON.stringify(participants, null, 2));
  
  // Find all declared participants
  const declaredParticipants = participants.filter(p => p.availability && Object.keys(p.availability).length > 0);
  console.log('calculateBestTime - declaredParticipants:', JSON.stringify(declaredParticipants, null, 2));
  
  if (declaredParticipants.length === 0) {
    return t('noDeclaredParticipants');
  }
  
  // For each day check availability and find common time slots
  const dayResults = days.map((day, dayIndex) => {
    console.log(`\n--- Sprawdzanie dnia: ${day} ---`);
    
    const availableParticipants = declaredParticipants.filter(participant => {
      const dayAvailability = participant.availability[0]?.[day];
      console.log(`Uczestnik ${participant.user?.name || 'Unknown'}:`, dayAvailability);
      return dayAvailability && (dayAvailability.fullFree || (dayAvailability.from && dayAvailability.to));
    });
    
    console.log(`Dostępni uczestnicy dla ${day}:`, availableParticipants.length);
    
    if (availableParticipants.length === 0) {
      return {
        day: dayNames[dayIndex],
        score: 0,
        availableCount: 0,
        totalCount: declaredParticipants.length,
        commonTimeRange: null
      };
    }
    
    // Find common time range for this day
    const commonTimeRange = findCommonTimeRangeForDay(availableParticipants, day);
    
    return {
      day: dayNames[dayIndex],
      score: availableParticipants.length / declaredParticipants.length,
      availableCount: availableParticipants.length,
      totalCount: declaredParticipants.length,
      commonTimeRange
    };
  });
  
  // Find day with highest score and common time
  const bestDay = dayResults.reduce((best, current) => {
    if (current.score > best.score && current.commonTimeRange) {
      return current;
    }
    return best;
  });
  
  if (!bestDay.commonTimeRange) {
    return t('noCommonTime');
  }
  
  return `${bestDay.day}, ${bestDay.commonTimeRange} (${bestDay.availableCount}/${bestDay.totalCount} ${t('participantsCount')})`;
};

// Function to find common time range for a specific day
const findCommonTimeRangeForDay = (participants, day) => {
  console.log(`findCommonTimeRangeForDay - day: ${day}, participants:`, participants);
  
  const timeRanges = participants.map(participant => {
    const dayAvailability = participant.availability[0]?.[day];
    console.log(`findCommonTimeRangeForDay - participant availability for ${day}:`, dayAvailability);
    
    if (dayAvailability?.fullFree) {
      return { start: '00:00', end: '23:59', type: 'full' };
    } else if (dayAvailability?.from && dayAvailability?.to) {
      return { start: dayAvailability.from, end: dayAvailability.to, type: 'range' };
    }
    return null;
  }).filter(range => range !== null);
  
  console.log(`findCommonTimeRangeForDay - timeRanges for ${day}:`, timeRanges);
  
  if (timeRanges.length === 0) {
    return null;
  }
  
  // If someone has "all day", common time is intersection with other ranges
  const hasFullDay = timeRanges.some(range => range.type === 'full');
  
  if (hasFullDay) {
    // Find narrowest common range from remaining participants
    const rangeParticipants = timeRanges.filter(range => range.type === 'range');
    if (rangeParticipants.length === 0) {
      return 'cały dzień';
    }
    
    const commonRange = findIntersectionOfRanges(rangeParticipants);
    return commonRange ? `${commonRange.start} - ${commonRange.end}` : 'różne godziny';
  } else {
    // Everyone has specific ranges - find intersection
    const commonRange = findIntersectionOfRanges(timeRanges);
    return commonRange ? `${commonRange.start} - ${commonRange.end}` : 'różne godziny';
  }
};

// Function to find intersection of time ranges
const findIntersectionOfRanges = (ranges) => {
  if (ranges.length === 0) return null;
  if (ranges.length === 1) return ranges[0];
  
  // Find latest start and earliest end
  let latestStart = ranges[0].start;
  let earliestEnd = ranges[0].end;
  
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].start > latestStart) {
      latestStart = ranges[i].start;
    }
    if (ranges[i].end < earliestEnd) {
      earliestEnd = ranges[i].end;
    }
  }
  
  // Check if intersection exists
  if (latestStart >= earliestEnd) {
    return null; // No intersection
  }
  
  return { start: latestStart, end: earliestEnd };
};

const styles = {
  wrapper: {
    background: '#111',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    color: 'white'
  },
  header: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  box: {
    background: '#222',
    padding: '2rem',
    borderRadius: '16px',
    width: '400px',
    textAlign: 'center',
    maxWidth: '100%'
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    marginTop: '0'
  },
  label: {
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    marginBottom: '8px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #444',
    fontSize: '14px',
    background: '#333',
    color: '#fff',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  copyButton: {
    background: 'none',
    border: 'none',
    color: '#3ad1c6',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '16px',
    textDecoration: 'underline'
  },
  copied: {
    color: '#4be36b',
    marginBottom: '16px',
    fontSize: '14px'
  },
  copyNotification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#4be36b',
    color: '#222',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    animation: 'slideInRight 0.3s ease-out'
  },
  deleteBtn: {
    width: '100%',
    background: '#e36b6b',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  description: {
    marginBottom: '20px',
    color: '#ccc',
    textAlign: 'center',
    padding: '12px',
    background: '#333',
    borderRadius: '6px'
  },
  participantsContainer: {
    marginBottom: '20px'
  },
  noParticipants: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  },
  columns: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  column: {
    flex: 1,
    background: '#333',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center'
  },
  person: {
    fontSize: '14px',
    color: '#ddd',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bestTime: {
    color: '#ccc',
    marginBottom: '20px',
    padding: '12px',
    background: '#333',
    borderRadius: '6px',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  availabilityBtn: {
    width: '100%',
    background: '#4be36b',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  backBtn: {
    width: '100%',
    background: '#a16be3',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  center: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: '4rem',
    fontSize: '18px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  modalBox: {
    background: '#222',
    padding: '2rem',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#fff',
    maxWidth: '400px'
  },
  modalDeleteBtn: {
    flex: 1,
    background: '#e36b6b',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  modalCancelBtn: {
    flex: 1,
    background: '#a16be3',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1001,
    animation: 'slideIn 0.3s ease-out'
  },
  notificationContent: {
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    minWidth: '300px',
    textAlign: 'center'
  },
  filterContainer: {
    marginBottom: '10px',
    padding: '0 10px'
  },
  filterInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  participantsList: {
    maxHeight: '200px',
    overflowY: 'auto',
    paddingRight: '5px'
  },
  removeButton: {
    background: '#e36b6b',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '11px',
    cursor: 'pointer'
  }
};

export default EventDetails;
