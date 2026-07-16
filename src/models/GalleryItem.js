const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['classroom', 'seminar', 'lab', 'students', 'other'],
      default: 'classroom',
    },
    altText: {
      type: String,
      trim: true,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', GalleryItemSchema);
