import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert('Brak informacji o użytkowniku. Zaloguj się ponownie.');
      navigate('/login');
      return;
    }
    const userName = localStorage.getItem('userName');
    const userSurname = localStorage.getItem('userSurname');
    const eventsKey = `events_${userEmail}`;
    const events = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    const newEvent = { id: Date.now(), name: form.name, description: form.description, creator: userEmail, creatorName: userName, creatorSurname: userSurname };
    localStorage.setItem(eventsKey, JSON.stringify([...events, newEvent]));
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ background: '#222', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '2rem', fontWeight: 'bold', textAlign: 'center' }}>Nowe wydarzenie</h2>
        <label style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>Nazwa wydarzenia:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 20, padding: 8, borderRadius: 6, border: '1px solid #aaa', fontSize: 16, background: '#eee' }}
          required
        />
        <label style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>Opis:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={7}
          style={{ width: '100%', marginBottom: 24, padding: 8, borderRadius: 6, border: '1px solid #aaa', fontSize: 16, background: '#999', resize: 'none' }}
          required
        />
        <button type="submit" style={{ width: '100%', background: '#6be39b', color: '#222', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', marginBottom: 12, fontSize: 16, cursor: 'pointer' }}>
          STWÓRZ WYDARZENIE
        </button>
        <button type="button" onClick={handleCancel} style={{ width: '100%', background: '#e36b6b', color: '#222', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.5rem', fontSize: 16, cursor: 'pointer' }}>
          ANULUJ
        </button>
      </form>
    </div>
  );
};

export default CreateEvent; 