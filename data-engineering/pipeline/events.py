"""Optional Kafka event publisher; never enabled by default."""
import json
import os


def publish_ingested_event(record: dict, topic: str = "raksha.ingestion.article.v1") -> bool:
    brokers = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
    if not brokers:
        return False
    try:
        from confluent_kafka import Producer
    except ImportError as exc:
        raise RuntimeError("Install events extras: pip install -e '.[events]'") from exc
    producer = Producer({"bootstrap.servers": brokers})
    key = str(record.get("id") or record.get("canonical_url") or "").encode()
    producer.produce(topic, key=key, value=json.dumps(record, ensure_ascii=False).encode())
    remaining = producer.flush(10)
    if remaining:
        raise RuntimeError(f"Kafka delivery incomplete: {remaining} message(s) remain.")
    return True
