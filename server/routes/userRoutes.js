const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getMe);
router.put('/update', authMiddleware, updateUser);

module.exports = router;
