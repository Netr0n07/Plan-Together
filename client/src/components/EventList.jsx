// Event list component
import React from 'react';
import { useLanguage } from '../locales/LanguageContext';

const EventList = ({ events }) => {
  const { t } = useLanguage();
  
  if (events.length === 0) {
    return <p>{t('noEventsToDisplay')}</p>;
  }

  return (
    <ul>
      {events.map((event) => (
        <li key={event._id} style={{ marginBottom: '1rem' }}>
          <strong>{event.title}</strong> <br />
          {event.date} - {event.location}
        </li>
      ))}
    </ul>
  );
};

export default EventList;
