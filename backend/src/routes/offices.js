import { Router } from 'express';
import mongoose from 'mongoose';
import Office from '../models/Office.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const categories = ['Roads', 'Garbage', 'Streetlights', 'Water', 'Other'];

router.get('/', async (_req, res, next) => {
  try {
    const offices = await Office.find({ active: true }).select('name categories areas address').sort({ name: 1 }).lean();
    res.json({ offices });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, categories: officeCategories, areas = [], address = '' } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() || !Array.isArray(officeCategories) || !officeCategories.length || !officeCategories.every(category => categories.includes(category)) || !Array.isArray(areas) || !areas.every(area => typeof area === 'string' && area.trim() && area.trim().length <= 120) || typeof address !== 'string') {
      return res.status(400).json({ message: 'Provide an office name, valid categories, and valid service areas.' });
    }
    const office = await Office.create({ name: name.trim(), categories: [...new Set(officeCategories)], areas: [...new Set(areas.map(area => area.trim()))], address: address.trim() });
    res.status(201).json({ office });
  } catch (error) { next(error); }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid office ID.' });
    const { name, categories: officeCategories, areas, address, active } = req.body ?? {};
    const updates = {};
    if (name !== undefined && typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (officeCategories !== undefined && Array.isArray(officeCategories) && officeCategories.length && officeCategories.every(category => categories.includes(category))) updates.categories = [...new Set(officeCategories)];
    if (areas !== undefined && Array.isArray(areas) && areas.every(area => typeof area === 'string' && area.trim() && area.trim().length <= 120)) updates.areas = [...new Set(areas.map(area => area.trim()))];
    if (address !== undefined && typeof address === 'string') updates.address = address.trim();
    if (active !== undefined && typeof active === 'boolean') updates.active = active;
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid office changes were provided.' });
    const office = await Office.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean();
    if (!office) return res.status(404).json({ message: 'Office not found.' });
    res.json({ office });
  } catch (error) { next(error); }
});

export default router;