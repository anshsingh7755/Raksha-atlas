"""Compare saved Node RAG and FastAPI outputs for the same question set.

Input JSON format:
{"node":[{"id":"q1","answer":"...","citations":[{"url":"..."}],"latency_ms":120,"evidence_count":4}],
 "fastapi":[{"id":"q1","answer":"...","citations":[{"url":"..."}],"latency_ms":95,"evidence_count":5}]}
This reports observable deltas only; it does not claim semantic equivalence.
"""
import argparse
import json
from pathlib import Path


def summarize(rows: list[dict]) -> dict:
    return {
        "cases": len(rows),
        "answered": sum(bool(item.get("answer")) for item in rows),
        "with_citations": sum(bool(item.get("citations")) for item in rows),
        "citation_count": sum(len(item.get("citations", [])) for item in rows),
        "mean_latency_ms": round(sum(float(item.get("latency_ms", 0)) for item in rows) / max(1, len(rows)), 2),
        "mean_evidence_count": round(sum(float(item.get("evidence_count", 0)) for item in rows) / max(1, len(rows)), 2),
    }


def compare(payload: dict) -> dict:
    node = {item["id"]: item for item in payload.get("node", [])}
    fastapi = {item["id"]: item for item in payload.get("fastapi", [])}
    ids = sorted(set(node) | set(fastapi))
    return {
        "matched_cases": len(set(node) & set(fastapi)),
        "node_only": sorted(set(node) - set(fastapi)),
        "fastapi_only": sorted(set(fastapi) - set(node)),
        "node": summarize(list(node.values())),
        "fastapi": summarize(list(fastapi.values())),
        "per_case": [{"id": key, "both_present": key in node and key in fastapi,
                      "node_citations": len(node.get(key, {}).get("citations", [])),
                      "fastapi_citations": len(fastapi.get(key, {}).get("citations", []))}
                     for key in ids],
        "interpretation": "Metrics are descriptive only. Human review is required for claim support, citation correctness and answer quality."
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("comparison_json")
    args = parser.parse_args()
    payload = json.loads(Path(args.comparison_json).read_text(encoding="utf-8"))
    print(json.dumps(compare(payload), indent=2))
