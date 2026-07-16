const express = require('express');
const { getGallery } = require('../controllers/gallery.controller');

const router = express.Router();

// Public route — used by frontend gallery.html
router.get('/', getGallery);

module.exports = router;
