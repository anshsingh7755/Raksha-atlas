"""Low-cost pipeline quality metrics and explicit acceptance thresholds."""
from collections import Counter
from datetime import datetime


def quality_report(records: list[dict]) -> dict:
    total = len(records)
    duplicate_urls = total - len({row.get("canonical_url") for row in records if row.get("canonical_url")})
    missing = Counter()
    invalid_dates = 0
    sources = set()
    for row in records:
        for key in ("id", "title", "canonical_url", "source_id", "ingested_at"):
            if not row.get(key):
                missing[key] += 1
        if row.get("source_id"):
            sources.add(row["source_id"])
        value = row.get("published_at")
        if value:
            try:
                datetime.fromisoformat(value.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                invalid_dates += 1
    return {
        "records": total,
        "duplicate_url_count": duplicate_urls,
        "duplicate_rate": duplicate_urls / total if total else 0.0,
        "missing_required_fields": dict(missing),
        "invalid_publication_dates": invalid_dates,
        "source_coverage": len(sources),
        "source_ids": sorted(sources),
        "passed": duplicate_urls == 0 and not missing and invalid_dates == 0,
    }
