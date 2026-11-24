"""Small deterministic regression evaluator; not a substitute for human review."""
import json
from pathlib import Path

def evaluate(answer: str, case: dict) -> dict:
    normalized = answer.casefold()
    required, forbidden = case.get("required_concepts", []), case.get("forbidden_concepts", [])
    found = [term for term in required if term.casefold() in normalized]
    violations = [term for term in forbidden if term.casefold() in normalized]
    return {"id": case["id"], "required_coverage": len(found) / max(1, len(required)),
            "missing_concepts": [term for term in required if term not in found],
            "forbidden_hits": violations, "passed": len(found) == len(required) and not violations}

def evaluate_file(answer_file: str, dataset_file: str = "ai/evaluation/golden_dataset.json") -> dict:
    answer = Path(answer_file).read_text(encoding="utf-8")
    dataset = json.loads(Path(dataset_file).read_text(encoding="utf-8"))
    results = [evaluate(answer, case) for case in dataset["cases"]]
    return {"dataset_version": dataset["version"], "case_count": len(results),
            "passed": all(item["passed"] for item in results), "results": results}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("answer_file")
    parser.add_argument("--dataset", default="ai/evaluation/golden_dataset.json")
    args = parser.parse_args()
    result = evaluate_file(args.answer_file, args.dataset)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["passed"] else 1)
