import { Router } from 'express';
import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import Issue from '../models/Issue.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { issueId = null, name = '', rating = null, message } = req.body ?? {};
    if (typeof message !== 'string' || !message.trim() || message.trim().length > 1200 || typeof name !== 'string' || name.trim().length > 100) {
      return res.status(400).json({ message: 'Provide feedback under 1,200 characters and an optional name under 100 characters.' });
    }
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return res.status(400).json({ message: 'Choose a rating from 1 to 5.' });
    if (issueId !== null && (!mongoose.isValidObjectId(issueId) || !(await Issue.exists({ _id: issueId })))) {
      return res.status(400).json({ message: 'Choose a valid report or send general CivicFix feedback.' });
    }
    const feedback = await Feedback.create({ issue: issueId, name: name.trim() || 'Community member', rating, message: message.trim() });
    res.status(201).json({ feedback: { id: feedback.id, message: feedback.message, createdAt: feedback.createdAt } });
  } catch (error) { next(error); }
});

router.get('/', requireAuth, requireRole('admin', 'staff'), async (req, res, next) => {
  try {
    const feedback = await Feedback.find().populate({ path: 'issue', select: 'title area assignedOffice', populate: { path: 'assignedOffice', select: 'name' } }).sort({ createdAt: -1 }).limit(300).lean();
    const visible = req.user.role === 'admin' ? feedback : feedback.filter(item => !item.issue || String(item.issue.assignedOffice?._id) === String(req.user.office?._id));
    res.json({ feedback: visible });
  } catch (error) { next(error); }
});

export default router;