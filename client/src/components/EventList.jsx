// Event list component
import React from 'react';

const EventList = ({ events }) => {
  if (events.length === 0) {
    return <p>Brak wydarzeń do wyświetlenia.</p>;
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
