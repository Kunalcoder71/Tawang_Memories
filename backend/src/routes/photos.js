import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import Photo from '../models/Photo.js';
import Place from '../models/Place.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadToDevLoad, deleteFromDevLoad, batchDeleteFromDevLoad } from '../middleware/devload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../temp/'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Images only'));
  }
});

// GET photos for a place
router.get('/place/:placeSlug', async (req, res) => {
  try {
    const photos = await Photo.find({ placeSlug: req.params.placeSlug }).populate('person').sort({ order: 1, createdAt: 1 });
    res.json(photos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPLOAD photo
router.post('/upload', adminAuth, upload.single('photo'), async (req, res) => {
  const tempPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { placeId, placeSlug, isGroup, personId, caption } = req.body;
    if (!placeId || !placeSlug) {
      if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ error: 'placeId and placeSlug required' });
    }
    const r = await uploadToDevLoad(tempPath, req.file.originalname);
    const photo = new Photo({
      place: placeId, placeSlug,
      isGroup: isGroup === 'true' || isGroup === true,
      person: (isGroup === 'true' || isGroup === true) ? null : (personId || null),
      fileId: r.fileid, filename: r.filename,
      publicUrl: r.publicurl, caption: caption || '',
    });
    await photo.save();
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(201).json({ success: true, photo });
  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ error: err.message });
  }
});

// DELETE photo
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    await deleteFromDevLoad(photo.fileId);
    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE multiple photos (batched)
router.post('/delete-batch', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'ids array required' });
    const photos = await Photo.find({ _id: { $in: ids } });
    const fileIds = photos.map(p => p.fileId).filter(Boolean);
    if (fileIds.length > 0) await batchDeleteFromDevLoad(fileIds, 5, 300);
    await Photo.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deleted: photos.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DOWNLOAD all photos of a place as ZIP
router.get('/download/:placeSlug', async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.placeSlug });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    const photos = await Photo.find({ placeSlug: req.params.placeSlug }).populate('person');
    if (!photos.length) return res.status(404).json({ error: 'No photos found' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${place.name.replace(/[^a-z0-9]/gi, '_')}_photos.zip"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    // Download each photo and add to zip (batched 3 at a time)
    const batchSize = 3;
    for (let i = 0; i < photos.length; i += batchSize) {
      const batch = photos.slice(i, i + batchSize);
      await Promise.all(batch.map((photo, bi) => new Promise((resolve, reject) => {
        const url = new URL(photo.publicUrl);
        const lib = url.protocol === 'https:' ? https : http;
        const label = photo.isGroup ? 'group' : (photo.person?.name || 'unknown');
        const filename = `${String(i + bi + 1).padStart(3, '0')}_${label.replace(/\s+/g, '_')}.jpg`;
        lib.get(photo.publicUrl, stream => {
          archive.append(stream, { name: filename });
          stream.on('end', resolve);
          stream.on('error', reject);
        }).on('error', reject);
      })));
    }

    archive.finalize();
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;
