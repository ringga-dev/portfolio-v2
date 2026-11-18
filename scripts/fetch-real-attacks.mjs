#!/usr/bin/env node
// Tarik data insiden siber NYATA dari sumber publik, normalisasi ke satu JSON
// statis untuk halaman /siber/ di GitHub Pages.
// Keyless. Tidak ada data rekaan. Ransomware wajib sukses; DShield opsional.

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'data', 'threats.json')
const CENTROIDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/country-centroids.json'), 'utf8'))
const EXTRA = {
  SG: [1.35, 103.82], HK: [22.32, 114.17], TW: [23.7, 120.96],
  IL: [31.47, 34.85], AE: [23.87, 54.21], QA: [25.35, 51.18],
}
const coord = Object.assign({}, CENTROIDS, EXTRA)

const UA = {
  'User-Agent': 'Mozilla/5.0 (compatible; portfolio-siber/1.0; +https://ringga-dev.github.io/portfolio-v2/)',
  'Accept': 'application/json',
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function getJSON(url, timeout = 30000, headers = UA) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeout)
  try {
    const r = await fetch(url, { headers, signal: ctl.signal })
    if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`)
    return await r.json()
  } finally { clearTimeout(t) }
}

function iso(c) {
  if (!c || typeof c !== 'string') return ''
  const s = c.trim().toUpperCase()
  if (s === 'UK') return 'GB'
  if (s.length === 2 && /^[A-Z]{2}$/.test(s)) return s
  return ''
}
function geo(code) { const c = coord[code]; return c ? { lat: c[0], lon: c[1] } : null }

/* -------------------------------------------------------------------------- */
/*  1. KORBAN RANSOMWARE — ransomware.live v2 (attackdate lebih segar)          */
/* -------------------------------------------------------------------------- */
function normaliseVictim(v, i, ver) {
  const code = iso(v.country)
  const g = geo(code)
  const group = v.group || v.group_name || 'tidak diketahui'
  return {
    id: `rl-${ver}-${i}-${(v.attackdate || v.discovered || '').slice(0, 10)}`,
    kind: 'ransomware',
    victim: v.victim || v.post_title || '(nama tidak dipublikasikan)',
    group,
    sector: v.activity || '',
    country: code,
    lat: g ? g.lat : null,
    lon: g ? g.lon : null,
    attackdate: v.attackdate || null,
    discovered: v.discovered || v.published || null,
    description: (v.description || '').slice(0, 500),
    domain: v.domain || v.website || '',
    dataSize: v.data_size || null,
    url: v.url || (v.claim_url ? `https://www.ransomware.live${v.claim_url}` : ''),
  }
}

async function ransomwareVictims() {
  // v2 dulu; kalau kena rate-limit 1 req/menit, fallback v1.
  try {
    const raw = await getJSON('https://api.ransomware.live/v2/recentvictims')
    if (Array.isArray(raw) && raw.length) return {
      events: raw.map((v, i) => normaliseVictim(v, i, 'v2')).filter(e => e.lat != null),
      endpoint: 'https://api.ransomware.live/v2/recentvictims',
      version: 'v2',
    }
  } catch (e) { console.warn('  v2 recentvictims gagal, coba v1:', e.message) }
  const raw = await getJSON('https://api.ransomware.live/v1/recentvictims')
  if (!Array.isArray(raw)) throw new Error('ransomware.live: respons bukan array')
  return {
    events: raw.map((v, i) => normaliseVictim(v, i, 'v1')).filter(e => e.lat != null),
    endpoint: 'https://api.ransomware.live/v1/recentvictims',
    version: 'v1',
  }
}

/* -------------------------------------------------------------------------- */
/*  2. TIMELINE INSIDEN MUNDUR — recentcyberattacks (date aktual 2024-2026)      */
/* -------------------------------------------------------------------------- */
async function ransomwareTimeline() {
  try {
    const raw = await getJSON('https://api.ransomware.live/v2/recentcyberattacks')
    if (!Array.isArray(raw)) return []
    return raw.map((v, i) => {
      const code = iso(v.country)
      const g = geo(code)
      return {
        id: `t-${i}-${v.date || ''}`,
        victim: v.victim || v.title || '(tidak diketahui)',
        domain: v.domain || v.url || '',
        country: code,
        lat: g ? g.lat : null,
        lon: g ? g.lon : null,
        date: v.date || null,
        added: v.added || null,
        summary: (v.summary || v.description || '').slice(0, 400),
        claimGang: !!v.claim_gang,
        link: v.link || v.url || '',
      }
    }).filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (e) {
    console.warn('  recentcyberattacks gagal (opsional):', e.message)
    return []
  }
}

/* -------------------------------------------------------------------------- */
/*  3. ASAL PENYERANG — DShield / SANS honeypot + ascountry dari ASN             */
/* -------------------------------------------------------------------------- */
async function dshieldSources() {
  try {
    const list = await getJSON('https://isc.sans.edu/api/sources/attacks/16/today?json', 30000, {
      ...UA, 'User-Agent': 'portfolio-siber/1.0 (research; contact: github.com/ringga-dev)',
    })
    const rows = Array.isArray(list) ? list : (list?.sources || [])
    const out = []
    for (const r of rows.slice(0, 12)) {
      try {
        await sleep(250) // jaga-jaga rate limit DShield
        const d = await getJSON(`https://isc.sans.edu/api/ip/${encodeURIComponent(r.ip)}?json`, 15000, {
          ...UA, 'User-Agent': 'portfolio-siber/1.0 (research; contact: github.com/ringga-dev)',
        })
        const node = d?.ip || {}
        const code = iso(node.ascountry)
        const g = geo(code)
        if (!g) continue
        if (/censys|shodan|scanner|googlebot/i.test(node.asname || '')) continue // scanner, bukan penyerang
        out.push({
          id: `ds-${r.ip}`,
          ip: r.ip,
          country: code,
          lat: g.lat,
          lon: g.lon,
          asn: node.as || null,
          asname: node.asname || '',
          attacks: r.attacks || 0,
          count: r.count || 0,
          firstseen: r.firstseen || null,
          lastseen: r.lastseen || null,
        })
      } catch (e) { console.warn('  enrich', r.ip, 'dilewati:', e.message) }
    }
    return out
  } catch (e) {
    console.warn('  DShield gagal (opsional):', e.message)
    return []
  }
}

async function main() {
  console.log('fetch-real-attacks: mengambil data nyata…')
  const victims = await ransomwareVictims()
  if (!victims.events.length) throw new Error('tidak ada korban dengan koordinat valid — snapshot lama dipertahankan')

  const [timeline, attackers] = await Promise.all([ransomwareTimeline(), dshieldSources()])
  const events = victims.events.sort((a, b) =>
    new Date(b.attackdate || b.discovered || 0) - new Date(a.attackdate || a.discovered || 0))

  const payload = {
    fetchedAt: new Date().toISOString(),
    sources: [
      {
        name: 'ransomware.live', url: 'https://www.ransomware.live/', endpoint: victims.endpoint,
        note: 'Korban ransomware yang dipublikasikan pelaku. Negara korban dari feed; koordinat Natural Earth 110m. API v2 memberi attackdate (tanggal serangan).',
      },
      {
        name: 'DShield / SANS ISC', url: 'https://isc.sans.edu/',
        endpoint: 'https://isc.sans.edu/api/sources/attacks/16/today?json + /api/ip/<ip>?json',
        note: 'IP yang menyerang honeypot DShield. Negara asal = ascountry dari ASN (bukan geolokasi IP presisi). Jumlah serangan nyata dari feed.',
      },
    ],
    count: events.length,
    events,
    timeline,
    attackers,
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(payload))
  console.log(`fetch-real-attacks: OK — ${events.length} korban, ${timeline.length} timeline, ${attackers.length} asal penyerang`)
  console.log(`  terbaru: ${events[0].attackdate || events[0].discovered} ${events[0].victim} (${events[0].country})`)
  if (attackers.length) console.log(`  asal: ${attackers.slice(0, 4).map(a => `${a.country}:${a.attacks}`).join(', ')}`)
}

main().catch(e => { console.error('fetch-real-attacks: FAILED —', e.message); process.exit(1) })
