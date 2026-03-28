import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  day: { type: Number },
  coverImage: { type: String, default: '' },
  coverImageFileId: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Place', placeSchema);
