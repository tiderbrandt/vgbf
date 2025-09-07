const { Pool } = require('pg')

async function run() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        console.error('DATABASE_URL not set in environment')
        process.exit(1)
    }

    const pool = new Pool({ connectionString })
    try {
        const tables = [
            'clubs',
            'news',
            'competitions',
            'records',
            'sponsors',
            'calendar_events',
            'board_members',
            'contact_info'
        ]

        for (const t of tables) {
            try {
                const cnt = await pool.query(`SELECT COUNT(*)::int AS count FROM ${t}`)
                const count = cnt.rows[0].count
                process.stdout.write(`${t}: ${count}`)
                if (count > 0) {
                    const sample = await pool.query(`SELECT * FROM ${t} LIMIT 1`)
                    process.stdout.write(' -> sample: ' + JSON.stringify(sample.rows[0]).slice(0, 400))
                }
                process.stdout.write('\n')
            } catch (err) {
                process.stdout.write(`${t}: ERROR (${err.message})\n`)
            }
        }
    } finally {
        await pool.end()
    }
}

run().catch(e => { console.error(e); process.exit(2) })
