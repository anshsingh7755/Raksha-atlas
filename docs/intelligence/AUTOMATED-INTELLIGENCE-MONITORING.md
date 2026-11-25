# Automated Defence Intelligence Monitoring — Requirements and Plan

**Status:** Proposed plan only. No application implementation is authorized by this document.  
**Timezone:** Asia/Kolkata (IST)  
**Operating model:** One owner, using a phone or laptop  
**Goal:** Keep Raksha Atlas collecting public defence-industry information when the owner's laptop is switched off.

## 1. Requirement in simple language

Raksha Atlas should work like an automated research desk. It should check approved public sources during the day, find new reports, connect reports about the same development, preserve original sources, classify the evidence and update the website.

The collection system must run on an online hosted service. It must not depend on the owner's laptop, browser tab or logged-in ChatGPT session.

## 2. Requirements extracted

| ID | Requirement | Expected result |
|---|---|---|
| AIM-01 | Laptop-independent operation | Hosted worker runs while the owner's laptop is offline. |
| AIM-02 | Morning activity | Collect and prepare a morning digest between 08:00 and 09:00 IST. |
| AIM-03 | 10 AM refresh | Run a separate scheduled refresh at 10:00 IST. |
| AIM-04 | All-day collection | Check enabled sources periodically through the day. |
| AIM-05 | Multiple source types | Official releases, defence publishers, general news, public forums and accessible public social posts. |
| AIM-06 | Cross-source matching | Group reports about the same event while preserving every original source. |
| AIM-07 | Evidence classification | Separate official confirmation, reported information, unverified claims, rumours, speculation and disputed claims. |
| AIM-08 | Programme lifecycle | Track proposal, approval, tender, contract, production/construction, delivery and induction as separate stages. |
| AIM-09 | Automatic website update | Save and display new records without a manual laptop refresh. |
| AIM-10 | Phone access | Secure mobile-friendly dashboard and manual refresh control. |
| AIM-11 | Daily summary | Show new items, changed statuses, source disagreements and items needing review. |
| AIM-12 | Free-first | Prefer existing code, public feeds, open-source tools and free tiers. Show limits clearly. |
| AIM-13 | Failure visibility | Show last check, last success, failures, rate limits and job history. |
| AIM-14 | Safe collection | Use permitted public feeds/APIs; do not bypass login, paywalls, anti-bot controls or access restrictions. |

## 3. Proposed schedule

All times are IST.

| Time | Activity |
|---|---|
| 08:00–09:00 | Morning collection and preparation of an overnight/early-morning digest |
| 10:00 | Separate refresh and dashboard update |
| Every hour | Incremental collection from enabled sources |
| Optional 18:00 | Daily close summary |
| On demand | Owner triggers a run from phone or laptop |

The morning window is a processing window, not a guarantee that every publisher has new content. The 10:00 refresh is a separate job.

**Important existing limitation:** The current Node scheduler runs only while its host process is alive. It cannot meet the laptop-independent requirement if it runs only on the owner's laptop. The scheduler/worker must run on hosted infrastructure or be triggered by a reliable hosted scheduler.

## 4. Source groups

Every source must be registered with its name, category, publisher type, access method, allowed domain, polling interval, enabled state, last check and last successful check.

### 4.1 Official primary sources
- Ministry of Defence and PIB.
- Indian Army, Navy and Air Force public releases.
- DRDO and relevant public research/production organizations.
- Public tender and procurement notices.
- Parliament questions, budget documents and other public government publications.

Keep the exact release wording and link. An official publisher does not automatically prove every interpretation made about a release.

### 4.2 Defence and industry publishers
- IDRW.
- ETDefence / The Economic Times.
- Indian Defence News.
- Other established defence and industry publishers.
- Public defence forums where access and terms permit.

Try RSS/Atom feeds or documented APIs first. If a publisher blocks automated access, mark it unavailable. Do not bypass HTTP 403, bot challenges, login walls or access restrictions.

### 4.3 General news
Use configured public feeds or supported APIs from reputable Indian and international publishers. Preserve publisher, byline where available, URL, publication date and update date.

### 4.4 X/Twitter and other public social sources
Social posts can be early signals but are not proof.

Preferred access:
1. Official public API or authorized provider.
2. Permitted public feed or embedded post metadata.
3. Search discovery linking to the original public post.

The system must not scrape behind login, defeat rate limits or violate platform terms. X API access may be limited or paid; unrestricted free access must not be assumed. If lawful reliable access is unavailable, show that X monitoring is unavailable and continue other sources.

Store account handle, post URL, post time and collection time. Popularity, followers and reposts are not evidence of truth.

## 5. Processing flow

```text
Hosted scheduler
  -> source registry and due sources
  -> RSS / public API / permitted metadata
  -> raw item with URL, publisher and timestamps
  -> URL/title/date normalization
  -> duplicate detection and event grouping
  -> evidence extraction and source comparison
  -> rule-based labels and optional AI summary
  -> persistent database and run logs
  -> website feed, programme tracker, digest and review queue
```

Each stage should be retryable. One failed publisher must not stop other publishers.

### Collection
- Fetch new or changed records since the previous successful check.
- Use feeds and documented APIs where possible.
- Set timeouts, bounded retries and per-source rate limits.
- Respect publisher terms and access restrictions.
- Keep publication time separate from collection time.
- Log failed and successful source checks.

### Normalization and matching
- Normalize tracking parameters while retaining the original URL.
- Preserve original publisher wording.
- Detect duplicate URLs and likely duplicate stories.
- Group reports into an event but retain each report as an individual source.
- Do not merge different programmes or contract stages because headlines look similar.

### AI-assisted processing
AI may summarize, extract names/dates, suggest categories, compare reports and explain differences.

AI must not invent contract values, quantities or dates; promote a rumour to official confirmation; treat copied reports as independent corroboration; remove attribution; or overwrite human review decisions.

Record provider/model, processing time and whether deterministic fallback was used. AI output is assistance, not evidence.

## 6. Evidence classification

Keep two separate fields:

- **Publisher type:** official body, established publisher, forum, social account or unknown.
- **Claim status:** strength of evidence for the specific claim.

| Claim status | Meaning |
|---|---|
| Officially confirmed | Appropriate primary official source explicitly confirms this specific event/fact |
| Officially stated | Official source makes a statement, but it does not prove more than its exact wording |
| Corroborated reporting | Multiple genuinely independent credible publishers report the same claim; no primary confirmation found |
| Single-source reporting | One identifiable publisher reports the claim |
| Unverified | Claim exists but evidence is insufficient |
| Rumour / speculation | Source presents it as rumour/speculation or evidence is very weak |
| Disputed / conflicting | Credible sources materially disagree |
| Withdrawn / corrected | Publisher corrected or withdrew the claim |

Five websites repeating one wire story are not five independent sources. Record source relationships and copied/re-published material where possible. Do not combine publisher identity and claim status into one field.

## 7. Example: Project 17B frigates

Suppose five sources report a possible contract:
- MoD release explicitly announces a signed contract: official confirmation.
- PIB reproduces the announcement: official source reference, but not necessarily independent corroboration.
- ETDefence reports the contract: media report.
- IDRW reports the same development: secondary reporting.
- A public X account claims a contract was signed: unverified social claim until evidence supports it.

Create one Project 17B development/event record with all source references. Do not create five unrelated contract records.

Track stages separately:
1. Concept/proposal.
2. Requirement identified.
3. Approval/Acceptance of Necessity, using the official wording.
4. Tender / Request for Proposal.
5. Bid/evaluation.
6. Contract signed.
7. Production/construction started.
8. Trials/testing.
9. Delivery.
10. Induction/entry into service.
11. Cancelled, delayed or suspended, when supported.

A tender is not a contract. An approval is not a contract. A contract is not proof of delivery. Unknown or skipped stages must remain unknown.

Each milestone stores programme ID, stage, reported event date, publication/collection dates, source IDs and links, claim status, evidence explanation, original quantity/value wording, human review notes and change history.

## 8. Website dashboard

Proposed sections:
1. **Today's Briefing:** morning digest and 10 AM refresh.
2. **Latest Developments:** chronological new reports.
3. **Programme Tracker:** programme profile and milestone history.
4. **Source Comparison:** multiple reports and differences for one event.
5. **Evidence Status:** official, corroborated, single-source, unverified, rumour and disputed filters.
6. **Needs Review:** conflicting, high-impact or weak-evidence claims.
7. **Source Health:** last check, last success and source failures.
8. **Run History:** scheduled/manual jobs, counts, duration and errors.

Every item must show the publisher, original link, publication date and evidence label. Summaries must not replace the original source.

## 9. Phone operation

The existing website should be mobile-friendly. The owner should be able to:
- Sign in securely.
- Read the digest and latest developments.
- Filter by service, programme, publisher and evidence status.
- Open original sources.
- Trigger a background refresh.
- See queued/running/completed/failed status.
- Enable or pause approved sources.
- Review, correct or reject claims with an audit entry.

A phone-triggered refresh creates a background job. The phone can close while the hosted worker continues. Protect all controls with authentication; never expose admin tokens in frontend code or public URLs.

## 10. Free-first technology and limitations

| Need | Free-first approach | Limitation |
|---|---|---|
| Source collection | RSS/Atom, official releases and public APIs | Some publishers have no feed or block automation |
| Scheduling | Hosted scheduler or CI scheduler triggering a worker | Free quotas, delays and execution limits vary |
| Background worker | Existing Node worker on a host that supports background jobs | Some free hosts sleep or stop workers |
| Database | Existing PostgreSQL-compatible free tier if available | Storage, connection and inactivity limits |
| AI summaries | Rule-based enrichment first; optional free-tier provider | Quotas change; free ChatGPT web access is not a backend API |
| Social posts | Authorized free API access if offered | X access is not assumed free or unlimited |
| Phone dashboard | Existing responsive website | Push notifications/PWA need separate testing |

**The first useful version should not require a paid AI API.** Start with feeds, rules, event grouping, source comparison and transparent labels.

A personal ChatGPT Free session cannot be called as an unattended backend API. Do not automate a browser session logged into ChatGPT as a substitute for an API. Optional model providers may be added behind a replaceable adapter if a usable free quota exists. The system must still work when AI is disabled.

"Free" does not mean unlimited or guaranteed. Show quota failures and missed collection windows.

## 11. Implementation stages

### Stage A — Source registry
- Define official, publisher, forum and social source groups.
- Test each feed/API and permitted access method.
- Record source priority, polling interval and health.
- Preserve current source configuration.

**Acceptance:** Every enabled source has a tested permitted access method.

### Stage B — Hosted scheduler and worker
- Run scheduled jobs away from the owner's laptop.
- Add 08:00–09:00, 10:00 and hourly schedules.
- Add run status, retries and overlap protection.
- Keep manual refresh available.

**Acceptance:** A scheduled test succeeds while the owner's laptop is off; failures are visible and retryable.

### Stage C — Collection and event grouping
- Reuse current collectors and deduplication.
- Store original metadata and normalized records.
- Group reports about the same event while preserving each source.

**Acceptance:** Repeated reports appear under one event; separate events remain separate.

### Stage D — Evidence and programme lifecycle
- Separate publisher type from claim status.
- Record evidence explanation and source independence.
- Link reports to programmes and milestones.
- Preserve disagreement.

**Acceptance:** Tests distinguish an official contract release, one media report, a repeated rumour and conflicting reported values.

### Stage E — Dashboard and phone controls
- Add morning and 10 AM digests.
- Add latest developments, programme tracker, source health and run history.
- Add authenticated manual refresh and review controls.

**Acceptance:** Owner can request a run from a phone; it continues after the phone is closed.

### Stage F — Optional AI
- Add optional summarization/entity extraction behind a provider interface.
- Keep deterministic fallback.
- Record model/provider and processing metadata.
- Evaluate against reviewed examples.

**Acceptance:** Collection remains useful with AI disabled; AI cannot promote unsupported claims to official confirmation.

## 12. Existing code reuse and non-destructive boundaries

The current project already has Node collectors, RSS/Atom parsing, URL normalization, deduplication/story grouping, capped public-page metadata extraction, AI/rule-based enrichment, PostgreSQL/JSON storage, an hourly scheduler, a 04:00 IST reference refresh and a public Signals feed.

The main gap for the owner's requirement is **reliable hosted execution independent of the laptop**. Evidence tracking, event-level comparison and phone controls are the next improvements.

Implementation rules:
- Reuse `server/collectors/`, `server/processors/`, `server/workers/` and `server/scheduler/` where practical.
- Preserve existing API response shapes and website pages.
- Add fields/tables with additive migrations.
- Keep JSON fallback until database parity is proven.
- Do not migrate the frontend/backend as part of this feature.
- Use feature flags for new dashboard features.
- Keep rollback paths for scheduler and database changes.
- Do not create a second independent news pipeline unless reuse is technically impossible.

## 13. Risks and safeguards

| Risk | Safeguard |
|---|---|
| Laptop offline stops collection | Hosted scheduler and worker |
| Free host sleeps or reaches quota | Health checks, last-success display, retry and fallback |
| Publisher blocks access | Use approved feed/API; disable source rather than bypass |
| X API is paid/limited | Mark unavailable until authorized access exists |
| Rumour becomes fact | Separate source type and claim status |
| Many sites repeat one story | Track source relationships and independence |
| AI invents a value/date | Preserve source text; AI output is non-authoritative |
| Duplicate/noisy updates | URL normalization and event clustering |
| Unauthorized phone trigger | Authentication, rate limits and audit logs |
| Silent worker failure | Run history and visible last-success time |

## 14. Definition of done

- [ ] Hosted worker runs while owner's laptop is off.
- [ ] Morning and 10:00 IST jobs run on schedule.
- [ ] Incremental collection runs throughout the day.
- [ ] Source health and last-success timestamps are visible.
- [ ] One source failure does not stop other sources.
- [ ] Duplicate reports are grouped and original links retained.
- [ ] Publisher type and claim status are separate.
- [ ] Official confirmation requires an appropriate primary source.
- [ ] Rumours and speculation stay clearly labelled.
- [ ] Programme milestones preserve evidence and history.
- [ ] Website updates without a laptop refresh.
- [ ] Owner can view and trigger jobs from a phone.
- [ ] System remains useful without a paid AI API.
- [ ] Secrets are protected and admin actions audited.
- [ ] Backup, recovery and rollback are documented and tested.

## 15. Recommended first implementation

Start with **hosted scheduling + the existing Node collection worker + the existing database + morning/10 AM digest + a mobile-friendly manual trigger**.

Do not begin by migrating to Next.js, Spring Boot, Kafka, Airflow, Spark or a new AI platform. Those technologies are not needed to prove the first requirement. First make the current pipeline run reliably without the laptop, then improve evidence handling and the dashboard in small, testable steps.
