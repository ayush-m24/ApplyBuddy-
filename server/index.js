import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import Job from './models/Job.js';
import User from './models/User.js';
import { sendApplicationMail } from './gmail.js';
import path from 'path';
import multer from 'multer';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import { auth, requireSubscription } from './middleware/auth.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo connection error', err));

app.get('/', (req, res) => {
  res.json({ message: 'ApplyBuddy API' });
});

app.post('/api/upload/cv', auth, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    await User.findByIdAndUpdate(req.user._id, { cvPath: req.file.path });
    res.json({ path: req.file.path });
  } catch (err) {
    console.error('cv upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/scrape', auth, requireSubscription, async (req, res) => {
  const scraperUrl = process.env.SCRAPER_URL || 'http://localhost:8000';
  try {
    const response = await fetch(`${scraperUrl}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('scraper error', err);
    res.status(500).json({ error: 'Failed to fetch from scraper' });
  }
});

app.post('/api/jobs/scrape', auth, requireSubscription, async (req, res) => {
  const { keywords = '', location = '' } = req.body || {};
  const scraperUrl = process.env.SCRAPER_URL || 'http://localhost:5000';
  try {
    const params = new URLSearchParams({ keywords, location }).toString();
    const resp = await fetch(`${scraperUrl}/scrape?${params}`);
    const jobs = await resp.json();
    const saved = await Promise.all(
      jobs.map((job) =>
        Job.create({
          userId: req.user._id,
          title: job.title,
          company: job.company,
          location: job.location,
          job_link: job.job_link,
          apply_type: job.apply_type,
          email: job.email,
          source: job.source,
        })
      )
    );
    res.json(saved);
  } catch (err) {
    console.error('job scrape failed', err);
    res.status(500).json({ error: 'Job scraping failed' });
  }
});

app.get('/api/jobs', auth, requireSubscription, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id });
    res.json(jobs);
  } catch (err) {
    console.error('get jobs failed', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.patch('/api/jobs/:id/save', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { saved: true },
      { new: true }
    );
    res.json(job);
  } catch (err) {
    console.error('save job failed', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.patch('/api/jobs/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { applied: true },
      { new: true }
    );
    res.json(job);
  } catch (err) {
    console.error('apply job failed', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.post('/api/apply/:jobId', auth, requireSubscription, async (req, res) => {
  const { userName = 'Applicant' } = req.body || {};
  const cvPath = req.user.cvPath;
  try {
    const job = await Job.findOne({ _id: req.params.jobId, userId: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.email) return res.status(400).json({ error: 'No email for this job' });

    const subject = `Application for ${job.title} at ${job.company}`;
    const body = `Dear Hiring Manager, please find my attached CV for the ${job.title} role. Regards, ${userName}`;
    const attachments = [];
    if (cvPath) {
      attachments.push({ filename: path.basename(cvPath), path: cvPath });
    }

    await sendApplicationMail({ to: job.email, subject, text: body, attachments });
    await Job.findOneAndUpdate(
      { _id: req.params.jobId, userId: req.user._id },
      { applied: true }
    );
    res.json({ message: 'Application sent' });
  } catch (err) {
    console.error('send application failed', err);
    res.status(500).json({ error: 'Failed to send application' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
