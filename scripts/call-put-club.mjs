import fetch from 'node-fetch';

async function main() {
    const url = 'http://localhost:3001/api/clubs'
    const body = { id: '335e70f4-192f-4a91-ade8-e0bf1ead382f', name: 'Test update from agent', hasUpdates: 1 }
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer admin-token-placeholder' }, body: JSON.stringify(body) })
    console.log('status', res.status)
    const text = await res.text()
    console.log('body:', text)
}

main().catch(e => { console.error(e); process.exit(1) })
