import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contractPath = path.join(root, 'lib', 'canonical-learning-record-contract.ts')
const schemaPath = path.join(root, 'prisma', 'schema.prisma')

const contract = fs.readFileSync(contractPath, 'utf8')
const schema = fs.readFileSync(schemaPath, 'utf8')

function assert(condition, message) {
  if (!condition) throw new Error(`G1 contract self-test failed: ${message}`)
}

function modelBlock(source, modelName) {
  const match = source.match(new RegExp(`model\\s+${modelName}\\s*\\{([\\s\\S]*?)\\n\\}`))
  return match?.[1] ?? ''
}

const canonical = modelBlock(schema, 'CanonicalLearningRecord')

assert(canonical, 'CanonicalLearningRecord Prisma model must exist')

for (const field of [
  'canonicalRecordId',
  'schemaVersion',
  'studentId',
  'lessonId',
  'scopeType',
  'scopeKey',
  'canonicalVersion',
  'canonicalHash',
  'hashAlgorithm',
  'sourceReferences',
  'sourceHash',
  'transcriptId',
  'pipelineRunId',
  'proposalReferences',
  'teacherDecisionId',
  'reviewerId',
  'reviewerRole',
  'decisionType',
  'authorityScope',
  'decisionTimestamp',
  'canonicalizedAt',
  'pedagogicalPayload',
  'supersedesRecordId',
]) {
  assert(new RegExp(`\\b${field}\\b`).test(canonical), `missing Prisma field: ${field}`)
}

assert(
  canonical.includes('@@unique([studentId, scopeKey, canonicalVersion])'),
  'canonical version uniqueness guard must be declared',
)

assert(
  canonical.includes('@@map("canonical_learning_records")'),
  'canonical table mapping must be explicit',
)

assert(
  !/\bupdatedAt\b/.test(canonical),
  'immutable canonical versions must not expose an automatic updatedAt mutation surface',
)

assert(
  contract.includes("'canonical-learning-record-v1'"),
  'schema version constant must be frozen',
)

assert(
  contract.includes("'sha256'"),
  'canonical hash algorithm must be frozen',
)

for (const decision of ["'accepted'", "'edited'", "'bounded'"]) {
  assert(contract.includes(decision), `decision contract missing ${decision}`)
}

for (const field of [
  'validatedEvidence',
  'learningSignals',
  'teacherInsight',
  'evidenceBoundaries',
  'nextVerification',
  'vocabulary',
  'grammarCorrections',
  'learnerStateChange',
  'priorityChange',
  'nextAction',
]) {
  assert(new RegExp(`\\b${field}\\b`).test(contract), `pedagogical payload missing: ${field}`)
}

assert(
  contract.includes('Teacher Decision alone must never be represented as this type'),
  'authority/canonicalization boundary must remain explicit',
)

assert(
  contract.includes('Generated record IDs and persistence timestamps are deliberately excluded'),
  'hash envelope boundary must remain explicit',
)

console.log('G1 Canonical Learning Record Contract: PASS')
