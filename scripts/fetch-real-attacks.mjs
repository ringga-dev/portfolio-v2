#!/usr/bin/env node
// Tarik data insiden siber NYATA dari sumber publik, normalisasi ke satu JSON
// statis untuk dipakai halaman /siber/ di GitHub Pages.
// Tidak ada API key. Tidak ada data rekaan. Jika sumber gagal, script gagal
// (workflow tidak menimpa snapshot terakhir dengan data kosong).

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'data', 'threats.json')
const CENTROIDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/country-centroids.json'), 'utf8'))

// tambahan negara kecil yang tidak ada di Natural Earth 110m
const EXTRA = {
  SG: [1.35, 103.82], HK: [22.32, 114.17], TW: [23.7, 120.96],
  IL: [31.47, 34.85], AE: [23.87, 54.21], QA: [25.35, 51.18],
}
const coord = Object.assign({}, CENTROIDS, EXTRA)

const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; portfolio-siber/1.0)' }
async function getJSON(url, timeout = 30000) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeout)
  try {
    const r = await fetch(url, { headers: UA, signal: ctl.signal })
    if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`)
    return await r.json()
  } finally { clearTimeout(t) }
}

// Grup ransomware paling aktif — sumber: ransomware.live, bukan rekaan.
// Digunakan hanya sebagai warna kategori, bukan klaim asal negara pelaku.
const HIGH = ['LockBit', 'BlackCat', 'ALPHV', 'Cl0p', 'Akira', 'Play', 'Royal', 'Cactus', 'Medusa']

function isoNormalise(c) {
  if (!c || typeof c !== 'string') return ''
  const s = c.trim().toUpperCase()
  if (s === 'UK') return 'GB'
  if (s === 'US' || /^UNITED STATES/.test(s)) return 'US'
  if (s.length === 2 && /^[A-Z]{2}$/.test(s)) return s
  return ''
}

async function ransomwareLive() {
  const raw = await getJSON('https://api.ransomware.live/v1/recentvictims')
  if (!Array.isArray(raw)) throw new Error('ransomware.live: respons bukan array')
  return raw.map((v, i) => {
    const iso = isoNormalise(v.country)
    const c = coord[iso]
    return {
      id: `rl-${i}-${(v.discovered || '').slice(0, 10)}`,
      kind: 'ransomware',
      source: 'ransomware.live',
      sourceUrl: 'https://www.ransomware.live/',
      victim: v.post_title || '(nama tidak dipublikasikan)',
      group: v.group_name || 'tidak diketahui',
      sector: v.activity || '',
      country: iso || (v.country || ''),
      lat: c ? c[0] : null,
      lon: c ? c[1] : null,
      discovered: v.discovered || null,
      published: v.published || null,
      description: (v.description || '').slice(0, 500),
      website: v.website || '',
      dataSize: v.data_size || null,
      weight: HIGH.some(g => (v.group_name || '').toLowerCase().includes(g.toLowerCase())) ? 2 : 1,
    }
  }).filter(e => e.lat != null && e.lon != null)
}

async function main() {
  const events = await ransomwareLive()
  if (!events.length) throw new Error('tidak ada event dengan koordinat valid — snapshot lama dipertahankan')
  events.sort((a, b) => new Date(b.discovered || 0) - new Date(a.discovered || 0))
  const payload = {
    fetchedAt: new Date().toISOString(),
    sources: [{
      name: 'ransomware.live',
      url: 'https://www.ransomware.live/',
      endpoint: 'https://api.ransomware.live/v1/recentvictims',
      note: 'Korban ransomware yang dipublikasikan pelaku. Negara korban dari feed; koordinat dari Natural Earth 110m.',
    }],
    count: events.length,
    events,
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(payload))
  console.log(`fetch-real-attacks: OK — ${events.length} insiden nyata -> ${path.relative(ROOT, OUT)}`)
  console.log(`  terbaru: ${events[0].discovered} ${events[0].victim} (${events[0].country})`)
}

main().catch(e => { console.error('fetch-real-attacks: FAILED —', e.message); process.exit(1) })
