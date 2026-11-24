# AI answer evaluation

The starter golden dataset in `golden_dataset.json` contains required and forbidden concepts for source-provenance and quantity-caveat regression checks.

Run the deterministic evaluator:

```powershell
cd ai
python -m evaluation.evaluate path\\to\\answer.txt
```

The evaluator is a fast regression guard, not a semantic truth judge or replacement for human review. Extend the dataset with reviewed question/answer/evidence examples and expected source IDs/pages. For comparative RAG evaluation, run the same questions and source snapshot through Node RAG and FastAPI, then review citation precision, evidence recall, unsupported assertions, abstention quality, freshness, latency and cost. Keep public publisher provenance distinct from claim verification.

Do not use synthetic scores as proof of answer quality. Record model/provider/version, embedding model, dataset version and evaluation timestamp for each run.
