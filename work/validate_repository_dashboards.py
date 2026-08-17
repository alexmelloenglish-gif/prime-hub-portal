from __future__ import annotations

import json
from pathlib import Path

ROOT = Path('/home/ubuntu/prime-hub-portal')
DATA = ROOT / 'data' / 'students'
REGISTRY = json.loads((DATA / 'student-core-registry.json').read_text(encoding='utf-8'))
LEGACY_FILES = {
    'rafael-copolillo-gmail-com': DATA / 'rafael-copolillo.firestore.json',
    'louise-nogueira-hotmail-com': DATA / 'louise-d-silva-nogueira.firestore.json',
}

errors = []
emails = []
for entry in REGISTRY['students']:
    email = entry.get('canonicalEmail', '').strip().lower()
    emails.append(email)
    filename = LEGACY_FILES.get(entry['firestoreDocumentId'], DATA / f"{entry['firestoreDocumentId']}.firestore.json")
    if not filename.exists():
        errors.append(f'missing profile file: {filename.name}')
        continue
    profile = json.loads(filename.read_text(encoding='utf-8'))
    required_keys = ('studentId', 'studentName', 'studentEmail', 'profileStatus', 'manageSpace')
    if entry['firestoreDocumentId'] not in LEGACY_FILES:
        required_keys = required_keys + ('profileCompleteness',)
    for key in required_keys:
        if key not in profile:
            errors.append(f'{email}: missing {key}')
    if profile.get('studentEmail', '').strip().lower() != email:
        errors.append(f'{email}: profile email mismatch')
    for link in profile.get('manageSpace', []):
        href = link.get('href')
        if not isinstance(href, str) or not href:
            errors.append(f'{email}: invalid manageSpace href for {link.get("id")}')
    if entry['firestoreDocumentId'] not in LEGACY_FILES:
        for lesson in profile.get('lessonRecords', []):
            if not lesson.get('lessonDate') or not lesson.get('startsAt') or not lesson.get('meetUrl'):
                errors.append(f'{email}: incomplete lesson record')

if len(emails) != len(set(emails)):
    errors.append('duplicate canonical emails in registry')

print(json.dumps({
    'registry_count': len(emails),
    'unique_email_count': len(set(emails)),
    'errors': errors,
    'status': 'PASS' if not errors else 'FAIL',
    'emails': emails,
}, ensure_ascii=False, indent=2))

if errors:
    raise SystemExit(1)
