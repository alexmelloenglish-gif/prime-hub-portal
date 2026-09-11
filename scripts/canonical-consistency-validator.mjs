import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STUDENTS_DIR = path.join(ROOT, 'data', 'students')
const STRICT = process.argv.includes('--strict')
const ONE_DAY = 24 * 60 * 60 * 1000

const errors = []
const warnings = []

function issue(level, file, code, message) {
  const target = level === 'error' ? errors : warnings
  target.push({ file, code, message })
}

function normalizeDateText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
}

function parseDate(value) {
  if (!value) return null
  const raw = String(value).trim()
  const direct = Date.parse(raw)
  if (Number.isFinite(direct)) return direct

  const dmy = raw.match(/\b(\d{1,2})[\s/-](jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s,/-]+(20\d{2})\b/i)
  if (dmy) {
    const parsed = Date.parse(`${dmy[2]} ${dmy[1]}, ${dmy[3]}`)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function dateKey(value) {
  const ts = parseDate(value)
  if (ts === null) return normalizeDateText(value)
  return new Date(ts).toISOString().slice(0, 10)
}

function extractDateStrings(value) {
  const text = String(value ?? '')
  const patterns = [
    /\b20\d{2}-\d{2}-\d{2}\b/g,
    /\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\b/gi,
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}\b/gi,
  ]
  return patterns.flatMap((pattern) => text.match(pattern) ?? [])
}

function attendanceCountFromLabel(value) {
  const match = String(value ?? '').match(/\b(\d+)\s*\/\s*(\d+)\b/)
  if (!match) return null
  return { numerator: Number(match[1]), denominator: Number(match[2]) }
}

function isPast(ts) {
  if (ts === null) return false
  return ts < Date.now() - ONE_DAY
}

function containsFutureLanguage(value) {
  return /\b(next|upcoming|scheduled|will be recorded|to be added after|pr[oó]xima aula|agendada|agendado)\b/i.test(String(value ?? ''))
}

function validateStudent(file, student) {
  const name = student.studentName || student.studentEmail || file
  const attendance = Array.isArray(student.attendanceOverview) ? student.attendanceOverview : []
  const reports = Array.isArray(student.classReports) ? student.classReports : []
  const publishedReports = reports.filter((r) => r && (r.status === 'published' || r.contentStatus === 'published'))
  const present = attendance.filter((a) => a?.status === 'present')

  const rate = attendanceCountFromLabel(student.attendanceRate)
  if (rate && attendance.length) {
    if (rate.numerator !== present.length) {
      issue('error', file, 'ATTENDANCE_RATE_MISMATCH', `${name}: attendanceRate says ${rate.numerator} present, but attendanceOverview has ${present.length}.`)
    }
    const completed = attendance.filter((a) => a?.status === 'present' || a?.status === 'absent').length
    if (rate.denominator !== completed) {
      issue('error', file, 'ATTENDANCE_DENOMINATOR_MISMATCH', `${name}: attendanceRate denominator is ${rate.denominator}, but completed attendance entries total ${completed}.`)
    }
  }

  for (const entry of attendance) {
    if (!entry) continue
    const ts = parseDate(entry.date)
    if (entry.status === 'scheduled' && isPast(ts)) {
      issue('warning', file, 'PAST_LESSON_STILL_SCHEDULED', `${name}: ${entry.date} is in the past but is still marked scheduled. Resolve when evidence confirms attended/cancelled; do not infer.`)
    }
  }

  const reportKeys = new Set()
  for (const report of publishedReports) {
    if (!report.date || !report.title) {
      issue('error', file, 'PUBLISHED_REPORT_INCOMPLETE', `${name}: a published class report is missing date or title.`)
      continue
    }
    const key = `${dateKey(report.date)}|${normalizeDateText(report.title)}`
    if (reportKeys.has(key)) {
      issue('error', file, 'DUPLICATE_PUBLISHED_REPORT', `${name}: duplicate published class report for ${report.date} / ${report.title}.`)
    }
    reportKeys.add(key)
  }

  if (publishedReports.length) {
    const reportDates = new Set(publishedReports.map((r) => dateKey(r.date)))
    for (const entry of present) {
      const key = dateKey(entry.date)
      if (key && !reportDates.has(key)) {
        issue('warning', file, 'PRESENT_LESSON_WITHOUT_REPORT', `${name}: attended lesson ${entry.date} has no published class report for the same date. Backfill when source evidence is available.`)
      }
    }
  }

  const projection = student.canonicalProjection ?? {}
  const nextAction = projection.nextAction ?? {}
  const schedule = projection.schedule ?? {}
  const forwardFacingText = [
    nextAction.title,
    nextAction.description,
    typeof nextAction.outcome === 'string' ? nextAction.outcome : '',
    schedule.label,
  ].filter(Boolean)

  for (const text of forwardFacingText) {
    if (!containsFutureLanguage(text)) continue
    for (const dateText of extractDateStrings(text)) {
      const ts = parseDate(dateText)
      if (isPast(ts)) {
        issue('error', file, 'NEXT_ACTION_REFERENCES_PAST_DATE', `${name}: forward-looking dashboard text references past date ${dateText}: "${text}"`)
      }
    }
  }

  const criticalStrings = [
    student.attendanceLabel,
    projection?.whatChanged?.summary,
    nextAction?.title,
    nextAction?.description,
    schedule?.label,
  ].filter(Boolean)

  for (const text of criticalStrings) {
    if (/\b(to be added|attendance will be recorded after|pending confirmation)\b/i.test(String(text))) {
      issue('warning', file, 'UNRESOLVED_PLACEHOLDER', `${name}: unresolved placeholder in canonical-facing text: "${text}"`)
    }
  }

  if (present.length && publishedReports.length && present.length !== publishedReports.length) {
    issue('warning', file, 'ATTENDANCE_REPORT_COUNT_DIFFERENCE', `${name}: ${present.length} attended lessons vs ${publishedReports.length} published reports. Review if intentional.`)
  }
}

function main() {
  const files = fs.readdirSync(STUDENTS_DIR)
    .filter((name) => name.endsWith('.firestore.json'))
    .sort()

  for (const file of files) {
    const fullPath = path.join(STUDENTS_DIR, file)
    try {
      const student = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      validateStudent(file, student)
    } catch (error) {
      issue('error', file, 'INVALID_JSON', `Could not parse/validate: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  console.log(`\nPRIME Canonical Consistency Validator`)
  console.log(`Scanned: ${files.length} student snapshots`)

  for (const item of warnings) {
    console.warn(`WARN  [${item.code}] ${item.file}: ${item.message}`)
  }
  for (const item of errors) {
    console.error(`ERROR [${item.code}] ${item.file}: ${item.message}`)
  }

  console.log(`Result: ${errors.length} error(s), ${warnings.length} warning(s)\n`)

  if (STRICT && errors.length) process.exit(1)
}

main()
