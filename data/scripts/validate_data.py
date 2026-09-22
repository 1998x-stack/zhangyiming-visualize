#!/usr/bin/env python3
"""Validate the shipped JSONL corpus without requiring the tagging API or npm."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'data' / 'zhangyiming_weibo_tagged.jsonl'
PUBLIC = ROOT / 'public' / 'zhangyiming_weibo_tagged.jsonl'
SECTIONS = {'关于成长', '关于管理', '关于商业'}


def validate_corpus(text: str) -> int:
    """Return the record count; raise ValueError with the faulty line on invalid data."""
    seen: set[int] = set()
    count = 0
    for line_number, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f'line {line_number}: invalid JSON: {exc.msg}') from exc
        if not isinstance(entry, dict):
            raise ValueError(f'line {line_number}: expected object')
        for field in ('id', 'section_num', 'global_id'):
            value = entry.get(field)
            if type(value) is not int or value <= 0:
                raise ValueError(f'line {line_number}: {field} must be a positive integer')
        if entry.get('section') not in SECTIONS:
            raise ValueError(f'line {line_number}: unknown section')
        if not isinstance(entry.get('content'), str) or not entry['content'].strip():
            raise ValueError(f'line {line_number}: empty content')
        for field in ('tags', 'keywords'):
            value = entry.get(field)
            if not isinstance(value, list) or not all(isinstance(x, str) and x.strip() for x in value):
                raise ValueError(f'line {line_number}: {field} must be a list of nonempty strings')
        identity = entry['global_id']
        if identity in seen:
            raise ValueError(f'line {line_number}: duplicate global_id {identity}')
        seen.add(identity)
        count += 1
    if count == 0:
        raise ValueError('corpus is empty')
    return count


def main() -> None:
    if SOURCE.read_bytes() != PUBLIC.read_bytes():
        raise ValueError('data and public corpus copies differ; synchronize them before deployment')
    count = validate_corpus(SOURCE.read_text(encoding='utf-8'))
    print(f'Validated {count} records; checked schema, uniqueness, and public data sync.')


if __name__ == '__main__':
    main()
