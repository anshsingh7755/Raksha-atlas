# Raksha Atlas — Commands Module

**Status:** Initial public directory implementation  
**As-of date:** 23 November 2026  
**Scope:** Public organisational information only. This is not an operational order of battle and does not expose deployments, readiness, unit locations or sensitive command relationships.

## 1. Classification model

Commands and related organisations are not one flat list. Every record carries:

- `service`: Indian Army, Indian Navy, Indian Air Force or Joint.
- `group`: Service commands, Joint structures or Proposed structures.
- `structureType`: Operational, Training, Maintenance, Joint operational command, Joint headquarters, Tri-service agency or Theatre-command framework.
- `status`: `established` or a non-established state such as `under_study`.
- `headquarters`: public headquarters only when supported by the linked source; otherwise null.
- `description`: short explanation of the organisational role and relevant caveat.
- `sourceUrl`, `sourceName`, `verificationStatus`: evidence trail.

A service command, joint operational command, headquarters, agency and proposed theatre command must never be presented as interchangeable entities.

## 2. Initial public register

The register is stored in `server/commands.json`. It includes:

- Indian Army: six operational commands and Army Training Command.
- Indian Navy: Western and Eastern operational commands; Southern training command.
- Indian Air Force: five operational commands, Training Command and Maintenance Command.
- Joint structures: Andaman and Nicobar Command, Strategic Forces Command, HQ Integrated Defence Staff and separately classified tri-service agencies.
- Proposed structures: Integrated Theatre Commands are shown as under study, not established.

Where a current primary source for an individual headquarters was not available in this first pass, the field is intentionally null. Do not infer a headquarters from a command's name or from an unrelated source.

## 3. API contract

### `GET /api/commands`

Optional exact-match filters:

| Query parameter | Meaning |
|---|---|
| `service` | Service owner/group: Indian Army, Indian Navy, Indian Air Force, Joint |
| `group` | Service commands, Joint structures, Proposed structures |
| `type` | Exact structure type |
| `status` | Established / under-study state |

Response shape:

```json
{
  "items": [],
  "count": 0,
  "filters": {},
  "availableFilters": {
    "services": [],
    "groups": [],
    "structureTypes": [],
    "statuses": []
  },
  "asOf": "2026-11-23",
  "policy": "Public organisational reference only..."
}
```

The frontend reads this API. It must not import or read `server/commands.json` directly.

## 4. UI behaviour

- Overview shows the service-level directory from API records.
- Forces page shows the expanded directory.
- Each record displays its structure type, status, public headquarters when supported, and source link.
- Non-established records are separated from established command cards.
- Joint agencies and HQ IDS are not labelled as service commands.
- Proposed theatre-command structures are never counted as operational commands.

## 5. Source and verification policy

Use Ministry of Defence / PIB and official service publications first. Keep a source URL on each record. `official_reference` means the linked reference is an official government/service publication; it does not claim that every descriptive sentence or headquarters field has been independently revalidated on the as-of date.

For every future update:
1. Open the linked primary source and confirm it still supports the record.
2. Record a new checked date in the source metadata or register.
3. Change headquarters only when directly supported.
4. Keep proposed, under-study and announced structures separate from established organisations.
5. Preserve older source links for historical context; do not silently overwrite conflicting claims.

## 6. Acceptance checklist

- [x] `GET /api/commands` returns all register records and available filters (implementation committed; local runtime check pending).
- [x] Exact service, group, type and status filters are implemented (local runtime check pending).
- [x] Overview and Forces pages render API-backed records.
- [x] Established and proposed structures are visually separated.
- [x] Unsupported headquarters fields remain null.
- [x] Each register record includes a source link.
- [ ] `npm run build` passes locally after pulling the branch.
- [ ] Local API smoke tests pass after starting the updated Node API.
