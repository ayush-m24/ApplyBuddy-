import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  company: String,
  location: String,
  job_link: String,
  apply_type: String,
  email: String,
  source: String,
  applied: { type: Boolean, default: false },
  saved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default model('Job', jobSchema);
