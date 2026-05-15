import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
  // Debug log to see if cookies are arriving
  console.log('--- Auth Middleware ---');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Cookies received:', req.cookies);

  const token = req.cookies.token;

  if (!token) {
    console.log('No token found in cookies');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log('Token verified for user:', verified.email);
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};
