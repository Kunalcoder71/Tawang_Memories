import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  location: { type: String, default: '' },        // e.g. "Manali, Himachal Pradesh"
  date: { type: String, default: '' },            // e.g. "2024-12-20" or "Dec 2024"
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  coverImageFileId: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Place', placeSchema);
