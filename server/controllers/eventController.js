const Event = require('../models/Event');
const mongoose = require('mongoose');

// GET - get events for logged in user only
exports.getAllEvents = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const events = await Event.find({
      $or: [
        { creator: userObjectId },
        { 'participants.user': userObjectId }
      ]
    });
    res.json(events);
  } catch (err) {
    console.error('Błąd pobierania wydarzeń:', err);
    res.status(500).json({ message: 'Błąd pobierania wydarzeń', error: err.message });
  }
  console.log('[getAllEvents] req.user:', req.user);
};

// POST - create new event
exports.createEvent = async (req, res) => {
  console.log("createEvent -> req.user:", req.user);
  console.log("createEvent -> req.body:", req.body);

  try {
    const { title, description } = req.body;

    const newEvent = new Event({
      title,
      description,
      creator: req.user.userId,
      participants: [{
        user: req.user.userId,
        availability: []
      }]
    });

    await newEvent.save();
    
    // Get event with populated user data
    const populatedEvent = await Event.findById(newEvent._id)
      .populate('creator', '_id')
      .populate('participants.user', 'name surname email');
    
    res.status(201).json({ message: 'Wydarzenie utworzone', event: populatedEvent });
  } catch (err) {
    console.error('Błąd tworzenia wydarzenia:', err);
    res.status(500).json({ message: 'Błąd tworzenia wydarzenia' });
  }
};

// GET - get single event details
exports.getEventById = async (req, res) => {
  console.log('getEventById wywołane z id:', req.params.id);
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', '_id') // Added: ensures isCreator works correctly
      .populate('participants.user', 'name surname email');

    if (!event) {
      console.log('Nie znaleziono wydarzenia');
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    console.log('Znaleziono wydarzenie:', event);
    res.json(event);
  } catch (err) {
    console.error('Błąd pobierania wydarzenia:', err);
    res.status(500).json({ message: 'Błąd pobierania wydarzenia' });
  }
};

// PUT - update event
exports.updateEvent = async (req, res) => {
  try {
    const { title, description } = req.body;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('[updateEvent] Nie znaleziono wydarzenia:', eventId);
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }

    if (event.creator.toString() !== req.user.userId) {
      console.log('[updateEvent] Brak uprawnień:', {
        eventCreator: event.creator.toString(),
        userId: req.user.userId
      });
      return res.status(403).json({ message: 'Brak uprawnień do edycji tego wydarzenia' });
    }

    if (title) event.title = title;
    if (description) event.description = description;

    await event.save();
    const populated = await Event.findById(eventId).populate('participants.user', 'name surname email');
    console.log('[updateEvent] Wydarzenie zaktualizowane:', eventId);
    res.json({ message: 'Wydarzenie zaktualizowane', event: populated });
  } catch (err) {
    console.error('Błąd aktualizacji wydarzenia:', err);
    res.status(500).json({ message: 'Błąd aktualizacji wydarzenia' });
  }
};

// DELETE - delete event
exports.deleteEvent = async (req, res) => {
  console.log('[deleteEvent] Próba usunięcia wydarzenia:', req.params.id, 'przez użytkownika:', req.user.userId);
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('[deleteEvent] Nie znaleziono wydarzenia:', eventId);
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    if (event.creator.toString() !== req.user.userId) {
      console.log('[deleteEvent] Brak uprawnień:', {
        eventCreator: event.creator.toString(),
        userId: req.user.userId
      });
      return res.status(403).json({ message: 'Brak uprawnień do usunięcia tego wydarzenia' });
    }
    await event.deleteOne();
    console.log('[deleteEvent] Wydarzenie usunięte:', eventId);
    res.json({ message: 'Wydarzenie usunięte' });
  } catch (err) {
    console.error('Błąd usuwania wydarzenia:', err);
    res.status(500).json({ message: 'Błąd usuwania wydarzenia' });
  }
};

// POST - join event
exports.joinEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    const idx = event.participants.findIndex(p => p.user && p.user.toString() === userId);
    if (event.creator.toString() === userId) {
      return res.status(400).json({ message: 'Jesteś twórcą wydarzenia' });
    }
    if (idx !== -1) {
      return res.status(400).json({ message: 'Już jesteś uczestnikiem tego wydarzenia' });
    }
    event.participants.push({ user: userId, availability: [] });
    await event.save();
    res.json({ message: 'Dołączono do wydarzenia', event });
  } catch (err) {
    console.error('Błąd dołączania do wydarzenia:', err);
    res.status(500).json({ message: 'Błąd dołączania do wydarzenia' });
  }
};

// POST - leave event
exports.leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    if (event.creator.toString() === userId) {
      return res.status(400).json({ message: 'Twórca nie może opuścić własnego wydarzenia' });
    }
    const before = event.participants.length;
    event.participants = event.participants.filter(p => p.user && p.user.toString() !== userId);
    if (event.participants.length === before) {
      return res.status(400).json({ message: 'Nie jesteś uczestnikiem tego wydarzenia' });
    }
    await event.save();
    res.json({ message: 'Opuściłeś wydarzenie' });
  } catch (err) {
    console.error('Błąd opuszczania wydarzenia:', err);
    res.status(500).json({ message: 'Błąd opuszczania wydarzenia' });
  }
};

// POST - kick participant from event
exports.kickParticipant = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { participantId } = req.body;
    const userId = req.user.userId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    if (event.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Tylko twórca wydarzenia może usuwać uczestników' });
    }
    if (!event.participants.some(p => p.user && p.user.toString() === participantId)) {
      return res.status(400).json({ message: 'Ten użytkownik nie jest uczestnikiem wydarzenia' });
    }
    event.participants = event.participants.filter(p => !(p.user && p.user.toString() === participantId));
    await event.save();
    res.json({ message: 'Uczestnik został usunięty', event });
  } catch (err) {
    console.error('Błąd usuwania uczestnika:', err);
    res.status(500).json({ message: 'Błąd usuwania uczestnika' });
  }
};

// Set/update participant availability
exports.setAvailability = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const { availability } = req.body;
    console.log('setAvailability - received availability:', availability);
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    const idx = event.participants.findIndex(p => p.user && p.user.toString() === userId);
    if (idx === -1) {
      event.participants.push({ user: userId, availability: [availability] });
    } else {
      event.participants[idx].availability = [availability];
    }
    await event.save();
    console.log('setAvailability - saved event:', event);
    res.json({ message: 'Dostępność zapisana', event });
  } catch (err) {
    console.error('Błąd zapisu dostępności:', err);
    res.status(500).json({ message: 'Błąd zapisu dostępności' });
  }
};

// [ADMIN/DEV] Remove old participant entries without user field
exports.cleanParticipants = async (req, res) => {
  try {
    const events = await Event.find({});
    let changed = 0;
    for (const event of events) {
      const before = event.participants.length;
      event.participants = event.participants.filter(p => p.user);
      if (event.participants.length !== before) {
        await event.save();
        changed++;
      }
    }
    res.json({ message: `Wyczyszczono ${changed} wydarzeń.` });
  } catch (err) {
    res.status(500).json({ message: 'Błąd czyszczenia participants' });
  }
};

// [ADMIN/DEV] Add creators as participants in events where they're missing
exports.fixCreatorParticipants = async (req, res) => {
  try {
    const events = await Event.find({});
    let fixed = 0;
    for (const event of events) {
      const creatorIsParticipant = event.participants.some(p => 
        p.user && p.user.toString() === event.creator.toString()
      );
      
      if (!creatorIsParticipant) {
        event.participants.push({
          user: event.creator,
          availability: []
        });
        await event.save();
        fixed++;
      }
    }
    res.json({ message: `Naprawiono ${fixed} wydarzeń.` });
  } catch (err) {
    console.error('Błąd naprawiania uczestników:', err);
    res.status(500).json({ message: 'Błąd naprawiania uczestników' });
  }
};

// --- FUNCTION EXPORTS ---
module.exports = {
  getAllEvents: exports.getAllEvents,
  createEvent: exports.createEvent,
  getEventById: exports.getEventById,
  updateEvent: exports.updateEvent,
  deleteEvent: exports.deleteEvent,
  joinEvent: exports.joinEvent,
  leaveEvent: exports.leaveEvent,
  kickParticipant: exports.kickParticipant,
  setAvailability: exports.setAvailability,
  cleanParticipants: exports.cleanParticipants,
  fixCreatorParticipants: exports.fixCreatorParticipants
};
