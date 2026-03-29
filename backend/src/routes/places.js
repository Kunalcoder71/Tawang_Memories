import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Place from '../models/Place.js';
import Person from '../models/Person.js';
import Photo from '../models/Photo.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadToDevLoad, deleteFromDevLoad, batchDeleteFromDevLoad } from '../middleware/devload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../temp/'),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Images only'));
  }
});

// GET all places
router.get('/', async (req, res) => {
  try {
    const places = await Place.find().sort({ date: -1, createdAt: -1 });
    // Attach counts
    const placeIds = places.map(p => p._id);
    const [photoCounts, personCounts] = await Promise.all([
      Photo.aggregate([{ $match: { place: { $in: placeIds } } }, { $group: { _id: '$place', count: { $sum: 1 } } }]),
      Person.aggregate([{ $match: { place: { $in: placeIds } } }, { $group: { _id: '$place', count: { $sum: 1 } } }]),
    ]);
    const photoMap = Object.fromEntries(photoCounts.map(p => [p._id.toString(), p.count]));
    const personMap = Object.fromEntries(personCounts.map(p => [p._id.toString(), p.count]));
    const result = places.map(p => ({
      ...p.toObject(),
      photoCount: photoMap[p._id.toString()] || 0,
      personCount: personMap[p._id.toString()] || 0,
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single place with persons
router.get('/:slug', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const persons = await Person.find({ placeSlug: req.params.slug }).sort({ order: 1, createdAt: 1 });
    const photos = await Photo.find({ placeSlug: req.params.slug }).populate('person').sort({ order: 1, createdAt: 1 });
    const groupPhotos = photos.filter(p => p.isGroup);
    const personPhotos = {};
    persons.forEach(person => {
      personPhotos[person._id.toString()] = {
        person,
        photos: photos.filter(p => !p.isGroup && p.person?._id?.toString() === person._id.toString())
      };
    });
    res.json({ place, persons, personPhotos, groupPhotos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET person photos at place
router.get('/:slug/person/:personId', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const person = await Person.findById(req.params.personId);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    const photos = await Photo.find({ placeSlug: req.params.slug, person: req.params.personId, isGroup: false }).sort({ order: 1, createdAt: 1 });
    res.json({ place, person, photos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET group photos at place
router.get('/:slug/group', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const photos = await Photo.find({ placeSlug: req.params.slug, isGroup: true }).sort({ order: 1, createdAt: 1 });
    res.json({ place, photos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE place
router.post('/', adminAuth, upload.single('coverImage'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    let coverImage = '', coverImageFileId = '';
    if (req.file) {
      const r = await uploadToDevLoad(tempPath, req.file.originalname);
      coverImage = r.publicurl; coverImageFileId = r.fileid;
    }
    const count = await Place.countDocuments();
    const place = new Place({
      name: req.body.name, slug: req.body.slug,
      location: req.body.location || '', date: req.body.date || '',
      description: req.body.description || '',
      coverImage, coverImageFileId,
      order: Number(req.body.order) || count + 1,
    });
    await place.save();
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(201).json(place);
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE place
router.put('/:id', adminAuth, upload.single('coverImage'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    const updates = { name: req.body.name, slug: req.body.slug, location: req.body.location, date: req.body.date, description: req.body.description };
    if (req.file) {
      const existing = await Place.findById(req.params.id);
      if (existing?.coverImageFileId) await deleteFromDevLoad(existing.coverImageFileId);
      const r = await uploadToDevLoad(tempPath, req.file.originalname);
      updates.coverImage = r.publicurl; updates.coverImageFileId = r.fileid;
    }
    const place = await Place.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.json(place);
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// DELETE place → cascade: all persons + all photos (batched)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: 'Place not found' });

    // Collect all fileIds to delete from DevLoad
    const fileIds = [];
    if (place.coverImageFileId) fileIds.push(place.coverImageFileId);

    const persons = await Person.find({ place: req.params.id });
    persons.forEach(p => { if (p.avatarFileId) fileIds.push(p.avatarFileId); });

    const photos = await Photo.find({ place: req.params.id });
    photos.forEach(p => { if (p.fileId) fileIds.push(p.fileId); });

    // Batch delete from DevLoad (5 at a time, 300ms apart)
    if (fileIds.length > 0) await batchDeleteFromDevLoad(fileIds, 5, 300);

    // Delete from DB
    await Promise.all([
      Person.deleteMany({ place: req.params.id }),
      Photo.deleteMany({ place: req.params.id }),
      Place.findByIdAndDelete(req.params.id),
    ]);

    res.json({ success: true, deletedPersons: persons.length, deletedPhotos: photos.length, deletedFiles: fileIds.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
