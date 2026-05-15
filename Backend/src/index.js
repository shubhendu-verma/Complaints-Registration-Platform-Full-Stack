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
    const tables = await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    
    const url = process.env.DATABASE_URL || 'NOT SET';
    const maskedUrl = url.replace(/\/\/.*@/, '//****:****@'); // Hide password
    
    res.json({
      message: 'Complaints Registration API is running',
      version: '1.4.0',
      db_connected: true,
      tables: tables.map(t => t.table_name),
      using_url: maskedUrl
    });
  } catch (err) {
    res.json({
      message: 'API running but DB error',
      version: '1.3.0',
      db_connected: false,
      error: err.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
