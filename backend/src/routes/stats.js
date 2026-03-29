import express from 'express';
import Place from '../models/Place.js';
import Person from '../models/Person.js';
import Photo from '../models/Photo.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [totalPlaces, totalPersons, totalPhotos, groupPhotos] = await Promise.all([
      Place.countDocuments(),
      Person.countDocuments(),
      Photo.countDocuments(),
      Photo.countDocuments({ isGroup: true }),
    ]);
    const recentPlaces = await Place.find().sort({ createdAt: -1 }).limit(3).select('name date location');
    res.json({ totalPlaces, totalPersons, totalPhotos, groupPhotos, recentPlaces });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
