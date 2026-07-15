const express = require('express');
const { getNotes, downloadNoteAndSaveLead } = require('../controllers/notes.controller');

const router = express.Router();

// Public routes for reading and downloading study notes
router.get('/', getNotes);
router.post('/download/:id', downloadNoteAndSaveLead);

module.exports = router;
