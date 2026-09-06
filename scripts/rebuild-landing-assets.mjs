import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const specs = [
  ['hero', 'public/assets/prime-hero-student-hq.webp'],
  ['context', 'public/assets/prime-context-person-hq.webp'],
  ['cta', 'public/assets/prime-cta-community-hq.webp'],
]

for (const [name, output] of specs) {
  const dir = path.join(root, 'assets-src/landing', name)
  if (!fs.existsSync(dir)) continue
  const parts = fs.readdirSync(dir).filter((file) => file.endsWith('.b64')).sort()
  if (!parts.length) continue
  const encoded = parts.map((file) => fs.readFileSync(path.join(dir, file), 'utf8').trim()).join('')
  const bytes = Buffer.from(encoded, 'base64')
  const target = path.join(root, output)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, bytes)
  console.log(`rebuilt ${output} (${bytes.length} bytes)`)
}
