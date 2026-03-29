import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import placesRouter from './routes/places.js';
import personsRouter from './routes/persons.js';
import photosRouter from './routes/photos.js';
import adminRouter from './routes/admin.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['localhost:3000', 'https://tawangmemories-backend.deployhub.online'],
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password']
}));
app.use(express.json());

app.use('/api/places', placesRouter);
app.use('/api/persons', personsRouter);
app.use('/api/photos', photosRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });
