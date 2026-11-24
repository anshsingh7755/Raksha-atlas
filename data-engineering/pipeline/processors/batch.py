"""Optional Polars batch transforms; core ingestion stays dependency-light."""
from __future__ import annotations

from typing import Any


def transform_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not records:
        return []
    try:
        import polars as pl
    except ImportError as exc:
        raise RuntimeError("Install analytics extras: pip install -e '.[analytics]'") from exc
    frame = pl.DataFrame(records, infer_schema_length=None)
    if "title" in frame.columns:
        frame = frame.with_columns(pl.col("title").cast(pl.String).str.strip_chars())
    if "summary" in frame.columns:
        frame = frame.with_columns(pl.col("summary").cast(pl.String).fill_null("").str.strip_chars())
    if "source_id" in frame.columns:
        frame = frame.filter(pl.col("source_id").is_not_null() & (pl.col("source_id") != ""))
    if "canonical_url" in frame.columns:
        frame = frame.unique(subset=["canonical_url"], keep="first", maintain_order=True)
    return frame.to_dicts()
