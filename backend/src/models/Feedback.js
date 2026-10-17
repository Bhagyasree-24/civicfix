import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
  name: { type: String, trim: true, maxlength: 100, default: 'Community member' },
  rating: { type: Number, min: 1, max: 5, default: null },
  message: { type: String, required: true, trim: true, maxlength: 1200 }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);