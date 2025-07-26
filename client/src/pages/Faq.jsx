import React from 'react';
import { useNavigate } from 'react-router-dom';

const Faq = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>POWRÓT</button>
        </div>
        <h2 style={styles.heading}>Jak utworzyć wydarzenie?</h2>
        <ol style={styles.list}>
          <li>Zaloguj się lub utwórz konto jeśli jeszcze go nie posiadasz.</li>
          <li>Kliknij „+ UTWÓRZ WYDARZENIE”.</li>
          <li>Wpisz nazwę i opis, a potem udostępnij link.</li>
        </ol>
        <h2 style={styles.heading}>Jak dołączyć do wydarzenia?</h2>
        <ol style={styles.list}>
          <li>Zaloguj się lub utwórz konto jeśli jeszcze go nie posiadasz.</li>
          <li>Kliknij „&gt; DOŁĄCZ DO WYDARZENIA”.</li>
          <li>Przekopiuj otrzymany link.</li>
        </ol>
        <h2 style={styles.heading}>Jak działa wybór terminu?</h2>
        <p style={styles.text}>Aplikacja analizuje grafiki uczestników i wybiera najlepszy wspólny przedział.</p>
        
        <h2 style={styles.heading}>Jak wypełnić swoją dostępność?</h2>
        <ol style={styles.list}>
          <li>Przejdź do szczegółów wydarzenia.</li>
          <li>Kliknij przycisk „MOJA DOSTĘPNOŚĆ".</li>
          <li>Zaznacz dni, w które jesteś całkowicie wolny lub zajęty.</li>
          <li>Lub podaj konkretne godziny dostępności dla każdego dnia.</li>
          <li>Kliknij „ZAPISZ" aby zapisać swój harmonogram.</li>
        </ol>
        
        <h2 style={styles.heading}>Co oznaczają oznaczenia przy nazwach?</h2>
        <ul style={styles.list}>
          <li><span style={{color: '#FF6B6B', fontWeight: 'bold'}}>(T)</span> - Twórca wydarzenia</li>
          <li><span style={{color: '#FFD700', fontWeight: 'bold'}}>(TY)</span> - Ty (aktualny użytkownik)</li>
        </ul>
        <h2 style={styles.heading}>Czy mogę usunąć wydarzenie?</h2>
        <p style={styles.text}>Tak, o ile jesteś osobą, która utworzyła dane wydarzenie.</p>
        <ol style={styles.list}>
          <li>Przejdź do szczegółów wydarzenia.</li>
          <li>Kliknij przycisk „USUŃ WYDARZENIE" i potwierdź.</li>
        </ol>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#111',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#222',
    padding: '2rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    textAlign: 'left',
    color: '#fff',
  },
  backBtn: {
    marginBottom: '1rem',
    background: '#009dff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '0.5rem 1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  heading: {
    color: '#fff',
    marginTop: '1.2rem',
    marginBottom: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  list: {
    marginLeft: '1.2rem',
    color: '#ccc',
    marginBottom: '0.7rem',
  },
  text: {
    color: '#ccc',
    marginBottom: '0.7rem',
  },
};

export default Faq; 