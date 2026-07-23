const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['Blog', 'Hiring'],
      default: 'Blog',
    },
    hiringDetails: {
      source: { type: String, enum: ['own', 'external'], default: 'external' },
      company: { type: String, default: '' },
      role: { type: String, default: '' },
      applyLink: { type: String, default: '' },
      location: { type: String, default: '' },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: String,
      default: 'SSSAM Academy',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Published',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);
