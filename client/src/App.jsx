import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import JobDashboard from './pages/JobDashboard';
import Subscribe from './pages/Subscribe';

function Home() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-2xl font-bold">ApplyBuddy Client</h1>
    </motion.div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className={dark ? 'dark min-h-screen' : 'min-h-screen'}>
      <header className="p-4 flex justify-between items-center shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-xl font-semibold">ApplyBuddy</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <Link to="/subscribe" className="hover:text-blue-600 transition-colors">Subscribe</Link>
          <button onClick={logout} className="hover:text-blue-600 transition-colors">Logout</button>
          <button
            onClick={() => setDark(!dark)}
            className="ml-2 border rounded px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </nav>
      </header>
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<JobDashboard />} />
          <Route path="/subscribe" element={<Subscribe />} />
        </Routes>
      </motion.main>
    </div>
  );
}
