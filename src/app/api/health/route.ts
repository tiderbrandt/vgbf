import { NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET() {
  try {
    const start = Date.now()
    await sql`SELECT 1 as ok`
    const ms = Date.now() - start
    return NextResponse.json({ status: 'ok', db: true, latencyMs: ms })
  } catch (e:any) {
    return NextResponse.json({ status: 'error', db: false, error: e?.message }, { status: 500 })
  }
}
