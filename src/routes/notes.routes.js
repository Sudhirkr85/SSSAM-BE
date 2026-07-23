const express = require('express');
const { getNotes, getNoteById, downloadNoteAndSaveLead } = require('../controllers/notes.controller');

const router = express.Router();

// Public routes for reading and downloading study notes
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/download/:id', downloadNoteAndSaveLead);

module.exports = router;
