from app.evaluation.evaluate import evaluate

def test_evaluator_detects_required_and_forbidden_concepts():
    case = {"id":"x","required_concepts":["unverified","not confirmed inventory"],
            "forbidden_concepts":["confirmed quantity"]}
    assert evaluate("The value is unverified and is not confirmed inventory.", case)["passed"]

def test_evaluator_fails_when_required_concepts_are_missing():
    case = {"id":"x","required_concepts":["source URL"],"forbidden_concepts":["guaranteed"]}
    result = evaluate("This answer is guaranteed.", case)
    assert not result["passed"]
    assert result["forbidden_hits"] == ["guaranteed"]
