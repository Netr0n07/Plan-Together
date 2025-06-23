const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  console.log('authMiddleware fired');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Brak lub niepoprawny nagłówek autoryzacji:', authHeader);
    return res.status(401).json({ message: 'Brak tokenu uwierzytelniającego' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token OK. Dane użytkownika:', decoded);
    next();
  } catch (err) {
    console.log('Błąd tokenu:', err.message);
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

module.exports = authMiddleware;
