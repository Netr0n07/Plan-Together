const express = require('express');
const router = express.Router();
const { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent, joinEvent, leaveEvent, kickParticipant, fixCreatorParticipants, setAvailability, cleanParticipants } = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllEvents);
router.post('/', authMiddleware, createEvent);
router.get('/:id', authMiddleware, getEventById);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.post('/:id/join', authMiddleware, joinEvent);
router.post('/:id/leave', authMiddleware, leaveEvent);
router.post('/:id/kick', authMiddleware, kickParticipant);
router.post('/:id/availability', authMiddleware, setAvailability);
router.post('/admin/clean-participants', cleanParticipants);
router.post('/admin/fix-creator-participants', fixCreatorParticipants);

module.exports = router;
