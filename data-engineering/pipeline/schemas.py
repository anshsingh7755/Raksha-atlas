"""Canonical, source-aware contracts for public intelligence ingestion."""
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class ArticleRecord:
    id: str
    title: str
    canonical_url: str
    source_id: str
    publisher: str | None = None
    summary: str = ""
    published_at: str | None = None
    ingested_at: str = ""
    publisher_official: bool = False
    verification_status: str = "unverified"
    review_state: str = "unreviewed"
    confidence: str = "unreviewed discovery lead"
    language: str = "en"
    media_type: str = "rss"
    raw_metadata: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class SourceRecord:
    id: str
    name: str
    url: str
    source_type: str
    official: bool = False
    active: bool = True
    default_verification: str = "unverified"


@dataclass(frozen=True)
class ProgrammeRecord:
    id: str
    name: str
    service_domain: str | None
    status: str | None
    sources: tuple[str, ...] = ()


@dataclass(frozen=True)
class EquipmentRecord:
    id: str
    name: str
    service: str | None
    category: str | None
    quantity: int | None = None
    quantity_status: str | None = None


def valid_iso_datetime(value: str | None) -> bool:
    if not value:
        return True
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False
