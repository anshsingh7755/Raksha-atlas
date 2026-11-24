"""Partitioned Parquet snapshots for analytical, non-operational workloads."""
from __future__ import annotations

from pathlib import Path
from typing import Any


def export_parquet(records: list[dict[str, Any]], output_dir: str) -> dict:
    if not records:
        return {"written": 0, "output_dir": output_dir}
    try:
        import polars as pl
    except ImportError as exc:
        raise RuntimeError("Install analytics extras: pip install -e '.[analytics]'") from exc
    frame = pl.DataFrame(records, infer_schema_length=None)
    destination = Path(output_dir)
    destination.mkdir(parents=True, exist_ok=True)
    if "published_at" in frame.columns:
        frame = frame.with_columns(
            pl.col("published_at").cast(pl.String).str.slice(0, 4).alias("published_year")
        )
        frame.write_parquet(destination / "articles.parquet", compression="zstd")
    else:
        frame.write_parquet(destination / "records.parquet", compression="zstd")
    return {"written": frame.height, "output_dir": str(destination)}
