import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import axios from 'axios';
import Photo from '../models/Photo.js';
import Place from '../models/Place.js';
import { adminAuth } from '../middleware/adminAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../temp/'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
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

// GET all photos for a place
router.get('/place/:placeSlug', async (req, res) => {
  try {
    const photos = await Photo.find({ placeSlug: req.params.placeSlug })
      .populate('person')
      .sort({ order: 1, createdAt: 1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Upload photo
router.post('/upload', adminAuth, upload.single('photo'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { placeId, placeSlug, isGroup, personId, caption } = req.body;
    if (!placeId || !placeSlug) {
      if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ error: 'placeId and placeSlug required' });
    }

    const uploadResult = await uploadToDevLoad(req.file.path, req.file.originalname);

    const photo = new Photo({
      place: placeId,
      placeSlug,
      isGroup: isGroup === 'true' || isGroup === true,
      person: (!isGroup || isGroup === 'false') && personId ? personId : null,
      fileId: uploadResult.fileid,
      filename: uploadResult.filename,
      publicUrl: uploadResult.publicurl,
      downloadUrl: uploadResult.downloadeUrl,
      deleteUrl: uploadResult.deleteurl,
      caption: caption || '',
    });

    await photo.save();
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(201).json({ success: true, photo });
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Delete photo
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    await deleteFromDevLoad(photo.fileId);
    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Update photo
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { caption, order, isGroup, personId } = req.body;
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { caption, order, isGroup, person: personId || null },
      { new: true }
    );
    res.json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;