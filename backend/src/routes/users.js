import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Office from '../models/Office.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', async (_req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').populate('office', 'name').sort({ name: 1 }).lean();
    res.json({ users });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, password, officeId } = req.body ?? {};
    if (![name, email, password, officeId].every(value => typeof value === 'string' && value.trim()) || password.length < 12 || !mongoose.isValidObjectId(officeId)) {
      return res.status(400).json({ message: 'Provide a name, valid email, office, and password of at least 12 characters.' });
    }
    const office = await Office.findOne({ _id: officeId, active: true });
    if (!office) return res.status(400).json({ message: 'Choose an active office.' });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'staff', office: office._id });
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, office: { id: office.id, name: office.name }, active: user.active } });
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid staff ID.' });
    const { active, officeId, name } = req.body ?? {};
    const user = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!user) return res.status(404).json({ message: 'Staff account not found.' });
    if (typeof active === 'boolean') user.active = active;
    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (officeId !== undefined) {
      if (!mongoose.isValidObjectId(officeId)) return res.status(400).json({ message: 'Choose a valid office.' });
      const office = await Office.findOne({ _id: officeId, active: true });
      if (!office) return res.status(400).json({ message: 'Choose an active office.' });
      user.office = office._id;
    }
    await user.save();
    await user.populate('office', 'name');
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, office: user.office, active: user.active } });
  } catch (error) { next(error); }
});

export default router;