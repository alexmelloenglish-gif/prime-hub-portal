import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12

function getKey() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.PRIME_PIPELINE_INGEST_SECRET
  if (!secret) throw new Error('Audio encryption secret is not configured')
  return createHash('sha256').update(secret).digest()
}

export function encryptAudio(bytes: Buffer) {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()])

  return {
    audioCiphertext: ciphertext.toString('base64'),
    audioIv: iv.toString('base64'),
    audioAuthTag: cipher.getAuthTag().toString('base64'),
  }
}

export function decryptAudio(payload: {
  audioCiphertext?: string
  audioIv?: string
  audioAuthTag?: string
}) {
  if (!payload.audioCiphertext || !payload.audioIv || !payload.audioAuthTag) return null

  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(payload.audioIv, 'base64'),
  )
  decipher.setAuthTag(Buffer.from(payload.audioAuthTag, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(payload.audioCiphertext, 'base64')),
    decipher.final(),
  ])
}
