"""Deterministic normalization and contract validation."""
import re
from datetime import datetime, timezone
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

TRACKING_KEYS = {"fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid"}


def canonicalize_url(raw_url: str) -> str:
    parts = urlsplit(raw_url.strip())
    if parts.scheme.lower() != "https" or not parts.hostname or parts.username or parts.password:
        raise ValueError("Article URL must be a public HTTPS URL.")
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
             if not k.lower().startswith("utm_") and k.lower() not in TRACKING_KEYS]
    host = parts.hostname.lower()
    port = f":{parts.port}" if parts.port and parts.port != 443 else ""
    path = parts.path.rstrip("/") or "/"
    return urlunsplit(("https", host + port, path, urlencode(sorted(query)), ""))


def normalize_article(record: dict, ingested_at: str | None = None) -> dict:
    now = ingested_at or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    result = dict(record)
    result["title"] = re.sub(r"\s+", " ", str(result.get("title", ""))).strip()[:300]
    result["canonical_url"] = canonicalize_url(str(result.get("canonical_url", "")))
    result["summary"] = re.sub(r"\s+", " ", str(result.get("summary", ""))).strip()[:4000]
    result["ingested_at"] = now
    result.setdefault("verification_status", "unverified")
    result.setdefault("review_state", "unreviewed")
    result.setdefault("publisher_official", False)
    result.setdefault("confidence", "unreviewed discovery lead")
    errors = []
    for field in ("id", "title", "source_id", "canonical_url", "ingested_at"):
        if not result.get(field):
            errors.append(f"missing:{field}")
    for field in ("published_at", "ingested_at"):
        value = result.get(field)
        if value:
            try:
                datetime.fromisoformat(value.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                errors.append(f"invalid_datetime:{field}")
    if result.get("verification_status") not in {"unverified", "reported", "verified", "disputed", "retracted"}:
        errors.append("invalid:verification_status")
    if result.get("review_state") not in {"unreviewed", "in_review", "reviewed"}:
        errors.append("invalid:review_state")
    if errors:
        raise ValueError("Article validation failed: " + ", ".join(errors))
    return result
