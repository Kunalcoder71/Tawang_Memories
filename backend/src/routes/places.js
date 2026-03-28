import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import axios from 'axios';
import Place from '../models/Place.js';
import Photo from '../models/Photo.js';
import Person from '../models/Person.js';
import { adminAuth } from '../middleware/adminAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../temp/'),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

const tempDir = path.join(__dirname, '../../temp/');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const devloadClient = () => axios.create({
  baseURL: 'https://api-devload.cloudcoderhub.in',
  headers: { 'x-api-key': process.env.DEVLOAD_API_KEY },
});

async function uploadToDevLoad(filePath, originalName) {
  const projectId = process.env.DEVLOAD_PROJECT_ID;
  if (!process.env.DEVLOAD_API_KEY || !projectId) throw new Error('DEVLOAD_API_KEY or DEVLOAD_PROJECT_ID not set in .env');

  const ext = originalName ? path.extname(originalName).toLowerCase() : '.jpg';
  const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
  const mimeType = mimeMap[ext] || 'image/jpeg';
  const fileName = `upload_${Date.now()}${ext}`;

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: fileName,
    contentType: mimeType,
    knownLength: fs.statSync(filePath).size,
  });

  const response = await devloadClient().post(
    `/api/v1/devload/projects/${projectId}/upload`,
    form,
    {
      headers: { ...form.getHeaders() },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );
  return response.data;
}

async function deleteFromDevLoad(fileId) {
  if (!process.env.DEVLOAD_API_KEY || !fileId) return;
  try {
    await devloadClient().delete(`/api/v1/devload/file/${fileId}`);
  } catch (e) {
    console.warn('DevLoad delete warning:', e.response?.data?.message || e.message);
  }
}

// GET all places
router.get('/', async (req, res) => {
  try {
    const places = await Place.find().sort({ order: 1, createdAt: 1 });
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single place with photos grouped by person
router.get('/:slug', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug });
    if (!place) return res.status(404).json({ error: 'Place not found' });

    const persons = await Person.find().sort({ order: 1 });
    const photos = await Photo.find({ placeSlug: req.params.slug })
      .populate('person')
      .sort({ order: 1, createdAt: 1 });

    const groupPhotos = photos.filter(p => p.isGroup);
    const personPhotos = {};
    persons.forEach(person => {
      personPhotos[person._id.toString()] = {
        person,
        photos: photos.filter(p => !p.isGroup && p.person?._id?.toString() === person._id.toString())
      };
    });

    res.json({ place, persons, personPhotos, groupPhotos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET photos for a specific person at a place
router.get('/:slug/person/:personId', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const person = await Person.findById(req.params.personId);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    const photos = await Photo.find({ placeSlug: req.params.slug, person: req.params.personId, isGroup: false }).sort({ order: 1, createdAt: 1 });
    res.json({ place, person, photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET group photos at a place
router.get('/:slug/group', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const photos = await Photo.find({ placeSlug: req.params.slug, isGroup: true }).sort({ order: 1, createdAt: 1 });
    res.json({ place, photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Create place (with optional cover image)
router.post('/', adminAuth, upload.single('coverImage'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    let coverImage = '';
    let coverImageFileId = '';

    if (req.file) {
      const uploadResult = await uploadToDevLoad(req.file.path, req.file.originalname);
      coverImage = uploadResult.publicurl;
      coverImageFileId = uploadResult.fileid;
    }

    const place = new Place({
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description || '',
      day: Number(req.body.day) || 0,
      order: Number(req.body.order) || 0,
      coverImage,
      coverImageFileId,
    });

    await place.save();
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(201).json(place);
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// ADMIN: Update place (with optional new cover image)
router.put('/:id', adminAuth, upload.single('coverImage'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    const updates = {
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,
      day: Number(req.body.day),
      order: Number(req.body.order),
    };

    if (req.file) {
      const existing = await Place.findById(req.params.id);
      if (existing?.coverImageFileId) await deleteFromDevLoad(existing.coverImageFileId);
      const uploadResult = await uploadToDevLoad(req.file.path, req.file.originalname);
      updates.coverImage = uploadResult.publicurl;
      updates.coverImageFileId = uploadResult.fileid;
    }

    const place = await Place.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.json(place);
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// ADMIN: Delete place → cascade delete ALL photos at this place
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: 'Place not found' });

    // Delete cover image from DevLoad
    if (place.coverImageFileId) await deleteFromDevLoad(place.coverImageFileId);

    // Find and delete all photos at this place
    const photos = await Photo.find({ placeSlug: place.slug });
    await Promise.allSettled(photos.map(p => deleteFromDevLoad(p.fileId)));
    await Photo.deleteMany({ placeSlug: place.slug });

    await Place.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Place and all its photos deleted', deletedPhotos: photos.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;