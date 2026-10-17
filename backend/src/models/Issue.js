import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, enum: ['Roads', 'Garbage', 'Streetlights', 'Water', 'Other'] },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  location: { type: String, required: true, trim: true, maxlength: 180 },
  area: { type: String, required: true, trim: true, maxlength: 120 },
  assignedOffice: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', default: null },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  statusHistory: [{
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], required: true },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Issue', issueSchema);
