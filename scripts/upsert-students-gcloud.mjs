import { execFileSync } from 'node:child_process'

const projectId = execFileSync('gcloud', ['config', 'get-value', 'project'], { encoding: 'utf8' }).trim()

if (projectId !== 'prime-hub-portal') {
  throw new Error(`Refusing to write: active gcloud project is ${projectId || '(empty)'}`)
}

const accessToken = execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim()

if (!accessToken) {
  throw new Error('gcloud did not return an access token')
}

function toFirestoreValue(value) {
  if (value === null) return { nullValue: 'NULL_VALUE' }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    if (Number.isInteger(value) && Number.isSafeInteger(value)) return { integerValue: String(value) }
    return { doubleValue: value }
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } }
  }
  if (typeof value === 'object') {
    const fields = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, toFirestoreValue(child)]))
    return { mapValue: { fields } }
  }
  throw new Error(`Unsupported JSON value: ${typeof value}`)
}

async function downloadProfile(fileName) {
  const url = `https://raw.githubusercontent.com/alexmelloenglish-gif/prime-hub-portal/main/data/students/${fileName}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not download ${fileName}: HTTP ${response.status}`)
  return response.json()
}

async function upsertStudent(documentId, fileName) {
  const payload = await downloadProfile(fileName)
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students/${encodeURIComponent(documentId)}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, toFirestoreValue(value)])) }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Firestore upsert failed for ${documentId}: HTTP ${response.status} ${details}`)
  }

  const saved = await response.json()
  const savedFieldCount = Object.keys(saved.fields ?? {}).length
  console.log(`Upserted ${documentId} from ${fileName} (${savedFieldCount} top-level fields)`)
}

await upsertStudent('louise-nogueira-hotmail-com', 'louise-d-silva-nogueira.firestore.json')
await upsertStudent('rafael-copolillo-gmail-com', 'rafael-copolillo.firestore.json')
console.log('Firestore profile publication completed.')
