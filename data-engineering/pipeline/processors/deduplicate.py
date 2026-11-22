from pipeline.collectors.base import CollectedItem


def deduplicate(items: list[CollectedItem]) -> list[CollectedItem]:
    unique: dict[str, CollectedItem] = {}

    for item in items:
        unique.setdefault(item.url, item)

    return list(unique.values())
