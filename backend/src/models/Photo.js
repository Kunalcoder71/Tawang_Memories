import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  placeSlug: { type: String, required: true },
  // Either a person or group
  isGroup: { type: Boolean, default: false },
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', default: null },
  // DevLoad file info
  fileId: { type: String, required: true },
  filename: { type: String },
  publicUrl: { type: String, required: true },
  downloadUrl: { type: String },
  deleteUrl: { type: String },
  caption: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Photo', photoSchema);
