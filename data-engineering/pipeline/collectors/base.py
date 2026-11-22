from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class CollectedItem:
    source_id: str
    title: str
    url: str


class Collector(Protocol):
    def collect(self) -> list[CollectedItem]:
        ...
