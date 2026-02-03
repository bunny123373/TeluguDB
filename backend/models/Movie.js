const mongoose = require('mongoose');

const downloadLinkSchema = new mongoose.Schema({
  quality: {
    type: String,
    required: true,
    enum: ['480p', '720p', '1080p', '4K']
  },
  url: {
    type: String,
    required: true
  }
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    enum: ['Telugu', 'Tamil', 'Hindi', 'English', 'Kannada', 'Malayalam', 'Dubbed']
  },
  category: {
    type: String,
    required: true,
    enum: ['Movie', 'Web Series', 'Dubbed']
  },
  genre: [{
    type: String,
    enum: ['Action', 'Comedy', 'Romance', 'Thriller', 'Horror', 'Drama', 'Sci-Fi', 'Adventure', 'Crime']
  }],
  year: {
    type: Number,
    required: true
  },
  posterUrl: {
    type: String,
    required: true
  },
  downloadLinks: [downloadLinkSchema],
  description: {
    type: String,
    required: true
  },
  fileSize: {
    type: String,
    required: true
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
movieSchema.index({ language: 1 });
movieSchema.index({ category: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ year: 1 });
movieSchema.index({ isTrending: 1 });
movieSchema.index({ isActive: 1 });

module.exports = mongoose.model('Movie', movieSchema);
