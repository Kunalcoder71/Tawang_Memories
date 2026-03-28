import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import axios from 'axios';
import Person from '../models/Person.js';
import Place from '../models/Place.js';
import Photo from '../models/Photo.js';
import { adminAuth } from '../middleware/adminAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../temp/'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

const tempDir = path.join(__dirname, '../../temp/');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// ── DevLoad helpers ────────────────────────────────────────────────────────────
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

// ── Verify admin ───────────────────────────────────────────────────────────────
router.post('/verify', adminAuth, (req, res) => {
  res.json({ success: true, message: 'Admin authenticated' });
});

// ── GET all persons ────────────────────────────────────────────────────────────
router.get('/persons', async (req, res) => {
  try {
    const persons = await Person.find().sort({ order: 1 });
    res.json(persons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CREATE person ──────────────────────────────────────────────────────────────
router.post('/persons', adminAuth, upload.single('avatar'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    let avatarUrl = '';
    let avatarFileId = '';

    if (req.file) {
      const uploadResult = await uploadToDevLoad(req.file.path, req.file.originalname);
      avatarUrl = uploadResult.publicurl;
      avatarFileId = uploadResult.fileid;
    }

    const person = new Person({
      name: req.body.name,
      bio: req.body.bio || '',
      avatar: avatarUrl,
      avatarFileId,
      order: Number(req.body.order) || 0,
    });

    await person.save();
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(201).json(person);
  } catch (err) {
    console.log(err)
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// ── UPDATE person ──────────────────────────────────────────────────────────────
router.put('/persons/:id', adminAuth, upload.single('avatar'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    const updates = {
      name: req.body.name,
      bio: req.body.bio || '',
      order: Number(req.body.order) || 0,
    };

    if (req.file) {
      const existing = await Person.findById(req.params.id);
      if (existing?.avatarFileId) await deleteFromDevLoad(existing.avatarFileId);
      const uploadResult = await uploadToDevLoad(req.file.path, req.file.originalname);
      updates.avatar = uploadResult.publicurl;
      updates.avatarFileId = uploadResult.fileid;
    }

    const person = await Person.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.json(person);
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE person → cascade: photos + avatar ──────────────────────────────────
router.delete('/persons/:id', adminAuth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ error: 'Person not found' });

    if (person.avatarFileId) await deleteFromDevLoad(person.avatarFileId);

    const photos = await Photo.find({ person: req.params.id });
    await Promise.allSettled(photos.map(p => deleteFromDevLoad(p.fileId)));
    await Photo.deleteMany({ person: req.params.id });
    await Person.findByIdAndDelete(req.params.id);

    res.json({ success: true, deletedPhotos: photos.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SEED initial data ──────────────────────────────────────────────────────────
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const existingPlaces = await Place.countDocuments();
    if (existingPlaces > 0) {
      return res.json({ message: 'Data already seeded', skipped: true });
    }

    const places = [
      { slug: 'dirang', name: 'Dirang Valley', description: 'A beautiful valley town known for apple orchards, hot springs, and monasteries. Gateway to Tawang.', day: 1, order: 1 },
      { slug: 'sela-pass', name: 'Sela Pass', description: 'At 13,700 ft, Sela Pass is a breathtaking crossing where snow blankets the mountains. Beside it lies the turquoise Sela Lake.', day: 2, order: 2 },
      { slug: 'jaswant-garh', name: 'Jaswant Garh War Memorial', description: 'Dedicated to Rifleman Jaswant Singh Rawat, a hero of the 1962 Indo-China war.', day: 2, order: 3 },
      { slug: 'nuranang-falls', name: 'Nuranang Waterfall', description: 'A stunning waterfall cascading powerfully against a lush backdrop.', day: 2, order: 4 },
      { slug: 'tawang-monastery', name: 'Tawang Monastery', description: 'The largest monastery in India, over 300 years old. Golden rooftops shine above the valley.', day: 3, order: 5 },
      { slug: 'madhuri-lake', name: 'Madhuri Lake (Sangetsar)', description: 'A serene alpine lake whose reflections of the surrounding peaks create postcard views.', day: 3, order: 6 },
      { slug: 'pt-tso', name: 'PT Tso Lake', description: 'A pristine high-altitude lake near Bum La Pass with breathtaking Himalayan views.', day: 3, order: 7 },
      { slug: 'bum-la-pass', name: 'Bum La Pass', description: 'At 15,200 ft near the Indo-China border — one of the highest motorable points in the region.', day: 3, order: 8 },
      { slug: 'sangti-valley', name: 'Sangti Valley', description: 'A peaceful retreat near Dirang with apple orchards, meadows, and grazing yaks.', day: 4, order: 9 },
    ];

    await Place.insertMany(places);
    res.json({ success: true, message: `Seeded ${places.length} places` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;