import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../locales/LanguageContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', surname: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const token = sessionStorage.getItem('token');
  const userId = sessionStorage.getItem('userId');

  // Load user data on component mount
  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setForm({ name: userData.name || '', surname: userData.surname || '' });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setNotification({ show: true, message: t('errorLoadingProfile'), type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, userId, navigate, t]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear validation error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    // Clear password validation error when user starts typing
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.name.trim()) {
      errors.name = t('pleaseEnterName');
    }
    
    if (!form.surname.trim()) {
      errors.surname = t('pleaseEnterSurname');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = t('pleaseEnterCurrentPassword');
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = t('pleaseEnterNewPassword');
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = t('passwordTooShort');
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = t('pleaseConfirmPassword');
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('passwordsDoNotMatch');
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name.trim(),
          surname: form.surname.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setNotification({ show: true, message: t('profileUpdatedSuccessfully'), type: 'success' });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({ show: true, message: t('errorUpdatingProfile'), type: 'error' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setNotification({ show: true, message: t('passwordChangedSuccessfully'), type: 'success' });
      
      // Clear password form
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      console.error('Error changing password:', error);
      setNotification({ show: true, message: error.message || t('errorChangingPassword'), type: 'error' });
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  if (loading) {
    return <div style={styles.center}>Ładowanie...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>{t('editProfile')}</h2>
        
        {/* Profile Information Form */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('personalInformation')}</h3>
          <form onSubmit={handleSaveChanges}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('name')}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={styles.input}
                placeholder={t('enterName')}
              />
              {validationErrors.name && (
                <div style={styles.error}>{validationErrors.name}</div>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('surname')}</label>
              <input
                type="text"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                style={styles.input}
                placeholder={t('enterSurname')}
              />
              {validationErrors.surname && (
                <div style={styles.error}>{validationErrors.surname}</div>
              )}
            </div>
            
            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.saveBtn}>
                {t('saveChanges')}
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('changePassword')}</h3>
          <form onSubmit={handleChangePassword}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('currentPassword')}</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder={t('enterCurrentPassword')}
              />
              {passwordErrors.currentPassword && (
                <div style={styles.error}>{passwordErrors.currentPassword}</div>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('newPassword')}</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder={t('enterNewPassword')}
              />
              {passwordErrors.newPassword && (
                <div style={styles.error}>{passwordErrors.newPassword}</div>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('confirmNewPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder={t('confirmNewPassword')}
              />
              {passwordErrors.confirmPassword && (
                <div style={styles.error}>{passwordErrors.confirmPassword}</div>
              )}
            </div>
            
            <button type="submit" style={styles.changePasswordBtn}>
              {t('changePassword')}
            </button>
          </form>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogoutClick} style={styles.logoutBtn}>
          {t('logout')}
        </button>
      </div>

      {/* Notification */}
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p>{t('confirmLogout')}</p>
            <div style={styles.modalButtonGroup}>
              <button onClick={handleLogout} style={styles.modalLogoutBtn}>
                {t('logout')}
              </button>
              <button onClick={() => setShowLogoutConfirm(false)} style={styles.modalCancelBtn}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    background: '#111',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    color: 'white'
  },
  container: {
    background: '#222',
    padding: '2rem',
    borderRadius: '16px',
    width: '400px',
    maxWidth: '100%'
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: '#333',
    borderRadius: '12px'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #444',
    fontSize: '14px',
    background: '#444',
    color: '#fff',
    boxSizing: 'border-box'
  },
  error: {
    color: '#e36b6b',
    fontSize: '12px',
    marginTop: '4px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '1rem'
  },
  saveBtn: {
    flex: 1,
    background: '#4be36b',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  cancelBtn: {
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
       changePasswordBtn: {
    width: '100%',
    background: '#3ad1c6',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  logoutBtn: {
    width: '100%',
    background: '#e36b6b',
    color: '#222',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  center: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: '4rem',
    fontSize: '18px'
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
   modalOverlay: {
     position: 'fixed',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
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
   modalButtonGroup: {
     display: 'flex',
     gap: '10px',
     marginTop: '20px'
   },
   modalLogoutBtn: {
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
   }
};

export default EditProfile;
