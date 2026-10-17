import { Router } from 'express';
import Issue from '../models/Issue.js';
import Office from '../models/Office.js';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const categories = ['Roads', 'Garbage', 'Streetlights', 'Water', 'Other'];
const statuses = ['Pending', 'In Progress', 'Resolved'];

async function matchOffice(category, area) {
  const offices = await Office.find({ active: true, categories: category }).lean();
  const normalizedArea = area.toLocaleLowerCase();
  const matches = offices.filter(office => office.areas.some(value => value.toLocaleLowerCase() === normalizedArea));
  if (matches.length === 1) return matches[0]._id;
  if (matches.length > 1) return null;
  const allAreaOffices = offices.filter(office => office.areas.length === 0);
  return allAreaOffices.length === 1 ? allAreaOffices[0]._id : null;
}

router.get('/queue', requireAuth, requireRole('admin', 'staff'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'staff') {
      if (!req.user.office?._id) return res.status(403).json({ message: 'Your account is not assigned to an office.' });
      filter.assignedOffice = req.user.office._id;
    }
    if (req.query.status && statuses.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.area && typeof req.query.area === 'string') filter.area = req.query.area;
    const issues = await Issue.find(filter).populate('assignedOffice', 'name').sort({ createdAt: -1 }).limit(500).lean();
    res.json({ issues });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && categories.includes(req.query.category)) filter.category = req.query.category;
    if (req.query.status && statuses.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.area && typeof req.query.area === 'string') filter.area = req.query.area;
    const issues = await Issue.find(filter).populate('assignedOffice', 'name').sort({ createdAt: -1 }).limit(200).lean();
    res.json({ issues });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, category, description, location, area } = req.body ?? {};
    if (![title, category, description, location, area].every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Please provide a title, category, description, location, and area.' });
    }
    if (title.trim().length > 100 || description.trim().length > 1000 || location.trim().length > 180 || area.trim().length > 120) {
      return res.status(400).json({ message: 'One or more fields exceed the allowed length.' });
    }
    if (!categories.includes(category)) return res.status(400).json({ message: 'Choose a valid category.' });
    const normalizedArea = area.trim();
    const assignedOffice = await matchOffice(category, normalizedArea);
    const issue = await Issue.create({ title: title.trim(), category, description: description.trim(), location: location.trim(), area: normalizedArea, assignedOffice });
    await issue.populate('assignedOffice', 'name');
    res.status(201).json({ issue });
  } catch (error) { next(error); }
});

router.patch('/:id/status', requireAuth, requireRole('admin', 'staff'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid report ID.' });
    const { status, note = '' } = req.body ?? {};
    if (!statuses.includes(status) || typeof note !== 'string' || note.trim().length > 500) {
      return res.status(400).json({ message: 'Choose a valid status and keep the update note under 500 characters.' });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Report not found.' });
    if (req.user.role === 'staff' && String(issue.assignedOffice) !== String(req.user.office?._id)) {
      return res.status(403).json({ message: 'This report is assigned to another office.' });
    }
    issue.status = status;
    issue.statusHistory.push({ status, note: note.trim(), updatedBy: req.user._id });
    await issue.save();
    await issue.populate('assignedOffice', 'name');
    res.json({ issue });
  } catch (error) { next(error); }
});

export default router;
