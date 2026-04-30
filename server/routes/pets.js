const express = require('express');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/pets — List all pets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { species, health_status, search, page = 1, limit = 50 } = req.query;
    let query = 'SELECT * FROM pets WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM pets WHERE 1=1';
    const params = [];

    if (species && species !== 'all') {
      params.push(species);
      query += ` AND species = $${params.length}`;
      countQuery += ` AND species = $${params.length}`;
    }

    if (health_status && health_status !== 'all') {
      params.push(health_status);
      query += ` AND health_status = $${params.length}`;
      countQuery += ` AND health_status = $${params.length}`;
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
      const n = params.length;
      query += ` AND (pet_id ILIKE $${n-4} OR name ILIKE $${n-3} OR breed ILIKE $${n-2} OR species ILIKE $${n-1} OR owner_name ILIKE $${n})`;
      countQuery += ` AND (pet_id ILIKE $${n-4} OR name ILIKE $${n-3} OR breed ILIKE $${n-2} OR species ILIKE $${n-1} OR owner_name ILIKE $${n})`;
    }

    const { rows: countRows } = await pool.query(countQuery, params);
    const total = parseInt(countRows[0].total);

    query += ' ORDER BY created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const { rows: pets } = await pool.query(query, params);
    res.json({
      pets,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('List pets error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/pets/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pets WHERE id::text = $1 OR pet_id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Pet not found.' });
    // Also get active transports
    const { rows: transports } = await pool.query(
      "SELECT tracking_id, status, origin, destination, estimated_delivery FROM shipments WHERE pet_id = $1 ORDER BY created_at DESC LIMIT 5",
      [rows[0].pet_id]
    );
    res.json({ pet: rows[0], transports });
  } catch (err) {
    console.error('Get pet error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/pets — Create pet
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, species, breed, age, weight, color, gender, microchip_id,
      vaccination_status, vaccination_notes, health_status, health_notes,
      temperament, diet_info, special_needs, crate_type, crate_size,
      owner_name, owner_email, owner_phone, vet_name, vet_phone, vet_clearance, photo_url } = req.body;

    if (!name || !species) return res.status(400).json({ error: 'name and species are required.' });

    // Generate pet ID
    const num = Math.floor(100 + Math.random() * 900);
    const petId = `PT-PET-${num}`;

    const { rows } = await pool.query(`
      INSERT INTO pets (pet_id, name, species, breed, age, weight, color, gender, microchip_id,
        vaccination_status, vaccination_notes, health_status, health_notes,
        temperament, diet_info, special_needs, crate_type, crate_size,
        owner_name, owner_email, owner_phone, vet_name, vet_phone, vet_clearance, photo_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
      RETURNING *
    `, [petId, name, species, breed || null, age || null, weight || null, color || null, gender || null,
      microchip_id || null, vaccination_status || 'unknown', vaccination_notes || null,
      health_status || 'unknown', health_notes || null, temperament || null,
      diet_info || null, special_needs || null, crate_type || null, crate_size || null,
      owner_name || null, owner_email || null, owner_phone || null,
      vet_name || null, vet_phone || null, vet_clearance || false, photo_url || null]);

    res.status(201).json({ pet: rows[0] });
  } catch (err) {
    console.error('Create pet error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/pets/:id — Update pet
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM pets WHERE id::text = $1 OR pet_id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Pet not found.' });

    const { name, species, breed, age, weight, color, gender, microchip_id,
      vaccination_status, vaccination_notes, health_status, health_notes,
      temperament, diet_info, special_needs, crate_type, crate_size,
      owner_name, owner_email, owner_phone, vet_name, vet_phone, vet_clearance, photo_url } = req.body;

    const { rows } = await pool.query(`
      UPDATE pets SET
        name = COALESCE($1, name), species = COALESCE($2, species), breed = COALESCE($3, breed),
        age = COALESCE($4, age), weight = COALESCE($5, weight), color = COALESCE($6, color),
        gender = COALESCE($7, gender), microchip_id = COALESCE($8, microchip_id),
        vaccination_status = COALESCE($9, vaccination_status), vaccination_notes = COALESCE($10, vaccination_notes),
        health_status = COALESCE($11, health_status), health_notes = COALESCE($12, health_notes),
        temperament = COALESCE($13, temperament), diet_info = COALESCE($14, diet_info),
        special_needs = COALESCE($15, special_needs), crate_type = COALESCE($16, crate_type),
        crate_size = COALESCE($17, crate_size), owner_name = COALESCE($18, owner_name),
        owner_email = COALESCE($19, owner_email), owner_phone = COALESCE($20, owner_phone),
        vet_name = COALESCE($21, vet_name), vet_phone = COALESCE($22, vet_phone),
        vet_clearance = COALESCE($23, vet_clearance), photo_url = COALESCE($24, photo_url)
      WHERE id = $25 RETURNING *
    `, [name||null, species||null, breed||null, age||null, weight||null, color||null,
      gender||null, microchip_id||null, vaccination_status||null, vaccination_notes||null,
      health_status||null, health_notes||null, temperament||null, diet_info||null,
      special_needs||null, crate_type||null, crate_size||null, owner_name||null,
      owner_email||null, owner_phone||null, vet_name||null, vet_phone||null,
      vet_clearance != null ? vet_clearance : null, photo_url||null, existing[0].id]);

    res.json({ pet: rows[0] });
  } catch (err) {
    console.error('Update pet error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/pets/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pets WHERE id::text = $1 OR pet_id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Pet not found.' });
    await pool.query('DELETE FROM pets WHERE id = $1', [rows[0].id]);
    res.json({ message: 'Pet deleted successfully.' });
  } catch (err) {
    console.error('Delete pet error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/pets/species/list — Get unique species list
router.get('/species/list', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT species FROM pets ORDER BY species');
    res.json({ species: rows.map(r => r.species) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
