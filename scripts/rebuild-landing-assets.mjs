import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

// Only assets that are intentionally reconstructed during build belong here.
// The approved comparison students are committed source assets and must never be
// overwritten by this script, otherwise a deploy can silently roll back the visual.
const specs = [
  {
    name: 'hero',
    sourceDir: 'assets-src/landing-q76/hero',
    expectedBytes: 48406,
    output: 'public/assets/prime-hero-student-hq.webp',
  },
  {
    name: 'cta',
    sourceDir: 'assets-src/landing/cta',
    expectedBytes: 18556,
    output: 'public/assets/prime-cta-community-hq.webp',
  },
]

for (const { name, sourceDir, expectedBytes, output } of specs) {
  const dir = path.join(root, sourceDir)
  if (!fs.existsSync(dir)) {
    throw new Error(`Missing landing asset source directory: ${sourceDir}`)
  }

  const parts = fs.readdirSync(dir).filter((file) => file.endsWith('.b64')).sort()
  if (!parts.length) {
    throw new Error(`No Base64 parts found for landing asset: ${name}`)
  }

  const encoded = parts.map((file) => fs.readFileSync(path.join(dir, file), 'utf8').trim()).join('')
  const bytes = Buffer.from(encoded, 'base64')

  if (bytes.length !== expectedBytes) {
    throw new Error(`Invalid ${name} asset size: expected ${expectedBytes} bytes, got ${bytes.length}`)
  }

  const target = path.join(root, output)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, bytes)
  console.log(`rebuilt ${output} (${bytes.length} bytes)`)
}
