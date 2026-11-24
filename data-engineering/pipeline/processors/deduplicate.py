from pipeline.collectors.base import CollectedItem
from pipeline.processors.normalize import canonicalize_url


def deduplicate(items: list[CollectedItem]) -> list[CollectedItem]:
    unique: dict[str, CollectedItem] = {}
    for item in items:
        try:
            key = canonicalize_url(item.url)
        except ValueError:
            key = item.url
        unique.setdefault(key, item)
    return list(unique.values())


def deduplicate_records(records: list[dict]) -> list[dict]:
    """Keep the first record for each canonical URL; preserve input order."""
    unique: dict[str, dict] = {}
    for record in records:
        key = canonicalize_url(record["canonical_url"])
        unique.setdefault(key, record)
    return list(unique.values())
