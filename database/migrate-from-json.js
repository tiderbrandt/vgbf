const { Pool } = require('pg')
const path = require('path')
const fs = require('fs')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const pool = new Pool({ connectionString })

async function ensureMappingTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS legacy_id_map (
    legacy_id TEXT PRIMARY KEY,
    table_name TEXT,
    new_id UUID NOT NULL
  )`)
}

async function saveMapping(legacyId, tableName, newId) {
  if (!legacyId) return
  try {
    await pool.query('INSERT INTO legacy_id_map(legacy_id, table_name, new_id) VALUES ($1,$2,$3) ON CONFLICT (legacy_id) DO UPDATE SET table_name=EXCLUDED.table_name, new_id=EXCLUDED.new_id', [legacyId, tableName, newId])
  } catch (err) {
    console.warn('Failed to save mapping:', err.message)
  }
}

async function getIdByUnique(table, whereClause, params) {
  try {
    const res = await pool.query(`SELECT id FROM ${table} WHERE ${whereClause} LIMIT 1`, params)
    return res.rows[0] ? res.rows[0].id : null
  } catch (err) {
    return null
  }
}

function normalizeId(id) {
  if (!id) return null
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id) ? id : null
}

async function insertClubs(clubs) {
  for (const c of clubs) {
    const id = normalizeId(c.id)
  const rawId = c.id
  if (id) {
      const q = `INSERT INTO clubs (id, name, description, location, contact_person, email, phone, website, address, postal_code, city, established, activities, facilities, training_times, member_count, membership_fee, welcomes_new_members, facebook, instagram, image_url, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description`;
      const params = [id, c.name, c.description || null, c.location || null, c.contactPerson || c.contact_person || null, c.email || null, c.phone || null, c.website || null, c.address || null, c.postalCode || c.postal_code || null, c.city || null, c.established || null, c.activities || null, c.facilities || null, JSON.stringify(c.trainingTimes || c.training_times || []), c.memberCount || c.member_count || 0, c.membershipFee || c.membership_fee || null, c.welcomesNewMembers !== undefined ? c.welcomesNewMembers : (c.welcomes_new_members !== undefined ? c.welcomes_new_members : true), c.facebook || null, c.instagram || null, c.imageUrl || c.image_url || null]
      try {
        await pool.query(q, params)
        await saveMapping(rawId, 'clubs', id)
      } catch (err) {
        console.warn('Club insert failed:', err.message)
      }
    } else {
      const q = `INSERT INTO clubs (name, description, location, contact_person, email, phone, website, address, postal_code, city, established, activities, facilities, training_times, member_count, membership_fee, welcomes_new_members, facebook, instagram, image_url, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, NOW(), NOW())
        ON CONFLICT DO NOTHING RETURNING id`;
      const params = [c.name, c.description || null, c.location || null, c.contactPerson || c.contact_person || null, c.email || null, c.phone || null, c.website || null, c.address || null, c.postalCode || c.postal_code || null, c.city || null, c.established || null, c.activities || null, c.facilities || null, JSON.stringify(c.trainingTimes || c.training_times || []), c.memberCount || c.member_count || 0, c.membershipFee || c.membership_fee || null, c.welcomesNewMembers !== undefined ? c.welcomesNewMembers : (c.welcomes_new_members !== undefined ? c.welcomes_new_members : true), c.facebook || null, c.instagram || null, c.imageUrl || c.image_url || null]
      try {
        const res = await pool.query(q, params)
        let newId = res.rows[0] ? res.rows[0].id : null
        if (!newId) newId = await getIdByUnique('clubs', 'name = $1', [c.name])
        if (newId) await saveMapping(rawId, 'clubs', newId)
      } catch (err) {
        console.warn('Club insert failed (no id):', err.message)
      }
    }
  }
}

async function insertNews(news) {
  for (const n of news) {
    const id = normalizeId(n.id)
  const rawId = n.id
  if (id) {
      const q = `INSERT INTO news (id, title, content, excerpt, author, image_url, published_at, is_published, tags, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title`;
      const params = [id, n.title, n.content || null, n.excerpt || null, n.author || null, n.imageUrl || n.image_url || null, n.date || n.published_at || null, n.featured !== undefined ? n.featured : (n.is_published !== undefined ? n.is_published : true), n.tags || null]
      try { await pool.query(q, params); await saveMapping(rawId, 'news', id) } catch (err) { console.warn('News insert failed:', err.message) }
    } else {
      const q = `INSERT INTO news (title, content, excerpt, author, image_url, published_at, is_published, tags, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) ON CONFLICT DO NOTHING RETURNING id`;
      const params = [n.title, n.content || null, n.excerpt || null, n.author || null, n.imageUrl || n.image_url || null, n.date || n.published_at || null, n.featured !== undefined ? n.featured : (n.is_published !== undefined ? n.is_published : true), n.tags || null]
      try { const res = await pool.query(q, params); let newId = res.rows[0] ? res.rows[0].id : null; if (!newId) newId = await getIdByUnique('news', 'title = $1', [n.title]); if (newId) await saveMapping(rawId, 'news', newId) } catch (err) { console.warn('News insert failed (no id):', err.message) }
    }
  }
}

async function insertCompetitions(comps) {
  for (const c of comps) {
  const rawId = c.id
  const id = normalizeId(rawId)
  if (id) {
      const q = `INSERT INTO competitions (id, title, description, date, location, organizer, contact_email, registration_deadline, max_participants, entry_fee, image_url, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title`;
      const params = [id, c.title, c.description || null, c.date || null, c.location || null, c.organizer || null, c.contactEmail || c.contact_email || null, c.registrationDeadline || c.registration_deadline || null, c.maxParticipants || c.max_participants || null, c.fee || c.entry_fee || null, c.imageUrl || c.image_url || null]
      try { await pool.query(q, params); await saveMapping(rawId, 'competitions', id) } catch (err) { console.warn('Competition insert failed:', err.message) }
    } else {
      const q = `INSERT INTO competitions (title, description, date, location, organizer, contact_email, registration_deadline, max_participants, entry_fee, image_url, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW()) ON CONFLICT DO NOTHING RETURNING id`;
      const params = [c.title, c.description || null, c.date || null, c.location || null, c.organizer || null, c.contactEmail || c.contact_email || null, c.registrationDeadline || c.registration_deadline || null, c.maxParticipants || c.max_participants || null, c.fee || c.entry_fee || null, c.imageUrl || c.image_url || null]
      try { const res = await pool.query(q, params); let newId = res.rows[0] ? res.rows[0].id : null; if (!newId) newId = await getIdByUnique('competitions', 'title = $1', [c.title]); if (newId) await saveMapping(rawId, 'competitions', newId) } catch (err) { console.warn('Competition insert failed (no id):', err.message) }
    }
  }
}

async function insertRecords(records) {
  for (const r of records) {
  const rawId = r.id
  const id = normalizeId(rawId)
  if (id) {
      const q = `INSERT INTO records (id, category, discipline, distance, gender, age_group, record_holder, club, score, date_achieved, location, verified, notes, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET record_holder=EXCLUDED.record_holder`;
      const params = [id, r.category || null, r.class || r.discipline || null, r.distance || null, r.gender || null, r.age_group || null, r.name || r.record_holder || null, r.club || null, r.score || null, r.date || r.date_achieved || null, r.location || null, r.verified || false, r.notes || null]
      try { await pool.query(q, params); await saveMapping(rawId, 'records', id) } catch (err) { console.warn('Record insert failed:', err.message) }
    } else {
      const q = `INSERT INTO records (category, discipline, distance, gender, age_group, record_holder, club, score, date_achieved, location, verified, notes, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()) ON CONFLICT DO NOTHING RETURNING id`;
      const params = [r.category || null, r.class || r.discipline || null, r.distance || null, r.gender || null, r.age_group || null, r.name || r.record_holder || null, r.club || null, r.score || null, r.date || r.date_achieved || null, r.location || null, r.verified || false, r.notes || null]
      try { const res = await pool.query(q, params); let newId = res.rows[0] ? res.rows[0].id : null; if (!newId) newId = await getIdByUnique('records', 'category = $1 AND discipline = $2', [r.category || null, r.class || r.discipline || null]); if (newId) await saveMapping(rawId, 'records', newId) } catch (err) { console.warn('Record insert failed (no id):', err.message) }
    }
  }
}

async function insertSponsors(sp) {
  for (const s of sp) {
  const rawId = s.id
  const id = normalizeId(rawId)
  if (id) {
      const q = `INSERT INTO sponsors (id, name, logo_url, website, description, active, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`;
      const params = [id, s.name || null, s.logoUrl || s.logo_url || null, s.website || null, s.description || null, s.isActive !== undefined ? s.isActive : true]
      try { await pool.query(q, params); await saveMapping(rawId, 'sponsors', id) } catch (err) { console.warn('Sponsor insert failed:', err.message) }
    } else {
      const q = `INSERT INTO sponsors (name, logo_url, website, description, active, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) ON CONFLICT DO NOTHING RETURNING id`;
      const params = [s.name || null, s.logoUrl || s.logo_url || null, s.website || null, s.description || null, s.isActive !== undefined ? s.isActive : true]
      try { const res = await pool.query(q, params); let newId = res.rows[0] ? res.rows[0].id : null; if (!newId) newId = await getIdByUnique('sponsors', 'name = $1', [s.name]); if (newId) await saveMapping(rawId, 'sponsors', newId) } catch (err) { console.warn('Sponsor insert failed (no id):', err.message) }
    }
  }
}

async function insertCalendar(events) {
  for (const e of events) {
  const rawId = e.id
  const id = normalizeId(rawId)
  if (id) {
      const q = `INSERT INTO calendar_events (id, title, description, start_date, end_date, location, organizer, event_type, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title`;
      const params = [id, e.title || null, e.description || null, e.date || e.start_date || null, e.endDate || e.end_date || e.end_time || null, e.location || null, e.organizer || null, e.type || e.event_type || null]
    } else {
      const q = `INSERT INTO calendar_events (title, description, start_date, end_date, location, organizer, event_type, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) ON CONFLICT DO NOTHING RETURNING id`;
      const params = [e.title || null, e.description || null, e.date || e.start_date || null, e.endDate || e.end_date || e.end_time || null, e.location || null, e.organizer || null, e.type || e.event_type || null]
      try { const res = await pool.query(q, params); let newId = res.rows[0] ? res.rows[0].id : null; if (!newId) newId = await getIdByUnique('calendar_events', 'title = $1 AND start_date = $2', [e.title || null, e.date || e.start_date || null]); if (newId) await saveMapping(rawId, 'calendar_events', newId) } catch (err) { console.warn('Calendar insert failed (no id):', err.message) }
    }
  }
}

async function insertBoardMembers(members) {
  if (!members || !Array.isArray(members)) return
  for (const m of members) {
    const id = normalizeId(m.id)
    if (id) {
      const q = `INSERT INTO board_members (id, name, position, email, phone, bio, image_url, display_order, active, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`;
      const params = [id, m.name || null, m.position || null, m.email || null, m.phone || null, m.bio || null, m.imageUrl || m.image_url || null, m.displayOrder || m.display_order || null, m.active !== undefined ? m.active : true]
      try { await pool.query(q, params) } catch (err) { console.warn('Board member insert failed:', err.message) }
    } else {
      const q = `INSERT INTO board_members (name, position, email, phone, bio, image_url, display_order, active, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) ON CONFLICT DO NOTHING`;
      const params = [m.name || null, m.position || null, m.email || null, m.phone || null, m.bio || null, m.imageUrl || m.image_url || null, m.displayOrder || m.display_order || null, m.active !== undefined ? m.active : true]
      try { await pool.query(q, params) } catch (err) { console.warn('Board member insert failed (no id):', err.message) }
    }
  }
}

async function insertContactInfo(items) {
  if (!items || !Array.isArray(items)) return
  for (const it of items) {
    const id = normalizeId(it.id)
    if (id) {
      const q = `INSERT INTO contact_info (id, type, name, position, email, phone, address, postal_code, city, description, active, display_order, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`;
      const params = [id, it.type || null, it.name || null, it.position || null, it.email || null, it.phone || null, it.address || null, it.postalCode || it.postal_code || null, it.city || null, it.description || null, it.active !== undefined ? it.active : true, it.displayOrder || it.display_order || null]
      try { await pool.query(q, params) } catch (err) { console.warn('Contact info insert failed:', err.message) }
    } else {
      const q = `INSERT INTO contact_info (type, name, position, email, phone, address, postal_code, city, description, active, display_order, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()) ON CONFLICT DO NOTHING`;
      const params = [it.type || null, it.name || null, it.position || null, it.email || null, it.phone || null, it.address || null, it.postalCode || it.postal_code || null, it.city || null, it.description || null, it.active !== undefined ? it.active : true, it.displayOrder || it.display_order || null]
      try { await pool.query(q, params) } catch (err) { console.warn('Contact info insert failed (no id):', err.message) }
    }
  }
}

async function run() {
  try {
    const clubs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'clubs.json'), 'utf8'))
    const news = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'news.json'), 'utf8'))
    const comps = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'competitions.json'), 'utf8'))
    const records = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'records.json'), 'utf8'))
    const sponsors = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sponsors.json'), 'utf8'))
    const calendar = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'calendar.json'), 'utf8'))
  let boardMembers = []
  let contactInfo = []
  try { boardMembers = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'board_members.json'), 'utf8')) } catch (e) { /* optional */ }
  try { contactInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'contact_info.json'), 'utf8')) } catch (e) { /* optional */ }

  await ensureMappingTable()
  await insertClubs(clubs)
    await insertNews(news)
    await insertCompetitions(comps)
    await insertRecords(records)
    await insertSponsors(sponsors)
    await insertCalendar(calendar)
  await insertBoardMembers(boardMembers)
  await insertContactInfo(contactInfo)

    console.log('Data migration completed')
  } catch (err) {
    console.error('Data migration failed:', err)
  } finally {
    await pool.end()
  }
}

run()
