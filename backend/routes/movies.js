const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const adminAuth = require('../middleware/adminAuth');
const { convertGoogleDriveLink } = require('../utils/googleDrive');

// GET /api/movies - Get all movies with filters
router.get('/', async (req, res) => {
  try {
    const { 
      language, 
      category, 
      genre, 
      year, 
      isTrending, 
      isFeatured,
      search,
      limit = 50,
      page = 1 
    } = req.query;

    const query = { isActive: true };

    if (language) query.language = language;
    if (category) query.category = category;
    if (genre) query.genre = { $in: [genre] };
    if (year) query.year = parseInt(year);
    if (isTrending === 'true') query.isTrending = true;
    if (isFeatured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movies = await Movie.find(query)
      .select('title language category genre year posterUrl description fileSize downloadCount isTrending isFeatured createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(parseInt(limit), 100)); // Cap at 100

    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    console.error('Query parameters:', req.query);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/search-suggestions - Get search suggestions
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await Movie.find({
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } }
      ]
    })
    .select('title posterUrl language year')
    .limit(8);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/related/:id - Get related movies
router.get('/related/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const relatedMovies = await Movie.find({
      isActive: true,
      _id: { $ne: movie._id },
      $or: [
        { language: movie.language },
        { genre: { $in: movie.genre } }
      ]
    })
    .limit(8);

    res.json(relatedMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/:id - Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/movies - Create new movie (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Received movie data:', JSON.stringify(req.body, null, 2));
    const movieData = req.body;
    
    // Ensure language doesn't conflict with MongoDB text index
    if (movieData.language) {
      delete movieData.language_override; // Remove if exists
    }
    
    // Convert Google Drive links
    if (movieData.downloadLinks && movieData.downloadLinks.length > 0) {
      movieData.downloadLinks = movieData.downloadLinks.map(link => ({
        ...link,
        url: convertGoogleDriveLink(link.url)
      }));
    }

    const movie = new Movie(movieData);
    const savedMovie = await movie.save();
    console.log('Movie saved successfully:', savedMovie._id);
    res.status(201).json(savedMovie);
  } catch (error) {
    console.error('Error creating movie:', error);
    console.error('Validation errors:', Object.keys(error.errors || {}));
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/movies/:id - Update movie (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const movieData = req.body;
    
    // Convert Google Drive links
    if (movieData.downloadLinks && movieData.downloadLinks.length > 0) {
      movieData.downloadLinks = movieData.downloadLinks.map(link => ({
        ...link,
        url: convertGoogleDriveLink(link.url)
      }));
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      movieData,
      { new: true, runValidators: true }
    );
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/movies/:id - Delete movie (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/movies/:id/download - Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ downloadCount: movie.downloadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/movies/:id/toggle-active - Toggle movie active status (Admin only)
router.patch('/:id/toggle-active', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.isActive = !movie.isActive;
    await movie.save();

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/movies/:id/toggle-trending - Toggle trending status (Admin only)
router.patch('/:id/toggle-trending', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.isTrending = !movie.isTrending;
    await movie.save();

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/movies/:id/toggle-featured - Toggle featured status (Admin only)
router.patch('/:id/toggle-featured', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.isFeatured = !movie.isFeatured;
    await movie.save();

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
