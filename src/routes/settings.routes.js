const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

router.get('/:key', settingsController.getSetting);

module.exports = router;
