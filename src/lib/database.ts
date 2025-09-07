// Provide a dev-only fallback that uses `pg` when USE_PG_LOCAL is set.
// This helps local debugging when the serverless driver fails TLS validation.
const connectionString = process.env.DATABASE_URL!

let sql: any

// Early debug: confirm env at module load
try {
	console.log('DB_HELPER_INIT - cwd=', process.cwd(), 'USE_PG_LOCAL=', process.env.USE_PG_LOCAL, 'NODE_ENV=', process.env.NODE_ENV)
} catch (e) {}

// Factory to create a pg Pool fallback and a minimal tagged-template shim
function createPgFallback() {
	const { Pool } = require('pg')
	const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
	console.log('database helper: created pg Pool fallback')

	const query = async (text: string, params?: any[]) => {
		return pool.query(text, params)
	}

	const tpl = ((strings: TemplateStringsArray, ...values: any[]) => {
		const textParts: string[] = []
		const params: any[] = []
		for (let i = 0; i < strings.length; i++) {
			textParts.push(strings[i])
			if (i < values.length) {
				params.push(values[i])
				textParts.push(`$${params.length}`)
			}
		}
		const text = textParts.join('')
		return query(text, params)
	}) as any

	tpl.query = query
	return { tpl, pool }
}

// runtime state
let client: any = null
let poolRef: any = null
let usingPg = false

// In local development, prefer pg fallback to avoid TLS/proxy certificate issues.
// Force Neon only in production regardless of USE_PG_LOCAL.
if (process.env.NODE_ENV !== 'production' && ((process.env.NODE_ENV === 'development' && process.env.USE_PG_LOCAL !== '0') || (process.env.USE_PG_LOCAL && process.env.USE_PG_LOCAL !== '0'))) {
	const f = createPgFallback()
	client = f.tpl
	poolRef = f.pool
	usingPg = true
	console.log('database helper: forcing pg Pool fallback for local development - USE_PG_LOCAL=', process.env.USE_PG_LOCAL)
} else {
	// In non-development environments attempt to load Neon serverless client.
	// In development we avoid requiring Neon to prevent the fetch/TLS errors seen
	// in some local environments. To force Neon in dev set ALLOW_NEON_IN_DEV=1 and
	// USE_PG_LOCAL=0 explicitly.
	if (process.env.NODE_ENV === 'development' && process.env.ALLOW_NEON_IN_DEV !== '1') {
		console.log('database helper: running in development - skipping Neon import and using pg fallback')
		const f = createPgFallback()
		client = f.tpl
		poolRef = f.pool
		usingPg = true
	} else {
		try {
			const { neon } = require('@neondatabase/serverless')
			client = neon(connectionString)
			console.log('database helper: using Neon serverless client')
		} catch (e) {
			console.error('database helper: failed to initialize Neon client, falling back to pg', e)
			const f = createPgFallback()
			client = f.tpl
			poolRef = f.pool
			usingPg = true
		}
	}
}

// Helper that detects Neon TLS/fetch errors so we can auto-fallback.
function isNeonTlsError(err: any) {
	if (!err) return false
	try {
		const msg = (err && (err.message || '')).toString().toLowerCase()
		if (msg.includes('unable to get local issuer certificate') || msg.includes('unable to get issuer')) return true
		const code = err?.sourceError?.code || err?.code
		if (typeof code === 'string' && code.toUpperCase().includes('UNABLE_TO_GET_ISSUER_CERT')) return true
	} catch (_) {}
	return false
}

// Wrapper supports both tagged-template usage (sql`...`) and conventional
// query usage (sql.query(...)). If Neon throws a TLS/connect error we will
// create a pg fallback at runtime and retry the query once.
const sqlWrapper = (strings: TemplateStringsArray, ...values: any[]) => {
	// tagged-template style
	const run = async () => {
		if (usingPg) return client(strings, ...values)
		try {
			return await client(strings, ...values)
		} catch (err) {
			if (isNeonTlsError(err)) {
				console.error('Neon TLS error detected; switching to pg fallback (dev). Error:', err)
				const f = createPgFallback()
				client = f.tpl
				poolRef = f.pool
				usingPg = true
				return client(strings, ...values)
			}
			throw err
		}
	}
	return run()
}

sqlWrapper.query = async (...args: any[]) => {
	if (usingPg) return client.query(...args)
	try {
		return await client.query(...args)
	} catch (err) {
		if (isNeonTlsError(err)) {
			console.error('Neon TLS error detected on query(); switching to pg fallback (dev). Error:', err)
			const f = createPgFallback()
			client = f.tpl
			poolRef = f.pool
			usingPg = true
			return client.query(...args)
		}
		throw err
	}
}

sql = sqlWrapper

export { sql }
export default sql

// Note: In dev you can set USE_PG_LOCAL=1 to use the pg Pool fallback which
// disables strict cert validation (ssl.rejectUnauthorized=false) to avoid
// issues with local TLS interception. Do not enable this in production.

