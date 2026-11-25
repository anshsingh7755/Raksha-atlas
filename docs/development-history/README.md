# Development history

## Why keep a history?

The roadmap explains what the project intends to build and what each phase requires. The development history records what actually changed over time.

Keeping these separate makes it easier to answer:
- What was planned?
- What was changed?
- Why was it changed?
- What failed and how was it fixed?
- Which checks were actually run?

## Where is the detailed history?

The earlier phase-by-phase implementation notes remain in the [delivery roadmap](../roadmap/README.md), its phase runbooks and the [architecture decisions](../architecture/README.md).

Use this folder for short project-level entries that point to those detailed records. Do not copy the entire phase document here.

## Entry format

```markdown
### YYYY-MM-DD — Phase or task name
- **Change:** What was changed and which files or services were affected.
- **Reason:** Why the change was needed.
- **Issue:** What failed or was unclear, if anything.
- **Fix:** What resolved the issue, if anything.
- **Validation:** Exact command or manual check and its result.
- **Status:** Completed, pending or blocked.
```

## Rules

- Record only work that actually happened.
- Use the real date of the change.
- Separate automated test results from manual checks and owner-reported status.
- Never say a deployment succeeded unless it was checked.
- Keep entries short and link to the detailed technical guide.
- Preserve older records. If a correction is needed, add a dated correction rather than silently rewriting history.
