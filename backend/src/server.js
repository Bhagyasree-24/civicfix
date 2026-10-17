import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from './models/User.js';
import authRouter from './routes/auth.js';
import issuesRouter from './routes/issues.js';
import officesRouter from './routes/offices.js';
import usersRouter from './routes/users.js';
import feedbackRouter from './routes/feedback.js';
import adminRouter from './routes/admin.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(value => value.trim());

app.disable('x-powered-by');
app.use(helmet());
app.use(compression());
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed by CORS'));
} }));
app.use(express.json({ limit: '20kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'CivicFix API', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/offices', officesRouter);
app.use('/api/users', usersRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/admin', adminRouter);
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error.message);
  if (error.message === 'Origin not allowed by CORS') return res.status(403).json({ message: 'This website is not allowed to access the API.' });
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});

async function start() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing. Add it to backend/.env.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  if (Boolean(process.env.BOOTSTRAP_ADMIN_EMAIL) !== Boolean(process.env.BOOTSTRAP_ADMIN_PASSWORD)) throw new Error('Set both BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to create the first administrator.');
  if (process.env.BOOTSTRAP_ADMIN_PASSWORD && process.env.BOOTSTRAP_ADMIN_PASSWORD.length < 12) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters.');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  if (process.env.BOOTSTRAP_ADMIN_EMAIL) {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await User.findOne({ email, role: 'admin' });
    if (!existingAdmin) {
      await User.create({ name: 'CivicFix Administrator', email, role: 'admin', passwordHash: await bcrypt.hash(process.env.BOOTSTRAP_ADMIN_PASSWORD, 12) });
      console.log('Bootstrap administrator created');
    }
  }
  app.listen(port, '0.0.0.0', () => console.log(`CivicFix API listening on port ${port}`));
}
start().catch(error => { console.error(`Startup failed: ${error.message}`); process.exit(1); });
