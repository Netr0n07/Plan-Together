const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUser, getUserProfile, updateUserProfile, changePassword } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getMe);
router.put('/update', authMiddleware, updateUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
