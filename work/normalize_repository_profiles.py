from __future__ import annotations

import json
from pathlib import Path

DATA = Path('/home/ubuntu/prime-hub-portal/data/students')
FILES = [
    DATA / 'italo-pires-gmail-com.firestore.json',
    DATA / 'eduarda-coelho-gabriel-hotmail-com.firestore.json',
]

for path in FILES:
    profile = json.loads(path.read_text(encoding='utf-8'))
    profile.setdefault('profileCompleteness', 'onboarding_pending_links_and_history')
    profile['manageSpace'] = [
        link for link in profile.get('manageSpace', [])
        if isinstance(link.get('href'), str) and link.get('href')
    ]
    path.write_text(json.dumps(profile, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(path.name)
