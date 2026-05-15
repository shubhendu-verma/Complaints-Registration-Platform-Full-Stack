import express from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/register (Simple Register)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, Email, and Password are required' });
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await db.insert(users).values({
      name,
      email,
      password,
      is_verified: true,
    });

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }

  try {
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];

    if (!user || user.password !== password) {
      console.log('Login failed: Invalid credentials for', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is missing in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie - Standard settings for production cross-origin hosting
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,   // Required for cross-site cookies
      sameSite: 'none', // Required for cross-site cookies (GitHub -> Render)
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log('Login successful for', email);
    res.json({
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ loggedIn: false });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      loggedIn: true,
      id: verified.id,
      name: verified.name,
      email: verified.email,
      role: verified.role
    });
  } catch (error) {
    res.json({ loggedIn: false });
  }
});

export default router;
