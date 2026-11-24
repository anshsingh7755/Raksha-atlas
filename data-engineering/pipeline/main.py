import argparse
import json
from pathlib import Path

from pipeline.collectors.base import CollectedItem
from pipeline.collectors.rss import collect_rss
from pipeline.processors.deduplicate import deduplicate, deduplicate_records
from pipeline.processors.normalize import normalize_article
from pipeline.storage import persist_articles


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Raksha Atlas data pipelines.")
    parser.add_argument("--check", action="store_true", help="Run local checks without network access.")
    parser.add_argument("--collect-rss", action="store_true", help="Collect configured RSS feeds in parallel pipeline mode.")
    parser.add_argument("--feed-id", help="Collect only this configured RSS feed.")
    parser.add_argument("--config", default="../server/monitor-sources.json", help="Path to monitor-sources.json.")
    parser.add_argument("--apply", action="store_true", help="Persist to PostgreSQL; otherwise dry-run.")
    args = parser.parse_args()

    if args.check:
        items = [CollectedItem("demo", "Example release", "https://example.com/release"), CollectedItem("demo", "Duplicate release", "https://example.com/release")]
        print(f"Pipeline check passed: {len(deduplicate(items))} unique item.")
        return
    if not args.collect_rss and not args.feed_id:
        parser.error("Select --check or --collect-rss [--feed-id ID].")

    config_path = Path(args.config).resolve()
    config = json.loads(config_path.read_text(encoding="utf-8"))
    feeds = [feed for feed in config.get("rssFeeds", []) if feed.get("active")]
    if args.feed_id:
        feeds = [feed for feed in feeds if feed.get("id") == args.feed_id]
        if not feeds:
            parser.error(f"No active RSS feed found with id: {args.feed_id}")

    records = []
    failures = []
    for feed in feeds:
        try:
            records.extend(collect_rss(feed))
        except Exception as exc:
            failures.append({"source_id": feed.get("id"), "error": str(exc)})
    normalized = []
    for record in records:
        try:
            normalized.append(normalize_article(record))
        except ValueError as exc:
            failures.append({"source_id": record.get("source_id"), "error": str(exc)})
    unique = deduplicate_records(normalized)
    result = persist_articles(unique, apply=args.apply)
    print(json.dumps({"ok": not failures, "feeds_checked": len(feeds), "discovered": len(records), "unique": len(unique), "failures": failures, "storage": result}, indent=2))


if __name__ == "__main__":
    main()
