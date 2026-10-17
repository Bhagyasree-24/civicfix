import mongoose from 'mongoose';

const officeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100, unique: true },
  categories: { type: [{ type: String, enum: ['Roads', 'Garbage', 'Streetlights', 'Water', 'Other'] }], required: true },
  areas: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
  address: { type: String, trim: true, maxlength: 240, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Office', officeSchema);