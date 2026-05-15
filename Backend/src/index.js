import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import complaintRoutes, { adminRouter } from './routes/complaints.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Simply reflect the origin back to allow it
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRouter);

// Health check
app.get('/', async (req, res) => {
  try {
    const { client } = await import('./db/index.js');
    
    const url = process.env.DATABASE_URL || 'NOT SET';
    const maskedUrl = url.replace(/\/\/.*@/, '//****:****@'); // Hide password
    
    // Check if client is actually a function before calling
    let tableNames = [];
    if (typeof client === 'function') {
      const tables = await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      tableNames = tables.map(t => t.table_name);
    }

    res.json({
      message: 'Complaints Registration API is running',
      version: '1.5.0',
      db_connected: typeof client === 'function',
      using_url: maskedUrl,
      env_keys: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')),
      tables: tableNames
    });
  } catch (err) {
    res.json({
      message: 'API running but DB error',
      version: '1.5.0',
      db_connected: false,
      env_keys: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')),
      error: err.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
