#!/usr/bin/env node
// Verify that `nuxt generate` actually emitted every expected static page.
// Pure Node.js — no dependencies. Exits 1 with a clear message on any problem.

import fs from 'node:fs'
import path from 'node:path'

const DIST = path.resolve(process.cwd(), 'dist')
const ROUTES = ['/', '/about', '/projects', '/skills', '/contact', '/tata-surya', '/siber']

const errors = []
const fail = (message) => errors.push(message)

// Resolve a possibly baseURL-prefixed asset reference to a real file in dist.
// Nuxt emits hrefs like "/nyawit-portfolio/_nuxt/entry.css" while the files
// live at "dist/_nuxt/entry.css", so we drop leading segments until one hits.
function resolveLocalAsset(ref) {
  let url = ref.trim().split('?')[0].split('#')[0]
  if (!url) return null

  // External or non-file references are not verifiable against dist.
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(url) || /^(data|blob|about|javascript|mailto):/i.test(url)) {
    return { external: true }
  }

  const parts = url.replace(/^\/+/, '').split('/').filter(Boolean)
  for (let i = 0; i < parts.length; i++) {
    const candidate = path.join(DIST, ...parts.slice(i))
    try {
      if (fs.statSync(candidate).isFile()) return { file: candidate }
    } catch {
      // not this candidate — keep stripping leading segments
    }
  }
  return { missing: true }
}

function finish() {
  if (errors.length) {
    console.error('verify-build: FAILED')
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }
  console.log('verify-build: OK — all pages present with <title> and resolvable CSS/assets')
}

function main() {
  if (!fs.existsSync(DIST) || !fs.statSync(DIST).isDirectory()) {
    fail(`dist directory not found at ${DIST} — did \`npm run generate\` succeed?`)
    finish()
    return
  }

  for (const route of ROUTES) {
    const relative = route === '/' ? 'index.html' : path.join(route.replace(/^\/+/, ''), 'index.html')
    const file = path.join(DIST, relative)

    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      fail(`Missing generated page for "${route}": expected ${relative}`)
      continue
    }

    const html = fs.readFileSync(file, 'utf8')

    if (!/<title\b[^>]*>\s*\S[\s\S]*?<\/title>/i.test(html)) {
      fail(`${relative}: missing or empty <title> tag`)
    }

    const references = []
    for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
      const href = (match[0].match(/\bhref\s*=\s*["']([^"']*)["']/i) || [])[1]
      if (href) references.push({ tag: 'link', href })
    }
    for (const match of html.matchAll(/<script\b[^>]*>/gi)) {
      const src = (match[0].match(/\bsrc\s*=\s*["']([^"']*)["']/i) || [])[1]
      if (src) references.push({ tag: 'script', href: src })
    }

    let localCount = 0
    for (const ref of references) {
      const result = resolveLocalAsset(ref.href)
      if (!result || result.external) continue
      localCount++
      if (result.missing) {
        fail(`${relative}: asset not found in dist — <${ref.tag} href="${ref.href}">`)
      }
    }

    if (localCount === 0) {
      fail(`${relative}: no local CSS/asset links found in generated HTML`)
    }
  }

  finish()
}

main()
