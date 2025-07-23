const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Błąd pobierania użytkownika' });
  }
};

const registerUser = async (req, res) => {
  const { name, surname, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Użytkownik już istnieje' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, surname, email, password: hashedPassword });
  await user.save();

  res.status(201).json({ message: 'Rejestracja zakończona' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: 'Nieprawidłowe hasło' });

    const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
  );

    res.status(200).json({ token, message: 'Zalogowano pomyślnie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd logowania' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, surname, email, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    // Sprawdź czy nowy email nie jest już używany przez innego użytkownika
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Ten email jest już używany' });
      }
      user.email = email;
    }

    // Aktualizuj podstawowe dane
    if (name) user.name = name;
    if (surname) user.surname = surname;

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Nieprawidłowe obecne hasło' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ message: 'Profil zaktualizowany pomyślnie' });
  } catch (err) {
    console.error('Błąd aktualizacji profilu:', err);
    res.status(500).json({ message: 'Błąd aktualizacji profilu' });
  }
};

module.exports = {
  registerUser,
  getMe,
  loginUser,
  updateUser
};