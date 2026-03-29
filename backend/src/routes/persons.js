import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Person from '../models/Person.js';
import Photo from '../models/Photo.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadToDevLoad, deleteFromDevLoad, batchDeleteFromDevLoad } from '../middleware/devload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../temp/'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Images only'));
  }
});

// GET all persons for a place
router.get('/place/:placeSlug', async (req, res) => {
  try {
    const persons = await Person.find({ placeSlug: req.params.placeSlug }).sort({ order: 1, createdAt: 1 });
    res.json(persons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all persons (admin)
router.get('/', async (req, res) => {
  try {
    const persons = await Person.find().sort({ placeSlug: 1, order: 1 });
    res.json(persons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE person for a place
router.post('/', adminAuth, upload.single('avatar'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    let avatar = '', avatarFileId = '';
    if (req.file) {
      const r = await uploadToDevLoad(tempPath, req.file.originalname);
      avatar = r.publicurl; avatarFileId = r.fileid;
    }
    const person = new Person({
      name: req.body.name, bio: req.body.bio || '',
      place: req.body.placeId, placeSlug: req.body.placeSlug,
      avatar, avatarFileId,
      order: Number(req.body.order) || 0,
    });
    await person.save();
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(201).json(person);
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE person
router.put('/:id', adminAuth, upload.single('avatar'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    const updates = { name: req.body.name, bio: req.body.bio || '' };
    if (req.file) {
      const existing = await Person.findById(req.params.id);
      if (existing?.avatarFileId) await deleteFromDevLoad(existing.avatarFileId);
      const r = await uploadToDevLoad(tempPath, req.file.originalname);
      updates.avatar = r.publicurl; updates.avatarFileId = r.fileid;
    }
    const person = await Person.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.json(person);
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// DELETE person → cascade photos + avatar
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ error: 'Person not found' });

    const photos = await Photo.find({ person: req.params.id });
    const fileIds = [];
    if (person.avatarFileId) fileIds.push(person.avatarFileId);
    photos.forEach(p => { if (p.fileId) fileIds.push(p.fileId); });

    if (fileIds.length > 0) await batchDeleteFromDevLoad(fileIds, 5, 300);
    await Photo.deleteMany({ person: req.params.id });
    await Person.findByIdAndDelete(req.params.id);

    res.json({ success: true, deletedPhotos: photos.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
