import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  placeSlug: { type: String, required: true },
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', default: null },
  isGroup: { type: Boolean, default: false },
  fileId: { type: String, required: true },
  filename: { type: String, default: '' },
  publicUrl: { type: String, required: true },
  caption: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Photo', photoSchema);
