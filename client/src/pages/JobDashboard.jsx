import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const mockJobs = [
  {
    _id: '1',
    title: 'Software Engineer',
    company: 'TechCorp',
    location: 'Bangalore',
    source: 'naukri',
    apply_type: 'email',
    job_link: '#',
    saved: false,
    applied: false,
  },
];

export default function JobDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const userId = 'demo';
    fetch(`/api/jobs?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setJobs(data);
        else setJobs(mockJobs);
      })
      .catch(() => setJobs(mockJobs));
  }, []);

  const markSaved = async (id) => {
    await fetch(`/api/jobs/${id}/save`, { method: 'PATCH' });
    setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, saved: true } : j)));
  };

  const markApplied = async (id) => {
    await fetch(`/api/jobs/${id}/apply`, { method: 'PATCH' });
    setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, applied: true } : j)));
  };

  return (
    <motion.div
      className="grid gap-6 sm:grid-cols-2 md:grid-cols-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {jobs.map((job) => (
        <motion.div
          key={job._id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{job.company}</p>
          <p className="text-sm mb-1">{job.location}</p>
          <p className="text-xs text-gray-500">Source: {job.source}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.apply_type && (
              <a
                href={job.job_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </a>
            )}
            <button
              onClick={() => markSaved(job._id)}
              className="px-3 py-1 rounded-md bg-green-600 text-white text-sm shadow hover:bg-green-700 transition-colors"
              disabled={job.saved}
            >
              {job.saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => markApplied(job._id)}
              className="px-3 py-1 rounded-md bg-yellow-600 text-white text-sm shadow hover:bg-yellow-700 transition-colors"
              disabled={job.applied}
            >
              {job.applied ? 'Applied' : 'Mark as Applied'}
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
