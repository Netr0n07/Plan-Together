const Event = require('../models/Event');
const mongoose = require('mongoose');

// GET - pobierz tylko wydarzenia zalogowanego użytkownika
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { creator: req.user.userId },
        { 'participants.user': new mongoose.Types.ObjectId(req.user.userId) }
      ]
    });
    res.json(events);
  } catch (err) {
    console.error('Błąd pobierania wydarzeń:', err);
    res.status(500).json({ message: 'Błąd pobierania wydarzeń', error: err.message });
  }
};


// POST - utwórz nowe wydarzenie
exports.createEvent = async (req, res) => {
  console.log("createEvent -> req.user:", req.user);
  console.log("createEvent -> req.body:", req.body);

  try {
    const { title, description } = req.body;

    const newEvent = new Event({
      title,
      description,
      creator: req.user.userId
    });

    await newEvent.save();
    res.status(201).json({ message: 'Wydarzenie utworzone', event: newEvent });
  } catch (err) {
    console.error('Błąd tworzenia wydarzenia:', err);
    res.status(500).json({ message: 'Błąd tworzenia wydarzenia' });
  }
};

// GET - pobierz szczegóły jednego wydarzenia
exports.getEventById = async (req, res) => {
  console.log('getEventById wywołane z id:', req.params.id);
  try {
    const event = await Event.findById(req.params.id)
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

// PUT - aktualizuj wydarzenie
exports.updateEvent = async (req, res) => {
  try {
    const { title, description } = req.body;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('[updateEvent] Nie znaleziono wydarzenia:', eventId);
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }

    // Sprawdź czy użytkownik jest twórcą wydarzenia
    if (event.creator.toString() !== req.user.userId) {
      console.log('[updateEvent] Brak uprawnień:', {
        eventCreator: event.creator.toString(),
        userId: req.user.userId
      });
      return res.status(403).json({ message: 'Brak uprawnień do edycji tego wydarzenia' });
    }

    // Aktualizuj pola
    if (title) event.title = title;
    if (description) event.description = description;

    await event.save();
    // Pobierz zpopulowany event
    const populated = await Event.findById(eventId).populate('participants.user', 'name surname email');
    console.log('[updateEvent] Wydarzenie zaktualizowane:', eventId);
    res.json({ message: 'Wydarzenie zaktualizowane', event: populated });
  } catch (err) {
    console.error('Błąd aktualizacji wydarzenia:', err);
    res.status(500).json({ message: 'Błąd aktualizacji wydarzenia' });
  }
};

// DELETE - usuń wydarzenie
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

// POST - dołącz do wydarzenia
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

// POST - opuść wydarzenie
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

// POST - wyrzuć uczestnika z wydarzenia
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

// Ustaw/aktualizuj dostępność uczestnika
exports.setAvailability = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const { availability } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia' });
    }
    // Szukaj uczestnika po userId
    const idx = event.participants.findIndex(p => p.user && p.user.toString() === userId);
    if (idx === -1) {
      // Dodaj nowego uczestnika z dostępnością
      event.participants.push({ user: userId, availability });
    } else {
      // Aktualizuj dostępność istniejącego uczestnika
      event.participants[idx].availability = availability;
    }
    await event.save();
    res.json({ message: 'Dostępność zapisana', event });
  } catch (err) {
    console.error('Błąd zapisu dostępności:', err);
    res.status(500).json({ message: 'Błąd zapisu dostępności' });
  }
};

// [ADMIN/DEV] Usuń stare wpisy participants bez pola user
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

// --- EKSPORT FUNKCJI ---
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
  cleanParticipants: exports.cleanParticipants
};

