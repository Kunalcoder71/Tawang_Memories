import mongoose from 'mongoose';

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  avatarFileId: { type: String, default: '' },
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  placeSlug: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Person', personSchema);
