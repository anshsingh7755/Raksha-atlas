## Simple explanation

This folder contains tools for checking the quality of answers produced by the AI assistant.

A **golden dataset** is a small set of reviewed questions, expected evidence and important concepts. An evaluator compares an answer with those expectations and warns when required information is missing or forbidden claims appear.

These checks are useful for catching regressions, but they cannot prove that an answer is true. Human reviewers must still inspect the original sources and citations.

# AI answer evaluation

The starter golden dataset in `golden_dataset.json` contains required and forbidden concepts for source-provenance and quantity-caveat regression checks.

Run the deterministic evaluator:

```powershell
cd ai
python -m evaluation.evaluate path\\to\\answer.txt
```

The evaluator is a fast regression guard, not a semantic truth judge or replacement for human review. Extend the dataset with reviewed question/answer/evidence examples and expected source IDs/pages. For comparative RAG evaluation, run the same questions and source snapshot through Node RAG and FastAPI, then review citation precision, evidence recall, unsupported assertions, abstention quality, freshness, latency and cost. Keep public publisher provenance distinct from claim verification.

Do not use synthetic scores as proof of answer quality. Record model/provider/version, embedding model, dataset version and evaluation timestamp for each run.
