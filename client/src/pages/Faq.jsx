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
        <h2 style={styles.heading}>Czy mogę usunąć wydarzenie?</h2>
        <p style={styles.text}>Tak, o ile jesteś osobą, która utworzyła dane wydarzenie.</p>
        <ol style={styles.list}>
          <li>Kliknij „EDYTUJ” przy wybranym wydarzeniu.</li>
          <li>Kliknij „USUŃ WYDARZENIE” na środku ekranu i potwierdź.</li>
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
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    textAlign: 'left',
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
    color: '#222',
    marginTop: '1.2rem',
    marginBottom: '0.5rem',
    fontSize: '1.1rem',
  },
  list: {
    marginLeft: '1.2rem',
    color: '#333',
    marginBottom: '0.7rem',
  },
  text: {
    color: '#333',
    marginBottom: '0.7rem',
  },
};

export default Faq; 