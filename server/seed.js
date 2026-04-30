const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seed() {
  console.log('🐾 Seeding Next Track database...\n');

  // ─── DROP OLD TABLES ──────────────────────────────────────────────
  await pool.query(`
    DROP TABLE IF EXISTS tracking_history CASCADE;
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS shipments CASCADE;
    DROP TABLE IF EXISTS pets CASCADE;
    DROP TABLE IF EXISTS couriers CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS conversations CASCADE;
    DROP TABLE IF EXISTS messages CASCADE;
    DROP TABLE IF EXISTS quotes CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS email_drafts CASCADE;
    DROP TABLE IF EXISTS tracking_subscriptions CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  console.log('✅ Old tables dropped.');

  // ─── CREATE TABLES ────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      phone VARCHAR(30),
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS couriers (
      id SERIAL PRIMARY KEY,
      courier_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(30),
      vehicle_type VARCHAR(30),
      license_plate VARCHAR(30),
      zone VARCHAR(100),
      status VARCHAR(20) DEFAULT 'active',
      total_deliveries INT DEFAULT 0,
      rating DECIMAL(2,1) DEFAULT 5.0,
      avatar TEXT,
      specialization VARCHAR(100),
      certified_species TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      customer_id VARCHAR(20) UNIQUE NOT NULL,
      company_name VARCHAR(200),
      contact_name VARCHAR(100) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(30),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(50),
      country VARCHAR(50) DEFAULT 'US',
      postal_code VARCHAR(20),
      type VARCHAR(20) DEFAULT 'individual',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pets (
      id SERIAL PRIMARY KEY,
      pet_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      species VARCHAR(50) NOT NULL,
      breed VARCHAR(100),
      age VARCHAR(30),
      weight VARCHAR(20),
      color VARCHAR(50),
      gender VARCHAR(20),
      microchip_id VARCHAR(50),
      vaccination_status VARCHAR(30) DEFAULT 'up-to-date',
      vaccination_notes TEXT,
      health_status VARCHAR(30) DEFAULT 'healthy',
      health_notes TEXT,
      temperament VARCHAR(50),
      diet_info TEXT,
      special_needs TEXT,
      crate_type VARCHAR(50),
      crate_size VARCHAR(30),
      owner_name VARCHAR(100),
      owner_email VARCHAR(255),
      owner_phone VARCHAR(30),
      vet_name VARCHAR(100),
      vet_phone VARCHAR(30),
      vet_clearance BOOLEAN DEFAULT FALSE,
      photo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id SERIAL PRIMARY KEY,
      tracking_id VARCHAR(20) UNIQUE NOT NULL,
      pet_id VARCHAR(20) REFERENCES pets(pet_id) ON DELETE SET NULL,
      sender_name VARCHAR(100),
      sender_email VARCHAR(255),
      sender_phone VARCHAR(30),
      receiver_name VARCHAR(100),
      receiver_email VARCHAR(255),
      receiver_phone VARCHAR(30),
      origin VARCHAR(200),
      destination VARCHAR(200),
      origin_lat DECIMAL(10,6),
      origin_lng DECIMAL(10,6),
      dest_lat DECIMAL(10,6),
      dest_lng DECIMAL(10,6),
      current_lat DECIMAL(10,6),
      current_lng DECIMAL(10,6),
      status VARCHAR(30) DEFAULT 'pending',
      courier_id VARCHAR(20),
      customer_id VARCHAR(20),
      transport_type VARCHAR(30) DEFAULT 'road',
      cargo_type VARCHAR(50) DEFAULT 'Pet',
      weight VARCHAR(20),
      dimensions VARCHAR(50),
      description TEXT,
      special_instructions TEXT,
      progress INT DEFAULT 0,
      is_paused BOOLEAN DEFAULT FALSE,
      pause_category VARCHAR(50),
      pause_reason TEXT,
      paused_at TIMESTAMPTZ,
      total_paused_ms BIGINT DEFAULT 0,
      estimated_delivery DATE,
      actual_delivery DATE,
      departed_at TIMESTAMPTZ,
      route_data TEXT,
      transport_modes TEXT,
      route_distance VARCHAR(50),
      route_duration VARCHAR(50),
      route_summary TEXT,
      comfort_check_interval INT DEFAULT 120,
      last_comfort_check TIMESTAMPTZ,
      temperature_controlled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tracking_history (
      id SERIAL PRIMARY KEY,
      shipment_id INT REFERENCES shipments(id) ON DELETE CASCADE,
      tracking_id VARCHAR(20),
      status VARCHAR(30),
      location VARCHAR(200),
      lat DECIMAL(10,6),
      lng DECIMAL(10,6),
      notes TEXT,
      updated_by VARCHAR(50),
      pet_status VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200),
      message TEXT,
      type VARCHAR(20) DEFAULT 'info',
      link VARCHAR(200),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      visitor_id VARCHAR(100),
      visitor_name VARCHAR(100),
      visitor_email VARCHAR(255),
      subject VARCHAR(200),
      status VARCHAR(20) DEFAULT 'open',
      unread_count INT DEFAULT 0,
      last_message_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
      sender_type VARCHAR(20) DEFAULT 'visitor',
      sender_name VARCHAR(100),
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100),
      company VARCHAR(200),
      email VARCHAR(255),
      phone VARCHAR(30),
      service_type VARCHAR(100),
      details TEXT,
      status VARCHAR(20) DEFAULT 'new',
      admin_notes TEXT,
      processed_by VARCHAR(100),
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      role VARCHAR(200) DEFAULT 'Verified Customer',
      avatar TEXT,
      text TEXT NOT NULL,
      rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
      status VARCHAR(20) DEFAULT 'pending',
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      approved_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS email_drafts (
      id SERIAL PRIMARY KEY,
      recipient_email VARCHAR(255),
      recipient_name VARCHAR(100),
      subject VARCHAR(300),
      html_body TEXT,
      text_body TEXT,
      status VARCHAR(20) DEFAULT 'draft',
      tracking_id VARCHAR(20),
      type VARCHAR(30) DEFAULT 'general',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      sent_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS tracking_subscriptions (
      id SERIAL PRIMARY KEY,
      tracking_id VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(tracking_id, email)
    );
  `);
  console.log('✅ Tables created.');

  // ─── ADMIN USER ────────────────────────────────────────────────────
  const hash = await bcrypt.hash('admin123', 12);
  await pool.query(
    'INSERT INTO users (username, email, password, full_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6)',
    ['admin', 'admin@Next Track.com', hash, 'Next Track Admin', '+1 (800) 555-PAWS', 'admin']
  );
  console.log('✅ Admin user created (username: admin, password: admin123)');

  // ─── COURIERS (Handlers) ──────────────────────────────────────────
  const couriers = [
    ['PT-HDL-7X92KP', 'Marcus Rivera', 'marcus@Next Track.com', '+1 555-0101', 'climate-van', 'TX-4821-MR', 'Southeast Region', 'active', 245, 4.9, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&fit=crop&w=100&q=80', 'Large Animals', 'dogs,cats,horses'],
    ['PT-HDL-3B81NQ', 'Sofia Chen', 'sofia@Next Track.com', '+1 555-0102', 'pet-van', 'TX-1192-SC', 'Northeast Region', 'active', 378, 4.8, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&fit=crop&w=100&q=80', 'Small Animals & Exotics', 'cats,birds,reptiles,small-mammals'],
    ['PT-HDL-9D44RL', 'Emily Nguyen', 'emily@Next Track.com', '+1 555-0103', 'air-cargo', 'N/A', 'West Coast', 'on-delivery', 156, 4.7, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&fit=crop&w=100&q=80', 'Air Transport Specialist', 'dogs,cats,birds'],
    ['PT-HDL-5F27WT', 'David Okafor', 'david@Next Track.com', '+1 555-0104', 'livestock-truck', 'TX-6654-DO', 'Midwest Region', 'active', 512, 4.9, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=jpg&fit=crop&w=100&q=80', 'Livestock & Equine', 'horses,cattle,livestock'],
    ['PT-HDL-2H65YM', 'Sarah Williams', 'sarah@Next Track.com', '+1 555-0105', 'pet-van', 'TX-3347-SW', 'Central Region', 'on-break', 89, 4.6, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&fit=crop&w=100&q=80', 'Domestic Pets', 'dogs,cats,small-mammals'],
  ];
  for (const c of couriers) {
    await pool.query(
      'INSERT INTO couriers (courier_id, name, email, phone, vehicle_type, license_plate, zone, status, total_deliveries, rating, avatar, specialization, certified_species) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)', c
    );
  }
  console.log(`✅ ${couriers.length} handlers created.`);

  // ─── CUSTOMERS ─────────────────────────────────────────────────────
  const customers = [
    ['PT-OWN-TX8801', null, 'Jennifer Adams', 'jennifer@email.com', '+1 555-2001', '500 Oak Lane', 'Houston', 'TX', 'US', '77001', 'individual'],
    ['PT-OWN-NY3302', 'Happy Tails Rescue', 'Dr. Sarah Lin', 'sarah@happytails.org', '+1 555-2002', '200 Rescue Blvd', 'New York', 'NY', 'US', '10001', 'business'],
    ['PT-OWN-MI4403', 'Midwest Breeders Co.', 'Mike Torres', 'mike@midwestbreeders.com', '+1 555-2003', '800 Farm Ave', 'Detroit', 'MI', 'US', '48201', 'business'],
    ['PT-OWN-FL5504', null, 'Lisa Morgan', 'lisa.morgan@email.com', '+1 555-2004', '45 Palm Street', 'Miami', 'FL', 'US', '33101', 'individual'],
    ['PT-OWN-CA7706', 'Pacific Pet Relocation', 'Anna Perez', 'anna@pacificpet.com', '+1 555-2006', '90 Market St', 'San Francisco', 'CA', 'US', '94101', 'business'],
  ];
  for (const c of customers) {
    await pool.query(
      'INSERT INTO customers (customer_id, company_name, contact_name, email, phone, address, city, state, country, postal_code, type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', c
    );
  }
  console.log(`✅ ${customers.length} customers created.`);

  // ─── PETS ─────────────────────────────────────────────────────────
  const pets = [
    ['PT-PET-001', 'Buddy', 'Dog', 'Golden Retriever', '3 years', '32 kg', 'Golden', 'Male', 'MC-98765432', 'up-to-date', 'Rabies, DHPP, Bordetella current', 'healthy', null, 'Friendly & Calm', 'Premium kibble twice daily', null, 'IATA-compliant crate', 'Large', 'Jennifer Adams', 'jennifer@email.com', '+1 555-2001', 'Dr. Smith', '+1 555-9001', true, 'https://images.unsplash.com/photo-1552053831-71594a27632d?fm=jpg&fit=crop&w=400&q=80'],
    ['PT-PET-002', 'Luna', 'Cat', 'Persian', '2 years', '4.5 kg', 'White', 'Female', 'MC-12345678', 'up-to-date', 'FVRCP, Rabies current', 'healthy', null, 'Shy but gentle', 'Wet food, grain-free', 'Needs quiet environment', 'Soft carrier', 'Medium', 'Lisa Morgan', 'lisa.morgan@email.com', '+1 555-2004', 'Dr. Patel', '+1 555-9002', true, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?fm=jpg&fit=crop&w=400&q=80'],
    ['PT-PET-003', 'Thunder', 'Horse', 'Arabian', '7 years', '450 kg', 'Bay', 'Stallion', 'MC-55667788', 'up-to-date', 'EWT, Rabies, Influenza', 'healthy', null, 'Spirited but trained', 'Hay, grain mix, supplements', 'Needs regular exercise stops', 'Horse trailer stall', 'Extra Large', 'Mike Torres', 'mike@midwestbreeders.com', '+1 555-2003', 'Dr. Equine Vet', '+1 555-9003', true, 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fm=jpg&fit=crop&w=400&q=80'],
    ['PT-PET-004', 'Mango', 'Bird', 'African Grey Parrot', '5 years', '0.5 kg', 'Grey', 'Unknown', 'BAND-AG-2020', 'up-to-date', 'PBFD, Polyoma tested negative', 'healthy', null, 'Talkative, social', 'Seeds, pellets, fresh fruit', 'Temperature sensitive - keep 20-26°C', 'Bird travel cage', 'Small', 'Anna Perez', 'anna@pacificpet.com', '+1 555-2006', 'Dr. Avian Care', '+1 555-9004', true, 'https://images.unsplash.com/photo-1544923246-77307dd270b1?fm=jpg&fit=crop&w=400&q=80'],
    ['PT-PET-005', 'Rex', 'Reptile', 'Ball Python', '4 years', '1.8 kg', 'Brown/Tan', 'Male', null, 'not-required', 'No vaccinations needed', 'healthy', null, 'Docile', 'Frozen/thawed mice weekly', 'Needs heat pack in crate, temp 27-32°C', 'Reptile shipping box', 'Small', 'Dr. Sarah Lin', 'sarah@happytails.org', '+1 555-2002', 'Dr. Herp Vet', '+1 555-9005', true, 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?fm=jpg&fit=crop&w=400&q=80'],
    ['PT-PET-006', 'Cinnamon', 'Small Mammal', 'Holland Lop Rabbit', '1 year', '1.5 kg', 'Brown', 'Female', null, 'up-to-date', 'RHDV2 vaccinated', 'healthy', null, 'Curious & active', 'Timothy hay, pellets, vegetables', 'Stress-sensitive, keep calm environment', 'Small pet carrier', 'Small', 'Jennifer Adams', 'jennifer@email.com', '+1 555-2001', 'Dr. Smith', '+1 555-9001', true, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fm=jpg&fit=crop&w=400&q=80'],
  ];
  for (const p of pets) {
    await pool.query(
      `INSERT INTO pets (pet_id, name, species, breed, age, weight, color, gender, microchip_id, vaccination_status, vaccination_notes, health_status, health_notes, temperament, diet_info, special_needs, crate_type, crate_size, owner_name, owner_email, owner_phone, vet_name, vet_phone, vet_clearance, photo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`, p
    );
  }
  console.log(`✅ ${pets.length} pets created.`);

  // ─── SHIPMENTS ─────────────────────────────────────────────────────
  const now = Date.now();
  const hours = (h) => h * 3600000;
  const days = (d) => d * 86400000;

  const shipments = [
    ['PT-8842-X9', 'PT-PET-001', 'Jennifer Adams', 'jennifer@email.com', '+1 555-2001', 'Dr. Sarah Lin', 'sarah@happytails.org', '+1 555-2002', 'Houston, TX', 'New York, NY', 29.7604, -95.3698, 40.7128, -74.006, 'in-transit', 'PT-HDL-7X92KP', 'PT-OWN-TX8801', 'road', 'Pet', '32 kg', '120x80x90 cm', 'Golden Retriever - Buddy', 'Comfort stop every 4 hours, needs water access', 0, false, new Date(now + days(2)).toISOString().split('T')[0], new Date(now - hours(18)).toISOString()],
    ['PT-3291-K4', 'PT-PET-002', 'Lisa Morgan', 'lisa.morgan@email.com', '+1 555-2004', 'Jennifer Adams', 'jennifer@email.com', '+1 555-2001', 'Miami, FL', 'Houston, TX', 25.7617, -80.1918, 29.7604, -95.3698, 'out-for-delivery', 'PT-HDL-3B81NQ', 'PT-OWN-FL5504', 'road', 'Pet', '4.5 kg', '45x30x30 cm', 'Persian Cat - Luna', 'Keep carrier covered, quiet environment', 0, false, new Date(now + hours(6)).toISOString().split('T')[0], new Date(now - hours(24)).toISOString()],
    ['PT-5510-A2', 'PT-PET-003', 'Mike Torres', 'mike@midwestbreeders.com', '+1 555-2003', 'Pacific Pet Relocation', 'anna@pacificpet.com', '+1 555-2006', 'Detroit, MI', 'San Francisco, CA', 42.3314, -83.0458, 37.7749, -122.4194, 'picked-up', 'PT-HDL-5F27WT', 'PT-OWN-MI4403', 'road', 'Livestock', '450 kg', 'Horse trailer', 'Arabian Horse - Thunder', 'Exercise stops every 6 hours, fresh water', 0, false, new Date(now + days(4)).toISOString().split('T')[0], new Date(now - hours(4)).toISOString()],
    ['PT-7723-M6', 'PT-PET-004', 'Anna Perez', 'anna@pacificpet.com', '+1 555-2006', 'Lisa Morgan', 'lisa.morgan@email.com', '+1 555-2004', 'San Francisco, CA', 'Miami, FL', 37.7749, -122.4194, 25.7617, -80.1918, 'pending', null, 'PT-OWN-CA7706', 'air', 'Pet', '0.5 kg', '30x20x20 cm', 'African Grey Parrot - Mango', 'Temperature controlled 20-26°C, cover at night', 0, false, new Date(now + days(3)).toISOString().split('T')[0], null],
    ['PT-6645-Z1', 'PT-PET-005', 'Dr. Sarah Lin', 'sarah@happytails.org', '+1 555-2002', 'Mike Torres', 'mike@midwestbreeders.com', '+1 555-2003', 'New York, NY', 'Detroit, MI', 40.7128, -74.006, 42.3314, -83.0458, 'paused', 'PT-HDL-9D44RL', 'PT-OWN-NY3302', 'road', 'Exotic', '1.8 kg', '40x25x15 cm', 'Ball Python - Rex', 'Heat pack required, temp 27-32°C', 0, true, new Date(now + days(1.5)).toISOString().split('T')[0], new Date(now - hours(12)).toISOString()],
    ['PT-1198-B7', 'PT-PET-006', 'Jennifer Adams', 'jennifer@email.com', '+1 555-2001', 'Anna Perez', 'anna@pacificpet.com', '+1 555-2006', 'Houston, TX', 'San Francisco, CA', 29.7604, -95.3698, 37.7749, -122.4194, 'delivered', 'PT-HDL-2H65YM', 'PT-OWN-TX8801', 'air', 'Pet', '1.5 kg', '35x25x25 cm', 'Holland Lop Rabbit - Cinnamon', 'Stress-sensitive, keep calm', 100, false, new Date(now - days(1)).toISOString().split('T')[0], new Date(now - days(3)).toISOString()],
  ];

  for (const s of shipments) {
    await pool.query(`
      INSERT INTO shipments (tracking_id, pet_id, sender_name, sender_email, sender_phone, receiver_name, receiver_email, receiver_phone, origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, status, courier_id, customer_id, transport_type, cargo_type, weight, dimensions, description, special_instructions, progress, is_paused, estimated_delivery, departed_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
    `, s);
  }

  // Set paused_at for the paused shipment
  await pool.query('UPDATE shipments SET paused_at = $1, pause_category = $2, pause_reason = $3 WHERE tracking_id = $4',
    [new Date(now - hours(2)).toISOString(), 'Vet Hold', 'Awaiting veterinary health certificate for interstate transport', 'PT-6645-Z1']);
  console.log(`✅ ${shipments.length} transports created.`);

  // Add tracking history
  const { rows: allShipments } = await pool.query('SELECT * FROM shipments');
  for (const s of allShipments) {
    await pool.query(
      'INSERT INTO tracking_history (shipment_id, tracking_id, status, location, notes, updated_by, pet_status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [s.id, s.tracking_id, 'pending', s.origin, 'Transport request created. Pet intake scheduled.', 'admin', 'healthy']
    );
    if (s.status !== 'pending') {
      await pool.query(
        'INSERT INTO tracking_history (shipment_id, tracking_id, status, location, notes, updated_by, pet_status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [s.id, s.tracking_id, 'picked-up', s.origin, 'Pet picked up by handler. Health check passed.', 'admin', 'healthy']
      );
    }
    if (['in-transit', 'out-for-delivery', 'delivered', 'paused'].includes(s.status)) {
      await pool.query(
        'INSERT INTO tracking_history (shipment_id, tracking_id, status, location, notes, updated_by, pet_status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [s.id, s.tracking_id, 'in-transit', 'En Route', 'Pet is in transit. Last comfort check: all good.', 'admin', 'comfortable']
      );
    }
    if (s.status === 'out-for-delivery') {
      await pool.query(
        'INSERT INTO tracking_history (shipment_id, tracking_id, status, location, notes, updated_by, pet_status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [s.id, s.tracking_id, 'out-for-delivery', s.destination, 'Almost there! Pet is comfortable and calm.', 'admin', 'comfortable']
      );
    }
    if (s.status === 'delivered') {
      await pool.query(
        'INSERT INTO tracking_history (shipment_id, tracking_id, status, location, notes, updated_by, pet_status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [s.id, s.tracking_id, 'delivered', s.destination, 'Pet delivered safely! Happy reunion with new family.', 'admin', 'healthy']
      );
    }
    if (s.status === 'paused') {
      await pool.query(
        'INSERT INTO tracking_history (shipment_id, tracking_id, status, location, notes, updated_by, pet_status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [s.id, s.tracking_id, 'paused', 'En Route', 'Transport paused — awaiting vet health certificate.', 'admin', 'healthy']
      );
    }
  }
  console.log('✅ Tracking history created.');

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────
  const notifs = [
    ['Handler Marcus picked up Buddy (PT-8842-X9)', 'Golden Retriever transport now in transit to New York.', 'info'],
    ['Luna (PT-3291-K4) out for delivery', 'Persian cat being delivered to Houston. Owner notified.', 'info'],
    ['Transport PT-6645-Z1 PAUSED', 'Ball Python Rex — awaiting vet health certificate.', 'warning'],
    ['Cinnamon (PT-1198-B7) delivered safely!', 'Holland Lop Rabbit arrived safely in San Francisco.', 'success'],
    ['New pet registered: Mango', 'African Grey Parrot added to system by Pacific Pet Relocation.', 'info'],
  ];
  for (const n of notifs) {
    await pool.query('INSERT INTO notifications (title, message, type) VALUES ($1, $2, $3)', n);
  }
  console.log(`✅ ${notifs.length} notifications created.`);

  console.log('\n🎉 Next Track database seeded successfully!');
  console.log('──────────────────────────────────────');
  console.log('Admin Login:  username: admin  |  password: admin123');
  console.log('──────────────────────────────────────\n');

  await pool.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
