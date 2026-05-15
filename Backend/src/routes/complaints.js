import express from 'express';
import { db } from '../db/index.js';
import { complaints, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/complaints (Submit Feedback)
router.post('/', authenticateToken, async (req, res) => {
  const { 
    district,
    police_station,
    service_type, 
    rating_behavior, 
    rating_time, 
    rating_cleanliness, 
    is_corruption_free, 
    complaint_text 
  } = req.body;

  if (!district || !police_station || !service_type || !complaint_text) {
    return res.status(400).json({ error: 'District, Police Station, Service type, and detailed opinion are required' });
  }

  try {
    console.log('Inserting feedback for user:', req.user.id);
    await db.insert(complaints).values({
      user_id: req.user.id,
      district: String(district),
      police_station: String(police_station),
      service_type: String(service_type),
      rating_behavior: Number(rating_behavior) || 0,
      rating_time: Number(rating_time) || 0,
      rating_cleanliness: Number(rating_cleanliness) || 0,
      is_corruption_free: Boolean(is_corruption_free),
      complaint_text: String(complaint_text),
    });

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: `Database Error: ${error.message}` });
  }
});

// GET /api/complaints/my
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userComplaints = await db.select()
      .from(complaints)
      .where(eq(complaints.user_id, req.user.id))
      .orderBy(desc(complaints.created_at));
    
    res.json(userComplaints);
  } catch (error) {
    console.error('Fetch user complaints error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Router
export const adminRouter = express.Router();

// GET /api/admin/complaints
adminRouter.get('/complaints', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const allComplaints = await db.select({
      id: complaints.id,
      userName: users.name,
      userEmail: users.email,
      district: complaints.district,
      police_station: complaints.police_station,
      service_type: complaints.service_type,
      rating_behavior: complaints.rating_behavior,
      rating_time: complaints.rating_time,
      rating_cleanliness: complaints.rating_cleanliness,
      is_corruption_free: complaints.is_corruption_free,
      complaint_text: complaints.complaint_text,
      created_at: complaints.created_at,
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.user_id, users.id))
    .orderBy(desc(complaints.created_at));
    
    res.json(allComplaints);
  } catch (error) {
    console.error('Fetch all complaints error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
