import sql from '../src/lib/database.js'

async function main() {
    console.log('DATABASE_URL:', !!process.env.DATABASE_URL);
    try {
        console.log('Running simple query...');
        // Support both tagged-template and query() call styles
        let res
        if (typeof sql === 'function') {
            // tagged-template style
            res = await sql`select 1 as ok`
        } else if (sql && typeof sql.query === 'function') {
            res = await sql.query('select 1 as ok')
        } else {
            throw new Error('No usable sql client available')
        }
        console.log('Query result:', res?.rows ?? res);
    } catch (e) {
        console.error('Query failed:', e);
        if (e && e.sourceError) console.error('sourceError:', e.sourceError);
        process.exitCode = 2;
    }
}

main();
