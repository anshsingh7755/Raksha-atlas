"""Optional PostgreSQL sink; importing the pipeline does not require psycopg."""
import json
import os


def persist_articles(records: list[dict], apply: bool = False) -> dict:
    if not apply:
        return {"mode": "dry-run", "records": len(records), "written": 0}
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError("DATABASE_URL is required with --apply.")
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError("Install the optional postgres extra: pip install -e '.[postgres]'") from exc
    sql = """
        INSERT INTO ingested_articles
          (id, title, canonical_url, source_id, publisher, summary, published_at,
           ingested_at, publisher_official, verification_status, review_state, confidence,
           language, media_type, raw_metadata)
        VALUES (%(id)s, %(title)s, %(canonical_url)s, %(source_id)s, %(publisher)s,
          %(summary)s, %(published_at)s, %(ingested_at)s, %(publisher_official)s,
          %(verification_status)s, %(review_state)s, %(confidence)s, %(language)s,
          %(media_type)s, %(raw_metadata)s::jsonb)
        ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,
          canonical_url=EXCLUDED.canonical_url, summary=EXCLUDED.summary,
          published_at=EXCLUDED.published_at, ingested_at=EXCLUDED.ingested_at,
          raw_metadata=EXCLUDED.raw_metadata
    """
    with psycopg.connect(dsn) as connection:
        with connection.cursor() as cursor:
            for record in records:
                row = dict(record)
                row["raw_metadata"] = json.dumps(row.get("raw_metadata") or {})
                cursor.execute(sql, row)
    return {"mode": "apply", "records": len(records), "written": len(records)}
