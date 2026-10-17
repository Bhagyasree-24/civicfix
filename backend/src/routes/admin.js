import { Router } from 'express';
import Feedback from '../models/Feedback.js';
import Issue from '../models/Issue.js';
import Office from '../models/Office.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/summary', async (_req, res, next) => {
  try {
    const [total, pending, progress, resolved, unassigned, areaStats, officeStats, offices, staff, feedback] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'Pending' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' }),
      Issue.countDocuments({ assignedOffice: null }),
      Issue.aggregate([{ $group: { _id: '$area', total: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } } } }, { $sort: { total: -1 } }]),
      Issue.aggregate([{ $group: { _id: '$assignedOffice', total: { $sum: 1 } } }]),
      Office.find().sort({ name: 1 }).lean(),
      User.countDocuments({ role: 'staff' }),
      Feedback.countDocuments()
    ]);
    const officeCounts = new Map(officeStats.map(item => [String(item._id), item.total]));
    res.json({ summary: { total, pending, inProgress: progress, resolved, unassigned, staff, feedback, areas: areaStats, offices: offices.map(office => ({ ...office, reports: officeCounts.get(String(office._id)) || 0 })) } });
  } catch (error) { next(error); }
});

export default router;