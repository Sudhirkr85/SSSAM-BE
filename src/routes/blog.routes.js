const express = require('express');
const { getBlogs, getBlogBySlug } = require('../controllers/blog.controller');

const router = express.Router();

// Public routes for reading blogs
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

module.exports = router;
