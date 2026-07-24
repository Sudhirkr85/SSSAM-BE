const GalleryItem = require('../models/GalleryItem');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

function parseBoolean(val) {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  if (typeof val === 'number') return val !== 0;
  return Boolean(val);
}

// Public: Get all active gallery images
async function getGallery(req, res, next) {
  try {
    const items = await GalleryItem.find({ active: true }).sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
}

// Admin: Get all gallery items (including hidden)
async function getAdminGallery(req, res, next) {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
}

// Admin: Create/upload gallery image
async function createGalleryItem(req, res, next) {
  try {
    const { title, category, altText, active } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'title and category are required.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'An image file is required.' });
    }

    const imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    const activeBool = active !== undefined ? parseBoolean(active) : true;

    const item = await GalleryItem.create({
      title,
      category,
      altText: altText || title,
      active: activeBool,
      imageUrl,
    });

    return res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

// Admin: Update gallery item (fields and optionally new image)
async function updateGalleryItem(req, res, next) {
  try {
    const { id } = req.params;
    const { title, category, altText, active } = req.body;

    const item = await GalleryItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found.' });
    }

    if (title) item.title = title;
    if (category) item.category = category;
    if (altText !== undefined) item.altText = altText;
    if (active !== undefined) item.active = parseBoolean(active);

    // Replace image in S3 if a new file is uploaded
    if (req.file) {
      if (item.imageUrl) {
        await deleteFromS3(item.imageUrl);
      }
      item.imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    await item.save();
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
}

// Admin: Delete gallery image (also removes from S3)
async function deleteGalleryItem(req, res, next) {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found.' });
    }

    if (item.imageUrl) {
      await deleteFromS3(item.imageUrl);
    }

    await GalleryItem.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Gallery item deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGallery,
  getAdminGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};
