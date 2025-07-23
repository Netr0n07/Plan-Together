const express = require('express');
const router = express.Router();
const { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent, joinEvent, leaveEvent, kickParticipant } = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllEvents);
router.post('/', authMiddleware, createEvent);
router.get('/:id', authMiddleware, getEventById);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.post('/:id/join', authMiddleware, joinEvent);
router.post('/:id/leave', authMiddleware, leaveEvent);
router.post('/:id/kick', authMiddleware, kickParticipant);
router.post('/:id/availability', authMiddleware, require('../controllers/eventController').setAvailability);
router.post('/admin/clean-participants', require('../controllers/eventController').cleanParticipants);

module.exports = router;
