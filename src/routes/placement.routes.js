const express = require('express');
const { getPlacements } = require('../controllers/placement.controller');

const router = express.Router();

// Public route to get active placements
router.get('/', getPlacements);

module.exports = router;
