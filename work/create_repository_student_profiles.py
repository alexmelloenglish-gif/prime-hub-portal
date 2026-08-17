from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from datetime import datetime

ROOT = Path('/home/ubuntu/prime-hub-portal')
DATA = ROOT / 'data' / 'students'
INTAKE = Path('/tmp/prime-intake-current.json')
STAGING = ROOT / 'work' / 'PRIME_CALENDAR_SCHEDULE_STAGING_2026-08-17.json'
REGISTRY = DATA / 'student-core-registry.json'

EXISTING_PROFILE_FILES = {
    'rafael.copolillo@gmail.com': DATA / 'rafael-copolillo.firestore.json',
    'louise_nogueira@hotmail.com': DATA / 'louise-d-silva-nogueira.firestore.json',
    'louise.nogueira@hotmail.com': DATA / 'louise-d-silva-nogueira.firestore.json',
    'itallopires17@gmail.com': DATA / 'italo-pires-gmail-com.firestore.json',
    'midias83@hotmail.com': DATA / 'eduarda-coelho-gabriel-hotmail-com.firestore.json',
}


def norm_email(value: str) -> str:
    return value.strip().lower()


def doc_id(email: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', norm_email(email)).strip('-')


def student_id(email: str) -> str:
    return 'stu_' + hashlib.sha256(norm_email(email).encode('utf-8')).hexdigest()[:12]


def clean(value: object) -> str:
    return str(value or '').strip()


def pending(value: str) -> bool:
    return not value or value.lower().startswith('pending')


def valid_url(value: str) -> bool:
    return value.startswith('https://') and 'Pending' not in value


def display_date(iso_date: str) -> str:
    return datetime.strptime(iso_date, '%Y-%m-%d').strftime('%B %-d, %Y')


def extract_meet(value: str) -> str | None:
    return value if valid_url(value) and 'meet.google.com/' in value else None


def build_profile(row: dict, events: list[dict], blocked_conflicts: list[dict]) -> dict:
    email = norm_email(clean(row['email']))
    name = clean(row['name'])
    meet = extract_meet(clean(row.get('meet_link', '')))
    student_events = [event for event in events if norm_email(event.get('studentEmail', '')) == email]
    event_meets = []
    for event in student_events:
        event_meet = extract_meet(clean(event.get('meetUrl', '')))
        if event_meet:
            event_meets.append((event, event_meet))
    if event_meets:
        meet = event_meets[0][1]
    for conflict in blocked_conflicts:
        if norm_email(conflict.get('studentEmail', '')) == email and valid_url(clean(conflict.get('currentMeetUrl', ''))):
            meet = clean(conflict['currentMeetUrl'])

    frequency = clean(row.get('class_frequency', '')) or 'Not yet established'
    program = clean(row.get('program', '')) or 'Prime Digital Hub'
    current_level = clean(row.get('current_level', ''))
    target_level = clean(row.get('target_level', ''))
    focus = clean(row.get('learning_focus', ''))
    if pending(current_level):
        current_level = 'Assessment pending'
    if pending(target_level):
        target_level = 'Not yet established'
    if pending(focus):
        focus = 'Learning focus pending teacher input.'

    source_type = 'google_calendar_booking' if student_events else 'teacher_student_intake'
    authority = 'booking_identity_and_scheduled_lesson_only' if student_events else 'teacher_intake_identity_only'
    status_note = (
        'Calendar booking found; attendance and class-report publication require teacher confirmation.'
        if student_events
        else 'Student identity supplied in the teacher intake; academic history and schedule remain pending.'
    )

    attendance = []
    lesson_records = []
    for index, (event, event_meet) in enumerate(event_meets):
        starts_at = event.get('startsAt')
        ends_at = event.get('endsAt')
        lesson_id = f"cal_{str(starts_at).replace(':', '').replace('-', '').replace('+', '').replace('.', '')}_{doc_id(email)}"
        attendance.append({
            'id': f"scheduled-{event.get('sourceEventDate', 'pending')}-{doc_id(email)}-{index + 1}",
            'lessonId': lesson_id,
            'date': display_date(event['sourceEventDate']),
            'status': 'scheduled',
            'title': 'Scheduled lesson',
            'summary': status_note,
            'sourceType': 'google_calendar_booking',
            'sourceDocumentId': 'calendar_students_2026-08-17_to_2026-08-30',
            'authorityStatus': 'scheduled_not_attendance',
        })
        lesson_records.append({
            'lessonId': lesson_id,
            'studentId': student_id(email),
            'sourceType': 'google_calendar_booking',
            'sourceDocumentId': 'calendar_students_2026-08-17_to_2026-08-30',
            'lessonDate': event['sourceEventDate'],
            'startsAt': starts_at,
            'endsAt': ends_at,
            'meetUrl': event_meet,
            'artifactStatus': 'scheduled',
            'authorityStatus': 'non_authoritative',
            'implementationStatus': 'staged_pending_profile_validation',
        })

    manage_space = []
    if meet:
        manage_space.append({
            'id': 'live-class',
            'title': 'Join My Live Class',
            'href': meet,
            'description': 'Current Google Meet link from onboarding or a scheduled calendar event.',
            'icon': 'video',
        })
    if student_events:
        manage_space.append({
            'id': 'calendar',
            'title': 'My Lesson Calendar',
            'href': '#attendance-overview',
            'description': 'Your scheduled lessons and attendance history appear here.',
            'icon': 'calendar-days',
        })

    aliases = [clean(value) for value in clean(row.get('email_aliases', '')).split(',') if clean(value)]
    if email == 'diegodasiro@gmail.com':
        aliases.extend(['Diego Da Zero', 'Diego Dasiro'])
    if email == 'midias83@hotmail.com':
        aliases.extend(['Eduarda Dias', 'Eduarda Jesus'])
    aliases = list(dict.fromkeys(aliases))

    return {
        'studentId': student_id(email),
        'studentName': name,
        'studentEmail': email,
        'identityVersion': 'prime-student-id-v1',
        'identitySource': 'teacher_intake_and_calendar_booking' if student_events else 'teacher_student_intake',
        'profileStatus': 'active',
        'profileCompleteness': 'schedule_mapped_pending_academic_history' if student_events else 'onboarding_pending_links_and_history',
        'profileSource': {
            'sourceType': source_type,
            'sourceDocumentId': 'calendar_students_2026-08-17_to_2026-08-30' if student_events else 'teacher_intake_google_sheet',
            'sourceAuthority': authority,
        },
        'teacherName': 'Alexandre Mello',
        'program': program,
        'classFrequency': frequency,
        'currentLevel': current_level,
        'targetLevel': target_level,
        'focus': focus,
        'attendanceRate': 'Pending verification',
        'attendanceLabel': 'Scheduled lessons are not authoritative attendance; teacher confirmation is required.',
        'manageSpace': manage_space,
        'portfolioNavigation': [],
        'progressTracker': [],
        'attendanceOverview': attendance,
        'classReports': [],
        'goals': [],
        'vocabularyBank': [],
        'grammarOverview': {
            'title': 'Grammar Overview',
            'summary': 'Awaiting validated teacher evidence and student history.',
            'focusPoints': [],
        },
        'teacherFeedback': [],
        'lessonRecords': lesson_records,
        'identityAliases': aliases,
        'notes': status_note + ' Missing links and historical academic data remain pending and must not be guessed.',
    }


def main() -> None:
    intake = json.loads(INTAKE.read_text(encoding='utf-8'))
    staging = json.loads(STAGING.read_text(encoding='utf-8'))
    registry = json.loads(REGISTRY.read_text(encoding='utf-8'))
    rows = intake['values'][1:]
    events = staging.get('events', [])

    rows_by_email = {}
    for row in rows:
        if len(row) < 2:
            continue
        email = norm_email(clean(row[1]))
        if not email:
            continue
        rows_by_email[email] = {
            'name': clean(row[0]),
            'email': email,
            'email_aliases': clean(row[2]) if len(row) > 2 else '',
            'class_frequency': clean(row[5]) if len(row) > 5 else '',
            'program': clean(row[6]) if len(row) > 6 else '',
            'current_level': clean(row[7]) if len(row) > 7 else '',
            'target_level': clean(row[8]) if len(row) > 8 else '',
            'learning_focus': clean(row[9]) if len(row) > 9 else '',
            'meet_link': clean(row[10]) if len(row) > 10 else '',
        }

    # Teacher-confirmed canonical identity overrides for aliases and abbreviated booking names.
    rows_by_email['midias83@hotmail.com']['name'] = 'Eduarda Coelho Gabriel'
    rows_by_email['diegodasiro@gmail.com']['name'] = 'Diego da Silva Rodrigues'

    existing_emails = set(EXISTING_PROFILE_FILES)
    generated = []
    for email, row in rows_by_email.items():
        if email in existing_emails:
            continue
        profile = build_profile(row, events, staging.get('blockedConflicts', []))
        output = DATA / f"{doc_id(email)}.firestore.json"
        output.write_text(json.dumps(profile, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        generated.append((email, profile, output.name))

    existing_registry_emails = {norm_email(item.get('canonicalEmail', '')) for item in registry['students']}
    for email, row in rows_by_email.items():
        if email in existing_registry_emails:
            continue
        profile = build_profile(row, events, staging.get('blockedConflicts', []))
        event_meets = [event.get('meetUrl') for event in events if norm_email(event.get('studentEmail', '')) == email and valid_url(event.get('meetUrl', ''))]
        registry['students'].append({
            'studentId': profile['studentId'],
            'firestoreDocumentId': doc_id(email),
            'studentName': profile['studentName'],
            'canonicalEmail': email,
            'emailAliases': profile.get('identityAliases', []),
            'profileStatus': 'active',
            'profileCompleteness': profile['profileCompleteness'],
            'dashboardPath': '/dashboard?studentEmail=' + email.replace('@', '%40'),
            'links': {
                'liveClass': event_meets[0] if event_meets else None,
                'portfolio': None,
                'classMaterials': None,
                'homework': None,
            },
            'historicalTranscriptCount': 0,
            'usableTranscriptCount': 0,
            'pendingReviewCount': 0,
            'classFrequency': profile['classFrequency'],
            'notes': profile['notes'],
        })

    registry['students'] = sorted(registry['students'], key=lambda item: item.get('studentName', '').casefold())
    REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(json.dumps({
        'generated_profiles': [item[2] for item in generated],
        'generated_count': len(generated),
        'registry_student_count': len(registry['students']),
        'registry_emails': [item['canonicalEmail'] for item in registry['students']],
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
