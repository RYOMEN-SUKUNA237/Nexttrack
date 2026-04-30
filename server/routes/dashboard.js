const express = require('express');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalPets, activeTransports, delivered, paused,
      totalHandlers, pendingTransports, reviews, quotes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM pets'),
      pool.query("SELECT COUNT(*) FROM shipments WHERE status IN ('in-transit','out-for-delivery','picked-up')"),
      pool.query("SELECT COUNT(*) FROM shipments WHERE status = 'delivered'"),
      pool.query("SELECT COUNT(*) FROM shipments WHERE is_paused = TRUE"),
      pool.query("SELECT COUNT(*) FROM couriers WHERE status != 'inactive'"),
      pool.query("SELECT COUNT(*) FROM shipments WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM reviews WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM quotes WHERE status = 'pending'"),
    ]);

    const { rows: recentTransports } = await pool.query(`
      SELECT s.tracking_id, s.status, s.origin, s.destination, s.estimated_delivery, s.cargo_type,
             s.is_paused, p.name as pet_name, p.species, p.breed, p.photo_url
      FROM shipments s
      LEFT JOIN pets p ON s.pet_id = p.pet_id
      ORDER BY s.created_at DESC LIMIT 6
    `);

    const { rows: speciesBreakdown } = await pool.query(`
      SELECT species, COUNT(*) as count FROM pets GROUP BY species ORDER BY count DESC
    `);

    const { rows: notifications } = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10'
    );

    res.json({
      stats: {
        totalPets: parseInt(totalPets.rows[0].count),
        activeTransports: parseInt(activeTransports.rows[0].count),
        delivered: parseInt(delivered.rows[0].count),
        paused: parseInt(paused.rows[0].count),
        totalHandlers: parseInt(totalHandlers.rows[0].count),
        pendingTransports: parseInt(pendingTransports.rows[0].count),
        pendingReviews: parseInt(reviews.rows[0].count),
        pendingQuotes: parseInt(quotes.rows[0].count),
      },
      recentTransports,
      speciesBreakdown,
      notifications,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/dashboard/active-map — Active transports for map
router.get('/active-map', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.tracking_id, s.status, s.origin, s.destination,
             s.origin_lat, s.origin_lng, s.dest_lat, s.dest_lng,
             s.current_lat, s.current_lng, s.is_paused, s.cargo_type, s.transport_type,
             p.name as pet_name, p.species, p.breed
      FROM shipments s
      LEFT JOIN pets p ON s.pet_id = p.pet_id
      WHERE s.status IN ('in-transit','out-for-delivery','picked-up')
    `);
    res.json({ transports: rows });
  } catch (err) {
    console.error('Active map error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/dashboard/notifications/:id/read
router.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
