const express = require('express');
const router = express.Router();
const { notes } = require('../db/inMemoryDb');
const { verifyToken } = require('../middleware/auth');
const myEmitter = require('../events/eventEmitter');

// protect all notes routes
router.use(verifyToken);

// GET /api/notes - get all notes for the logged in user
router.get('/', (req, res) => {
  let userNotes;
  if (req.user.role === 'admin') {
    userNotes = notes;
  } else {
    userNotes = notes.filter(n => n.userId === req.user.id);
  }
  res.json({ count: userNotes.length, notes: userNotes });
});

// POST /api/notes - add new note
router.post('/', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newNote = {
    id: Date.now().toString(),
    title,
    content,
    userId: req.user.id,
    createdBy: req.user.username,
    createdAt: new Date()
  };

  notes.push(newNote);

  // emit event
  myEmitter.emit('noteAdded', {
    id: newNote.id,
    title: newNote.title,
    username: req.user.username
  });

  res.status(201).json({
    message: 'Note created',
    note: newNote
  });
});

// GET /api/notes/:id - get single note
router.get('/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  // check ownership
  if (note.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this note' });
  }

  res.json(note);
});

// PUT /api/notes/:id - update note
router.put('/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (note.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to edit this note' });
  }

  note.title = req.body.title || note.title;
  note.content = req.body.content || note.content;

  res.json({ message: 'Note updated', note });
});

// DELETE /api/notes/:id - delete note
router.delete('/:id', (req, res) => {
  const index = notes.findIndex(n => n.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  const note = notes[index];
  if (note.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this note' });
  }

  notes.splice(index, 1);

  myEmitter.emit('noteDeleted', { id: req.params.id, userId: req.user.id });

  res.json({ message: 'Note deleted successfully' });
});

module.exports = router;
