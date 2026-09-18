import fs from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const service = fs.readFileSync('lib/canonical-learning-intelligence-projection.ts', 'utf8')
const proof = fs.readFileSync('lib/g5-runtime-proof.ts', 'utf8')
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')

assert(service.includes('canonicalLearningRecord.findUnique'), 'G5 must read CLR directly')
assert(service.includes("verificationStatus !== 'PASS'"), 'G5 must require G3 PASS')
assert(service.includes('canonicalLearningIntelligenceProjection.create'), 'G5 must persist independent LI projection')
assert(service.includes('canonicalLearningIntelligenceProjection.findUnique'), 'G5 must read back LI projection')
assert(service.includes('sourceReferences'), 'G5 must preserve source references')
assert(service.includes('teacherDecisionId'), 'G5 must preserve teacher decision lineage')
assert(service.includes('validationTaskId'), 'G5 must preserve ValidationTask lineage')
assert(service.includes('teacherDecisionPackageId'), 'G5 must preserve package lineage')
assert(service.includes('authorityScope'), 'G5 must preserve authority scope')
assert(service.includes('projectionHash = hashEnvelope'), 'G5 must hash lineage plus payload')
assert(!service.includes('parseTransferPoints'), 'G5 canonical path must not parse legacy transfer points')
assert(!service.includes('classReportProjection'), 'G5 canonical path must not read Class Report projection')
assert(!service.includes('portfolioProjection'), 'G5 canonical path must not read Portfolio projection')
assert(!service.includes('dashboard'), 'G5 canonical service must not use dashboard as source')
assert(proof.includes('const first = await projectCanonicalLearningIntelligence(input)'), 'G5 proof must materialize first projection')
assert(proof.includes('const replay = await projectCanonicalLearningIntelligence(input)'), 'G5 proof must exact replay')
assert(proof.includes('canonicalLearningIntelligenceProjection.count'), 'G5 proof must verify composite cardinality')
assert(proof.includes('canonicalRecordId: provenance.canonicalRecordId'), 'G5 count must include canonicalRecordId')
assert(proof.includes('targetType: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET'), 'G5 count must include targetType')
assert(proof.includes('projectionVersion: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION'), 'G5 count must include projectionVersion')
assert(proof.includes('compositeCount !== 1'), 'G5 proof must require composite count 1')
assert(proof.includes("GUSTAVO_CANONICAL_RECORD_ID = 'cmu6jv29k0001bf8kt45pl9ht'"), 'G5 runtime witness must be limited to Gustavo')
assert(schema.includes('@@unique([canonicalRecordId, targetType, projectionVersion])'), 'G5 schema must enforce composite uniqueness')

console.log('G5 Canonical Learning Intelligence Projection structural self-test: PASS')
