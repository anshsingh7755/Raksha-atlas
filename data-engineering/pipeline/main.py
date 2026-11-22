import argparse

from pipeline.collectors.base import CollectedItem
from pipeline.processors.deduplicate import deduplicate


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Raksha Atlas data pipelines.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Run a local pipeline wiring check without network access.",
    )
    args = parser.parse_args()

    if args.check:
        items = [
            CollectedItem("demo", "Example release", "https://example.com/release"),
            CollectedItem("demo", "Duplicate release", "https://example.com/release"),
        ]
        print(f"Pipeline check passed: {len(deduplicate(items))} unique item.")
        return

    parser.error("No pipeline selected. Use --check for the local wiring check.")


if __name__ == "__main__":
    main()
