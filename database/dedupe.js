const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error('DATABASE_URL not set')
    process.exit(1)
}

const pool = new Pool({ connectionString })

async function dedupeTable(table, keyCols) {
    // keyCols: array of column names used to identify duplicates (natural key)
    const partition = keyCols.map(c => `COALESCE(${c}::text,'')`).join(" || '||' || ")
    const sql = `
  WITH groups AS (
    SELECT id, first_value(id) OVER (PARTITION BY ${partition} ORDER BY created_at) AS keeper,
           row_number() OVER (PARTITION BY ${partition} ORDER BY created_at) AS rn
    FROM ${table}
  ), to_delete AS (
    SELECT id, keeper FROM groups WHERE rn > 1
  ), deleted AS (
    DELETE FROM ${table} USING to_delete WHERE ${table}.id = to_delete.id RETURNING to_delete.id AS old_id, to_delete.keeper AS keep_id
  )
  INSERT INTO legacy_id_map(legacy_id, table_name, new_id)
  SELECT old_id, $1, keep_id FROM deleted
  ON CONFLICT (legacy_id) DO UPDATE SET table_name = EXCLUDED.table_name, new_id = EXCLUDED.new_id;
  `
    try {
        const res = await pool.query(sql, [table])
        return res.rowCount
    } catch (err) {
        console.error(`Failed dedupe ${table}:`, err.message)
        return 0
    }
}

async function run() {
    try {
        const plan = [
            { table: 'clubs', keys: ['name'] },
            { table: 'news', keys: ['title'] },
            { table: 'competitions', keys: ['title', 'date'] },
            { table: 'records', keys: ['category', 'discipline', 'date_achieved', 'record_holder'] },
            { table: 'sponsors', keys: ['name'] },
            { table: 'calendar_events', keys: ['title', 'start_date'] },
            { table: 'board_members', keys: ['name', 'position'] },
            { table: 'contact_info', keys: ['type', 'name'] }
        ]

        for (const p of plan) {
            console.log('Deduping', p.table)
            const removed = await dedupeTable(p.table, p.keys)
            console.log(`Removed ${removed} duplicate rows from ${p.table}`)
        }

        const counts = await pool.query(`SELECT table_name, count(*) FROM legacy_id_map GROUP BY table_name`)
        console.log('legacy_id_map counts:', counts.rows)
    } finally {
        await pool.end()
    }
}

run().catch(err => { console.error(err); process.exit(1) })
