## How to use this research plan

This document defines a proposed way to follow three named public defence-news publishers and organize their reporting into a source-attributed research panel.

It is a source reconnaissance and implementation plan. It does not mean every historical article has been collected, every page can be accessed, or every claim is verified.

A publisher feed is a discovery channel. Each important item should link to the original publisher, retain its date and be labelled according to the evidence available. Follow publisher access rules and do not copy full copyrighted articles.

# Three-Publisher Defence Research and News Integration Plan

**Research cut-off:** 23 November 2026  
**Prepared for:** Raksha Atlas  
**Status:** Source reconnaissance and implementation specification; not a completed exhaustive archive extraction.

## 1. Objective

Establish three named secondary-publication streams for defence-industry research and a simple, source-attributed news panel:

1. Indian Defence Research Wing (IDRW) — https://idrw.org/
2. ETDefence / The Economic Times — https://defence.economictimes.indiatimes.com/
3. Indian Defence News (IDN) — https://www.indiandefensenews.in/

The requested coverage includes daily reporting, procurement and acquisition, future programmes, defence industry/manufacturing, military technology, aerospace, service developments, strategic affairs, defence history and international developments relevant to India.

This document records the source structures and safe collection approach. It does not claim that every historical article from the three sites has already been downloaded, read or normalized.

## 2. Publisher profiles and coverage map

### 2.1 Indian Defence Research Wing (IDRW)

- Website: https://idrw.org/
- About page: https://idrw.org/about-us/
- Public feed endpoint discovered: https://idrw.org/feed/
- Search-engine indexed archive pagination observed through at least page 336; archive size and pagination may change.
- The publisher describes itself as established in 2006 and focused on Indian armed forces, defence projects, procurement, military technology and regional/global security developments.
- Observed homepage/archive labels include **India**, **AFI**, **News Beat**, **N & S America**, **Europe**, and contributor/source labels such as **IDRW Team**, **RAUNAK KUNDE**, **PIB**, **PTI**, **IANS**, **Reuters**, **USI**, and **Company Press Release**.
- The archive includes a mixture of original IDRW reporting, commentary, official-release republication/attribution, wire copy and company announcements. The byline/source label must be retained per story; do not treat every post as original IDRW reporting.
- Useful research areas: Army/Navy/Air Force programmes, acquisition notices and tenders, indigenous development, defence industry, aerospace, strategic affairs, technology, international defence developments.
- Collection status: homepage and archive pages are indexable in search, but direct automated access returned HTTP 403 in this research session. The RSS endpoint is publicly advertised by third-party feed directories, but must be tested from the application environment before enabling automated ingestion.
- Proposed ingestion: test the publisher feed first; if blocked or unreliable, use public archive pagination and article metadata only where permitted. Do not bypass anti-bot controls, login walls or access restrictions.

### 2.2 ETDefence — The Economic Times

- Website: https://defence.economictimes.indiatimes.com/
- About page: https://defence.economictimes.indiatimes.com/about
- RSS directory: https://defence.economictimes.indiatimes.com/rss
- Publisher-described scope: defence-industry news, opinion and analysis, new launches, mergers and acquisitions, FDI, industry research, joint ventures and business developments. ETDefence says it aggregates and links to reporting from multiple media outlets and provides a daily newsletter.
- Publicly listed RSS categories:
  - Top Stories Today — https://defence.economictimes.indiatimes.com/rss/topstories
  - Recent Stories — https://defence.economictimes.indiatimes.com/rss/recentstories
  - Policy & Partnerships — https://defence.economictimes.indiatimes.com/rss/policy-partnerships
  - Manufacturing — https://defence.economictimes.indiatimes.com/rss/manufacturing
  - Military Systems — https://defence.economictimes.indiatimes.com/rss/military-systems
  - Advanced Technologies — https://defence.economictimes.indiatimes.com/rss/advanced-technologies
  - Research & Security — https://defence.economictimes.indiatimes.com/rss/research-security
  - Industry — https://defence.economictimes.indiatimes.com/rss/industry
- Useful research areas: defence policy and partnerships, manufacturing and supply chains, military platforms/systems, advanced technologies, research/security, defence companies and industry economics.
- Editorial caution: ETDefence often summarizes or links to reporting from another publisher. Capture ETDefence as the immediate source and, when its article identifies an underlying source, record that as a separate **underlying attribution**. Do not silently attribute the underlying outlet's reporting to ETDefence or vice versa.
- Important terms restriction: The Economic Times RSS terms page states that RSS feeds are for personal use and prohibits copying, publishing, distributing, hosting, aggregating or commercially using feed content without express consent. Therefore, do **not** ingest and republish ET RSS descriptions or full feed text in Raksha Atlas without written permission/licence. Until permission is obtained, use a manually curated link-out approach: article title, publisher name, publication date and a short independently written factual note only after checking the public article page and applicable terms; link users to ETDefence for the original story. If terms remain unclear, display only a source link and minimal bibliographic metadata.
- RSS terms: https://economictimes.indiatimes.com/rss.cms
- Collection status: RSS directory is discoverable. The main page and category pages are publicly indexable. Confirm current terms and feed access before enabling an automated ET collector.

### 2.3 Indian Defence News (IDN)

- Website: https://www.indiandefensenews.in/
- About page: https://www.indiandefensenews.in/p/about.html
- Blogger RSS endpoint discovered: https://www.indiandefensenews.in/feeds/posts/default?alt=rss
- The publisher's About page says it was founded in 2014 and curates defence reporting for a domestic audience, with global defence/geopolitical developments where relevant.
- Self-described topics include defence policy, national interest and security, foreign policy, diplomacy, economy, energy, aerospace, cyberspace, reconnaissance, defence infrastructure, defence business, new technologies/trends and indigenous defence manufacturing. It also publishes opinion, analysis, commentary and thematic pieces.
- Observed article labels include service/domain labels such as **Air Force**, **Defence Preparedness**, **Defence Purchase**, and **Drones**. Preserve the article's actual labels rather than forcing every story into a single service category.
- Recent indexed examples include DAC/AoN packages, procurement proposals, trainer aircraft requirements, missile contracts/upgrades, BrahMos orders and industry activity. These are examples of coverage, not independently verified facts.
- Collection status: homepage was indexed and returned recent posts; direct fetch returned HTTP 429 during this research session. RSS endpoint is advertised by public RSS directories; test from the application environment before enabling.
- Proposed ingestion: use the public Blogger feed if accessible and permitted; preserve original post URL, author/date and labels. If unavailable, use public article metadata and manual link-out rather than circumventing access controls.

## 3. Cross-publisher coverage taxonomy

Use these as broad Raksha Atlas tags. They are an internal taxonomy, not a claim that each publisher uses the same categories.

1. Army / land systems
2. Navy / maritime systems
3. Air Force / aerospace
4. Joint and strategic programmes
5. Missiles, rockets and air defence
6. Space, cyber, electronic warfare and communications
7. Defence procurement and acquisition stages
8. Defence manufacturing, industrial capacity and supply chains
9. Defence companies, contracts, investments and exports
10. Research, development, trials and technology
11. Policy, budgets, diplomacy and international partnerships
12. Defence history, institutions and military heritage
13. Regional and global security developments relevant to India

## 4. Acquisition-stage and evidence rules

Every article is a **secondary-source news item** until checked against primary evidence. Keep the article's own wording and attribution, then classify cautiously:

- Reported / claim: an outlet or named source reports it; not independently confirmed.
- RFI: information request; not a procurement approval or order.
- RFP / tender: solicitation stage; not a signed contract.
- AoN: Acceptance of Necessity; in-principle acquisition approval, not contract or delivery.
- Approved / sanctioned: retain the exact approving authority and scope.
- Contracted: signed contract with disclosed date, value and scope.
- Development / prototype / trials: technical progress; not induction.
- Under construction / production: only when the source explicitly supports it.
- Delivered / accepted / inducted / commissioned: retain the exact milestone and date.
- Disputed / corrected / withdrawn: preserve the correction trail; do not silently overwrite old claims.

Never infer quantities, service allocations, costs, specifications or schedules from headlines. Store unknown values as unknown, not zero. Keep estimates separate from official figures.

## 5. Daily news panel — deliberately simple

The user requested a simple section, not a complex newsroom CMS.

Each card should contain only:
- Headline
- Short original summary (one or two sentences; do not copy full article text)
- Publisher/source badge: **IDRW**, **ETDefence**, or **Indian Defence News**
- Publication date/time when available
- Topic tag when available
- Original article link

Recommended controls: source filter (All / IDRW / ETDefence / Indian Defence News), optional search, and a latest-first list. No article body republishing, comments, user accounts, or elaborate workflow is required for the first version.

News cards must remain separate from programme records and the verified inventory. A news item can link to a programme record, but must not automatically change its quantity, stage or service status.

## 6. Ingestion and copyright/access policy

- Prefer publisher-provided RSS/Atom or public APIs where their terms permit the intended use.
- Store bibliographic metadata and canonical URLs. Retain only the minimum excerpt needed for internal review, subject to source terms.
- Do not mirror full articles, images, paywalled text or subscriber-only material.
- Do not bypass 403/429 responses, bot checks, login requirements or other access controls.
- ETDefence RSS must not be republished or aggregated without express permission under its published RSS terms. Obtain permission or use the link-out-only path described above.
- For IDRW and IDN, verify their current terms, robots policy and feed behaviour before enabling automated collection. Public availability alone is not a blanket republication licence.
- Keep publisher and underlying source attribution distinct.
- Deduplicate by canonical article URL and near-identical headline; retain multiple publisher links as related coverage rather than creating false independent confirmation.
- Preserve original publication timestamp and ingestion timestamp separately.
- Do not use AI summaries to upgrade verification status. Summaries must preserve uncertainty and name the reporting source.
- Primary-source corroboration should use PIB, MoD, DRDO, service headquarters, Parliament, named manufacturer disclosures and official tender/contract documents.

## 7. Research workflow for broad archive coverage

The phrase "all information" spans years of articles and multiple subject areas. It cannot be truthfully declared complete after a small number of searches or a homepage snapshot. Use a repeatable archive review:

1. Enumerate each publisher's sitemap, feed and archive pagination where publicly available.
2. Record archive coverage dates, pagination range, inaccessible pages and feed limits.
3. Collect article metadata in bounded batches, starting with recent coverage and then moving backwards by month/year.
4. Tag articles against the cross-publisher taxonomy.
5. Extract candidate programme, company, platform, procurement-stage and milestone mentions into a research queue.
6. Deduplicate repeated stories and identify the original/underlying reporting outlet.
7. Verify consequential claims against primary sources before updating the programme dossier or inventory.
8. Maintain a coverage ledger with publisher, date range reviewed, pages/items discovered, items processed, failures and last review date.

Do not claim full historical coverage until the coverage ledger demonstrates it.

## 8. Initial reconnaissance findings and limitations

- IDRW: About page and current archive snippets were discoverable; archive pagination beyond page 300 was indexed; direct site access returned 403 in this research session. Feed availability is advertised by third-party RSS directories but not yet tested in Raksha Atlas runtime.
- ETDefence: About page, home page and all eight category RSS endpoints were discoverable. Published RSS terms restrict redistribution/hosting/aggregation without express consent. This is a hard implementation gate for automated ET RSS display.
- IDN: About page, homepage snippets and Blogger feed endpoint were discoverable. Direct homepage/feed fetch was rate-limited or unavailable in this research session; test from the application runtime and respect publisher rules.
- The three outlets have overlapping coverage. Their stories are not three independent confirmations when one outlet republishes or attributes the same underlying report.
- This reconnaissance is a publisher/source map and integration plan, not a complete extraction of all articles or historical defence knowledge.

## 9. Implementation sequence

1. Confirm source terms and test IDRW/IDN feeds from the application runtime.
2. Add/maintain the three source records in the source registry with distinct IDs and attribution rules.
3. Implement the simple news list using permitted metadata and link-outs.
4. Add ETDefence only through the permission-compliant route unless written RSS/display permission is obtained.
5. Run ingestion manually, inspect output, verify source labels and deduplication.
6. Only after successful validation, schedule daily/hourly refresh as appropriate.
7. Keep the research dossier and inventory updates as a separate human-reviewed workflow.

## 10. Source references

- IDRW About: https://idrw.org/about-us/
- IDRW public site/archive: https://idrw.org/
- IDRW feed endpoint: https://idrw.org/feed/
- ETDefence About: https://defence.economictimes.indiatimes.com/about
- ETDefence RSS directory: https://defence.economictimes.indiatimes.com/rss
- ET RSS terms: https://economictimes.indiatimes.com/rss.cms
- Indian Defence News About: https://www.indiandefensenews.in/p/about.html
- Indian Defence News public site: https://www.indiandefensenews.in/
- Indian Defence News Blogger feed: https://www.indiandefensenews.in/feeds/posts/default?alt=rss
