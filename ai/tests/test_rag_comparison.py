from evaluation.compare_rag import compare


def test_comparison_reports_missing_and_matched_cases():
    result = compare({
        "node": [{"id": "q1", "answer": "legacy", "citations": [{"url": "https://a"}], "latency_ms": 100}],
        "fastapi": [{"id": "q1", "answer": "candidate", "citations": [], "latency_ms": 80},
                    {"id": "q2", "answer": "new", "citations": [], "latency_ms": 90}]
    })
    assert result["matched_cases"] == 1
    assert result["fastapi_only"] == ["q2"]
    assert result["node"]["with_citations"] == 1
    assert result["fastapi"]["mean_latency_ms"] == 85
